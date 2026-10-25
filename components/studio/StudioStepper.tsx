"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check } from "lucide-react";
import { useSession } from "@/components/providers/SessionProvider";
import { getPersona } from "@/lib/personas";
import { getDuration } from "@/lib/durations";

type StepState = "complete" | "current" | "upcoming";

const STUDIO_ROUTES = ["/", "/resume", "/jobs", "/interview"];

// The 3-step flow: Import Context → Choose Interviewer → Live Session.
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
      label: "Add your context",
      detail: `${session.resume ? "Resume ✓" : "Resume"} · ${session.job ? "Job ✓" : "Job"}`,
      href: !session.resume ? "/resume" : "/jobs",
    },
    {
      label: "Choose interviewer",
      detail: `${getPersona(session.config.persona).interviewerName} · ${getDuration(session.config.durationMinutes).label}`,
      href: "/interview",
      disabled: !hasContext,
    },
    {
      label: "Practice live",
      detail: done ? "Recap ready" : session.status === "scoring" ? "Miss Rev is thinking…" : live ? "In progress" : "Voice session",
      href: "/interview",
      disabled: !hasContext,
    },
  ];

  return (
    <nav aria-label="Practice progress" className="mx-auto mb-8 max-w-6xl print:hidden">
      <ol className="flex items-center gap-2 sm:gap-3">
        {steps.map((step, i) => {
          const state = states[i];
          const content = (
            <>
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all duration-200 ${
                  state === "complete"
                    ? "bg-gold-400 text-maroon-900"
                    : state === "current"
                      ? "bg-aggie text-cream-50 ring-4 ring-maroon-100"
                      : "bg-stone-200 text-stone-500"
                }`}
              >
                {state === "complete" ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
              </span>
              <span className="hidden min-w-0 sm:block">
                <span className={`block truncate text-sm font-semibold ${state === "upcoming" ? "text-fg-subtle" : "text-fg"}`}>
                  {step.label}
                </span>
                <span className="block truncate text-xs text-fg-subtle">{step.detail}</span>
              </span>
            </>
          );
          const cls = `flex min-w-0 items-center gap-3 rounded-full py-1.5 pl-1.5 pr-4 transition-all duration-200 ${
            state === "current" ? "border border-maroon-200 bg-surface shadow-sm" : "hover:bg-surface"
          }`;
          return (
            <li key={step.label} className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3" aria-current={state === "current" ? "step" : undefined}>
              {step.disabled ? (
                <span className={`${cls} cursor-not-allowed opacity-70`}>{content}</span>
              ) : (
                <Link href={step.href} className={cls}>
                  {content}
                </Link>
              )}
              {i < steps.length - 1 && (
                <span aria-hidden className={`h-0.5 min-w-4 flex-1 rounded-full ${states[i] === "complete" ? "bg-gold-400" : "bg-stone-200"}`} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
