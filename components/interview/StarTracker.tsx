import { Check, Circle, Loader2, Target } from "lucide-react";
import type { AnswerRecord } from "@/types";
import { STAR_ELEMENTS } from "@/lib/star";
import { Card } from "@/components/dashboard/Card";
import { RevSays } from "@/components/mascot/Reveille";

function StarDots({ answer }: { answer: AnswerRecord }) {
  return (
    <div className="flex gap-1">
      {STAR_ELEMENTS.map(({ key, label }) => (
        <span
          key={key}
          title={label}
          className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
            answer.evaluation?.[key].present ? "bg-emerald-600 text-white" : "bg-stone-200 text-stone-500"
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
      title="STAR checklist"
      icon={<Target />}
      action={current?.evaluating && <Loader2 className="h-4 w-4 animate-spin text-accent" aria-label="Checking" />}
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
              className={`rounded-2xl border-2 p-3 transition-all duration-300 ${
                confirmed ? "border-emerald-300 bg-emerald-50" : detected ? "border-emerald-200 bg-emerald-50/50" : "border-stone-200 bg-surface"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full transition-all duration-300 ${
                    confirmed ? "scale-110 bg-emerald-600 text-white" : detected ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-400"
                  }`}
                >
                  {hit ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <Circle className="h-3 w-3" />}
                </span>
                <span className={`text-sm font-semibold ${hit ? "text-fg" : "text-fg-muted"}`}>{label}</span>
                {confirmed && <span className="ml-auto text-xs font-semibold tabular-nums text-emerald-700">{el.score}/10</span>}
                {detected && <span className="ml-auto text-[11px] font-medium text-emerald-700">Heard it</span>}
              </div>
              <p className="mt-1.5 line-clamp-2 text-xs text-fg-subtle">
                {confirmed && el.evidence ? `“${el.evidence}”` : detected ? "Checking…" : hint}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-5">
        {current?.evaluationError ? (
          <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{current.evaluationError}</p>
        ) : (
          <RevSays size={40} mood={behavioral && evaluation.coachingTip ? "happy" : "listening"}>
            {behavioral && evaluation.coachingTip
              ? evaluation.coachingTip
              : evaluation && !behavioral
                ? "I'm waiting for a story with a situation, task, action, and result."
                : "I'll check off each STAR step as you tell your story!"}
          </RevSays>
        )}
      </div>

      {past.length > 0 && (
        <div className="mt-5 border-t border-stone-200 pt-4">
          <h3 className="mb-2 text-xs font-semibold text-fg-subtle">Earlier answers</h3>
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
