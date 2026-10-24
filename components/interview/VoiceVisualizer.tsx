"use client";

import { useEffect, useRef } from "react";

const BAR_COUNT = 32;
const IDLE_SCALE = 0.06;

export function VoiceVisualizer({
  active,
  speaking,
  getInput,
  getOutput,
}: {
  active: boolean;
  speaking: boolean; // true when the interviewer is talking
  getInput: () => Uint8Array;
  getOutput: () => Uint8Array;
}) {
  const bars = useRef<(HTMLSpanElement | null)[]>([]);

  // Drive bar heights straight from the audio graph each frame, bypassing React renders.
  useEffect(() => {
    const setAll = (scaleFor: (i: number) => number) =>
      bars.current.forEach((bar, i) => {
        if (bar) bar.style.transform = `scaleY(${scaleFor(i)})`;
      });

    if (!active) {
      setAll(() => IDLE_SCALE);
      return;
    }

    let frame = 0;
    const half = BAR_COUNT / 2;
    const tick = () => {
      const data = speaking ? getOutput() : getInput();
      if (data.length > 0) {
        const bucket = Math.max(1, Math.floor(data.length / half));
        setAll((i) => {
          // Mirror around the center so the wave looks symmetric.
          const k = i < half ? half - 1 - i : i - half;
          let sum = 0;
          for (let j = k * bucket; j < (k + 1) * bucket && j < data.length; j++) sum += data[j];
          const v = sum / bucket / 255;
          return IDLE_SCALE + Math.min(1, v * 1.4) * (1 - IDLE_SCALE);
        });
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, speaking, getInput, getOutput]);

  return (
    <div className="flex h-28 items-center justify-center gap-1" aria-hidden>
      {Array.from({ length: BAR_COUNT }, (_, i) => (
        <span
          key={i}
          ref={(el) => {
            bars.current[i] = el;
          }}
          className={`h-full w-1.5 origin-center rounded-full transition-[background-color] duration-300 ${
            !active ? "bg-maroon-200" : speaking ? "bg-gradient-to-t from-maroon-800 to-maroon-500" : "bg-maroon-300"
          }`}
          style={{ transform: `scaleY(${IDLE_SCALE})` }}
        />
      ))}
    </div>
  );
}
