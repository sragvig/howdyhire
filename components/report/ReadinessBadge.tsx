import { BadgeCheck, Dumbbell, Sprout, TrendingUp, type LucideIcon } from "lucide-react";
import type { ReadinessTier } from "@/types";
import { READINESS } from "@/lib/readiness";

const STYLES: Record<ReadinessTier, { icon: LucideIcon; className: string }> = {
  "interview-ready": { icon: BadgeCheck, className: "bg-emerald-100 text-emerald-900" },
  "almost-ready": { icon: TrendingUp, className: "bg-sky-100 text-sky-900" },
  developing: { icon: Sprout, className: "bg-amber-100 text-amber-900" },
  "needs-practice": { icon: Dumbbell, className: "bg-stone-100 text-stone-800" },
};

export function ReadinessBadge({ tier }: { tier: ReadinessTier }) {
  const { icon: Icon, className } = STYLES[tier];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${className}`}>
      <Icon className="h-4 w-4" />
      {READINESS[tier].label}
    </span>
  );
}
