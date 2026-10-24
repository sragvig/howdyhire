import { Minus, Plus } from "lucide-react";
import type { QuestionFeedback, SessionReport } from "@/types";
import { STAR_ELEMENTS } from "@/lib/star";

// One scorecard per STAR element: average score across answers plus the AI's strength/weakness.
export function StarScorecards({
  questions,
  breakdown,
}: {
  questions: QuestionFeedback[];
  breakdown?: SessionReport["starBreakdown"];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {STAR_ELEMENTS.map(({ key, label, hint }) => {
        const avg = questions.length ? questions.reduce((n, q) => n + q.star[key], 0) / questions.length : 0;
        const score = Math.round(avg * 10);
        const insight = breakdown?.[key];
        return (
          <section key={key} className="flex flex-col rounded-xl border border-stone-200 bg-white p-5 shadow-sm print:break-inside-avoid print:shadow-none">
            <div className="flex items-baseline justify-between">
              <h3 className="font-semibold text-stone-900">{label}</h3>
              <p className="text-2xl font-bold tabular-nums text-stone-900">
                {score}
                <span className="text-sm font-medium text-stone-400">/100</span>
              </p>
            </div>
            <p className="text-xs text-stone-500">{hint}</p>
            <div
              className="mt-3 h-2 rounded bg-stone-100"
              role="meter"
              aria-label={`${label} score`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={score}
            >
              <div className="h-2 rounded bg-aggie" style={{ width: `${score}%` }} />
            </div>
            {insight && (
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex gap-2">
                  <dt>
                    <Plus className="mt-0.5 h-4 w-4 text-emerald-700" aria-label="Strength" />
                  </dt>
                  <dd className="text-stone-700">{insight.strength}</dd>
                </div>
                <div className="flex gap-2">
                  <dt>
                    <Minus className="mt-0.5 h-4 w-4 text-aggie" aria-label="Weakness" />
                  </dt>
                  <dd className="text-stone-700">{insight.weakness}</dd>
                </div>
              </dl>
            )}
          </section>
        );
      })}
    </div>
  );
}
