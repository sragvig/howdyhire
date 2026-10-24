"use client";

import { Flame, Gavel, Smile, type LucideIcon } from "lucide-react";
import type { InterviewerPersona } from "@/types";
import { PERSONAS } from "@/lib/personas";
import { useSession } from "@/components/providers/SessionProvider";

const ICONS: Record<InterviewerPersona, LucideIcon> = {
  friendly: Smile,
  strict: Gavel,
  grilling: Flame,
};

export function PersonaSelector() {
  const { session, setPersona } = useSession();
  const disabled = session.status !== "idle";

  return (
    <div role="radiogroup" aria-label="Interviewer persona" className="grid gap-3 sm:grid-cols-3">
      {PERSONAS.map((p) => {
        const Icon = ICONS[p.id];
        const selected = session.config.persona === p.id;
        return (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => setPersona(p.id)}
            className={`rounded-lg border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              selected
                ? "border-aggie bg-maroon-50 ring-1 ring-aggie"
                : "border-stone-200 bg-white hover:border-maroon-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${selected ? "text-aggie" : "text-stone-500"}`} />
              <span className="font-semibold">{p.label}</span>
            </div>
            <p className="mt-1 text-xs font-medium text-maroon-700">{p.tagline}</p>
            <p className="mt-2 text-sm text-stone-600">{p.description}</p>
          </button>
        );
      })}
    </div>
  );
}
