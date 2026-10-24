import Link from "next/link";
import { Briefcase, FileText, History, LayoutDashboard, Mic } from "lucide-react";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/resume", label: "Resume", icon: FileText },
  { href: "/jobs", label: "Job Board", icon: Briefcase },
  { href: "/interview", label: "Interview", icon: Mic },
  { href: "/history", label: "History", icon: History },
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-aggie text-maroon-50 md:flex print:hidden!">
      <div className="flex h-16 items-center gap-2 border-b border-maroon-700 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white font-bold text-aggie">
          H
        </div>
        <span className="text-lg font-semibold tracking-tight">HowdyHire</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-maroon-100 transition-colors hover:bg-maroon-700 hover:text-white"
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-maroon-700 px-6 py-4 text-xs text-maroon-200">
        Gig &apos;em. Practice like it counts.
      </div>
    </aside>
  );
}
