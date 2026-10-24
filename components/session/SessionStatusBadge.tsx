import type { SessionStatus } from "@/types";

const STYLES: Record<SessionStatus, { label: string; className: string; dot: string }> = {
  idle: { label: "Idle", className: "bg-stone-100 text-stone-600", dot: "bg-stone-400" },
  active: { label: "Live", className: "bg-maroon-100 text-maroon-800", dot: "bg-maroon-600 animate-pulse" },
  scoring: { label: "Scoring", className: "bg-amber-100 text-amber-800", dot: "bg-amber-500 animate-pulse" },
  complete: { label: "Complete", className: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-500" },
};

export function SessionStatusBadge({ status }: { status: SessionStatus }) {
  const { label, className, dot } = STYLES[status];
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${className}`}>
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
