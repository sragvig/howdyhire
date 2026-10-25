"use client";

import Link from "next/link";
import { ArrowRight, Briefcase, Check, ChevronRight, FileText, Library, Mic, Trophy, TrendingUp, UserRound } from "lucide-react";
import { useSession } from "@/components/providers/SessionProvider";
import { usePracticeLibrary } from "@/components/library/usePracticeLibrary";
import { ReadinessBadge } from "@/components/report/ReadinessBadge";
import { getPersona } from "@/lib/personas";
import { getDuration } from "@/lib/durations";
import { btn, chipMaroon, interactiveSurface, surface } from "@/components/ui/styles";

function StatusCard({
  href,
  icon: Icon,
  label,
  done,
  title,
  detail,
}: {
  href: string;
  icon: typeof FileText;
  label: string;
  done: boolean;
  title: string;
  detail: string;
}) {
  return (
    <Link href={href} className={`${interactiveSurface} group flex flex-col p-5`}>
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-maroon-500/15 text-accent ring-1 ring-inset ring-maroon-400/25">
          <Icon className="h-5 w-5" />
        </span>
        {done ? (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-400/15 text-gold ring-1 ring-inset ring-gold-400/40">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
        ) : (
          <span className="text-xs font-semibold text-accent">To do</span>
        )}
      </div>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-subtle">{label}</p>
      <p className="mt-1 truncate font-display font-semibold text-fg">{title}</p>
      <p className="mt-0.5 line-clamp-2 text-sm text-fg-muted">{detail}</p>
      <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-accent">
        {done ? "Change" : "Set up"} <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

export function Dashboard() {
  const { session } = useSession();
  const library = usePracticeLibrary();
  const { resume, job } = session;
  const first = resume?.candidateName.split(" ")[0];
  const persona = getPersona(session.config.persona);
  const duration = getDuration(session.config.durationMinutes);

  const next = !resume
    ? { href: "/resume", label: "Upload your resume" }
    : !job
      ? { href: "/jobs", label: "Pick a target role" }
      : { href: "/interview", label: "Enter the Interview Studio" };

  const scores = library.map((e) => e.feedback.overallScore);
  const best = scores.length ? Math.max(...scores) : null;
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-gold-400/20 bg-gradient-to-br from-maroon-700 via-aggie to-maroon-950 p-7 shadow-2xl shadow-maroon-950/60 sm:p-10">
        <span aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-gold-400/15 blur-3xl" />
        <span aria-hidden className="pointer-events-none absolute -bottom-40 left-10 h-80 w-80 rounded-full bg-maroon-400/20 blur-3xl" />
        <div className="relative max-w-2xl animate-fade-up">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-300">Behavioral Interview Studio</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Howdy{first ? `, ${first}` : ", Aggie"}!
          </h1>
          <p className="mt-3 text-base leading-relaxed text-maroon-100">
            Practice with an AI interviewer that knows your resume and your target role. Get STAR-method scoring, pacing
            analytics, and Aggie-alum rewrites after every session.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={next.href} className={`${btn.onMaroon} px-5 py-3`}>
              {next.label} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/library" className={`${btn.onMaroonGhost} px-5 py-3`}>
              <Library className="h-4 w-4" /> Practice Library
            </Link>
          </div>
        </div>
      </section>

      {/* Studio setup status */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-fg-subtle">Your studio setup</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <StatusCard
            href="/resume"
            icon={FileText}
            label="Resume"
            done={!!resume}
            title={resume ? resume.candidateName : "No resume yet"}
            detail={
              resume
                ? `${resume.experience.length} experiences · ${resume.projects.length} projects · ${resume.skills.technical.length} skills`
                : "Upload a PDF so questions reference your real projects."
            }
          />
          <StatusCard
            href="/jobs"
            icon={Briefcase}
            label="Target role"
            done={!!job}
            title={job ? job.title : "No role selected"}
            detail={job ? job.company : "Pick from the Aggie Job Board or import with the Chrome extension."}
          />
          <StatusCard
            href="/interview"
            icon={UserRound}
            label="Interviewer"
            done={!!resume && !!job}
            title={`${persona.interviewerName} · ${persona.label}`}
            detail={`${duration.label === "Demo" ? "2-minute demo" : `${duration.minutes} minutes`} · ~${duration.questions} questions`}
          />
        </div>
        {job && job.keyCompetencies.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-fg-subtle">Focus competencies:</span>
            {job.keyCompetencies.map((c) => (
              <span key={c.name} className={chipMaroon}>
                {c.name}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Progress */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-fg-subtle">Recent practice</h2>
          {library.length > 0 && (
            <Link href="/library" className="text-sm font-semibold text-accent hover:underline">
              View all
            </Link>
          )}
        </div>
        {library.length === 0 ? (
          <div className={`${surface} flex flex-col items-center p-8 text-center`}>
            <Mic className="h-8 w-8 text-fg-subtle/60" />
            <p className="mt-3 font-semibold text-fg">No sessions yet</p>
            <p className="mt-1 text-sm text-fg-muted">Your first scorecard will show up here. Start with the 2-minute demo.</p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-4">
            <div className={`${surface} grid grid-cols-2 gap-4 p-5 lg:col-span-1 lg:grid-cols-1`}>
              <div>
                <p className="flex items-center gap-1.5 text-xs text-fg-subtle">
                  <TrendingUp className="h-3.5 w-3.5" /> Average score
                </p>
                <p className="font-display text-3xl font-extrabold tabular-nums text-fg">{avg}</p>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-xs text-fg-subtle">
                  <Trophy className="h-3.5 w-3.5 text-gold" /> Best score
                </p>
                <p className="font-display text-3xl font-extrabold tabular-nums text-gold">{best}</p>
              </div>
            </div>
            {library.slice(0, 3).map((e) => (
              <Link key={e.id} href={`/library/${e.id}`} className={`${interactiveSurface} group flex flex-col p-5`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-fg">{e.job.title}</p>
                    <p className="truncate text-sm text-fg-subtle">{e.job.company}</p>
                  </div>
                  <p className="font-display text-2xl font-extrabold tabular-nums text-fg">{e.feedback.overallScore}</p>
                </div>
                <div className="mt-3">{e.feedback.report && <ReadinessBadge tier={e.feedback.report.readinessTier} />}</div>
                <p className="mt-auto pt-3 text-xs text-fg-subtle">
                  {new Date(e.completedAt).toLocaleDateString()} · {getPersona(e.persona).interviewerName}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
