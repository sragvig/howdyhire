import { NextResponse } from "next/server";
import { geminiErrorMessage } from "@/lib/server/gemini";
import type { StarScore } from "@/types";
import { generateSessionSummary, type SummaryInput } from "@/lib/server/summary-generator";
import { cleanTranscriptText } from "@/lib/transcript-clean";

const MAX_QUESTIONS = 20;
const MAX_TOTAL_CHARS = 60_000;

function badRequest(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? Math.min(10, Math.max(0, v)) : 0);

function parseBody(body: unknown): SummaryInput | string {
  if (!body || typeof body !== "object") return "Invalid body";
  const b = body as Record<string, unknown>;
  const job = (b.job ?? {}) as Record<string, unknown>;

  const title = str(job.title, 200);
  const company = str(job.company, 200);
  if (!title || !company) return "job.title and job.company are required";

  if (!Array.isArray(b.questions) || b.questions.length === 0) return "At least one question is required";
  if (b.questions.length > MAX_QUESTIONS) return `At most ${MAX_QUESTIONS} questions`;

  const questions = b.questions.map((raw) => {
    const q = (raw ?? {}) as Record<string, unknown>;
    const star = (q.star ?? {}) as Record<string, unknown>;
    return {
      // The client already strips voice tags; repeat here so the model never sees them.
      question: cleanTranscriptText(str(q.question, 2_000)),
      answer: cleanTranscriptText(str(q.answer, 10_000)),
      star: { situation: num(star.situation), task: num(star.task), action: num(star.action), result: num(star.result) } satisfies StarScore,
    };
  });
  if (questions.some((q) => !q.answer)) return "Every question needs an answer";
  if (questions.reduce((n, q) => n + q.question.length + q.answer.length, 0) > MAX_TOTAL_CHARS) {
    return "Transcript is too long";
  }

  return {
    job: {
      title,
      company,
      description: str(job.description, 5_000),
      competencies: Array.isArray(job.competencies)
        ? job.competencies.filter((c): c is string => typeof c === "string").slice(0, 10)
        : [],
    },
    persona: str(b.persona, 100) || undefined,
    questions,
  };
}

// Body: `{ job: { title, company, description, competencies }, persona?, questions: [{ question, answer, star }] }`.
// Returns `{ report, questionNotes }`.
export async function POST(req: Request) {
  const input = parseBody(await req.json().catch(() => null));
  if (typeof input === "string") return badRequest(input);

  try {
    return NextResponse.json(await generateSessionSummary(input));
  } catch (err) {
    console.error("generate-summary failed", err);
    return badRequest(geminiErrorMessage(err) ?? "Couldn't generate the interview report", 502);
  }
}
