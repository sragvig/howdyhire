import type { Feedback, InterviewSession, SessionReport } from "@/types";
import { getPersona } from "./personas";

// Asks /api/generate-summary for the AI report and merges it into the local feedback.
export async function requestReport(feedback: Feedback, session: InterviewSession): Promise<Feedback> {
  if (!session.job) throw new Error("No job posting on this session");

  const res = await fetch("/api/generate-summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      job: {
        title: session.job.title,
        company: session.job.company,
        description: session.job.description,
        competencies: session.job.keyCompetencies.map((c) => c.name),
      },
      persona: getPersona(session.config.persona).label,
      questions: feedback.questions.map((q) => ({ question: q.question, answer: q.transcript, star: q.star })),
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Couldn't generate the report");

  const report: SessionReport = data.report;
  const notes: { index: number; coachingNote: string }[] = data.questionNotes;

  return {
    ...feedback,
    overallScore: report.overallScore,
    summary: report.headline,
    report,
    reportError: undefined,
    questions: feedback.questions.map((q, i) => ({
      ...q,
      coachingNote: notes.find((n) => n.index === i)?.coachingNote ?? q.coachingNote,
    })),
  };
}
