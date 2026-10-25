import type { SessionStatus } from "@/types";

const STYLES: Record<SessionStatus, { label: string; className: string; dot: string }> = {
  idle: { label: "Ready", className: "bg-stone-100 text-stone-600", dot: "bg-stone-400" },
  active: { label: "Practicing", className: "bg-maroon-50 text-aggie ring-1 ring-inset ring-maroon-100", dot: "bg-aggie animate-pulse" },
  scoring: { label: "Miss Rev is thinking", className: "bg-gold-50 text-gold-700 ring-1 ring-inset ring-gold-200", dot: "bg-gold-500 animate-pulse" },
  complete: { label: "Recap ready", className: "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200", dot: "bg-emerald-500" },
};

export function SessionStatusBadge({ status }: { status: SessionStatus }) {
  const { label, className, dot } = STYLES[status];
  return (
    <span className={`hidden shrink-0 items-center gap-2 rounded-full px-3 py-1 text-xs font-medium sm:inline-flex ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
