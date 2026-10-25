"use client";

import { useEffect, useRef, type ReactNode } from "react";

const BAR_COUNT = 40;
const IDLE = 0.06;

// The live "stage": a pulsing maroon halo around the interviewer plus a mirrored waveform, both
// driven straight from the audio graph each frame (no React re-renders).
export function LiveStage({
  active,
  speaking,
  getInput,
  getOutput,
  initial,
  name,
  subtitle,
  children,
}: {
  active: boolean; // connected
  speaking: boolean; // interviewer is talking (otherwise the candidate's mic drives it)
  getInput: () => Uint8Array;
  getOutput: () => Uint8Array;
  initial: string;
  name: string;
  subtitle: string;
  children?: ReactNode;
}) {
  const orb = useRef<HTMLDivElement>(null);
  const bars = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const setBars = (scaleFor: (i: number) => number) =>
      bars.current.forEach((bar, i) => {
        if (bar) bar.style.transform = `scaleY(${scaleFor(i)})`;
      });

    if (!active) {
      orb.current?.style.setProperty("--level", "0");
      setBars(() => IDLE);
      return;
    }

    let frame = 0;
    let level = 0;
    const half = BAR_COUNT / 2;
    const tick = () => {
      const data = speaking ? getOutput() : getInput();
      if (data.length > 0) {
        // Overall loudness for the halo, eased so it breathes rather than flickers.
        let total = 0;
        const voiced = Math.floor(data.length * 0.6);
        for (let j = 0; j < voiced; j++) total += data[j];
        const target = Math.min(1, (total / voiced / 255) * 1.8);
        level += (target - level) * 0.2;
        orb.current?.style.setProperty("--level", level.toFixed(3));

        const bucket = Math.max(1, Math.floor(data.length / half));
        setBars((i) => {
          const k = i < half ? half - 1 - i : i - half; // mirror around the center
          let sum = 0;
          for (let j = k * bucket; j < (k + 1) * bucket && j < data.length; j++) sum += data[j];
          return IDLE + Math.min(1, (sum / bucket / 255) * 1.5) * (1 - IDLE);
        });
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, speaking, getInput, getOutput]);

  // Interviewer voice glows maroon; the candidate's voice glows gold.
  const ring = speaking ? "border-maroon-400/70" : "border-gold-400/60";
  const glow = speaking ? "184 49 49" : "212 175 55";

  return (
    <div className="flex flex-col items-center">
      <div ref={orb} className="relative flex h-48 w-48 items-center justify-center" style={{ ["--level" as string]: 0 }}>
        {/* idle breathing halo while connected */}
        {active && <span className={`absolute inset-6 animate-halo rounded-full border-2 ${ring}`} aria-hidden />}
        {/* level-reactive rings */}
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            aria-hidden
            className={`absolute inset-8 rounded-full border ${active ? ring : "border-white/10"} transition-colors duration-500`}
            style={{
              transform: `scale(calc(1 + var(--level) * ${0.28 + i * 0.22}))`,
              opacity: active ? `calc(${0.55 - i * 0.15} + var(--level) * 0.35)` : 0.4 - i * 0.12,
            }}
          />
        ))}
        <div
          className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-maroon-500 via-maroon-700 to-maroon-950 font-display text-4xl font-extrabold text-white ring-1 ring-inset ring-white/20 transition-shadow duration-300"
          style={{
            boxShadow: active
              ? `0 0 calc(24px + var(--level) * 70px) rgb(${glow} / calc(0.35 + var(--level) * 0.45)), inset 0 2px 12px rgb(255 255 255 / 0.15)`
              : "0 10px 40px rgb(80 0 0 / 0.5), inset 0 2px 12px rgb(255 255 255 / 0.12)",
          }}
        >
          {initial}
          {active && (
            <span
              className={`absolute bottom-2 right-2 h-3.5 w-3.5 rounded-full ring-2 ring-maroon-950 ${speaking ? "bg-maroon-300" : "bg-gold-400"}`}
              aria-hidden
            />
          )}
        </div>
      </div>

      <p className="mt-1 font-display text-lg font-bold text-fg">{name}</p>
      <p className="text-xs text-fg-subtle">{subtitle}</p>

      <div className="mt-4 flex h-16 w-full max-w-md items-center justify-center gap-[3px]" aria-hidden>
        {Array.from({ length: BAR_COUNT }, (_, i) => (
          <span
            key={i}
            ref={(el) => {
              bars.current[i] = el;
            }}
            className={`h-full w-1 origin-center rounded-full transition-[background-color] duration-500 ${
              !active
                ? "bg-white/15"
                : speaking
                  ? "bg-gradient-to-t from-maroon-700 via-maroon-400 to-maroon-200"
                  : "bg-gradient-to-t from-gold-600 via-gold-400 to-gold-200"
            }`}
            style={{ transform: `scaleY(${IDLE})` }}
          />
        ))}
      </div>

      {children}
    </div>
  );
}
