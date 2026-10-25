"use client";

import { DURATIONS } from "@/lib/durations";
import { useSession } from "@/components/providers/SessionProvider";

// Segmented control with a sliding highlight behind the active option.
export function DurationSelector() {
  const { session, updateConfig } = useSession();
  const disabled = session.status !== "idle";
  const index = Math.max(0, DURATIONS.findIndex((d) => d.minutes === session.config.durationMinutes));

  return (
    <div
      role="radiogroup"
      aria-label="Interview length"
      className="relative grid rounded-2xl border border-line bg-white/5 p-1 backdrop-blur-md"
      style={{ gridTemplateColumns: `repeat(${DURATIONS.length}, minmax(0, 1fr))` }}
    >
      <span
        aria-hidden
        className="absolute inset-y-1 left-1 rounded-xl bg-gradient-to-b from-maroon-600 to-aggie shadow-lg shadow-maroon-900/50 ring-1 ring-inset ring-white/15 transition-transform duration-300 ease-out"
        style={{ width: `calc((100% - 0.5rem) / ${DURATIONS.length})`, transform: `translateX(${index * 100}%)` }}
      />
      {DURATIONS.map((d, i) => {
        const selected = i === index;
        return (
          <button
            key={d.minutes}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => updateConfig({ durationMinutes: d.minutes, questionCount: d.questions })}
            className={`relative z-10 flex flex-col items-center rounded-xl px-1 py-2 text-center transition-colors duration-300 disabled:cursor-not-allowed ${
              selected ? "text-white" : "text-fg-muted hover:text-fg"
            }`}
          >
            <span className="text-sm font-semibold">
              {d.minutes === 2 ? "Demo · 2m" : `${d.minutes}m`}
            </span>
            <span className={`hidden text-[11px] sm:block ${selected ? "text-maroon-100" : "text-fg-subtle"}`}>
              ~{d.questions} questions
            </span>
          </button>
        );
      })}
    </div>
  );
}
