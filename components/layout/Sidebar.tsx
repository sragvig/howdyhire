"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, FileText, Home, Library, Mic, ThumbsUp } from "lucide-react";
import { RevAvatar } from "@/components/mascot/Reveille";

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/resume", label: "My Resume", icon: FileText },
  { href: "/jobs", label: "Job Board", icon: Briefcase },
  { href: "/interview", label: "Practice Session", icon: Mic },
  { href: "/library", label: "Practice Library", icon: Library },
];

export function Logo({ onMaroon = true }: { onMaroon?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <RevAvatar size={38} ring={false} />
      <span className={`font-display text-lg font-bold tracking-tight ${onMaroon ? "text-cream-50" : "text-accent"}`}>
        HowdyHire
      </span>
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
    <nav className="flex-1 px-3 py-6" aria-label="Main">
      <ul className="space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                  active ? "bg-white/10 text-cream-50" : "text-cream-200/80 hover:bg-white/5 hover:text-cream-50"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-gold-300" : ""}`} />
                {label}
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-gold-300" aria-hidden />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-aggie md:flex print:hidden!">
      <div className="flex h-20 items-center px-5">
        <Logo />
      </div>

      <Suspense fallback={<Nav pathname={null} />}>
        <ActiveNav />
      </Suspense>

      <div className="m-4 rounded-2xl bg-white/10 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-cream-50">
          <ThumbsUp className="h-4 w-4 text-gold-300" /> Gig &apos;em!
        </p>
        <p className="mt-1 text-xs leading-relaxed text-cream-200/80">Every practice session saves to your library.</p>
      </div>
    </aside>
  );
}
