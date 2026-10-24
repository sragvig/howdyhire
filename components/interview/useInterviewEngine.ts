"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useConversation } from "@elevenlabs/react";
import type { AnswerRecord, InterviewerPersona, StarEvaluation, TranscriptEntry } from "@/types";
import { useSession } from "@/components/providers/SessionProvider";
import { buildAgentPrompt, buildFirstMessage, missingElementsNote, personaSwitchNote } from "@/lib/interview-prompt";
import { buildFeedback, missingElements } from "@/lib/star";
import { requestReport } from "@/lib/report-client";

export type MicPermission = "unknown" | "granted" | "denied" | "unavailable";

const newId = () => crypto.randomUUID();

export function useInterviewEngine() {
  const { session, setPersona, start, beginScoring, complete, fail } = useSession();

  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [mic, setMic] = useState<MicPermission>("unknown");
  const [error, setError] = useState<string | null>(null);

  // Refs hold the source of truth for values read inside SDK callbacks and async work,
  // where render-time state would be stale.
  const answersRef = useRef<AnswerRecord[]>([]);
  const sessionRef = useRef(session);
  const pendingEvals = useRef(new Set<Promise<void>>());
  const evalSeq = useRef(new Map<string, number>());
  const lastNudge = useRef(new Map<string, string>());
  const finishing = useRef(false);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const commitAnswers = useCallback((next: AnswerRecord[]) => {
    answersRef.current = next;
    setAnswers(next);
  }, []);

  const patchAnswer = useCallback(
    (id: string, patch: Partial<AnswerRecord>) =>
      commitAnswers(answersRef.current.map((a) => (a.id === id ? { ...a, ...patch } : a))),
    [commitAnswers],
  );

  const appendTranscript = (speaker: TranscriptEntry["speaker"], text: string) =>
    setTranscript((prev) => [...prev, { id: newId(), speaker, text, at: new Date().toISOString() }]);

  const finish = useCallback(async () => {
    if (sessionRef.current.status !== "active" || finishing.current) return;
    finishing.current = true;
    beginScoring();
    await Promise.allSettled([...pendingEvals.current]);

    // Local STAR scores always exist; the AI report is layered on top when it succeeds.
    let feedback = buildFeedback(answersRef.current);
    if (feedback.questions.length > 0) {
      try {
        feedback = await requestReport(feedback, sessionRef.current);
      } catch (err) {
        feedback = { ...feedback, reportError: err instanceof Error ? err.message : "Couldn't generate the report" };
      }
    }
    complete(feedback);
    finishing.current = false;
  }, [beginScoring, complete]);

  const conversation = useConversation({
    onConnect: () => start(),
    onMessage: ({ message, role }) => {
      if (!message.trim()) return;
      if (role === "agent") handleInterviewerTurn(message);
      else handleCandidateTurn(message);
    },
    // When the candidate interrupts, ElevenLabs sends the truncated text the agent actually spoke.
    onAgentResponseCorrection: ({ original_agent_response, corrected_agent_response }) =>
      setTranscript((prev) => {
        const idx = prev.findLastIndex((t) => t.speaker === "interviewer" && t.text === original_agent_response);
        if (idx === -1) return prev;
        const next = [...prev];
        next[idx] = { ...next[idx], text: corrected_agent_response };
        return next;
      }),
    onDisconnect: (details) => {
      if (details.reason === "error") setError(details.message || "The connection dropped.");
      void finish();
    },
    onError: (message) => setError(message),
  });

  const { sendContextualUpdate } = conversation;
  const statusRef = useRef(conversation.status);
  useEffect(() => {
    statusRef.current = conversation.status;
  }, [conversation.status]);

  // Feedback loop: tell the agent which STAR elements are still missing so it can follow up.
  function maybeNudgeAgent(answerId: string, evaluation: StarEvaluation) {
    const isCurrent = answersRef.current.at(-1)?.id === answerId;
    if (!isCurrent || !evaluation.isBehavioralAnswer || statusRef.current !== "connected") return;
    const missing = missingElements(evaluation);
    // Nothing covered yet usually means the candidate is just getting started.
    if (missing.length === 0 || missing.length === 4) return;
    const key = missing.join(",");
    if (lastNudge.current.get(answerId) === key) return;
    lastNudge.current.set(answerId, key);
    sendContextualUpdate(missingElementsNote(missing));
  }

  function evaluate(answer: AnswerRecord) {
    const seq = (evalSeq.current.get(answer.id) ?? 0) + 1;
    evalSeq.current.set(answer.id, seq);
    patchAnswer(answer.id, { evaluating: true, evaluationError: undefined });

    const { job, config } = sessionRef.current;
    const run = (async () => {
      try {
        const res = await fetch("/api/evaluate-turn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: answer.question,
            answer: answer.answer,
            targetRole: job ? `${job.title} at ${job.company}` : undefined,
            competencies: config.focusCompetencies,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Evaluation failed");
        // A newer evaluation for this answer was requested while this one was in flight.
        if (evalSeq.current.get(answer.id) !== seq) return;
        patchAnswer(answer.id, { evaluation: data.evaluation, evaluating: false });
        maybeNudgeAgent(answer.id, data.evaluation);
      } catch (err) {
        if (evalSeq.current.get(answer.id) !== seq) return;
        patchAnswer(answer.id, {
          evaluating: false,
          evaluationError: err instanceof Error ? err.message : "Evaluation failed",
        });
      }
    })();

    pendingEvals.current.add(run);
    void run.finally(() => pendingEvals.current.delete(run));
  }

  // Consecutive interviewer messages belong to the same question until the candidate replies.
  function handleInterviewerTurn(text: string) {
    appendTranscript("interviewer", text);
    const list = answersRef.current;
    const last = list.at(-1);
    if (last && !last.answer) {
      commitAnswers([...list.slice(0, -1), { ...last, question: `${last.question} ${text}`.trim() }]);
    } else {
      commitAnswers([...list, { id: newId(), question: text, answer: "", evaluating: false }]);
    }
  }

  // Every candidate turn re-evaluates the whole answer so far, so badges accumulate.
  function handleCandidateTurn(text: string) {
    appendTranscript("candidate", text);
    const list = answersRef.current;
    const last = list.at(-1);
    const updated: AnswerRecord = last
      ? { ...last, answer: `${last.answer} ${text}`.trim() }
      : { id: newId(), question: "", answer: text, evaluating: false };
    commitAnswers(last ? [...list.slice(0, -1), updated] : [...list, updated]);
    evaluate(updated);
  }

  async function startInterview() {
    setError(null);
    const { resume, job, config } = sessionRef.current;
    if (!resume || !job) return;

    const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
    if (!agentId) {
      setError("NEXT_PUBLIC_ELEVENLABS_AGENT_ID is not configured.");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setMic("unavailable");
      setError("This browser doesn't support microphone access.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setMic("granted");
    } catch (err) {
      const denied = err instanceof DOMException && (err.name === "NotAllowedError" || err.name === "SecurityError");
      setMic(denied ? "denied" : "unavailable");
      setError(
        denied
          ? "Microphone access is blocked. Allow it in your browser's site settings, then try again."
          : "No microphone was found. Connect one and try again.",
      );
      return;
    }

    answersRef.current = [];
    setAnswers([]);
    setTranscript([]);
    evalSeq.current.clear();
    lastNudge.current.clear();

    conversation.startSession({
      agentId,
      overrides: {
        agent: {
          prompt: { prompt: buildAgentPrompt({ persona: config.persona, resume, job, config }) },
          firstMessage: buildFirstMessage(config.persona, resume, job),
        },
      },
    });
  }

  function endInterview() {
    conversation.endSession();
    void finish();
  }

  function switchPersona(persona: InterviewerPersona) {
    if (persona === sessionRef.current.config.persona) return;
    setPersona(persona);
    if (statusRef.current === "connected") sendContextualUpdate(personaSwitchNote(persona));
  }

  // Leaving the page ends the call (the provider unmounts), so don't leave the session stuck "active".
  useEffect(
    () => () => {
      if (sessionRef.current.status === "active") fail("The interview ended because you left the page.");
    },
    [fail],
  );

  return {
    status: conversation.status,
    isSpeaking: conversation.isSpeaking,
    isMuted: conversation.isMuted,
    setMuted: conversation.setMuted,
    getInputFrequencyData: conversation.getInputByteFrequencyData,
    getOutputFrequencyData: conversation.getOutputByteFrequencyData,
    mic,
    error: error ?? session.error ?? null,
    transcript,
    answers,
    startInterview,
    endInterview,
    switchPersona,
  };
}
