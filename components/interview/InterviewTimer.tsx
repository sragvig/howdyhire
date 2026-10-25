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
    <div className="mx-auto w-full max-w-xs" aria-live="off">
      <div className="flex items-center justify-between text-xs font-medium tabular-nums">
        <span className={`inline-flex items-center gap-1.5 ${over ? "text-bad" : warning ? "text-warn" : "text-fg-muted"}`}>
          <Clock className="h-3.5 w-3.5" />
          {over ? `Wrapping up · ends in ${fmt(limitMs + WRAP_UP_GRACE_MS - elapsedMs)}` : warning ? `${fmt(remaining)} left · almost done!` : `${fmt(remaining)} left`}
        </span>
        <span className="text-fg-subtle">
          {fmt(elapsedMs)} / {fmt(limitMs)}
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-stone-200">
        <div
          className={`h-2 rounded-full transition-[width] duration-1000 ease-linear ${over ? "bg-red-600" : warning ? "bg-gold-500" : "bg-aggie"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
