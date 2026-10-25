"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles } from "lucide-react";
import type { JobCategory, JobPosting } from "@/types";
import { AGGIE_JOB_BOARD } from "@/lib/mock-jobs";
import { useSession } from "@/components/providers/SessionProvider";
import { Card } from "@/components/dashboard/Card";
import { useToast } from "@/components/ui/Toast";
import { input } from "@/components/ui/styles";
import { CustomJobInput } from "./CustomJobInput";
import { JobCard } from "./JobCard";

type Filter = "all" | JobCategory;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "engineering", label: "Engineering" },
  { id: "business", label: "Business" },
];

export function JobBoardFeed() {
  const { session, setJob, reset } = useSession();
  const router = useRouter();
  const toast = useToast();
  // Seed with the selected custom job so it survives navigating away and back.
  const [customJobs, setCustomJobs] = useState<JobPosting[]>(() =>
    session.job?.source === "custom" ? [session.job] : [],
  );
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  // Only an interview in progress locks the board; a finished one is replaced by a fresh session.
  const locked = session.status === "active" || session.status === "scoring";

  const jobs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return AGGIE_JOB_BOARD.filter((j) => filter === "all" || j.category === filter).filter(
      (j) =>
        !q ||
        [j.title, j.company, j.location ?? "", ...j.keyCompetencies.map((c) => c.name)]
          .join(" ")
          .toLowerCase()
          .includes(q),
    );
  }, [filter, query]);

  // "Practice" on any card makes it the active job and goes straight to the interview room.
  function practice(job: JobPosting) {
    if (session.status === "complete") reset();
    setJob(job);
    toast({ tone: "success", title: "Active job set", description: `${job.title} @ ${job.company}` });
    router.push("/interview");
  }

  function handleImported(job: JobPosting) {
    setCustomJobs((prev) => [job, ...prev]);
    if (session.status === "complete") reset();
    setJob(job);
  }

  return (
    <div className="space-y-6">
      <Card title="Import a posting" icon={<Sparkles />}>
        <CustomJobInput disabled={locked} onImported={handleImported} />
      </Card>

      {customJobs.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-fg-subtle">Your imported postings</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {customJobs.map((job) => (
              <JobCard key={job.id} job={job} selected={session.job?.id === job.id} disabled={locked} onSelect={practice} />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-lg font-semibold text-fg">Aggie Job Board</h2>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="inline-flex rounded-full border border-stone-200 bg-surface p-1 shadow-sm">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300 ${
                    filter === f.id
                      ? "bg-aggie text-cream-50"
                      : "text-fg-muted hover:text-fg"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <label className="relative">
              <span className="sr-only">Search jobs</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search roles, companies, skills"
                className={`${input} py-2 pl-9 sm:w-64`}
              />
            </label>
          </div>
        </div>

        {jobs.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line-strong p-8 text-center text-sm text-fg-subtle">
            No roles match your search.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} selected={session.job?.id === job.id} disabled={locked} onSelect={practice} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
