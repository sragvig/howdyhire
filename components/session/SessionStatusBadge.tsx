import type { SessionStatus } from "@/types";

const STYLES: Record<SessionStatus, { label: string; className: string; dot: string }> = {
  idle: { label: "Ready", className: "bg-white/5 text-fg-muted ring-white/10", dot: "bg-fg-subtle" },
  active: { label: "Live", className: "bg-maroon-500/20 text-accent ring-maroon-400/30", dot: "bg-maroon-400 animate-pulse" },
  scoring: { label: "Analyzing", className: "bg-gold-400/15 text-gold ring-gold-400/30", dot: "bg-gold-400 animate-pulse" },
  complete: { label: "Complete", className: "bg-emerald-500/15 text-good ring-emerald-400/30", dot: "bg-emerald-400" },
};

export function SessionStatusBadge({ status }: { status: SessionStatus }) {
  const { label, className, dot } = STYLES[status];
  return (
    <span className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
