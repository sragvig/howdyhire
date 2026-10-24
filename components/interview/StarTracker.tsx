import { Check, Circle, Lightbulb, Loader2, Target } from "lucide-react";
import type { AnswerRecord } from "@/types";
import { STAR_ELEMENTS } from "@/lib/star";
import { Card } from "@/components/dashboard/Card";

function StarDots({ answer }: { answer: AnswerRecord }) {
  return (
    <div className="flex gap-1">
      {STAR_ELEMENTS.map(({ key, label }) => (
        <span
          key={key}
          title={label}
          className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${
            answer.evaluation?.[key].present ? "bg-emerald-500 text-white" : "bg-stone-200 text-stone-500"
          }`}
        >
          {label[0]}
        </span>
      ))}
    </div>
  );
}

export function StarTracker({ answers }: { answers: AnswerRecord[] }) {
  // The most recent question the candidate has started answering.
  const current = answers.findLast((a) => a.answer);
  const evaluation = current?.evaluation;
  const behavioral = evaluation?.isBehavioralAnswer;
  const past = answers.filter((a) => a !== current && a.evaluation?.isBehavioralAnswer);

  return (
    <Card
      title="STAR tracker"
      icon={<Target className="h-5 w-5" />}
      action={current?.evaluating && <Loader2 className="h-4 w-4 animate-spin text-aggie" aria-label="Evaluating" />}
    >
      <div className="grid grid-cols-2 gap-3">
        {STAR_ELEMENTS.map(({ key, label, hint }) => {
          const el = behavioral ? evaluation[key] : undefined;
          const hit = !!el?.present;
          return (
            <div
              key={key}
              className={`rounded-lg border p-3 transition-colors duration-500 ${
                hit ? "border-emerald-300 bg-emerald-50" : "border-stone-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full transition-all duration-500 ${
                    hit ? "scale-110 bg-emerald-500 text-white" : "bg-stone-100 text-stone-400"
                  }`}
                >
                  {hit ? <Check className="h-4 w-4" strokeWidth={3} /> : <Circle className="h-3 w-3" />}
                </span>
                <span className={`text-sm font-semibold ${hit ? "text-emerald-900" : "text-stone-700"}`}>{label}</span>
                {hit && <span className="ml-auto text-xs font-medium text-emerald-700">{el.score}/10</span>}
              </div>
              <p className="mt-1.5 line-clamp-2 text-xs text-stone-500">
                {hit && el.evidence ? `“${el.evidence}”` : hint}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 min-h-14 rounded-lg bg-maroon-50 p-3 text-sm">
        {current?.evaluationError ? (
          <p className="text-red-700">{current.evaluationError}</p>
        ) : behavioral && evaluation.coachingTip ? (
          <p className="flex gap-2 text-maroon-900">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-aggie" />
            {evaluation.coachingTip}
          </p>
        ) : (
          <p className="text-maroon-800/70">
            {evaluation && !behavioral
              ? "Waiting for a behavioral answer…"
              : "Badges light up as you cover each part of the STAR method."}
          </p>
        )}
      </div>

      {past.length > 0 && (
        <div className="mt-4 border-t border-stone-100 pt-3">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">Previous answers</h3>
          <ul className="space-y-2">
            {past.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-stone-600">{a.question || "Answer"}</span>
                <StarDots answer={a} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
