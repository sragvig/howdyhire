"use client";

import { useRouter } from "next/navigation";
import { Library, RotateCcw, Sparkles } from "lucide-react";
import { useSession } from "@/components/providers/SessionProvider";
import { requestReport } from "@/lib/report-client";
import { InterviewReport } from "./InterviewReport";

// The report for the interview that just finished (live session state).
export function SessionReport() {
  const { session, reset, updateFeedback } = useSession();
  const router = useRouter();
  const { feedback } = session;
  if (!feedback) return null;

  return (
    <InterviewReport
      feedback={feedback}
      context={{
        jobTitle: session.job?.title,
        company: session.job?.company,
        candidateName: session.resume?.candidateName,
        persona: session.config.persona,
        startedAt: session.startedAt,
        durationMinutes: session.config.durationMinutes,
      }}
      actions={[
        { label: "Try again", icon: RotateCcw, onClick: reset, primary: true },
        {
          label: "New interview",
          icon: Sparkles,
          onClick: () => {
            reset();
            router.push("/jobs");
          },
        },
        { label: "Practice Library", icon: Library, onClick: () => router.push("/library") },
      ]}
      onRetryReport={async () => updateFeedback(await requestReport(feedback, session))}
    />
  );
}
