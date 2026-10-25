import { Flame, Gavel, Smile, type LucideIcon } from "lucide-react";
import type { InterviewerPersona } from "@/types";
import { PERSONAS } from "@/lib/personas";

const ICONS: Record<InterviewerPersona, LucideIcon> = {
  friendly: Smile,
  strict: Gavel,
  grilling: Flame,
};

// Compact mid-session style switcher (the voice stays the same; only the style changes).
export function PersonaSwitcher({
  value,
  disabled,
  onChange,
}: {
  value: InterviewerPersona;
  disabled?: boolean;
  onChange: (persona: InterviewerPersona) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Interviewer style" className="flex flex-wrap gap-1.5">
      {PERSONAS.map((p) => {
        const Icon = ICONS[p.id];
        const selected = value === p.id;
        return (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={selected}
            title={`${p.label}: ${p.description}`}
            disabled={disabled}
            onClick={() => onChange(p.id)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
              selected
                ? "bg-aggie text-cream-50"
                : "border border-stone-200 bg-surface text-fg-muted enabled:hover:-translate-y-0.5 enabled:hover:border-maroon-200 enabled:hover:text-accent"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
