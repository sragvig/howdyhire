"use client";

import { useSession } from "@/components/providers/SessionProvider";
import { SessionStatusBadge } from "@/components/session/SessionStatusBadge";

export function Header() {
  const { session } = useSession();

  return (
    <header className="flex h-16 print:hidden items-center justify-between border-b border-stone-200 bg-white px-4 sm:px-8">
      <div className="flex items-center gap-2 md:hidden">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-aggie text-sm font-bold text-white">
          H
        </div>
        <span className="font-semibold text-aggie">HowdyHire</span>
      </div>
      <h1 className="hidden text-sm font-medium text-stone-500 md:block">
        Behavioral Interview Simulator
      </h1>
      <SessionStatusBadge status={session.status} />
    </header>
  );
}
