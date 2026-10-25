"use client";

import Link from "next/link";
import { Briefcase, Download } from "lucide-react";
import { useSession } from "@/components/providers/SessionProvider";

// Always-visible indicator of the job the practice session is targeting.
export function ActiveJobPill() {
  const { session } = useSession();
  const job = session.job;
  if (!job) return null;
  const imported = job.id.startsWith("import-");

  return (
    <Link
      href="/jobs"
      title={`Active job: ${job.title} @ ${job.company}`}
      className="flex min-w-0 items-center gap-2 rounded-full border border-maroon-200 bg-surface py-1 pl-1 pr-3.5 text-xs shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-maroon-300 hover:shadow-md"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-400 text-maroon-900">
        {imported ? <Download className="h-3.5 w-3.5" /> : <Briefcase className="h-3.5 w-3.5" />}
      </span>
      <span className="hidden shrink-0 font-semibold text-accent lg:inline">Active job:</span>
      <span className="min-w-0 truncate text-fg">
        <span className="font-semibold">{job.title}</span>
        <span className="text-fg-subtle"> @ {job.company}</span>
      </span>
    </Link>
  );
}
