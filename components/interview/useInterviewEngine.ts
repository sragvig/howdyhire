"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useConversation } from "@elevenlabs/react";
import type { AnswerRecord, Feedback, InterviewerPersona, StarEvaluation, TranscriptEntry } from "@/types";
import { useSession } from "@/components/providers/SessionProvider";
import {
  TIME_UP_NOTE,
  buildAgentPrompt,
  buildDynamicVariables,
  buildFirstMessage,
  missingElementsNote,
  personaSwitchNote,
  timeWarningNote,
} from "@/lib/interview-prompt";
import { WRAP_UP_GRACE_MS, warningLeadMs } from "@/lib/durations";
import { buildFeedback, missingElements } from "@/lib/star";
import { getPersona } from "@/lib/personas";
import { detectStarCues } from "@/lib/star-heuristics";
import { analyzeSpeech } from "@/lib/speech-analytics";
import { cleanTranscriptText } from "@/lib/transcript-clean";
import { requestReport } from "@/lib/report-client";

export type MicPermission = "unknown" | "granted" | "denied" | "unavailable";

const newId = () => crypto.randomUUID();

export function useInterviewEngine() {
  const { session, setPersona, start, beginScoring, complete, fail } = useSession();

  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [mic, setMic] = useState<MicPermission>("unknown");
  const [error, setError] = useState<string | null>(null);
  // True between clicking Start and the SDK taking over (mic prompt + signed URL fetch).
  const [preparing, setPreparing] = useState(false);
  // The persona whose voice and name the agent was started with; mid-call switches only change style.
  const [callPersona, setCallPersona] = useState<InterviewerPersona | null>(null);

  // Interview clock: started on connect, ticked once a second while connected.
  const [callStartedAt, setCallStartedAt] = useState<number | null>(null);
  const [limitMs, setLimitMs] = useState(0);
  const [now, setNow] = useState(0);
  const timeNotes = useRef({ warned: false, timeUp: false, ended: false });

  // Refs hold the source of truth for values read inside SDK callbacks and async work,
  // where render-time state would be stale.
  const answersRef = useRef<AnswerRecord[]>([]);
  const transcriptRef = useRef<TranscriptEntry[]>([]);
  const sessionRef = useRef(session);
  const pendingEvals = useRef(new Set<Promise<void>>());
  const evalSeq = useRef(new Map<string, number>());
  const lastNudge = useRef(new Map<string, string>());
  const finishing = useRef(false);

  // Speaking-time bookkeeping for the pace metric. Voice-activity (VAD) events give actual speech
  // time when the agent sends them; otherwise fall back to the window between the interviewer
  // finishing and the candidate's transcript arriving (includes thinking pauses).
  const timing = useRef({ listeningSince: 0, lastMessageAt: 0, turnMs: 0, vadMs: 0, vadEvents: 0, lastVadAt: 0 });

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

  const updateTranscript = (fn: (prev: TranscriptEntry[]) => TranscriptEntry[]) => {
    transcriptRef.current = fn(transcriptRef.current);
    setTranscript(transcriptRef.current);
  };

  const appendTranscript = (speaker: TranscriptEntry["speaker"], text: string) =>
    updateTranscript((prev) => [...prev, { id: newId(), speaker, text, at: new Date().toISOString() }]);

  const finish = useCallback(async () => {
    if (sessionRef.current.status !== "active" || finishing.current) return;
    finishing.current = true;
    beginScoring();
    await Promise.allSettled([...pendingEvals.current]);

    // Local STAR scores always exist; the AI report is layered on top when it succeeds.
    const t = timing.current;
    const useVad = t.vadEvents >= 20 && t.vadMs > 0;
    let feedback: Feedback = {
      ...buildFeedback(answersRef.current),
      speech: analyzeSpeech(
        answersRef.current.map((a) => a.answer).filter(Boolean),
        useVad ? t.vadMs : t.turnMs,
        useVad ? "voice-activity" : "turn-timing",
      ),
      transcript: transcriptRef.current,
    };
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
    onConnect: () => {
      start();
      timeNotes.current = { warned: false, timeUp: false, ended: false };
      const t = Date.now();
      setCallStartedAt(t);
      setNow(t);
    },
    onMessage: ({ message, role }) => {
      // Clean once here so both the transcript and every Gemini request get tag-free text.
      const text = cleanTranscriptText(message);
      if (!text) return;
      if (role === "agent") handleInterviewerTurn(text);
      else handleCandidateTurn(text);
    },
    // When the candidate interrupts, ElevenLabs sends the truncated text the agent actually spoke.
    onAgentResponseCorrection: ({ original_agent_response, corrected_agent_response }) =>
      updateTranscript((prev) => {
        const original = cleanTranscriptText(original_agent_response);
        const idx = prev.findLastIndex((t) => t.speaker === "interviewer" && t.text === original);
        if (idx === -1) return prev;
        const next = [...prev];
        next[idx] = { ...next[idx], text: cleanTranscriptText(corrected_agent_response) };
        return next;
      }),
    onModeChange: ({ mode }) => {
      if (mode === "listening") timing.current.listeningSince = Date.now();
    },
    onVadScore: ({ vadScore }) => {
      const t = timing.current;
      const now = Date.now();
      // Cap each gap so a stalled event stream doesn't count as speech.
      if (t.lastVadAt && vadScore >= 0.5) t.vadMs += Math.min(now - t.lastVadAt, 500);
      t.lastVadAt = now;
      t.vadEvents++;
    },
    onDisconnect: (details) => {
      setCallStartedAt(null);
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
    timing.current.lastMessageAt = Date.now();
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
  // Heuristic cues light badges instantly; Gemini confirms or corrects them a moment later.
  function handleCandidateTurn(text: string) {
    const t = timing.current;
    const now = Date.now();
    const turnStart = Math.max(t.listeningSince, t.lastMessageAt);
    if (turnStart) t.turnMs += now - turnStart;
    t.lastMessageAt = now;
    appendTranscript("candidate", text);
    const list = answersRef.current;
    const last = list.at(-1);
    const answer = last ? `${last.answer} ${text}`.trim() : text;
    const updated: AnswerRecord = last
      ? { ...last, answer, heuristic: detectStarCues(answer) }
      : { id: newId(), question: "", answer, heuristic: detectStarCues(answer), evaluating: false };
    commitAnswers(last ? [...list.slice(0, -1), updated] : [...list, updated]);
    evaluate(updated);
  }

  async function fetchSignedUrl(): Promise<string> {
    let res: Response;
    try {
      res = await fetch("/api/elevenlabs/signed-url", { cache: "no-store" });
    } catch {
      throw new Error("Couldn't reach the server to start the interview. Check your connection and try again.");
    }
    const data = await res.json().catch(() => null);
    if (!res.ok || typeof data?.signedUrl !== "string") {
      throw new Error(data?.error ?? "Couldn't start the voice session. Try again.");
    }
    return data.signedUrl;
  }

  async function startInterview() {
    if (preparing) return;
    setError(null);
    const { resume, job, config } = sessionRef.current;
    if (!resume || !job) return;

    setPreparing(true);
    try {
      if (!(await requestMic())) return;

      let signedUrl: string;
      try {
        signedUrl = await fetchSignedUrl();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't start the voice session.");
        return;
      }

      answersRef.current = [];
      setAnswers([]);
      transcriptRef.current = [];
      setTranscript([]);
      setLimitMs(config.durationMinutes * 60_000);
      evalSeq.current.clear();
      lastNudge.current.clear();
      timing.current = { listeningSince: 0, lastMessageAt: 0, turnMs: 0, vadMs: 0, vadEvents: 0, lastVadAt: 0 };

      // Persona voice + prompt go in as session overrides; the signed URL only authorizes the agent.
      const { voiceId } = getPersona(config.persona);
      setCallPersona(config.persona);
      conversation.startSession({
        signedUrl,
        overrides: {
          agent: {
            prompt: { prompt: buildAgentPrompt({ persona: config.persona, resume, job, config }) },
            firstMessage: buildFirstMessage(config.persona, resume, job),
          },
          ...(voiceId && { tts: { voiceId } }),
        },
        dynamicVariables: buildDynamicVariables({ resume, job, config }),
      });
    } finally {
      setPreparing(false);
    }
  }

  // Ask for the mic up front so a denial gets a clear message instead of a failed connection.
  async function requestMic(): Promise<boolean> {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMic("unavailable");
      setError("This browser doesn't support microphone access.");
      return false;
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
      return false;
    }
    return true;
  }

  function endInterview() {
    conversation.endSession();
    void finish();
  }

  // Keep the timer effect pointed at the latest endInterview without re-arming the interval.
  const endInterviewRef = useRef(endInterview);
  useEffect(() => {
    endInterviewRef.current = endInterview;
  });

  // Time management: warn the agent near the limit, tell it time's up at the limit, and end the
  // call automatically after a short wrap-up grace period.
  useEffect(() => {
    if (callStartedAt === null || conversation.status !== "connected" || !limitMs) return;
    const minutes = sessionRef.current.config.durationMinutes;
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      const elapsed = t - callStartedAt;
      const notes = timeNotes.current;
      if (!notes.warned && elapsed >= limitMs - warningLeadMs(minutes)) {
        notes.warned = true;
        sendContextualUpdate(timeWarningNote(Math.max(0, Math.round((limitMs - elapsed) / 1000))));
      }
      if (!notes.timeUp && elapsed >= limitMs) {
        notes.timeUp = true;
        sendContextualUpdate(TIME_UP_NOTE);
      }
      if (!notes.ended && elapsed >= limitMs + WRAP_UP_GRACE_MS) {
        notes.ended = true;
        endInterviewRef.current();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [callStartedAt, conversation.status, limitMs, sendContextualUpdate]);

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
    preparing,
    callPersona,
    elapsedMs: callStartedAt === null ? 0 : Math.max(0, now - callStartedAt),
    limitMs,
    error: error ?? session.error ?? null,
    transcript,
    answers,
    startInterview,
    endInterview,
    switchPersona,
  };
}
