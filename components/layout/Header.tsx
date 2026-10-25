"use client";

import { useSession } from "@/components/providers/SessionProvider";
import { SessionStatusBadge } from "@/components/session/SessionStatusBadge";
import { ActiveJobPill } from "@/components/studio/ActiveJobPill";
import { Logo } from "./Sidebar";

export function Header() {
  const { session } = useSession();
  const firstName = session.resume?.candidateName.split(" ")[0];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-line bg-canvas/70 px-4 backdrop-blur-md sm:px-8 print:hidden">
      <div className="flex min-w-0 items-center gap-3">
        <div className="md:hidden">
          <Logo compact />
        </div>
        <p className="hidden truncate text-sm text-fg-muted sm:block">
          {firstName ? (
            <>
              Howdy, <span className="font-semibold text-fg">{firstName}</span>
              <span className="text-gold">!</span>
            </>
          ) : (
            "Howdy! Let's get you interview-ready."
          )}
        </p>
      </div>
      <div className="flex min-w-0 items-center gap-2">
        <ActiveJobPill />
        <SessionStatusBadge status={session.status} />
      </div>
    </header>
  );
}
