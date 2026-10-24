"use client";

import { useMemo, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import type { JobCategory, JobPosting } from "@/types";
import { AGGIE_JOB_BOARD } from "@/lib/mock-jobs";
import { useSession } from "@/components/providers/SessionProvider";
import { Card } from "@/components/dashboard/Card";
import { CustomJobInput } from "./CustomJobInput";
import { JobCard } from "./JobCard";

type Filter = "all" | JobCategory;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "engineering", label: "Engineering" },
  { id: "business", label: "Business" },
];

export function JobBoardFeed() {
  const { session, setJob } = useSession();
  // Seed with the selected custom job so it survives navigating away and back.
  const [customJobs, setCustomJobs] = useState<JobPosting[]>(() =>
    session.job?.source === "custom" ? [session.job] : [],
  );
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const locked = session.status !== "idle";

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

  function handleImported(job: JobPosting) {
    setCustomJobs((prev) => [job, ...prev]);
    setJob(job);
  }

  return (
    <div className="space-y-6">
      <Card title="Import a posting" icon={<Sparkles className="h-5 w-5" />}>
        <CustomJobInput disabled={locked} onImported={handleImported} />
      </Card>

      {customJobs.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold text-stone-900">Your imported postings</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {customJobs.map((job) => (
              <JobCard key={job.id} job={job} selected={session.job?.id === job.id} disabled={locked} onSelect={setJob} />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold text-stone-900">Aggie Job Board</h2>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="inline-flex rounded-lg bg-stone-100 p-1">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={`rounded-md px-3 py-1 text-sm font-medium ${
                    filter === f.id ? "bg-white text-aggie shadow-sm" : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <label className="relative">
              <span className="sr-only">Search jobs</span>
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search roles, companies, skills"
                className="w-full rounded-md border border-stone-300 py-1.5 pl-8 pr-3 text-sm focus:border-aggie focus:outline-none focus:ring-1 focus:ring-aggie sm:w-64"
              />
            </label>
          </div>
        </div>

        {jobs.length === 0 ? (
          <p className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">
            No roles match your search.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} selected={session.job?.id === job.id} disabled={locked} onSelect={setJob} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
