import { Clock } from "lucide-react";
import { WRAP_UP_GRACE_MS } from "@/lib/durations";

const fmt = (ms: number) => {
  const total = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
};

export function InterviewTimer({ elapsedMs, limitMs, warningMs }: { elapsedMs: number; limitMs: number; warningMs: number }) {
  if (!limitMs) return null;
  const remaining = limitMs - elapsedMs;
  const over = remaining <= 0;
  const warning = !over && remaining <= warningMs;
  const pct = Math.min(100, (elapsedMs / limitMs) * 100);

  return (
    <div className="mx-auto w-full max-w-sm" aria-live="off">
      <div className="flex items-center justify-between text-xs font-medium tabular-nums">
        <span className={`inline-flex items-center gap-1.5 ${over ? "text-bad" : warning ? "text-warn" : "text-fg-muted"}`}>
          <Clock className="h-3.5 w-3.5" />
          {over
            ? `Wrapping up · auto-ends in ${fmt(limitMs + WRAP_UP_GRACE_MS - elapsedMs)}`
            : warning
              ? `${fmt(remaining)} left · finishing up`
              : `${fmt(remaining)} left`}
        </span>
        <span className="font-mono text-fg-subtle">
          {fmt(elapsedMs)} / {fmt(limitMs)}
        </span>
      </div>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-1 rounded-full transition-[width] duration-1000 ease-linear ${
            over ? "bg-red-400" : warning ? "bg-gradient-to-r from-gold-500 to-gold-300" : "bg-gradient-to-r from-maroon-500 to-maroon-300"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
