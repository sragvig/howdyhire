"use client";

import Link from "next/link";
import { ArrowRight, Briefcase, Check, ChevronRight, FileText, Library, Mic, Trophy, TrendingUp, UserRound } from "lucide-react";
import { useSession } from "@/components/providers/SessionProvider";
import { usePracticeLibrary } from "@/components/library/usePracticeLibrary";
import { ReadinessBadge } from "@/components/report/ReadinessBadge";
import { Reveille, RevSays } from "@/components/mascot/Reveille";
import { getPersona } from "@/lib/personas";
import { getDuration } from "@/lib/durations";
import { btn, chipMaroon, iconTile, interactiveSurface, surface } from "@/components/ui/styles";

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
    <Link href={href} className={`${interactiveSurface} group flex flex-col p-6`}>
      <div className="flex items-center justify-between">
        <span className={`${iconTile} h-11 w-11`}>
          <Icon className="h-5 w-5" />
        </span>
        {done ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-gold-400 px-2.5 py-0.5 text-xs font-bold text-maroon-900">
            <Check className="h-3.5 w-3.5" strokeWidth={3} /> Done
          </span>
        ) : (
          <span className="rounded-full bg-maroon-50 px-2.5 py-0.5 text-xs font-semibold text-accent">To do</span>
        )}
      </div>
      <p className="mt-4 text-xs font-medium text-fg-subtle">{label}</p>
      <p className="mt-0.5 truncate font-display text-lg font-semibold text-fg">{title}</p>
      <p className="mt-1 line-clamp-2 text-sm text-fg-muted">{detail}</p>
      <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-accent">
        {done ? "Change" : "Set it up"} <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
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
    ? { href: "/resume", label: "Add your resume" }
    : !job
      ? { href: "/jobs", label: "Pick a role to practice for" }
      : { href: "/interview", label: "Start a practice session" };

  const scores = library.map((e) => e.feedback.overallScore);
  const best = scores.length ? Math.max(...scores) : null;
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      {/* Welcome banner */}
      <section className={`${surface} relative overflow-hidden p-8 sm:p-10`}>
        <div className="relative flex flex-col items-center gap-8 md:flex-row">
          <span className="shrink-0 animate-bob rounded-full border-4 border-maroon-800 ring-4 ring-gold-200">
            <Reveille mood="happy" size={152} priority />
          </span>
          <div className="animate-fade-up text-center md:text-left">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-gold-50 px-3 py-1 text-xs font-semibold text-gold-700 ring-1 ring-inset ring-gold-200">
              Gig &apos;em, {first ?? "Ags"}!
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-fg sm:text-4xl">
              Howdy! HowdyHire is ready to help you practice.
            </h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-fg-muted">
              Practice behavioral interviews out loud with a friendly AI interviewer who knows your resume and the job you want.
              You&apos;ll get a quick STAR recap after every session.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
              <Link href={next.href} className={`${btn.primary} px-5 py-3`}>
                {next.label} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/library" className={`${btn.secondary} px-5 py-3`}>
                <Library className="h-4 w-4" /> Practice Library
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Setup status */}
      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-fg">Your practice setup</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <StatusCard
            href="/resume"
            icon={FileText}
            label="Resume"
            done={!!resume}
            title={resume ? resume.candidateName : "Add your resume"}
            detail={
              resume
                ? `${resume.experience.length} experiences · ${resume.projects.length} projects · ${resume.skills.technical.length} skills`
                : "So questions can mention your real projects."
            }
          />
          <StatusCard
            href="/jobs"
            icon={Briefcase}
            label="Role"
            done={!!job}
            title={job ? job.title : "Pick a role"}
            detail={job ? job.company : "From the Job Board or the Chrome extension."}
          />
          <StatusCard
            href="/interview"
            icon={UserRound}
            label="Interviewer"
            done={!!resume && !!job}
            title={`${persona.interviewerName} · ${persona.label}`}
            detail={`${duration.minutes} minutes · ~${duration.questions} questions`}
          />
        </div>
        {job && job.keyCompetencies.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-fg-subtle">You&apos;ll practice:</span>
            {job.keyCompetencies.map((c) => (
              <span key={c.name} className={chipMaroon}>
                {c.name}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Recent practice */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-fg">Recent practice</h2>
          {library.length > 0 && (
            <Link href="/library" className="text-sm font-semibold text-accent hover:underline">
              See all
            </Link>
          )}
        </div>
        {library.length === 0 ? (
          <RevSays mood="happy">
            No practice sessions yet. Try the <span className="font-semibold">2-minute demo</span> first. It&apos;s a great warm-up!
          </RevSays>
        ) : (
          <div className="grid gap-4 lg:grid-cols-4">
            <div className={`${surface} grid grid-cols-2 gap-4 p-6 lg:grid-cols-1`}>
              <div>
                <p className="flex items-center gap-1.5 text-xs text-fg-subtle">
                  <TrendingUp className="h-3.5 w-3.5" /> Average score
                </p>
                <p className="font-display text-3xl font-bold tabular-nums text-fg">{avg}</p>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-xs text-fg-subtle">
                  <Trophy className="h-3.5 w-3.5 text-gold-600" /> Best score
                </p>
                <p className="font-display text-3xl font-bold tabular-nums text-accent">{best}</p>
              </div>
            </div>
            {library.slice(0, 3).map((e) => (
              <Link key={e.id} href={`/library/${e.id}`} className={`${interactiveSurface} group flex flex-col p-6`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-fg">{e.job.title}</p>
                    <p className="truncate text-sm text-fg-subtle">{e.job.company}</p>
                  </div>
                  <span className="rounded-full bg-surface-muted px-2.5 py-0.5 font-display text-lg font-bold tabular-nums text-accent">
                    {e.feedback.overallScore}
                  </span>
                </div>
                <div className="mt-3">{e.feedback.report && <ReadinessBadge tier={e.feedback.report.readinessTier} />}</div>
                <p className="mt-auto flex items-center gap-1.5 pt-4 text-xs text-fg-subtle">
                  <Mic className="h-3.5 w-3.5" />
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
