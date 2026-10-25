import { ArrowUpRight, Check } from "lucide-react";
import type { QuestionFeedback, SessionReport, SpeechAnalytics } from "@/types";
import { STAR_ELEMENTS } from "@/lib/star";
import { surface } from "@/components/ui/styles";

function meterColor(score: number) {
  if (score >= 70) return "bg-emerald-600";
  if (score >= 50) return "bg-gold-500";
  return "bg-aggie";
}

// One card per STAR step: a big score, a progress meter, and two short pill notes.
export function StarScorecards({
  questions,
  breakdown,
  speech,
}: {
  questions: QuestionFeedback[];
  breakdown?: SessionReport["starBreakdown"];
  speech?: SpeechAnalytics;
}) {
  const pronouns = speech ? speech.firstPersonSingular + speech.firstPersonPlural : 0;
  const iPct = speech && pronouns ? Math.round((speech.firstPersonSingular / pronouns) * 100) : null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {STAR_ELEMENTS.map(({ key, label, criterion }) => {
        const avg = questions.length ? questions.reduce((n, q) => n + q.star[key], 0) / questions.length : 0;
        const score = Math.round(avg * 10);
        const insight = breakdown?.[key];
        return (
          <section key={key} className={`${surface} p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md print:break-inside-avoid`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-aggie font-display text-lg font-bold text-cream-50">
                  {label[0]}
                </span>
                <div>
                  <h3 className="font-display font-semibold text-fg">{label}</h3>
                  <p className="text-xs text-fg-subtle">{criterion}</p>
                </div>
              </div>
              <p className="font-display text-3xl font-bold tabular-nums text-fg">
                {score}
                <span className="text-sm font-medium text-fg-subtle">/100</span>
              </p>
            </div>

            <div
              className="mt-4 h-3 overflow-hidden rounded-full bg-stone-200"
              role="meter"
              aria-label={`${label} score`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={score}
            >
              <div className={`h-3 rounded-full transition-all duration-1000 ${meterColor(score)}`} style={{ width: `${score}%` }} />
            </div>

            {key === "action" && iPct !== null && (
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-fg-muted">
                “I” statements: <span className="font-bold text-accent">{iPct}%</span>
              </p>
            )}

            {insight && (insight.strength || insight.weakness) && (
              <div className="mt-4 flex flex-col gap-2">
                {insight.strength && (
                  <p className="flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs leading-relaxed text-emerald-900">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={3} /> {insight.strength}
                  </p>
                )}
                {insight.weakness && (
                  <p className="flex items-start gap-2 rounded-xl bg-gold-50 px-3 py-2 text-xs leading-relaxed text-gold-700">
                    <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2.5} /> {insight.weakness}
                  </p>
                )}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
