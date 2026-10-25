import { Minus, Plus } from "lucide-react";
import type { QuestionFeedback, SessionReport, SpeechAnalytics } from "@/types";
import { STAR_ELEMENTS } from "@/lib/star";
import { surface } from "@/components/ui/styles";

// "I" vs "we" split for the Action card, so personal ownership is visible at a glance.
function OwnershipSplit({ speech }: { speech: SpeechAnalytics }) {
  const { firstPersonSingular: i, firstPersonPlural: we } = speech;
  const total = i + we;
  if (total === 0) return null;
  const iPct = Math.round((i / total) * 100);
  return (
    <div className="mt-3 rounded-xl bg-white/[0.03] p-3">
      <div className="flex justify-between text-xs text-fg-muted">
        <span>
          <span className="font-semibold text-fg">&ldquo;I&rdquo;</span> {i}
        </span>
        <span>
          {we} <span className="font-semibold text-fg">&ldquo;we&rdquo;</span>
        </span>
      </div>
      <div className="mt-1.5 flex h-1.5 gap-0.5" role="img" aria-label={`${iPct}% "I" statements versus ${100 - iPct}% "we"`}>
        <div className="rounded-l-full bg-gradient-to-r from-gold-500 to-gold-300" style={{ width: `${iPct}%` }} />
        <div className="flex-1 rounded-r-full bg-white/15" />
      </div>
      <p className="mt-1.5 text-xs text-fg-subtle">
        {iPct >= 60 ? "Good ownership of your actions." : "Try more “I” statements to show your personal contribution."}
      </p>
    </div>
  );
}

// One scorecard per STAR element: average score across answers plus the AI's strength/weakness.
export function StarScorecards({
  questions,
  breakdown,
  speech,
}: {
  questions: QuestionFeedback[];
  breakdown?: SessionReport["starBreakdown"];
  speech?: SpeechAnalytics;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {STAR_ELEMENTS.map(({ key, label, criterion }) => {
        const avg = questions.length ? questions.reduce((n, q) => n + q.star[key], 0) / questions.length : 0;
        const score = Math.round(avg * 10);
        const insight = breakdown?.[key];
        return (
          <section key={key} className={`${surface} flex flex-col p-5 print:break-inside-avoid`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-maroon-500 to-aggie font-display text-lg font-extrabold text-white ring-1 ring-inset ring-white/20">
                  {label[0]}
                </span>
                <div>
                  <h3 className="font-display font-semibold text-fg">{label}</h3>
                  <p className="text-xs text-fg-subtle">{criterion}</p>
                </div>
              </div>
              <p className="font-display text-3xl font-extrabold tabular-nums text-fg">
                {score}
                <span className="text-sm font-medium text-fg-subtle">/100</span>
              </p>
            </div>
            <div
              className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"
              role="meter"
              aria-label={`${label} score`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={score}
            >
              <div
                className="h-2 rounded-full bg-gradient-to-r from-maroon-600 via-maroon-400 to-gold-300 transition-all duration-1000"
                style={{ width: `${score}%` }}
              />
            </div>
            {key === "action" && speech && <OwnershipSplit speech={speech} />}
            {insight && (insight.strength || insight.weakness) && (
              <dl className="mt-4 space-y-2 text-sm">
                {insight.strength && (
                  <div className="flex gap-2">
                    <dt>
                      <Plus className="mt-0.5 h-4 w-4 text-good" aria-label="Strength" />
                    </dt>
                    <dd className="text-fg-muted">{insight.strength}</dd>
                  </div>
                )}
                {insight.weakness && (
                  <div className="flex gap-2">
                    <dt>
                      <Minus className="mt-0.5 h-4 w-4 text-accent" aria-label="Weakness" />
                    </dt>
                    <dd className="text-fg-muted">{insight.weakness}</dd>
                  </div>
                )}
              </dl>
            )}
          </section>
        );
      })}
    </div>
  );
}
