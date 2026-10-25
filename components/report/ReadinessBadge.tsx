import { BadgeCheck, Dumbbell, Sprout, TrendingUp, type LucideIcon } from "lucide-react";
import type { ReadinessTier } from "@/types";
import { READINESS } from "@/lib/readiness";

const STYLES: Record<ReadinessTier, { icon: LucideIcon; className: string }> = {
  "interview-ready": { icon: BadgeCheck, className: "bg-gold-400/15 text-gold ring-gold-400/40" },
  "almost-ready": { icon: TrendingUp, className: "bg-emerald-500/15 text-good ring-emerald-400/30" },
  developing: { icon: Sprout, className: "bg-sky-500/15 text-sky-300 ring-sky-400/30" },
  "needs-practice": { icon: Dumbbell, className: "bg-white/10 text-fg-muted ring-white/15" },
};

export function ReadinessBadge({ tier }: { tier: ReadinessTier }) {
  const { icon: Icon, className } = STYLES[tier];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${className}`}>
      <Icon className="h-3.5 w-3.5" />
      {READINESS[tier].label}
    </span>
  );
}
