import { BadgeCheck, Dumbbell, Sprout, TrendingUp, type LucideIcon } from "lucide-react";
import type { ReadinessTier } from "@/types";
import { READINESS } from "@/lib/readiness";

const STYLES: Record<ReadinessTier, { icon: LucideIcon; className: string }> = {
  "interview-ready": { icon: BadgeCheck, className: "bg-gold-400 text-maroon-900" },
  "almost-ready": { icon: TrendingUp, className: "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200" },
  developing: { icon: Sprout, className: "bg-sky-50 text-sky-800 ring-1 ring-inset ring-sky-200" },
  "needs-practice": { icon: Dumbbell, className: "bg-stone-100 text-stone-700 ring-1 ring-inset ring-stone-200" },
};

export function ReadinessBadge({ tier }: { tier: ReadinessTier }) {
  const { icon: Icon, className } = STYLES[tier];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${className}`}>
      <Icon className="h-3.5 w-3.5" />
      {READINESS[tier].label}
    </span>
  );
}
