"use client";

import Link from "next/link";
import { ConversationProvider } from "@elevenlabs/react";
import { AlertTriangle, Briefcase, Check, FileText, Mic, MicOff, PhoneOff, Play, Tag } from "lucide-react";
import { useSession } from "@/components/providers/SessionProvider";
import { getPersona } from "@/lib/personas";
import { getDuration, warningLeadMs } from "@/lib/durations";
import { topCompetencies } from "@/lib/interview-prompt";
import { PersonaSelector } from "@/components/session/PersonaSelector";
import { DurationSelector } from "@/components/session/DurationSelector";
import { SessionReport } from "@/components/report/SessionReport";
import { PageHeader } from "@/components/ui/PageHeader";
import { RevSays, Reveille } from "@/components/mascot/Reveille";
import { btn, chipMaroon, iconTile, interactiveSurface, surface } from "@/components/ui/styles";
import { useInterviewEngine } from "./useInterviewEngine";
import { LiveStage } from "./LiveStage";
import { TranscriptFeed } from "./TranscriptFeed";
import { StarTracker } from "./StarTracker";
import { PersonaSwitcher } from "./PersonaSwitcher";
import { InterviewTimer } from "./InterviewTimer";

function SetupRequired({ hasResume, hasJob }: { hasResume: boolean; hasJob: boolean }) {
  const items = [
    { done: hasResume, label: "Add your resume", detail: "So your interviewer can ask about your real projects.", href: "/resume", icon: FileText },
    { done: hasJob, label: "Pick a role to practice for", detail: "From the Job Board or the Chrome extension.", href: "/jobs", icon: Briefcase },
  ];
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader eyebrow="Step 1 · Add your context" title="Almost ready!" />
      <RevSays>Howdy! Before we practice, I need two quick things from you.</RevSays>
      <ul className="space-y-3">
        {items.map(({ done, label, detail, href, icon: Icon }) => (
          <li key={label}>
            <Link href={href} className={`${interactiveSurface} group flex items-center gap-4 p-5`}>
              <span className={`${done ? "bg-gold-400 text-maroon-900" : iconTile} flex h-11 w-11 items-center justify-center rounded-xl`}>
                {done ? <Check className="h-5 w-5" strokeWidth={3} /> : <Icon className="h-5 w-5" />}
              </span>
              <span className="flex-1">
                <span className="block font-semibold text-fg">{label}</span>
                <span className="block text-sm text-fg-subtle">{done ? "All set!" : detail}</span>
              </span>
              {!done && <span className="text-sm font-semibold text-aggie transition-transform group-hover:translate-x-0.5">Go →</span>}
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

  if (session.status === "scoring") {
    return (
      <div className={`${surface} mx-auto flex min-h-[55vh] max-w-2xl flex-col items-center justify-center p-10 text-center`}>
        <span className="flex h-36 w-36 animate-bob items-center justify-center overflow-hidden rounded-full bg-cream-200">
          <Reveille mood="happy" size={130} className="translate-y-2" />
        </span>
        <h1 className="mt-6 font-display text-2xl font-bold text-fg">Miss Rev is putting together your recap…</h1>
        <p className="mt-2 max-w-md text-fg-muted">Scoring your STAR answers and pacing. This usually takes 10 to 20 seconds.</p>
        <span className="mt-5 flex gap-1.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-2 w-2 animate-dot rounded-full bg-aggie" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </span>
      </div>
    );
  }

  const connected = engine.status === "connected";
  const connecting = engine.preparing || engine.status === "connecting";
  const inCall = connected || connecting || session.status !== "idle";
  const topics = session.job ? topCompetencies(session.job, session.config.focusCompetencies) : [];
  const duration = getDuration(session.config.durationMinutes);

  const errorBox = engine.error && (
    <p className="mx-auto mt-4 flex max-w-md items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-left text-sm text-red-800 ring-1 ring-inset ring-red-200">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {engine.error}
    </p>
  );

  const topicChips = topics.length > 0 && (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1 text-xs text-fg-subtle">
        <Tag className="h-3.5 w-3.5" /> Topics
      </span>
      {topics.map((t) => (
        <span key={t.name} className={chipMaroon}>
          {t.name}
        </span>
      ))}
    </div>
  );

  // ---------------------------------------------------------------------------
  // Setup (before the call)
  // ---------------------------------------------------------------------------
  if (!inCall) {
    return (
      <div className="mx-auto max-w-6xl space-y-10">
        <PageHeader
          eyebrow="Step 2 · Choose your interviewer"
          title="Practice Session"
          description={
            <>
              Practicing for <span className="font-semibold text-fg">{session.job?.title}</span> at{" "}
              <span className="font-semibold text-fg">{session.job?.company}</span>.
            </>
          }
        />

        <section className="space-y-4">
          <h2 className="font-display text-lg font-semibold text-fg">Who would you like to practice with?</h2>
          <PersonaSelector />
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-lg font-semibold text-fg">How much time do you have?</h2>
          <DurationSelector />
          {topicChips}
        </section>

        <section className={`${surface} flex flex-col gap-6 p-6 sm:p-8 md:flex-row md:items-center`}>
          <RevSays mood="happy" size={60} className="flex-1">
            <p className="font-semibold text-fg">Ready when you are!</p>
            <p className="mt-1 text-fg-muted">
              {persona.interviewerName} will ask about ~{duration.questions} questions in {duration.minutes} minutes. I&apos;ll check off your STAR steps as you go.
            </p>
          </RevSays>
          <div className="md:w-72">
            <button type="button" onClick={engine.startInterview} disabled={connecting} className={`${btn.primary} w-full py-3.5 text-base`}>
              <Play className="h-4 w-4" />
              {engine.mic === "denied" ? "Try the microphone again" : "Start practice session"}
            </button>
            <p className="mt-2 text-center text-xs text-fg-subtle">Your browser will ask to use your microphone.</p>
            {errorBox}
          </div>
        </section>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Live session
  // ---------------------------------------------------------------------------
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 space-y-2">
          <p className="inline-flex items-center gap-2 rounded-full bg-maroon-50 px-3 py-1 text-xs font-semibold text-aggie ring-1 ring-inset ring-maroon-100">
            {connected && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-aggie" />}
            {connected ? "Practice session in progress" : "Connecting"}
          </p>
          <h1 className="truncate font-display text-2xl font-bold text-fg">
            {session.job?.title} <span className="font-medium text-fg-subtle">@ {session.job?.company}</span>
          </h1>
          {topicChips}
        </div>
        <PersonaSwitcher value={session.config.persona} onChange={engine.switchPersona} disabled={!connected} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <section className={`${surface} p-8`}>
            <LiveStage
              active={connected}
              speaking={engine.isSpeaking}
              connecting={connecting}
              getInput={engine.getInputFrequencyData}
              getOutput={engine.getOutputFrequencyData}
              interviewerName={speaker.interviewerName}
              interviewerLabel={persona.label}
            >
              {connected && (
                <div className="mt-6 w-full">
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
                  className={`${btn.secondary} rounded-full px-5 ${engine.isMuted ? "border-gold-400 bg-gold-50 text-gold-700" : ""}`}
                >
                  {engine.isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  {engine.isMuted ? "Unmute" : "Mute"}
                </button>
                <button type="button" onClick={engine.endInterview} disabled={!connected} className={`${btn.primary} rounded-full px-5`}>
                  <PhoneOff className="h-4 w-4" /> Finish &amp; see my recap
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
