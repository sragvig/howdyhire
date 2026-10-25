"use client";

import Link from "next/link";
import { Briefcase, Download } from "lucide-react";
import { useSession } from "@/components/providers/SessionProvider";

// Always-visible indicator of the job the interview is targeting.
export function ActiveJobPill() {
  const { session } = useSession();
  const job = session.job;
  if (!job) return null;
  const imported = job.id.startsWith("import-");

  return (
    <Link
      href="/jobs"
      title={`Active job: ${job.title} @ ${job.company}`}
      className="group flex min-w-0 items-center gap-2 rounded-full border border-gold-400/30 bg-gradient-to-r from-maroon-800/70 to-maroon-950/60 py-1 pl-1 pr-3 text-xs shadow-lg shadow-maroon-950/40 transition-all duration-300 hover:border-gold-400/60 hover:shadow-maroon-800/40"
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-400/20 text-gold">
        {imported ? <Download className="h-3.5 w-3.5" /> : <Briefcase className="h-3.5 w-3.5" />}
      </span>
      <span className="hidden shrink-0 font-semibold uppercase tracking-wider text-gold lg:inline">Active job</span>
      <span className="min-w-0 truncate text-white">
        <span className="font-semibold">{job.title}</span>
        <span className="text-maroon-200"> @ {job.company}</span>
      </span>
    </Link>
  );
}
