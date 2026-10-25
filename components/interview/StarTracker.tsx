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
          className={`flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold ${
            answer.evaluation?.[key].present ? "bg-emerald-500/80 text-white" : "bg-white/10 text-fg-subtle"
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
      icon={<Target />}
      action={current?.evaluating && <Loader2 className="h-4 w-4 animate-spin text-accent" aria-label="Evaluating" />}
    >
      <div className="grid grid-cols-2 gap-3">
        {STAR_ELEMENTS.map(({ key, label, hint }) => {
          const el = behavioral ? evaluation[key] : undefined;
          const confirmed = !!el?.present;
          // Show live cue hits only until a fresh Gemini evaluation covers the latest text.
          const awaitingEval = !!current && (current.evaluating || !evaluation);
          const detected = !confirmed && awaitingEval && !!current.heuristic?.[key];
          const hit = confirmed || detected;
          return (
            <div
              key={key}
              className={`rounded-xl border p-3 transition-all duration-500 ${
                confirmed
                  ? "border-emerald-400/40 bg-emerald-500/10 shadow-lg shadow-emerald-900/20"
                  : detected
                    ? "border-emerald-400/25 bg-emerald-500/5"
                    : "border-line bg-white/[0.03]"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full transition-all duration-500 ${
                    confirmed
                      ? "scale-110 bg-emerald-500 text-white shadow-md shadow-emerald-500/40"
                      : detected
                        ? "scale-105 bg-emerald-500/20 text-good ring-2 ring-emerald-400/60"
                        : "bg-white/5 text-fg-subtle"
                  }`}
                >
                  {hit ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <Circle className="h-3 w-3" />}
                </span>
                <span className={`text-sm font-semibold ${hit ? "text-fg" : "text-fg-muted"}`}>{label}</span>
                {confirmed && <span className="ml-auto text-xs font-semibold tabular-nums text-good">{el.score}/10</span>}
                {detected && <span className="ml-auto text-[11px] font-medium text-good">Detected</span>}
              </div>
              <p className="mt-1.5 line-clamp-2 text-xs text-fg-subtle">
                {confirmed && el.evidence ? `“${el.evidence}”` : detected ? "Heard it. Confirming…" : hint}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 min-h-14 rounded-xl border border-maroon-400/20 bg-maroon-500/10 p-3 text-sm">
        {current?.evaluationError ? (
          <p className="text-bad">{current.evaluationError}</p>
        ) : behavioral && evaluation.coachingTip ? (
          <p className="flex gap-2 text-fg">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
            {evaluation.coachingTip}
          </p>
        ) : (
          <p className="text-fg-muted">
            {evaluation && !behavioral ? "Waiting for a behavioral answer…" : "Badges light up as you cover each part of the STAR method."}
          </p>
        )}
      </div>

      {past.length > 0 && (
        <div className="mt-4 border-t border-line pt-3">
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-subtle">Previous answers</h3>
          <ul className="space-y-2">
            {past.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-fg-muted">{a.question || "Answer"}</span>
                <StarDots answer={a} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
