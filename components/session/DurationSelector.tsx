"use client";

import { Clock, Sparkles } from "lucide-react";
import { DURATIONS } from "@/lib/durations";
import { useSession } from "@/components/providers/SessionProvider";
import { choiceCard } from "@/components/ui/styles";

export function DurationSelector() {
  const { session, updateConfig } = useSession();
  const disabled = session.status !== "idle";

  return (
    <div role="radiogroup" aria-label="Session length" className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {DURATIONS.map((d) => {
        const selected = session.config.durationMinutes === d.minutes;
        const demo = d.minutes === 2;
        return (
          <button
            key={d.minutes}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => updateConfig({ durationMinutes: d.minutes, questionCount: d.questions })}
            className={`${choiceCard(selected)} flex flex-col items-center px-3 py-4 text-center`}
          >
            {demo && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-gold-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-maroon-900">
                Demo
              </span>
            )}
            <span className={`flex h-9 w-9 items-center justify-center rounded-full ${selected ? "bg-aggie text-cream-50" : "bg-stone-100 text-stone-500"}`}>
              {demo ? <Sparkles className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
            </span>
            <span className={`mt-2 font-display text-lg font-bold ${selected ? "text-accent" : "text-fg"}`}>{d.minutes} min</span>
            <span className="text-xs text-fg-subtle">~{d.questions} questions</span>
          </button>
        );
      })}
    </div>
  );
}
