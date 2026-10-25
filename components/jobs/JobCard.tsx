import { ArrowRight, Building2, Check, MapPin } from "lucide-react";
import type { JobPosting } from "@/types";
import { chipMaroon, chipNeutral, surface } from "@/components/ui/styles";

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
      className={`${surface} group relative flex flex-col overflow-hidden p-5 transition-all duration-300 hover:-translate-y-0.5 ${
        selected ? "border-maroon-400/60 ring-1 ring-maroon-400/40 shadow-maroon-900/40" : "hover:border-maroon-400/40 hover:shadow-maroon-900/30"
      }`}
    >
      {selected && <span aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-maroon-500/30 blur-2xl" />}
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display font-semibold text-fg">{job.title}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-fg-muted">
            <Building2 className="h-3.5 w-3.5 shrink-0" /> {job.company}
          </p>
          {job.location && (
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-fg-subtle">
              <MapPin className="h-3.5 w-3.5 shrink-0" /> {job.location}
            </p>
          )}
        </div>
        {job.employmentType && <span className={chipNeutral}>{TYPE_LABELS[job.employmentType]}</span>}
      </div>

      <p className="relative mt-3 line-clamp-3 text-sm leading-relaxed text-fg-muted">{job.description}</p>

      <div className="relative mt-3 flex flex-wrap gap-1.5">
        {job.keyCompetencies.map((c) => (
          <span key={c.name} className={chipMaroon}>
            {c.name}
          </span>
        ))}
      </div>

      <div className="relative mt-auto pt-5">
        <button
          type="button"
          onClick={() => onSelect(job)}
          disabled={disabled}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${
            selected
              ? "bg-gold-400/15 text-gold ring-1 ring-inset ring-gold-400/40 hover:bg-gold-400/25"
              : "bg-gradient-to-b from-maroon-600 to-aggie text-white shadow-lg shadow-maroon-950/50 ring-1 ring-inset ring-white/15 hover:from-maroon-500 hover:to-maroon-700"
          }`}
        >
          {selected ? (
            <>
              <Check className="h-4 w-4" /> Active job · Go to studio
            </>
          ) : (
            <>
              Practice for this role <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </div>
    </article>
  );
}
