"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Reveille } from "@/components/mascot/Reveille";

// The live stage: Miss Rev listens along. A soft gold ring breathes gently with the audio level;
// no bars, glows, or gradients.
export function LiveStage({
  active,
  speaking,
  connecting,
  getInput,
  getOutput,
  interviewerName,
  interviewerLabel,
  children,
}: {
  active: boolean; // connected
  speaking: boolean; // interviewer is talking
  connecting: boolean;
  getInput: () => Uint8Array;
  getOutput: () => Uint8Array;
  interviewerName: string;
  interviewerLabel: string;
  children?: ReactNode;
}) {
  const ring = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!active) {
      if (ring.current) ring.current.style.transform = "scale(1)";
      return;
    }
    let frame = 0;
    let level = 0;
    const tick = () => {
      const data = speaking ? getOutput() : getInput();
      if (data.length > 0) {
        let total = 0;
        const voiced = Math.floor(data.length * 0.6);
        for (let j = 0; j < voiced; j++) total += data[j];
        level += (Math.min(1, (total / voiced / 255) * 1.8) - level) * 0.15;
        if (ring.current) ring.current.style.transform = `scale(${1 + level * 0.12})`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, speaking, getInput, getOutput]);

  const status = connecting
    ? "Miss Rev is getting things ready"
    : !active
      ? "Miss Rev is ready when you are"
      : speaking
        ? `${interviewerName} is asking`
        : "Miss Rev is listening";

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative flex h-44 w-44 items-center justify-center">
        {active && !speaking && <span aria-hidden className="absolute inset-3 animate-soft-ping rounded-full bg-gold-200" />}
        <span
          ref={ring}
          aria-hidden
          className={`absolute inset-3 rounded-full border-4 transition-colors duration-300 ${
            active ? (speaking ? "border-maroon-200" : "border-gold-300") : "border-stone-200"
          }`}
        />
        <span className={`relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-cream-200 ${active ? "animate-bob" : ""}`}>
          <Reveille mood={active && !speaking ? "listening" : "happy"} size={120} className="translate-y-2" />
        </span>
      </div>

      <span className="mt-1 inline-flex items-center gap-2 rounded-full bg-surface px-4 py-1.5 text-sm font-semibold text-fg shadow-sm ring-1 ring-stone-200" aria-live="polite">
        {status}
        {(active || connecting) && (
          <span className="flex gap-0.5" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-1.5 w-1.5 animate-dot rounded-full bg-aggie" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </span>
        )}
      </span>
      <p className="mt-2 text-xs text-fg-subtle">
        Interviewing with <span className="font-semibold text-fg-muted">{interviewerName}</span> · {interviewerLabel}
      </p>

      {children}
    </div>
  );
}
