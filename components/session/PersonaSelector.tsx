"use client";

import { AudioLines, Check, Flame, Gavel, Smile, type LucideIcon } from "lucide-react";
import type { InterviewerPersona } from "@/types";
import { PERSONAS } from "@/lib/personas";
import { useSession } from "@/components/providers/SessionProvider";
import { chipNeutral } from "@/components/ui/styles";

const ICONS: Record<InterviewerPersona, LucideIcon> = {
  friendly: Smile,
  strict: Gavel,
  grilling: Flame,
};

const DIFFICULTY = ["Easy", "Medium", "Hard"] as const;

function DifficultyMeter({ level }: { level: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-2" aria-label={`Difficulty: ${DIFFICULTY[level - 1]}`}>
      <div className="flex gap-1" aria-hidden>
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-1.5 w-6 rounded-full transition-colors duration-300 ${
              i <= level ? (level === 3 ? "bg-gradient-to-r from-maroon-400 to-red-400" : "bg-gradient-to-r from-gold-500 to-gold-300") : "bg-white/10"
            }`}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-fg-muted">{DIFFICULTY[level - 1]}</span>
    </div>
  );
}

export function PersonaSelector() {
  const { session, setPersona } = useSession();
  const disabled = session.status !== "idle";

  return (
    <div role="radiogroup" aria-label="Interviewer persona" className="grid gap-4 md:grid-cols-3">
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
            className={`group relative flex flex-col overflow-hidden rounded-2xl border p-5 text-left backdrop-blur-md transition-all duration-300 [transform-style:preserve-3d] disabled:cursor-not-allowed disabled:opacity-60 enabled:hover:[transform:perspective(900px)_rotateX(3deg)_translateY(-4px)] ${
              selected
                ? "border-maroon-400/60 bg-gradient-to-b from-maroon-800/50 to-surface shadow-2xl shadow-maroon-900/50 ring-1 ring-maroon-400/40"
                : "border-line bg-surface shadow-xl shadow-black/20 hover:border-maroon-400/40 hover:shadow-maroon-900/30"
            }`}
          >
            {/* glow */}
            <span
              aria-hidden
              className={`pointer-events-none absolute -top-16 left-1/2 h-32 w-48 -translate-x-1/2 rounded-full blur-3xl transition-opacity duration-300 ${
                selected ? "bg-maroon-500/40 opacity-100" : "bg-maroon-500/30 opacity-0 group-hover:opacity-100"
              }`}
            />

            {selected && (
              <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-gold-400 text-maroon-950 shadow-lg shadow-gold-500/30">
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
            )}

            <div className="relative flex items-center gap-3">
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-display text-xl font-bold transition-all duration-300 ${
                  selected
                    ? "bg-gradient-to-br from-maroon-500 to-aggie text-white shadow-lg shadow-maroon-700/50 ring-1 ring-inset ring-white/20"
                    : "bg-white/5 text-fg-muted ring-1 ring-inset ring-white/10 group-hover:text-fg"
                }`}
              >
                {p.interviewerName[0]}
              </span>
              <div className="min-w-0">
                <p className="font-display text-lg font-bold text-fg">{p.interviewerName}</p>
                <p className="flex items-center gap-1.5 text-xs text-fg-muted">
                  <Icon className={`h-3.5 w-3.5 ${selected ? "text-accent" : ""}`} /> {p.label}
                </p>
              </div>
            </div>

            <p className="relative mt-4 text-sm leading-relaxed text-fg-muted">{p.description}</p>

            <div className="relative mb-4 mt-4 flex flex-wrap gap-1.5">
              {p.tags.map((tag) => (
                <span key={tag} className={chipNeutral}>
                  {tag}
                </span>
              ))}
            </div>

            <div className="relative mt-auto flex items-center justify-between gap-2 border-t border-line pt-4">
              <DifficultyMeter level={p.difficulty} />
              <span className="inline-flex items-center gap-1 rounded-full bg-gold-400/10 px-2 py-0.5 text-[11px] font-medium text-gold ring-1 ring-inset ring-gold-400/25">
                <AudioLines className="h-3 w-3" /> {p.voiceStyle}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
