import { Flame, Gavel, Smile, type LucideIcon } from "lucide-react";
import type { InterviewerPersona } from "@/types";
import { PERSONAS } from "@/lib/personas";

const ICONS: Record<InterviewerPersona, LucideIcon> = {
  friendly: Smile,
  strict: Gavel,
  grilling: Flame,
};

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
    <div role="radiogroup" aria-label="Interviewer persona" className="flex flex-wrap gap-1 rounded-lg bg-stone-100 p-1">
      {PERSONAS.map((p) => {
        const Icon = ICONS[p.id];
        const selected = value === p.id;
        return (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={selected}
            title={p.description}
            disabled={disabled}
            onClick={() => onChange(p.id)}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              selected ? "bg-aggie text-white shadow-sm" : "text-stone-600 hover:bg-white hover:text-stone-900"
            }`}
          >
            <Icon className="h-4 w-4" />
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
