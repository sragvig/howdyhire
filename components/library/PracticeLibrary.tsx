"use client";

import Link from "next/link";
import { Calendar, ChevronRight, Clock, Library, Mic, Trash2, Trophy, TrendingUp } from "lucide-react";
import type { PastInterview } from "@/types";
import { deleteInterview } from "@/lib/practice-library";
import { getPersona } from "@/lib/personas";
import { ReadinessBadge } from "@/components/report/ReadinessBadge";
import { PageHeader } from "@/components/ui/PageHeader";
import { btn, interactiveSurface, surface } from "@/components/ui/styles";
import { usePracticeLibrary, useHydrated } from "./usePracticeLibrary";

const dateFmt = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" });
const timeFmt = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });

function Stat({ icon, label, value, gold = false }: { icon: React.ReactNode; label: string; value: string; gold?: boolean }) {
  return (
    <div className={`${surface} p-5`}>
      <p className="flex items-center gap-1.5 text-xs font-medium text-fg-subtle">
        {icon} {label}
      </p>
      <p className={`mt-1 font-display text-3xl font-extrabold tabular-nums ${gold ? "text-gold" : "text-fg"}`}>{value}</p>
    </div>
  );
}

function SessionCard({ entry }: { entry: PastInterview }) {
  const persona = getPersona(entry.persona);
  const date = new Date(entry.completedAt);
  const { feedback } = entry;

  function onDelete(e: React.MouseEvent) {
    e.preventDefault();
    if (window.confirm(`Delete this ${entry.job.title} session from your Practice Library?`)) deleteInterview(entry.id);
  }

  return (
    <li>
      <Link href={`/library/${entry.id}`} className={`${interactiveSurface} group flex h-full flex-col p-5`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate font-display font-semibold text-fg">{entry.job.title}</h2>
            <p className="truncate text-sm text-fg-muted">{entry.job.company}</p>
          </div>
          <div className="text-right">
            <p className="font-display text-3xl font-extrabold leading-none tabular-nums text-fg">{feedback.overallScore}</p>
            <p className="text-[10px] uppercase tracking-wider text-fg-subtle">score</p>
          </div>
        </div>

        <div className="mt-3">{feedback.report && <ReadinessBadge tier={feedback.report.readinessTier} />}</div>

        <dl className="mt-4 space-y-1.5 text-xs text-fg-muted">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-fg-subtle" />
            <dt className="sr-only">Date</dt>
            <dd>
              {dateFmt.format(date)} · {timeFmt.format(date)}
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Mic className="h-3.5 w-3.5 text-fg-subtle" />
            <dt className="sr-only">Interviewer</dt>
            <dd className="truncate">
              {persona.interviewerName} · {persona.label}
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-fg-subtle" />
            <dt className="sr-only">Length</dt>
            <dd>
              {entry.durationMinutes} min · {feedback.questions.length} question{feedback.questions.length === 1 ? "" : "s"}
            </dd>
          </div>
        </dl>

        <div className="mt-auto flex items-center justify-between border-t border-line pt-4">
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent">
            See recap <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete ${entry.job.title} session`}
            className="rounded-lg p-1.5 text-fg-subtle transition-colors hover:bg-red-500/15 hover:text-bad"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </Link>
    </li>
  );
}

export function PracticeLibrary() {
  const entries = usePracticeLibrary();
  const hydrated = useHydrated();

  const scores = entries.map((e) => e.feedback.overallScore);
  const average = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const best = scores.length ? Math.max(...scores) : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        eyebrow="Your progress"
        title="Practice Library"
        description="Every completed interview is saved here automatically, on this device. Reopen any scorecard to review it."
      />

      {!hydrated ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-busy>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl bg-stone-200/60" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className={`${surface} flex flex-col items-center p-12 text-center`}>
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-maroon-50 text-accent ring-1 ring-inset ring-maroon-100">
            <Library className="h-7 w-7" />
          </span>
          <h2 className="mt-4 font-display text-lg font-semibold text-fg">No interviews yet</h2>
          <p className="mt-1 text-sm text-fg-muted">Finish a practice interview and its full scorecard will show up here.</p>
          <Link href="/interview" className={`${btn.primary} mt-5`}>
            <Mic className="h-4 w-4" /> Start an interview
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            <Stat icon={<Library className="h-3.5 w-3.5" />} label="Sessions" value={String(entries.length)} />
            <Stat icon={<TrendingUp className="h-3.5 w-3.5" />} label="Average score" value={String(average)} />
            <Stat icon={<Trophy className="h-3.5 w-3.5 text-gold" />} label="Best score" value={String(best)} gold />
          </div>
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {entries.map((e) => (
              <SessionCard key={e.id} entry={e} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
