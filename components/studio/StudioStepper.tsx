"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, FileSearch, Mic, UserRound } from "lucide-react";
import { useSession } from "@/components/providers/SessionProvider";
import { getPersona } from "@/lib/personas";
import { getDuration } from "@/lib/durations";

type StepState = "complete" | "current" | "upcoming";

const STUDIO_ROUTES = ["/", "/resume", "/jobs", "/interview"];

// The 3-step studio flow: Import Context → Choose Interviewer → Live Session.
export function StudioStepper() {
  const pathname = usePathname();
  const { session } = useSession();
  if (!STUDIO_ROUTES.includes(pathname)) return null;

  const hasContext = !!session.resume && !!session.job;
  const live = session.status === "active" || session.status === "scoring";
  const done = session.status === "complete";
  const onInterview = pathname === "/interview";

  const states: StepState[] = done
    ? ["complete", "complete", "complete"]
    : live
      ? ["complete", "complete", "current"]
      : hasContext && onInterview
        ? ["complete", "current", "upcoming"]
        : hasContext
          ? ["complete", "upcoming", "upcoming"]
          : ["current", "upcoming", "upcoming"];

  const steps = [
    {
      label: "Import Context",
      icon: FileSearch,
      detail: `${session.resume ? "Resume ✓" : "Resume"} · ${session.job ? "Job ✓" : "Job"}`,
      href: !session.resume ? "/resume" : "/jobs",
    },
    {
      label: "Choose Interviewer",
      icon: UserRound,
      detail: `${getPersona(session.config.persona).interviewerName} · ${getDuration(session.config.durationMinutes).label}`,
      href: "/interview",
      disabled: !hasContext,
    },
    {
      label: "Live Session",
      icon: Mic,
      detail: done ? "Results ready" : session.status === "scoring" ? "Analyzing…" : live ? "Live now" : "Voice interview",
      href: "/interview",
      disabled: !hasContext,
    },
  ];

  const progress = states.filter((s) => s === "complete").length;

  return (
    <nav aria-label="Interview studio progress" className="mx-auto mb-8 max-w-6xl print:hidden">
      <ol className="relative grid grid-cols-3 gap-2 rounded-2xl border border-line bg-surface p-2 shadow-xl shadow-black/20 backdrop-blur-md">
        {/* progress rail */}
        <span aria-hidden className="pointer-events-none absolute inset-x-2 bottom-0 h-px overflow-hidden rounded-full">
          <span
            className="block h-px bg-gradient-to-r from-maroon-500 via-gold-400 to-gold-300 transition-all duration-700"
            style={{ width: `${(progress / 3) * 100}%` }}
          />
        </span>
        {steps.map((step, i) => {
          const state = states[i];
          const Icon = step.icon;
          const content = (
            <>
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-all duration-300 ${
                  state === "complete"
                    ? "bg-gold-400/15 text-gold ring-1 ring-inset ring-gold-400/40"
                    : state === "current"
                      ? "bg-gradient-to-br from-maroon-500 to-aggie text-white shadow-lg shadow-maroon-700/50 ring-1 ring-inset ring-white/20"
                      : "bg-white/5 text-fg-subtle ring-1 ring-inset ring-white/10"
                }`}
              >
                {state === "complete" ? <Check className="h-4 w-4" strokeWidth={3} /> : <Icon className="h-4 w-4" />}
              </span>
              <span className="hidden min-w-0 sm:block">
                <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-fg-subtle">Step {i + 1}</span>
                <span className={`block truncate text-sm font-semibold ${state === "upcoming" ? "text-fg-muted" : "text-fg"}`}>
                  {step.label}
                </span>
                <span className="block truncate text-xs text-fg-subtle">{step.detail}</span>
              </span>
              <span className="text-xs font-semibold text-fg sm:hidden">{step.label.split(" ")[0]}</span>
            </>
          );
          const className = `flex items-center gap-3 rounded-xl px-2 py-2 transition-all duration-300 sm:px-3 ${
            state === "current" ? "bg-maroon-500/10 ring-1 ring-inset ring-maroon-400/20" : "hover:bg-white/5"
          }`;
          return (
            <li key={step.label} aria-current={state === "current" ? "step" : undefined}>
              {step.disabled ? (
                <span className={`${className} cursor-not-allowed opacity-60 hover:bg-transparent`}>{content}</span>
              ) : (
                <Link href={step.href} className={className}>
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
