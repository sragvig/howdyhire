"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Library, Loader2, RotateCcw } from "lucide-react";
import { useSession } from "@/components/providers/SessionProvider";
import { Card } from "@/components/dashboard/Card";
import { getDuration } from "@/lib/durations";
import { InterviewReport } from "@/components/report/InterviewReport";
import { usePracticeLibrary, useHydrated } from "./usePracticeLibrary";

// Re-opens the full analysis for one saved interview.
export function PastInterviewView({ id }: { id: string }) {
  const entries = usePracticeLibrary();
  const hydrated = useHydrated();
  const router = useRouter();
  const { session, setJob, setPersona, updateConfig } = useSession();
  const entry = entries.find((e) => e.id === id);

  if (!hydrated) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-accent" aria-label="Loading" />
      </div>
    );
  }

  if (!entry) {
    return (
      <Card title="Session not found" icon={<Library />} className="mx-auto max-w-2xl">
        <p className="text-sm text-fg-muted">
          This interview isn&apos;t in your Practice Library. It may have been deleted, or saved in a different browser.
        </p>
        <Link href="/library" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Practice Library
        </Link>
      </Card>
    );
  }

  function practiceAgain() {
    if (!entry) return;
    // Setup can only change between interviews; mid-call, just go back to the room.
    if (session.status === "idle") {
      setJob(entry.job);
      setPersona(entry.persona);
      updateConfig({ durationMinutes: entry.durationMinutes, questionCount: getDuration(entry.durationMinutes).questions });
    }
    router.push("/interview");
  }

  return (
    <div className="space-y-4">
      <Link href="/library" className="mx-auto flex max-w-6xl items-center gap-1.5 text-sm font-medium text-fg-muted transition-colors hover:text-accent print:hidden">
        <ArrowLeft className="h-4 w-4" /> Practice Library
      </Link>
      <InterviewReport
        feedback={entry.feedback}
        context={{
          jobTitle: entry.job.title,
          company: entry.job.company,
          candidateName: entry.candidateName,
          persona: entry.persona,
          startedAt: entry.startedAt ?? entry.completedAt,
          durationMinutes: entry.durationMinutes,
        }}
        actions={[
          { label: "Practice this role again", icon: RotateCcw, onClick: practiceAgain, primary: true },
          { label: "All sessions", icon: Library, onClick: () => router.push("/library") },
        ]}
      />
    </div>
  );
}
