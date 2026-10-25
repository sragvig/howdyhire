"use client";

import { useSession } from "@/components/providers/SessionProvider";
import { SessionStatusBadge } from "@/components/session/SessionStatusBadge";
import { ActiveJobPill } from "@/components/studio/ActiveJobPill";
import { RevAvatar } from "@/components/mascot/Reveille";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Logo } from "./Sidebar";

export function Header() {
  const { session } = useSession();
  const firstName = session.resume?.candidateName.split(" ")[0];

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-3 border-b border-stone-200 bg-canvas/95 px-4 sm:px-8 print:hidden">
      <div className="flex min-w-0 items-center gap-3">
        <div className="md:hidden">
          <Logo onMaroon={false} />
        </div>
        <div className="hidden items-center gap-3 sm:flex">
          <RevAvatar size={40} />
          <p className="truncate text-sm text-fg-muted">
            <span className="font-semibold text-fg">Howdy{firstName ? `, ${firstName}` : ""}!</span> HowdyHire is ready to help you
            practice.
          </p>
        </div>
      </div>
      <div className="flex min-w-0 items-center gap-2">
        <ActiveJobPill />
        <SessionStatusBadge status={session.status} />
        <ThemeToggle />
      </div>
    </header>
  );
}
