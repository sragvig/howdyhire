"use client";

import Link from "next/link";
import { ConversationProvider } from "@elevenlabs/react";
import { AlertTriangle, Loader2, Mic, MicOff, PhoneOff, Play } from "lucide-react";
import { useSession } from "@/components/providers/SessionProvider";
import { Card } from "@/components/dashboard/Card";
import { getPersona } from "@/lib/personas";
import { useInterviewEngine } from "./useInterviewEngine";
import { VoiceVisualizer } from "./VoiceVisualizer";
import { TranscriptFeed } from "./TranscriptFeed";
import { StarTracker } from "./StarTracker";
import { PersonaSwitcher } from "./PersonaSwitcher";
import { InterviewReport } from "@/components/report/InterviewReport";

function SetupRequired({ hasResume, hasJob }: { hasResume: boolean; hasJob: boolean }) {
  return (
    <Card title="Almost ready" icon={<AlertTriangle className="h-5 w-5" />}>
      <p className="text-sm text-stone-600">Your interviewer needs a little context first:</p>
      <ul className="mt-3 space-y-2 text-sm">
        {!hasResume && (
          <li>
            <Link href="/resume" className="font-medium text-aggie underline-offset-2 hover:underline">
              Upload your resume →
            </Link>
          </li>
        )}
        {!hasJob && (
          <li>
            <Link href="/jobs" className="font-medium text-aggie underline-offset-2 hover:underline">
              Pick a role from the job board →
            </Link>
          </li>
        )}
      </ul>
    </Card>
  );
}

function Room() {
  const { session } = useSession();
  const engine = useInterviewEngine();
  const persona = getPersona(session.config.persona);

  if (session.status === "complete" && session.feedback) {
    return <InterviewReport />;
  }

  const connected = engine.status === "connected";
  const connecting = engine.status === "connecting";
  const scoring = session.status === "scoring";

  const statusText = scoring
    ? "Analyzing your interview and writing your report…"
    : connecting
      ? "Connecting…"
      : connected
        ? engine.isSpeaking
          ? `${persona.interviewerName} is speaking`
          : engine.isMuted
            ? "You're muted"
            : "Listening…"
        : "Ready when you are";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">Interview Room</h1>
          <p className="mt-1 text-sm text-stone-600">
            {session.job?.title} · {session.job?.company}
          </p>
        </div>
        <PersonaSwitcher
          value={session.config.persona}
          disabled={scoring || connecting}
          onChange={engine.switchPersona}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white transition-shadow duration-300 ${
                  connected && engine.isSpeaking ? "bg-aggie shadow-[0_0_0_8px_rgba(80,0,0,0.15)]" : "bg-maroon-700"
                }`}
              >
                {persona.interviewerName[0]}
              </div>
              <p className="mt-2 font-semibold">{persona.interviewerName}</p>
              <p className="text-xs text-stone-500">{persona.label}</p>
            </div>

            <div className="mt-4">
              <VoiceVisualizer
                active={connected}
                speaking={engine.isSpeaking}
                getInput={engine.getInputFrequencyData}
                getOutput={engine.getOutputFrequencyData}
              />
            </div>

            <p className="mt-2 flex items-center justify-center gap-2 text-sm font-medium text-stone-600" aria-live="polite">
              {(connecting || scoring) && <Loader2 className="h-4 w-4 animate-spin" />}
              {statusText}
            </p>

            {engine.error && (
              <p className="mx-auto mt-3 flex max-w-md items-start gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {engine.error}
              </p>
            )}

            <div className="mt-5 flex justify-center gap-3">
              {connected ? (
                <>
                  <button
                    type="button"
                    onClick={() => engine.setMuted(!engine.isMuted)}
                    aria-pressed={engine.isMuted}
                    className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50"
                  >
                    {engine.isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    {engine.isMuted ? "Unmute" : "Mute"}
                  </button>
                  <button
                    type="button"
                    onClick={engine.endInterview}
                    className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    <PhoneOff className="h-4 w-4" /> End interview
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={engine.startInterview}
                  disabled={connecting || scoring}
                  className="inline-flex items-center gap-2 rounded-full bg-aggie px-6 py-2.5 text-sm font-semibold text-white hover:bg-maroon-700 disabled:cursor-not-allowed disabled:bg-stone-300"
                >
                  {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  {engine.mic === "denied" ? "Retry microphone" : "Start interview"}
                </button>
              )}
            </div>
          </section>

          <TranscriptFeed entries={engine.transcript} interviewerName={persona.interviewerName} />
        </div>

        <div className="lg:col-span-2">
          <StarTracker answers={engine.answers} />
        </div>
      </div>
    </div>
  );
}

export function InterviewRoom() {
  const { session } = useSession();

  if (session.status === "idle" && (!session.resume || !session.job)) {
    return <SetupRequired hasResume={!!session.resume} hasJob={!!session.job} />;
  }

  return (
    <ConversationProvider>
      <Room />
    </ConversationProvider>
  );
}
