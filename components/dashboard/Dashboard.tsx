"use client";

import Link from "next/link";
import { Briefcase, CheckCircle2, Circle, FileText, Play, RotateCcw, UserRound } from "lucide-react";
import { useSession } from "@/components/providers/SessionProvider";
import { PersonaSelector } from "@/components/session/PersonaSelector";
import { getPersona } from "@/lib/personas";
import { Card } from "./Card";

function ChecklistItem({ done, label }: { done: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      {done ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
      ) : (
        <Circle className="h-4 w-4 text-stone-300" />
      )}
      <span className={done ? "text-stone-900" : "text-stone-500"}>{label}</span>
    </li>
  );
}

export function Dashboard() {
  const { session, isReadyToStart, reset } = useSession();
  const { resume, job } = session;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="rounded-xl bg-gradient-to-br from-maroon-800 to-maroon-950 p-6 text-white shadow-sm sm:p-8">
        <p className="text-sm font-medium text-maroon-200">Howdy!</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          Ready for your next behavioral interview?
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-maroon-100">
          Upload your resume, pick a listing from the Aggie Job Board, and practice with an AI
          interviewer. You&apos;ll get STAR-method feedback on every answer.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Resume" icon={<FileText className="h-5 w-5" />}>
          {resume ? (
            <div className="space-y-2 text-sm">
              <p className="font-medium">{resume.candidateName}</p>
              <p className="text-stone-500">
                {resume.experience.length} experiences · {resume.projects.length} projects ·{" "}
                {resume.skills.technical.length} skills
              </p>
            </div>
          ) : (
            <p className="text-sm text-stone-500">No resume uploaded yet.</p>
          )}
        </Card>

        <Card title="Target Role" icon={<Briefcase className="h-5 w-5" />}>
          {job ? (
            <div className="space-y-2 text-sm">
              <p className="font-medium">{job.title}</p>
              <p className="text-stone-500">{job.company}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {job.keyCompetencies.map((c) => (
                  <span key={c.name} className="rounded-full bg-maroon-50 px-2 py-0.5 text-xs text-maroon-800">
                    {c.name}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-stone-500">No job posting selected.</p>
          )}
        </Card>

        <Card title="Session" icon={<Play className="h-5 w-5" />}>
          <ul className="space-y-2">
            <ChecklistItem done={!!resume} label="Resume parsed" />
            <ChecklistItem done={!!job} label="Job posting selected" />
            <ChecklistItem done label={`Persona: ${getPersona(session.config.persona).label}`} />
          </ul>
          {session.error && <p className="mt-3 text-sm text-red-700">{session.error}</p>}
          <div className="mt-4">
            {session.status === "complete" ? (
              <button
                type="button"
                onClick={reset}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-aggie px-4 py-2 text-sm font-semibold text-aggie hover:bg-maroon-50"
              >
                <RotateCcw className="h-4 w-4" /> New session
              </button>
            ) : isReadyToStart || session.status !== "idle" ? (
              <Link
                href="/interview"
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-aggie px-4 py-2 text-sm font-semibold text-white hover:bg-maroon-700"
              >
                <Play className="h-4 w-4" /> {session.status === "idle" ? "Go to interview room" : "Return to interview"}
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-md bg-stone-300 px-4 py-2 text-sm font-semibold text-white"
              >
                <Play className="h-4 w-4" /> Start interview
              </button>
            )}
          </div>
        </Card>
      </div>

      <Card title="Interviewer Persona" icon={<UserRound className="h-5 w-5" />}>
        <PersonaSelector />
      </Card>
    </div>
  );
}
