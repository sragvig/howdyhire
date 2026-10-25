import type { Feedback, InterviewSession, ReadinessTier, SessionReport } from "@/types";
import { getPersona } from "./personas";
import { READINESS } from "./readiness";

const str = (v: unknown, fallback = "") => (typeof v === "string" ? v : fallback);
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === "object" ? (v as Record<string, unknown>) : {});

function insight(v: unknown) {
  const o = obj(v);
  return { strength: str(o.strength), weakness: str(o.weakness) };
}

// Model output is untrusted shape-wise: default every field so the report view can't crash
// on a missing or malformed property.
export function normalizeReport(raw: unknown, fallbackScore: number): SessionReport {
  const r = obj(raw);
  const score = typeof r.overallScore === "number" && Number.isFinite(r.overallScore) ? r.overallScore : fallbackScore;
  const tier = str(r.readinessTier) as ReadinessTier;
  const star = obj(r.starBreakdown);
  return {
    overallScore: Math.min(100, Math.max(0, Math.round(score))),
    readinessTier: tier in READINESS ? tier : "developing",
    headline: str(r.headline),
    starBreakdown: {
      situation: insight(star.situation),
      task: insight(star.task),
      action: insight(star.action),
      result: insight(star.result),
    },
    keyStrengths: arr(r.keyStrengths)
      .map((s) => ({ title: str(obj(s).title), evidence: str(obj(s).evidence) }))
      .filter((s) => s.title),
    improvements: arr(r.improvements)
      .map((i) => ({ title: str(obj(i).title), detail: str(obj(i).detail), competency: str(obj(i).competency) || undefined }))
      .filter((i) => i.title),
    aggieSpirit: str(r.aggieSpirit),
    generatedAt: str(r.generatedAt, new Date().toISOString()),
  };
}

// Asks /api/evaluate-interview for the AI report and merges it into the local feedback.
export async function requestReport(feedback: Feedback, session: InterviewSession): Promise<Feedback> {
  if (!session.job) throw new Error("No job posting on this session");

  const res = await fetch("/api/evaluate-interview", {
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
  const data = obj(await res.json().catch(() => null));
  if (!res.ok) throw new Error(str(data.error, "Couldn't generate the report"));
  if (!data.report) throw new Error("The analysis came back empty");

  const report = normalizeReport(data.report, feedback.overallScore);
  const notes = arr(data.questionNotes).map((n) => obj(n));

  return {
    ...feedback,
    overallScore: report.overallScore,
    summary: report.headline || feedback.summary,
    report,
    reportError: undefined,
    questions: feedback.questions.map((q, i) => {
      const note = notes.find((n) => n.index === i);
      return {
        ...q,
        coachingNote: str(note?.coachingNote) || q.coachingNote,
        sampleAnswer: str(note?.sampleAnswer).trim() || q.sampleAnswer,
      };
    }),
  };
}
