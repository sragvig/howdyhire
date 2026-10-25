import { CheckCircle2, GraduationCap, Lightbulb, MessageCircleQuestion, ThumbsUp, UserRound } from "lucide-react";
import type { QuestionFeedback } from "@/types";
import { STAR_ELEMENTS } from "@/lib/star";
import { surface } from "@/components/ui/styles";
import { questionScore } from "./QuestionScoreChart";

// Bracketed placeholders ("[number]") are details for the candidate to fill in; make them pop.
function WithPlaceholders({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\[[^\]]+\])/g).map((part, i) =>
        /^\[[^\]]+\]$/.test(part) ? (
          <mark key={i} className="rounded-md bg-gold-400/15 px-1 py-0.5 font-medium text-gold ring-1 ring-inset ring-gold-400/30">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function QuestionCompare({ q, index, interviewerName }: { q: QuestionFeedback; index: number; interviewerName: string }) {
  const score = questionScore(q);
  return (
    <li className={`${surface} p-5 print:break-inside-avoid`}>
      <div className="flex items-start gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-maroon-500/15 font-display text-sm font-bold text-accent ring-1 ring-inset ring-maroon-400/25">
          Q{index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-subtle">
            <MessageCircleQuestion className="h-3.5 w-3.5" /> {interviewerName} asked
          </p>
          <p className="mt-1 font-medium text-fg">{q.question || "(question not captured)"}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {STAR_ELEMENTS.map(({ key, label }) => (
              <span
                key={key}
                title={`${label}: ${q.star[key]}/10`}
                className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ring-1 ring-inset ${
                  q.star[key] >= 7
                    ? "bg-emerald-500/15 text-good ring-emerald-400/30"
                    : q.star[key] >= 5
                      ? "bg-gold-400/10 text-gold ring-gold-400/25"
                      : "bg-white/5 text-fg-subtle ring-white/10"
                }`}
              >
                {label[0]} {q.star[key]}
              </span>
            ))}
          </div>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl font-extrabold tabular-nums text-fg">{score}</p>
          <p className="text-[10px] uppercase tracking-wider text-fg-subtle">score</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-line bg-white/[0.03] p-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-fg-subtle">
            <UserRound className="h-3.5 w-3.5" /> Your answer
          </p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-fg-muted">{q.transcript}</p>
        </div>

        {q.sampleAnswer ? (
          <div className="relative overflow-hidden rounded-xl border border-gold-400/30 bg-gradient-to-br from-maroon-900/50 to-maroon-950/30 p-4 shadow-lg shadow-maroon-950/30">
            <span aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gold-400/10 blur-2xl" />
            <p className="relative mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gold">
              <GraduationCap className="h-3.5 w-3.5" /> Aggie alum version · stronger STAR
            </p>
            <p className="relative whitespace-pre-wrap text-sm leading-relaxed text-fg">
              <WithPlaceholders text={q.sampleAnswer} />
            </p>
            <p className="relative mt-3 text-xs text-fg-subtle">Built from your own story. Fill the highlighted details from your experience.</p>
          </div>
        ) : (
          <div className="flex flex-col justify-center rounded-xl border border-emerald-400/25 bg-emerald-500/[0.07] p-4">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-good">
              <CheckCircle2 className="h-4 w-4" /> Strong answer
            </p>
            <p className="mt-1 text-sm text-fg-muted">This one hit the STAR beats. No rewrite needed. Keep it in your story bank.</p>
          </div>
        )}
      </div>

      {(q.coachingNote || q.strengths.length > 0) && (
        <div className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
          {q.coachingNote && (
            <p className="flex gap-2 text-fg-muted">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> {q.coachingNote}
            </p>
          )}
          {q.strengths.map((s) => (
            <p key={s} className="flex gap-2 text-fg-muted">
              <ThumbsUp className="mt-0.5 h-4 w-4 shrink-0 text-good" /> {s}
            </p>
          ))}
        </div>
      )}
    </li>
  );
}

export function RewriteComparison({ questions, interviewerName }: { questions: QuestionFeedback[]; interviewerName: string }) {
  return (
    <ol className="space-y-4">
      {questions.map((q, i) => (
        <QuestionCompare key={i} q={q} index={i} interviewerName={interviewerName} />
      ))}
    </ol>
  );
}
