import { Building2, Check, MapPin } from "lucide-react";
import type { JobPosting } from "@/types";

const TYPE_LABELS: Record<NonNullable<JobPosting["employmentType"]>, string> = {
  internship: "Internship",
  "co-op": "Co-op",
  "full-time": "Full-time",
  "part-time": "Part-time",
};

export function JobCard({
  job,
  selected,
  disabled,
  onSelect,
}: {
  job: JobPosting;
  selected: boolean;
  disabled?: boolean;
  onSelect: (job: JobPosting) => void;
}) {
  return (
    <article
      className={`flex flex-col rounded-xl border bg-white p-5 shadow-sm transition-colors ${
        selected ? "border-aggie ring-1 ring-aggie" : "border-stone-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-stone-900">{job.title}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-stone-600">
            <Building2 className="h-3.5 w-3.5 shrink-0" /> {job.company}
          </p>
          {job.location && (
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-stone-500">
              <MapPin className="h-3.5 w-3.5 shrink-0" /> {job.location}
            </p>
          )}
        </div>
        {job.employmentType && (
          <span className="shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">
            {TYPE_LABELS[job.employmentType]}
          </span>
        )}
      </div>

      <p className="mt-3 line-clamp-3 text-sm text-stone-600">{job.description}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {job.keyCompetencies.map((c) => (
          <span key={c.name} className="rounded-full bg-maroon-50 px-2 py-0.5 text-xs text-maroon-800">
            {c.name}
          </span>
        ))}
      </div>

      <div className="mt-auto pt-4">
        <button
          type="button"
          onClick={() => onSelect(job)}
          disabled={disabled || selected}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${
            selected
              ? "bg-maroon-50 text-aggie"
              : "bg-aggie text-white hover:bg-maroon-700 disabled:bg-stone-300"
          }`}
        >
          {selected ? (
            <>
              <Check className="h-4 w-4" /> Selected
            </>
          ) : (
            "Practice for this role"
          )}
        </button>
      </div>
    </article>
  );
}
