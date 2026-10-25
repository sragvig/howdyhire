"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Gauge, MessageSquareWarning, Mic2, Timer, Type, UserRound, type LucideIcon } from "lucide-react";
import type { SpeechAnalytics } from "@/types";
import { paceBand } from "@/lib/speech-analytics";
import { Card } from "@/components/dashboard/Card";

const SCALE_MIN = 60;
const SCALE_MAX = 220;
const TARGET = [120, 160] as const;
const pct = (wpm: number) => ((Math.min(SCALE_MAX, Math.max(SCALE_MIN, wpm)) - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;
const HESITATION_WORDS = new Set(["um", "uh", "er"]);

type Status = "good" | "watch" | "neutral";

interface Metric {
  id: string;
  label: string;
  icon: LucideIcon;
  value: string;
  unit: string;
  status: Status;
  statusLabel: string;
  insight: string;
}

function buildMetrics(s: SpeechAnalytics): Metric[] {
  const wpm = s.wordsPerMinute;
  const band = wpm !== null ? paceBand(wpm) : null;
  const hesitations = s.fillers.filter((f) => HESITATION_WORDS.has(f.word)).reduce((n, f) => n + f.count, 0);
  const pronouns = s.firstPersonSingular + s.firstPersonPlural;
  const iPct = pronouns ? Math.round((s.firstPersonSingular / pronouns) * 100) : null;

  return [
    {
      id: "pace",
      label: "Pace",
      icon: Timer,
      value: wpm !== null ? String(wpm) : "–",
      unit: "WPM",
      status: band === null ? "neutral" : band === "good" ? "good" : "watch",
      statusLabel: band === null ? "Not enough speech" : band === "good" ? "Conversational" : band === "fast" ? "A bit fast" : "A bit slow",
      insight:
        band === "fast"
          ? "You're speaking faster than the 120–160 WPM sweet spot. Pause briefly between Situation, Task, Action, and Result so each beat lands."
          : band === "slow"
            ? "You're under 120 WPM. A slightly quicker tempo reads as more confident; prepare your opening line so you start strong."
            : band === "good"
              ? "Right in the 120–160 WPM sweet spot: easy to follow and confident."
              : "Speak a little longer next session to get a reliable pace reading.",
    },
    {
      id: "hesitations",
      label: "Hesitations",
      icon: Mic2,
      value: String(hesitations),
      unit: "um / uh",
      status: hesitations <= 3 ? "good" : "watch",
      statusLabel: hesitations <= 3 ? "Minimal" : "Noticeable",
      insight:
        hesitations <= 3
          ? "Very few audible hesitations. Your delivery sounds prepared."
          : "Replace “um” and “uh” with a silent pause. A one-second breath sounds deliberate; filler sounds unsure.",
    },
    {
      id: "fillers",
      label: "Filler rate",
      icon: MessageSquareWarning,
      value: String(s.fillersPer100Words),
      unit: "per 100 words",
      status: s.fillersPer100Words <= 2 ? "good" : "watch",
      statusLabel: s.fillersPer100Words <= 2 ? "Low" : s.fillersPer100Words <= 5 ? "Moderate" : "High",
      insight: `${s.fillerTotal} filler word${s.fillerTotal === 1 ? "" : "s"} total${
        s.fillers[0] ? `; your most common was “${s.fillers[0].word}”` : ""
      }. Under 2 per 100 words sounds polished.`,
    },
    {
      id: "ownership",
      label: "Ownership",
      icon: UserRound,
      value: iPct !== null ? `${iPct}%` : "–",
      unit: "“I” vs “we”",
      status: iPct === null ? "neutral" : iPct >= 60 ? "good" : "watch",
      statusLabel: iPct === null ? "No data" : iPct >= 60 ? "Strong" : "Lean on “I”",
      insight:
        iPct === null
          ? "Not enough first-person language to measure."
          : `${s.firstPersonSingular} “I/me/my” vs ${s.firstPersonPlural} “we/us/our”. Interviewers want your personal actions; credit the team, then say what you did.`,
    },
    {
      id: "words",
      label: "Words spoken",
      icon: Type,
      value: s.totalWords.toLocaleString(),
      unit: "total",
      status: "neutral",
      statusLabel: "Volume",
      insight: "Total words across all your answers. Strong STAR answers usually run 150–300 words each.",
    },
  ];
}

const STATUS_STYLE: Record<Status, string> = {
  good: "text-good",
  watch: "text-warn",
  neutral: "text-fg-subtle",
};

export function PacingPanel({ speech }: { speech: SpeechAnalytics }) {
  const metrics = buildMetrics(speech);
  const [selected, setSelected] = useState(metrics[0].id);
  const active = metrics.find((m) => m.id === selected) ?? metrics[0];
  const wpm = speech.wordsPerMinute;
  const maxFiller = speech.fillers[0]?.count ?? 0;

  return (
    <div className="space-y-6">
      {/* Interactive metric chips */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {metrics.map((m) => {
          const isActive = m.id === active.id;
          const Icon = m.icon;
          const StatusIcon = m.status === "watch" ? AlertCircle : CheckCircle2;
          return (
            <button
              key={m.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => setSelected(m.id)}
              className={`rounded-2xl border p-4 text-left backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 ${
                isActive
                  ? "border-maroon-400/60 bg-gradient-to-b from-maroon-800/50 to-surface shadow-xl shadow-maroon-900/40 ring-1 ring-maroon-400/30"
                  : "border-line bg-surface shadow-lg shadow-black/20 hover:border-maroon-400/30"
              }`}
            >
              <p className="flex items-center gap-1.5 text-xs font-medium text-fg-subtle">
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-gold" : ""}`} /> {m.label}
              </p>
              <p className="mt-2 font-display text-3xl font-extrabold tabular-nums text-fg">{m.value}</p>
              <p className="text-xs text-fg-subtle">{m.unit}</p>
              <p className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${STATUS_STYLE[m.status]}`}>
                {m.status !== "neutral" && <StatusIcon className="h-3.5 w-3.5" />} {m.statusLabel}
              </p>
            </button>
          );
        })}
      </div>

      <div className="animate-fade-up rounded-2xl border border-gold-400/20 bg-gradient-to-r from-maroon-900/40 to-transparent p-4 text-sm text-fg" key={active.id} aria-live="polite">
        <span className="font-semibold text-gold">{active.label}: </span>
        {active.insight}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Speaking pace" icon={<Gauge />}>
          {wpm !== null ? (
            <>
              <div className="relative mt-2 h-3 rounded-full bg-white/10">
                <div
                  className="absolute inset-y-0 rounded-full bg-emerald-400/25 ring-1 ring-inset ring-emerald-400/40"
                  style={{ left: `${pct(TARGET[0])}%`, width: `${pct(TARGET[1]) - pct(TARGET[0])}%` }}
                />
                <div
                  className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-gradient-to-br from-maroon-400 to-aggie shadow-lg shadow-maroon-700/60 transition-all duration-700"
                  style={{ left: `${pct(wpm)}%` }}
                  title={`${wpm} words per minute`}
                />
              </div>
              <div className="relative mt-2 h-4 text-xs tabular-nums text-fg-subtle">
                <span className="absolute left-0">{SCALE_MIN}</span>
                <span className="absolute -translate-x-1/2 text-good" style={{ left: `${(pct(TARGET[0]) + pct(TARGET[1])) / 2}%` }}>
                  target {TARGET[0]}–{TARGET[1]}
                </span>
                <span className="absolute right-0">{SCALE_MAX}+</span>
              </div>
              <p className="mt-4 text-sm text-fg-muted">
                You averaged <span className="font-semibold text-fg">{wpm} words per minute</span>.
              </p>
            </>
          ) : (
            <p className="text-sm text-fg-muted">Not enough speech to estimate pace.</p>
          )}
          <p className="mt-3 text-xs text-fg-subtle">
            {speech.timingMethod === "voice-activity"
              ? "Measured from voice activity."
              : "Estimated from turn timing (includes thinking pauses), so it may read slightly low."}
          </p>
        </Card>

        <Card title="Filler words" icon={<MessageSquareWarning />}>
          {speech.fillers.length === 0 ? (
            <p className="text-sm text-fg-muted">No filler words detected. Crisp delivery!</p>
          ) : (
            <ul className="space-y-2">
              {speech.fillers.map((f) => (
                <li key={f.word} className="grid grid-cols-[5.5rem_1fr_2rem] items-center gap-3 text-sm" title={`"${f.word}": ${f.count}`}>
                  <span className="truncate text-fg-muted">&ldquo;{f.word}&rdquo;</span>
                  <span className="h-2 overflow-hidden rounded-full bg-white/10">
                    <span
                      className="block h-2 rounded-full bg-gradient-to-r from-maroon-600 to-maroon-400"
                      style={{ width: `${(f.count / maxFiller) * 100}%` }}
                    />
                  </span>
                  <span className="text-right font-semibold tabular-nums text-fg">{f.count}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-fg-subtle">Speech-to-text can drop some “um”s and “uh”s, so counts are a lower bound.</p>
        </Card>
      </div>
    </div>
  );
}
