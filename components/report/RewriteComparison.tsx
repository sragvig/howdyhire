import { CheckCircle2, GraduationCap, Lightbulb, MessageCircleQuestion, ThumbsUp, UserRound } from "lucide-react";
import type { QuestionFeedback } from "@/types";
import { STAR_ELEMENTS } from "@/lib/star";
import { surface } from "@/components/ui/styles";
import { questionScore } from "./QuestionScoreChart";

// Bracketed placeholders ("[number]") are details for the student to fill in.
function WithPlaceholders({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\[[^\]]+\])/g).map((part, i) =>
        /^\[[^\]]+\]$/.test(part) ? (
          <mark key={i} className="rounded-md bg-gold-100 px-1 py-0.5 font-medium text-gold-700">
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
    <li className={`${surface} p-6 print:break-inside-avoid`}>
      <div className="flex items-start gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-maroon-50 font-display text-sm font-bold text-aggie">
          Q{index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-xs font-medium text-fg-subtle">
            <MessageCircleQuestion className="h-3.5 w-3.5" /> {interviewerName} asked
          </p>
          <p className="mt-1 font-semibold text-fg">{q.question || "(question not captured)"}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {STAR_ELEMENTS.map(({ key, label }) => (
              <span
                key={key}
                title={`${label}: ${q.star[key]}/10`}
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ${
                  q.star[key] >= 7 ? "bg-emerald-50 text-emerald-800" : q.star[key] >= 5 ? "bg-gold-50 text-gold-700" : "bg-stone-100 text-stone-600"
                }`}
              >
                {label} {q.star[key]}
              </span>
            ))}
          </div>
        </div>
        <span className="rounded-full bg-cream-200 px-3 py-1 font-display text-lg font-bold tabular-nums text-aggie">{score}</span>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-cream-200 p-5">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-fg-subtle">
            <UserRound className="h-3.5 w-3.5" /> What you said
          </p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-fg-muted">{q.transcript}</p>
        </div>

        {q.sampleAnswer ? (
          <div className="rounded-2xl border-2 border-gold-300 bg-gold-50/60 p-5">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-gold-700">
              <GraduationCap className="h-3.5 w-3.5" /> How an Aggie alum might say it
            </p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-fg">
              <WithPlaceholders text={q.sampleAnswer} />
            </p>
            <p className="mt-3 text-xs text-fg-subtle">Built from your story. Fill in the highlighted parts with your details.</p>
          </div>
        ) : (
          <div className="flex flex-col justify-center rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-5">
            <p className="flex items-center gap-1.5 font-semibold text-emerald-800">
              <CheckCircle2 className="h-5 w-5" /> Great answer!
            </p>
            <p className="mt-1 text-sm text-emerald-900/80">This one hit every STAR step. Keep it in your story bank.</p>
          </div>
        )}
      </div>

      {(q.coachingNote || q.strengths.length > 0) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {q.coachingNote && (
            <p className="flex w-full items-start gap-2 rounded-xl bg-maroon-50 px-3 py-2 text-sm text-fg">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-aggie" /> {q.coachingNote}
            </p>
          )}
          {q.strengths.map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
              <ThumbsUp className="h-3.5 w-3.5" /> {s}
            </span>
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
