"use client";

import Link from "next/link";
import { ConversationProvider } from "@elevenlabs/react";
import { AlertTriangle, Briefcase, Check, FileText, Loader2, Mic, MicOff, PhoneOff, Play, Sparkles, Tag } from "lucide-react";
import { useSession } from "@/components/providers/SessionProvider";
import { getPersona } from "@/lib/personas";
import { getDuration, warningLeadMs } from "@/lib/durations";
import { topCompetencies } from "@/lib/interview-prompt";
import { PersonaSelector } from "@/components/session/PersonaSelector";
import { DurationSelector } from "@/components/session/DurationSelector";
import { SessionReport } from "@/components/report/SessionReport";
import { PageHeader } from "@/components/ui/PageHeader";
import { btn, chipMaroon, surface } from "@/components/ui/styles";
import { useInterviewEngine } from "./useInterviewEngine";
import { LiveStage } from "./LiveStage";
import { TranscriptFeed } from "./TranscriptFeed";
import { StarTracker } from "./StarTracker";
import { PersonaSwitcher } from "./PersonaSwitcher";
import { InterviewTimer } from "./InterviewTimer";

function SetupRequired({ hasResume, hasJob }: { hasResume: boolean; hasJob: boolean }) {
  const items = [
    { done: hasResume, label: "Upload your resume", detail: "So your interviewer can reference your real projects.", href: "/resume", icon: FileText },
    { done: hasJob, label: "Pick a target role", detail: "From the Aggie Job Board or the Chrome extension.", href: "/jobs", icon: Briefcase },
  ];
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader eyebrow="Step 1 · Import context" title="Let's set the stage" description="Your interviewer needs two things before you go live." />
      <ul className="space-y-3">
        {items.map(({ done, label, detail, href, icon: Icon }) => (
          <li key={label}>
            <Link
              href={href}
              className={`${surface} group flex items-center gap-4 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-maroon-400/40 hover:shadow-maroon-900/30`}
            >
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                  done ? "bg-gold-400/15 text-gold ring-1 ring-inset ring-gold-400/40" : "bg-maroon-500/15 text-accent ring-1 ring-inset ring-maroon-400/25"
                }`}
              >
                {done ? <Check className="h-5 w-5" strokeWidth={3} /> : <Icon className="h-5 w-5" />}
              </span>
              <span className="flex-1">
                <span className="block font-semibold text-fg">{label}</span>
                <span className="block text-sm text-fg-subtle">{done ? "Done" : detail}</span>
              </span>
              {!done && <span className="text-sm font-semibold text-accent transition-transform group-hover:translate-x-0.5">Go →</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Room() {
  const { session } = useSession();
  const engine = useInterviewEngine();
  const persona = getPersona(session.config.persona);
  // Name/avatar stay with the voice the call started with, even if the style is switched mid-call.
  const speaker = getPersona(engine.callPersona ?? session.config.persona);

  if (session.status === "complete" && session.feedback) {
    return <SessionReport />;
  }

  // Once the call ends, swap the live room for an analysis state until the report is ready.
  if (session.status === "scoring") {
    return (
      <div className={`${surface} mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center p-8 text-center`}>
        <div className="relative flex h-24 w-24 items-center justify-center">
          <span className="absolute inset-0 animate-halo rounded-full border-2 border-gold-400/60" />
          <span className="absolute inset-3 animate-halo rounded-full border-2 border-maroon-400/60 [animation-delay:0.8s]" />
          <Sparkles className="h-9 w-9 text-gold" />
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold text-fg">Analyzing your interview</h1>
        <p className="mt-2 max-w-md text-sm text-fg-muted">
          Scoring your STAR answers, pacing, and filler words, and writing your personalized Aggie feedback. This usually
          takes 10–20 seconds.
        </p>
      </div>
    );
  }

  const connected = engine.status === "connected";
  const connecting = engine.preparing || engine.status === "connecting";
  const inCall = connected || connecting || session.status !== "idle";
  const topics = session.job ? topCompetencies(session.job, session.config.focusCompetencies) : [];
  const duration = getDuration(session.config.durationMinutes);

  const statusText = connecting
    ? "Connecting to your interviewer…"
    : connected
      ? engine.isSpeaking
        ? `${speaker.interviewerName} is speaking`
        : engine.isMuted
          ? "Your mic is muted"
          : "Listening… take your time"
      : "Ready when you are";

  const errorBox = engine.error && (
    <p className="mx-auto mt-4 flex max-w-md items-start gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-left text-sm text-bad">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {engine.error}
    </p>
  );

  // ---------------------------------------------------------------------------
  // Setup hub (before the call)
  // ---------------------------------------------------------------------------
  if (!inCall) {
    return (
      <div className="mx-auto max-w-6xl space-y-8">
        <PageHeader
          eyebrow="Step 2 · Choose your interviewer"
          title="Interview Studio"
          description={
            <>
              Practicing for <span className="font-semibold text-fg">{session.job?.title}</span> at{" "}
              <span className="font-semibold text-fg">{session.job?.company}</span>. Pick who you&apos;ll face and how long you have.
            </>
          }
        />

        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-fg-subtle">Interviewer</h2>
          <PersonaSelector />
        </section>

        <div className="grid gap-6 lg:grid-cols-5">
          <section className="space-y-3 lg:col-span-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-fg-subtle">Session length</h2>
            <DurationSelector />
            {topics.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="inline-flex items-center gap-1 text-xs text-fg-subtle">
                  <Tag className="h-3.5 w-3.5" /> Focus topics
                </span>
                {topics.map((t) => (
                  <span key={t.name} className={chipMaroon}>
                    {t.name}
                  </span>
                ))}
              </div>
            )}
          </section>

          <section className={`${surface} relative overflow-hidden p-6 lg:col-span-2`}>
            <span aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-maroon-600/30 blur-3xl" />
            <p className="relative text-xs font-semibold uppercase tracking-[0.18em] text-gold">Step 3 · Live session</p>
            <p className="relative mt-2 font-display text-xl font-bold text-fg">
              {persona.interviewerName} is ready for you
            </p>
            <p className="relative mt-1 text-sm text-fg-muted">
              {duration.label === "Demo" ? "2-minute demo" : `${duration.minutes}-minute session`} · ~{duration.questions} questions
              · voice interview
            </p>
            <button type="button" onClick={engine.startInterview} disabled={connecting} className={`${btn.primary} relative mt-5 w-full py-3 text-base`}>
              <Play className="h-4 w-4" />
              {engine.mic === "denied" ? "Retry microphone" : "Start live session"}
            </button>
            <p className="relative mt-3 text-center text-xs text-fg-subtle">Your browser will ask for microphone access.</p>
            {errorBox}
          </section>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Live room
  // ---------------------------------------------------------------------------
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {connected && <span className="h-2 w-2 animate-pulse rounded-full bg-maroon-400" />}
            {connected ? "Live session" : "Connecting"}
          </p>
          <h1 className="mt-1 truncate font-display text-2xl font-bold text-fg">
            {session.job?.title} <span className="font-medium text-fg-subtle">@ {session.job?.company}</span>
          </h1>
          {topics.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {topics.map((t) => (
                <span key={t.name} className={chipMaroon}>
                  {t.name}
                </span>
              ))}
            </div>
          )}
        </div>
        <PersonaSwitcher value={session.config.persona} onChange={engine.switchPersona} disabled={!connected} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <section className={`${surface} relative overflow-hidden p-6`}>
            <span aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-56 w-80 -translate-x-1/2 rounded-full bg-maroon-700/25 blur-3xl" />
            <LiveStage
              active={connected}
              speaking={engine.isSpeaking}
              getInput={engine.getInputFrequencyData}
              getOutput={engine.getOutputFrequencyData}
              initial={speaker.interviewerName[0]}
              name={speaker.interviewerName}
              subtitle={persona.label}
            >
              <p className="mt-3 flex items-center gap-2 text-sm font-medium text-fg-muted" aria-live="polite">
                {connecting && <Loader2 className="h-4 w-4 animate-spin" />}
                {statusText}
              </p>
              {connected && (
                <div className="mt-4 w-full">
                  <InterviewTimer
                    elapsedMs={engine.elapsedMs}
                    limitMs={engine.limitMs}
                    warningMs={warningLeadMs(session.config.durationMinutes)}
                  />
                </div>
              )}
              {errorBox}
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => engine.setMuted(!engine.isMuted)}
                  aria-pressed={engine.isMuted}
                  disabled={!connected}
                  className={`${engine.isMuted ? `${btn.secondary} border-gold-400/50 text-gold` : btn.secondary} rounded-full px-5`}
                >
                  {engine.isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  {engine.isMuted ? "Unmute mic" : "Mute mic"}
                </button>
                <button type="button" onClick={engine.endInterview} disabled={!connected} className={`${btn.danger} rounded-full px-5`}>
                  <PhoneOff className="h-4 w-4" /> End session &amp; analyze
                </button>
              </div>
            </LiveStage>
          </section>

          <TranscriptFeed entries={engine.transcript} interviewerName={speaker.interviewerName} />
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
