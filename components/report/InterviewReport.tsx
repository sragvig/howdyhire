"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BarChart3,
  Briefcase,
  FileDown,
  FileText,
  ListChecks,
  Loader2,
  Printer,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Star,
  Target,
  ThumbsUp,
} from "lucide-react";
import { useSession } from "@/components/providers/SessionProvider";
import { Card } from "@/components/dashboard/Card";
import { getPersona } from "@/lib/personas";
import { READINESS } from "@/lib/readiness";
import { requestReport } from "@/lib/report-client";
import { downloadText, reportToText } from "@/lib/report-text";
import { ScoreGauge } from "./ScoreGauge";
import { ReadinessBadge } from "./ReadinessBadge";
import { StarScorecards } from "./StarScorecards";
import { QuestionScoreChart } from "./QuestionScoreChart";
import { QuestionPlayback } from "./QuestionPlayback";

export function InterviewReport() {
  const { session, reset, updateFeedback } = useSession();
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  const feedback = session.feedback;
  if (!feedback) return null;
  const { report, questions } = feedback;
  const persona = getPersona(session.config.persona);

  async function retryReport() {
    if (!feedback) return;
    setRetrying(true);
    setRetryError(null);
    try {
      updateFeedback(await requestReport(feedback, session));
    } catch (err) {
      setRetryError(err instanceof Error ? err.message : "Couldn't generate the report");
    } finally {
      setRetrying(false);
    }
  }

  function downloadSummary() {
    const date = new Date(session.startedAt ?? Date.now()).toISOString().slice(0, 10);
    downloadText(`howdyhire-report-${date}.txt`, reportToText(feedback!, session));
  }

  function newInterview() {
    reset();
    router.push("/jobs");
  }

  if (questions.length === 0) {
    return (
      <Card title="No answers to score" icon={<AlertTriangle className="h-5 w-5" />}>
        <p className="text-sm text-stone-600">{feedback.summary}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-aggie px-4 py-2 text-sm font-semibold text-white hover:bg-maroon-700"
        >
          <RotateCcw className="h-4 w-4" /> Try again
        </button>
      </Card>
    );
  }

  return (
    <article className="space-y-6">
      {/* Hero */}
      <header className="overflow-hidden rounded-2xl bg-gradient-to-br from-maroon-800 via-maroon-900 to-maroon-950 p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <ScoreGauge score={feedback.overallScore} />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-maroon-200">Interview Report</p>
            <h1 className="mt-1 flex flex-wrap items-center gap-x-2 text-xl font-bold sm:text-2xl">
              <Briefcase className="h-5 w-5 text-maroon-200" />
              {session.job?.title} <span className="font-normal text-maroon-200">at {session.job?.company}</span>
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {report && <ReadinessBadge tier={report.readinessTier} />}
              {report && <span className="text-sm text-maroon-100">{READINESS[report.readinessTier].description}</span>}
            </div>
            <p className="mt-4 max-w-3xl text-maroon-50">{feedback.summary}</p>
            <p className="mt-3 text-xs text-maroon-300">
              {questions.length} question{questions.length === 1 ? "" : "s"} · {persona.label}
              {session.startedAt && ` · ${new Date(session.startedAt).toLocaleDateString()}`}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-5 print:hidden">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-aggie hover:bg-maroon-50"
          >
            <RotateCcw className="h-4 w-4" /> Try again
          </button>
          <button
            type="button"
            onClick={newInterview}
            className="inline-flex items-center gap-2 rounded-md border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
          >
            <Sparkles className="h-4 w-4" /> New interview
          </button>
          <span className="flex-1" />
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-md border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
          >
            <Printer className="h-4 w-4" /> Print / Save PDF
          </button>
          <button
            type="button"
            onClick={downloadSummary}
            className="inline-flex items-center gap-2 rounded-md border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
          >
            <FileDown className="h-4 w-4" /> Download .txt
          </button>
        </div>
      </header>

      {feedback.reportError && (
        <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm sm:flex-row sm:items-center print:hidden">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-700" />
          <p className="flex-1 text-amber-900">
            The AI summary couldn&apos;t be generated ({retryError ?? feedback.reportError}). Your scores below come
            from the live STAR evaluation.
          </p>
          <button
            type="button"
            onClick={retryReport}
            disabled={retrying}
            className="inline-flex items-center gap-2 rounded-md bg-aggie px-3 py-1.5 font-semibold text-white hover:bg-maroon-700 disabled:bg-stone-300"
          >
            {retrying ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Retry
          </button>
        </div>
      )}

      {/* STAR breakdown */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 font-semibold text-stone-900">
          <Star className="h-5 w-5 text-aggie" /> STAR breakdown
        </h2>
        <StarScorecards questions={questions} breakdown={report?.starBreakdown} />
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card title="Score by question" icon={<BarChart3 className="h-5 w-5" />} className="lg:col-span-3">
          <QuestionScoreChart questions={questions} />
        </Card>

        {report && (
          <Card title="Key strengths" icon={<ThumbsUp className="h-5 w-5" />} className="lg:col-span-2">
            <ul className="space-y-3">
              {report.keyStrengths.map((s) => (
                <li key={s.title} className="text-sm">
                  <p className="font-semibold text-stone-900">{s.title}</p>
                  <p className="text-stone-600">{s.evidence}</p>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      {report && (
        <Card title={`Areas to improve for ${session.job?.title ?? "this role"}`} icon={<Target className="h-5 w-5" />}>
          <ol className="grid gap-4 md:grid-cols-2">
            {report.improvements.map((item, i) => (
              <li key={item.title} className="flex gap-3 rounded-lg bg-stone-50 p-4 text-sm print:break-inside-avoid">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aggie text-xs font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold text-stone-900">{item.title}</p>
                  <p className="mt-0.5 text-stone-600">{item.detail}</p>
                  {item.competency && (
                    <span className="mt-2 inline-block rounded-full bg-maroon-50 px-2 py-0.5 text-xs text-maroon-800">
                      {item.competency}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </Card>
      )}

      <section className="space-y-3 print:break-before-page">
        <h2 className="flex items-center gap-2 font-semibold text-stone-900">
          <ListChecks className="h-5 w-5 text-aggie" /> Question-by-question playback
        </h2>
        <QuestionPlayback questions={questions} interviewerName={persona.interviewerName} />
      </section>

      <p className="hidden items-center gap-1.5 text-xs text-stone-400 print:flex">
        <FileText className="h-3.5 w-3.5" /> Generated by HowdyHire
      </p>
    </article>
  );
}
