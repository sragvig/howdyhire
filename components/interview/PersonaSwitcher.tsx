import { Flame, Gavel, Smile, type LucideIcon } from "lucide-react";
import type { InterviewerPersona } from "@/types";
import { PERSONAS } from "@/lib/personas";

const ICONS: Record<InterviewerPersona, LucideIcon> = {
  friendly: Smile,
  strict: Gavel,
  grilling: Flame,
};

// Compact mid-call style switcher (the voice stays the same; only the style changes).
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
    <div role="radiogroup" aria-label="Interviewer style" className="flex flex-wrap gap-1 rounded-xl border border-line bg-white/5 p-1">
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
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${
              selected
                ? "bg-gradient-to-b from-maroon-600 to-aggie text-white shadow-md shadow-maroon-900/50"
                : "text-fg-muted hover:bg-white/5 hover:text-fg"
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
