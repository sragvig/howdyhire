"use client";

import { AudioLines, Check, Flame, Gavel, Smile, type LucideIcon } from "lucide-react";
import type { InterviewerPersona } from "@/types";
import { PERSONAS } from "@/lib/personas";
import { useSession } from "@/components/providers/SessionProvider";
import { choiceCard, chipGold, chipNeutral } from "@/components/ui/styles";

const ICONS: Record<InterviewerPersona, LucideIcon> = {
  friendly: Smile,
  strict: Gavel,
  grilling: Flame,
};

const DIFFICULTY = ["Easy", "Medium", "Tough"] as const;

function DifficultyMeter({ level }: { level: 1 | 2 | 3 }) {
  return (
    <span className="inline-flex items-center gap-1.5" aria-label={`Difficulty: ${DIFFICULTY[level - 1]}`}>
      <span className="flex gap-0.5" aria-hidden>
        {[1, 2, 3].map((i) => (
          <span key={i} className={`h-2 w-2 rounded-full ${i <= level ? "bg-aggie dark:bg-maroon-400" : "bg-stone-200"}`} />
        ))}
      </span>
      <span className="text-xs font-medium text-fg-muted">{DIFFICULTY[level - 1]}</span>
    </span>
  );
}

export function PersonaSelector() {
  const { session, setPersona } = useSession();
  const disabled = session.status !== "idle";

  return (
    <div role="radiogroup" aria-label="Interviewer" className="grid gap-4 md:grid-cols-3">
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
            className={`${choiceCard(selected)} flex flex-col p-6`}
          >
            {selected && (
              <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-aggie text-cream-50">
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
            )}

            <div className="flex items-center gap-3">
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-display text-xl font-bold ${
                  selected ? "bg-aggie text-cream-50" : "bg-maroon-50 text-accent"
                }`}
              >
                {p.interviewerName[0]}
              </span>
              <div className="min-w-0">
                <p className="font-display text-lg font-bold text-fg">{p.interviewerName}</p>
                <p className="flex items-center gap-1.5 text-xs font-medium text-fg-muted">
                  <Icon className="h-3.5 w-3.5 text-accent" /> {p.label}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {p.tags.map((tag) => (
                <span key={tag} className={chipNeutral}>
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-auto flex items-center justify-between gap-2 pt-5">
              <DifficultyMeter level={p.difficulty} />
              <span className={chipGold}>
                <AudioLines className="h-3 w-3" /> {p.voiceStyle}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
