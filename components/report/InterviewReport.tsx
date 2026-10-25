"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Check,
  FileDown,
  Gauge,
  ListChecks,
  Loader2,
  MessagesSquare,
  Printer,
  RefreshCw,
  Smile,
  Star,
  ThumbsUp,
  type LucideIcon,
} from "lucide-react";
import type { Feedback } from "@/types";
import { Card } from "@/components/dashboard/Card";
import { Tabs } from "@/components/ui/Tabs";
import { RevSays, Reveille } from "@/components/mascot/Reveille";
import { btn, chipMaroon, surface } from "@/components/ui/styles";
import { getPersona } from "@/lib/personas";
import { tierForScore } from "@/lib/readiness";
import { downloadText, reportToText, type ReportContext } from "@/lib/report-text";
import { ScoreGauge } from "./ScoreGauge";
import { ReadinessBadge } from "./ReadinessBadge";
import { StarScorecards } from "./StarScorecards";
import { QuestionScoreChart } from "./QuestionScoreChart";
import { DeliveryStats } from "./DeliveryStats";
import { RewriteComparison } from "./RewriteComparison";

export interface ReportAction {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  primary?: boolean;
}

const unique = (items: string[]) => [...new Set(items.map((s) => s.trim()).filter(Boolean))];

// Strengths/next steps: the AI recap when available, otherwise the live per-answer feedback.
function bullets(feedback: Feedback) {
  const { report, questions } = feedback;
  return {
    strengths: report?.keyStrengths.length
      ? report.keyStrengths.map((s) => ({ title: s.title, detail: s.evidence, tag: undefined as string | undefined }))
      : unique(questions.flatMap((q) => q.strengths)).slice(0, 4).map((s) => ({ title: s, detail: "", tag: undefined })),
    growth: report?.improvements.length
      ? report.improvements.map((i) => ({ title: i.title, detail: i.detail, tag: i.competency }))
      : unique(questions.flatMap((q) => q.improvements)).slice(0, 4).map((s) => ({ title: s, detail: "", tag: undefined })),
  };
}

function PointCards({ items, tone }: { items: { title: string; detail: string; tag?: string }[]; tone: "good" | "next" }) {
  if (items.length === 0) return <p className="text-sm text-fg-subtle">Nothing here yet.</p>;
  const Icon = tone === "good" ? Check : ArrowUpRight;
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.title} className="flex items-start gap-3 rounded-xl bg-surface-muted p-3">
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
              tone === "good" ? "bg-emerald-600 text-white" : "bg-gold-400 text-maroon-900"
            }`}
          >
            <Icon className="h-4 w-4" strokeWidth={3} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-fg">{item.title}</p>
            {item.detail && <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-fg-muted">{item.detail}</p>}
            {item.tag && <span className={`${chipMaroon} mt-1.5`}>{item.tag}</span>}
          </div>
        </li>
      ))}
    </ul>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-surface-muted px-3 py-1.5 text-sm">
      <span className="text-fg-subtle">{label}</span>
      <span className="font-semibold tabular-nums text-fg">{value}</span>
    </span>
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
  // Provided for the live session; past (library) recaps can't regenerate.
  onRetryReport?: () => Promise<void>;
}) {
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  const { report, questions, speech, transcript } = feedback;
  const persona = getPersona(context.persona);
  const { strengths, growth } = bullets(feedback);
  const primary = actions.find((a) => a.primary) ?? actions[0];
  const tier = report?.readinessTier ?? tierForScore(feedback.overallScore);
  const gigEm = feedback.overallScore >= 85;

  async function retryReport() {
    if (!onRetryReport) return;
    setRetrying(true);
    setRetryError(null);
    try {
      await onRetryReport();
    } catch (err) {
      setRetryError(err instanceof Error ? err.message : "Couldn't build the recap");
    } finally {
      setRetrying(false);
    }
  }

  function downloadSummary() {
    const date = new Date(context.startedAt ?? Date.now()).toISOString().slice(0, 10);
    downloadText(`howdyhire-recap-${date}.txt`, reportToText(feedback, context));
  }

  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <RevSays mood="happy" size={64}>
          <p className="font-semibold">That one was a little short for a full recap!</p>
          <p className="mt-1 text-fg-muted">{feedback.summary}</p>
        </RevSays>
        {primary && (
          <button type="button" onClick={primary.onClick} className={btn.primary}>
            <primary.icon className="h-4 w-4" /> {primary.label}
          </button>
        )}
        {speech && speech.totalWords > 0 && <DeliveryStats speech={speech} />}
      </div>
    );
  }

  const tabs = [
    {
      id: "summary",
      label: "Summary",
      icon: Smile,
      content: (
        <div className="space-y-6">
          <RevSays mood={gigEm ? "cheer" : "happy"} size={56}>
            <p>{feedback.summary}</p>
            {report?.aggieSpirit && (
              <p className="mt-3 flex items-start gap-2 rounded-xl bg-gold-50 px-3 py-2 text-xs leading-relaxed text-gold-700">
                <ThumbsUp className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {report.aggieSpirit}
              </p>
            )}
          </RevSays>

          <div className="grid gap-6 md:grid-cols-2">
            <Card title="What you nailed" icon={<ThumbsUp />}>
              <PointCards items={strengths} tone="good" />
            </Card>
            <Card title="Try this next time" icon={<ArrowUpRight />}>
              <PointCards items={growth} tone="next" />
            </Card>
          </div>

          {speech && (
            <section className="space-y-3">
              <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-fg">
                <Gauge className="h-5 w-5 text-accent" /> How you sounded
              </h3>
              <DeliveryStats speech={speech} />
            </section>
          )}
        </div>
      ),
    },
    {
      id: "star",
      label: "STAR Breakdown",
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
    {
      id: "questions",
      label: "Key Questions",
      icon: ListChecks,
      content: (
        <div className="space-y-4">
          <RewriteComparison questions={questions} interviewerName={persona.interviewerName} />
          {transcript && transcript.length > 0 && (
            <details className={`${surface} print:hidden`}>
              <summary className="flex cursor-pointer items-center gap-2 p-5 font-semibold text-fg">
                <MessagesSquare className="h-5 w-5 text-accent" /> Full conversation
                <span className="text-sm font-normal text-fg-subtle">({transcript.length} messages)</span>
              </summary>
              <ol className="space-y-2 border-t border-stone-200 p-5 text-sm">
                {transcript.map((t) => (
                  <li key={t.id} className="flex gap-3">
                    <span className={`w-20 shrink-0 text-xs font-semibold ${t.speaker === "candidate" ? "text-fg-subtle" : "text-accent"}`}>
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
    <article className="mx-auto max-w-6xl space-y-8">
      {/* Recap hero */}
      <header className={`${surface} p-6 sm:p-8`}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          <ScoreGauge score={feedback.overallScore} />

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-fg-subtle">Your practice recap</p>
            <h1 className="mt-1 font-display text-2xl font-bold text-fg sm:text-3xl">
              {context.jobTitle} <span className="font-medium text-fg-subtle">@ {context.company}</span>
            </h1>
            <div className="mt-3">
              <ReadinessBadge tier={tier} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <StatChip label="Questions" value={String(questions.length)} />
              {speech?.wordsPerMinute != null && <StatChip label="Pace" value={`${speech.wordsPerMinute} wpm`} />}
              {speech && <StatChip label="Filler words" value={String(speech.fillerTotal)} />}
              <StatChip label="With" value={`${persona.interviewerName}${context.durationMinutes ? ` · ${context.durationMinutes} min` : ""}`} />
            </div>
          </div>

          {/* Mascot verdict */}
          <div
            className={`flex items-center gap-4 rounded-2xl p-4 lg:w-72 lg:flex-col lg:text-center ${
              gigEm ? "bg-gold-50 ring-2 ring-gold-300" : "bg-surface-muted"
            }`}
          >
            <span className="relative shrink-0">
              <span className="block rounded-full border-2 border-maroon-800">
                <Reveille mood={gigEm ? "cheer" : "happy"} size={76} />
              </span>
              {gigEm && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-aggie px-2.5 py-0.5 text-[11px] font-bold text-cream-50">
                  Gig &apos;em!
                </span>
              )}
            </span>
            <div className="min-w-0">
              <p className="font-display font-bold text-fg">{gigEm ? "HowdyHire approves!" : "HowdyHire tip"}</p>
              <p className="mt-0.5 text-sm text-fg-muted">
                {gigEm ? "You're ready for the real thing. Gig 'em, Ags!" : (growth[0]?.title ?? "Keep practicing your STAR stories!")}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 border-t border-stone-200 pt-5 print:hidden">
          {actions.map((a) => (
            <button key={a.label} type="button" onClick={a.onClick} className={a === primary ? btn.primary : btn.secondary}>
              <a.icon className="h-4 w-4" /> {a.label}
            </button>
          ))}
          <span className="flex-1" />
          <button type="button" onClick={() => window.print()} className={btn.ghost}>
            <Printer className="h-4 w-4" /> Print / PDF
          </button>
          <button type="button" onClick={downloadSummary} className={btn.ghost}>
            <FileDown className="h-4 w-4" /> Download .txt
          </button>
        </div>
      </header>

      {feedback.reportError && (
        <div className="flex flex-col gap-3 rounded-2xl bg-gold-50 p-4 text-sm ring-1 ring-inset ring-gold-200 sm:flex-row sm:items-center print:hidden">
          <AlertTriangle className="h-5 w-5 shrink-0 text-gold-700" />
          <p className="flex-1 text-fg">
            HowdyHire couldn&apos;t write the full recap ({retryError ?? feedback.reportError}). Your scores below come from the live
            STAR checklist.
          </p>
          {onRetryReport && (
            <button type="button" onClick={retryReport} disabled={retrying} className={btn.primary}>
              {retrying ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Try again
            </button>
          )}
        </div>
      )}

      <Tabs tabs={tabs} />

      <p className="hidden text-xs text-fg-subtle print:block">Made with HowdyHire · Gig &apos;em!</p>
    </article>
  );
}
