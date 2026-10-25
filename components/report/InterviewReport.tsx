"use client";

import { useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Briefcase,
  FileDown,
  Gauge,
  Loader2,
  MessagesSquare,
  PenLine,
  Printer,
  RefreshCw,
  ScrollText,
  Sparkles,
  Sprout,
  Star,
  ThumbsUp,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import type { Feedback } from "@/types";
import { Card } from "@/components/dashboard/Card";
import { Tabs } from "@/components/ui/Tabs";
import { btn, chipMaroon } from "@/components/ui/styles";
import { getPersona } from "@/lib/personas";
import { READINESS, tierForScore } from "@/lib/readiness";
import { downloadText, reportToText, type ReportContext } from "@/lib/report-text";
import { ScoreGauge } from "./ScoreGauge";
import { StarScorecards } from "./StarScorecards";
import { QuestionScoreChart } from "./QuestionScoreChart";
import { PacingPanel } from "./PacingPanel";
import { RewriteComparison } from "./RewriteComparison";

export interface ReportAction {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  primary?: boolean;
}

const unique = (items: string[]) => [...new Set(items.map((s) => s.trim()).filter(Boolean))];

// Strengths/growth bullets: the AI report when available, otherwise the live per-answer feedback.
function bullets(feedback: Feedback) {
  const { report, questions } = feedback;
  return {
    strengths: report?.keyStrengths.length
      ? report.keyStrengths.map((s) => ({ title: s.title, detail: s.evidence, tag: undefined as string | undefined }))
      : unique(questions.flatMap((q) => q.strengths)).slice(0, 5).map((s) => ({ title: s, detail: "", tag: undefined })),
    growth: report?.improvements.length
      ? report.improvements.map((i) => ({ title: i.title, detail: i.detail, tag: i.competency }))
      : unique(questions.flatMap((q) => q.improvements)).slice(0, 5).map((s) => ({ title: s, detail: "", tag: undefined })),
  };
}

function BulletList({ items, tone }: { items: { title: string; detail: string; tag?: string }[]; tone: "good" | "growth" }) {
  if (items.length === 0) return <p className="text-sm text-fg-subtle">Nothing to show yet.</p>;
  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item.title} className="flex gap-3 text-sm">
          <span
            className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
              tone === "good" ? "bg-emerald-400 shadow-[0_0_8px] shadow-emerald-400/60" : "bg-gold-400 shadow-[0_0_8px] shadow-gold-400/60"
            }`}
          />
          <div>
            <p className="font-semibold text-fg">{item.title}</p>
            {item.detail && <p className="mt-0.5 leading-relaxed text-fg-muted">{item.detail}</p>}
            {item.tag && <span className={`${chipMaroon} mt-2`}>{item.tag}</span>}
          </div>
        </li>
      ))}
    </ul>
  );
}

const CELEBRATION = {
  "interview-ready": { icon: Trophy, text: "Interview ready · Gig 'em!", className: "bg-gold-400 text-maroon-950 shadow-lg shadow-gold-500/30" },
  "almost-ready": { icon: Sparkles, text: "Almost there", className: "bg-gold-400/20 text-gold-200 ring-1 ring-inset ring-gold-400/40" },
  developing: { icon: Sprout, text: "Solid foundation", className: "bg-white/10 text-white ring-1 ring-inset ring-white/20" },
  "needs-practice": { icon: Sprout, text: "Keep building", className: "bg-white/10 text-white ring-1 ring-inset ring-white/20" },
};

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/15 px-4 py-2.5 backdrop-blur-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-maroon-200">{label}</p>
      <p className="font-display text-lg font-bold tabular-nums text-white">{value}</p>
    </div>
  );
}

export function InterviewReport({
  feedback,
  context,
  actions,
  onRetryReport,
}: {
  feedback: Feedback;
  context: ReportContext;
  actions: ReportAction[];
  // Provided for the live session; past (library) reports can't regenerate.
  onRetryReport?: () => Promise<void>;
}) {
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  const { report, questions, speech, transcript } = feedback;
  const persona = getPersona(context.persona);
  const { strengths, growth } = bullets(feedback);
  const primary = actions.find((a) => a.primary) ?? actions[0];
  const tier = report?.readinessTier ?? tierForScore(feedback.overallScore);
  const celebration = CELEBRATION[tier];

  async function retryReport() {
    if (!onRetryReport) return;
    setRetrying(true);
    setRetryError(null);
    try {
      await onRetryReport();
    } catch (err) {
      setRetryError(err instanceof Error ? err.message : "Couldn't generate the report");
    } finally {
      setRetrying(false);
    }
  }

  function downloadSummary() {
    const date = new Date(context.startedAt ?? Date.now()).toISOString().slice(0, 10);
    downloadText(`howdyhire-report-${date}.txt`, reportToText(feedback, context));
  }

  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Card title="No answers to score" icon={<AlertTriangle />}>
          <p className="text-sm text-fg-muted">{feedback.summary}</p>
          {primary && (
            <button type="button" onClick={primary.onClick} className={`${btn.primary} mt-4`}>
              <primary.icon className="h-4 w-4" /> {primary.label}
            </button>
          )}
        </Card>
        {speech && speech.totalWords > 0 && <PacingPanel speech={speech} />}
      </div>
    );
  }

  const tabs = [
    {
      id: "overview",
      label: "Overview & Strengths",
      icon: ScrollText,
      content: (
        <div className="space-y-6">
          <Card title="Executive summary" icon={<ScrollText />}>
            <p className="leading-relaxed text-fg">{feedback.summary}</p>
            {report?.aggieSpirit && (
              <div className="mt-5 flex gap-4 rounded-xl border border-gold-400/25 bg-gradient-to-r from-maroon-900/60 to-maroon-950/20 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-400 text-maroon-950 shadow-lg shadow-gold-500/30">
                  <ThumbsUp className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-gold">Aggie spirit</h3>
                  <p className="mt-1 text-sm leading-relaxed text-fg">{report.aggieSpirit}</p>
                </div>
              </div>
            )}
          </Card>
          <div className="grid gap-6 md:grid-cols-2">
            <Card title="Things you did well" icon={<ThumbsUp />}>
              <BulletList items={strengths} tone="good" />
            </Card>
            <Card title="Areas for growth" icon={<Sprout />}>
              <BulletList items={growth} tone="growth" />
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: "star",
      label: "STAR Scorecard",
      icon: Star,
      content: (
        <div className="space-y-6">
          <StarScorecards questions={questions} breakdown={report?.starBreakdown} speech={speech} />
          <Card title="Score by question" icon={<BarChart3 />}>
            <QuestionScoreChart questions={questions} />
          </Card>
        </div>
      ),
    },
    ...(speech
      ? [{ id: "pacing", label: "Pacing & Fillers", icon: Gauge, content: <PacingPanel speech={speech} /> }]
      : []),
    {
      id: "rewrites",
      label: "Sample Re-writes",
      icon: PenLine,
      content: (
        <div className="space-y-6">
          <p className="text-sm text-fg-muted">
            Your answer side by side with a stronger STAR version in an Aggie alum&apos;s voice, built only from your own story.
          </p>
          <RewriteComparison questions={questions} interviewerName={persona.interviewerName} />
          {transcript && transcript.length > 0 && (
            <details className="group rounded-2xl border border-line bg-surface backdrop-blur-md print:hidden">
              <summary className="flex cursor-pointer items-center gap-2 p-5 font-semibold text-fg">
                <MessagesSquare className="h-5 w-5 text-accent" /> Full transcript
                <span className="text-sm font-normal text-fg-subtle">({transcript.length} messages)</span>
              </summary>
              <ol className="space-y-2 border-t border-line p-5 text-sm">
                {transcript.map((t) => (
                  <li key={t.id} className="flex gap-3">
                    <span className={`w-20 shrink-0 text-xs font-semibold ${t.speaker === "candidate" ? "text-fg-subtle" : "text-gold"}`}>
                      {t.speaker === "candidate" ? "You" : persona.interviewerName}
                    </span>
                    <span className="text-fg-muted">{t.text}</span>
                  </li>
                ))}
              </ol>
            </details>
          )}
        </div>
      ),
    },
  ];

  return (
    <article className="mx-auto max-w-6xl space-y-6">
      {/* Hero score card */}
      <header className="relative overflow-hidden rounded-3xl border border-gold-400/20 bg-gradient-to-br from-maroon-600 via-aggie to-maroon-950 p-6 text-white shadow-2xl shadow-maroon-950/60 sm:p-8">
        <span aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold-400/15 blur-3xl" />
        <span aria-hidden className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-maroon-400/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
          <ScoreGauge score={feedback.overallScore} />
          <div className="min-w-0 flex-1">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${celebration.className}`}>
              <celebration.icon className="h-3.5 w-3.5" /> {celebration.text}
            </span>
            <h1 className="mt-3 flex flex-wrap items-center gap-x-2 font-display text-2xl font-bold sm:text-3xl">
              <Briefcase className="h-6 w-6 text-gold-300" />
              {context.jobTitle}
              <span className="font-medium text-maroon-200">@ {context.company}</span>
            </h1>
            <p className="mt-2 text-sm text-maroon-100">
              {READINESS[tier].label}: {READINESS[tier].description}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <HeroStat label="Questions" value={String(questions.length)} />
              {speech?.wordsPerMinute != null && <HeroStat label="Pace" value={`${speech.wordsPerMinute} WPM`} />}
              {speech && <HeroStat label="Fillers" value={String(speech.fillerTotal)} />}
              <HeroStat
                label="Interviewer"
                value={`${persona.interviewerName}${context.durationMinutes ? ` · ${context.durationMinutes}m` : ""}`}
              />
            </div>
          </div>
        </div>

        <div className="relative mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-5 print:hidden">
          {actions.map((a) => (
            <button key={a.label} type="button" onClick={a.onClick} className={a === primary ? btn.onMaroon : btn.onMaroonGhost}>
              <a.icon className="h-4 w-4" /> {a.label}
            </button>
          ))}
          <span className="flex-1" />
          <button type="button" onClick={() => window.print()} className={btn.onMaroonGhost}>
            <Printer className="h-4 w-4" /> Print / PDF
          </button>
          <button type="button" onClick={downloadSummary} className={btn.onMaroonGhost}>
            <FileDown className="h-4 w-4" /> Download .txt
          </button>
        </div>
      </header>

      {feedback.reportError && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm sm:flex-row sm:items-center print:hidden">
          <AlertTriangle className="h-5 w-5 shrink-0 text-warn" />
          <p className="flex-1 text-fg">
            The AI analysis couldn&apos;t be generated ({retryError ?? feedback.reportError}). Scores and tips below come from the
            live STAR evaluation.
          </p>
          {onRetryReport && (
            <button type="button" onClick={retryReport} disabled={retrying} className={btn.primary}>
              {retrying ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Retry
            </button>
          )}
        </div>
      )}

      <Tabs tabs={tabs} />

      <p className="hidden text-xs text-fg-subtle print:block">Generated by HowdyHire · Gig &apos;em</p>
    </article>
  );
}
