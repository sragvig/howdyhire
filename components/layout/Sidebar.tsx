"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, FileText, LayoutDashboard, Library, Mic, ThumbsUp } from "lucide-react";

const SECTIONS = [
  {
    label: "Studio",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/resume", label: "Resume", icon: FileText },
      { href: "/jobs", label: "Job Board", icon: Briefcase },
      { href: "/interview", label: "Interview Studio", icon: Mic },
    ],
  },
  { label: "Progress", items: [{ href: "/library", label: "Practice Library", icon: Library }] },
];

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-maroon-600 to-maroon-900 font-display text-lg font-extrabold text-white shadow-lg shadow-maroon-950/60 ring-1 ring-inset ring-white/15">
        H
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-gold-400 ring-2 ring-canvas" />
      </span>
      {!compact && (
        <span className="font-display text-lg font-bold tracking-tight text-fg">
          Howdy<span className="text-accent">Hire</span>
        </span>
      )}
    </Link>
  );
}

// Reading the path is runtime data under cacheComponents, so it lives behind Suspense; the
// fallback renders the same links without the active highlight.
function ActiveNav() {
  return <Nav pathname={usePathname()} />;
}

function Nav({ pathname }: { pathname: string | null }) {
  const isActive = (href: string) => !!pathname && (href === "/" ? pathname === "/" : pathname.startsWith(href));
  return (
    <nav className="flex-1 space-y-6 px-3 py-4" aria-label="Main">
      {SECTIONS.map((section) => (
        <div key={section.label}>
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-fg-subtle">{section.label}</p>
          <ul className="space-y-1">
            {section.items.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-300 ${
                      active
                        ? "bg-gradient-to-r from-maroon-700/60 to-maroon-900/30 text-white shadow-lg shadow-maroon-950/40 ring-1 ring-inset ring-maroon-400/25"
                        : "text-fg-muted hover:bg-white/5 hover:text-fg"
                    }`}
                  >
                    {active && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-gold-400" />}
                    <Icon className={`h-4 w-4 transition-colors ${active ? "text-gold-300" : "text-fg-subtle group-hover:text-accent"}`} />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-canvas/70 backdrop-blur-md md:flex print:hidden!">
      <div className="flex h-16 items-center px-5">
        <Logo />
      </div>

      <Suspense fallback={<Nav pathname={null} />}>
        <ActiveNav />
      </Suspense>

      <div className="m-3 rounded-2xl border border-gold-400/20 bg-gradient-to-br from-maroon-900/60 to-transparent p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-fg">
          <ThumbsUp className="h-4 w-4 text-gold" /> Gig &apos;em
        </p>
        <p className="mt-1 text-xs leading-relaxed text-fg-subtle">Practice like it counts. Every session saves to your library.</p>
      </div>
    </aside>
  );
}
