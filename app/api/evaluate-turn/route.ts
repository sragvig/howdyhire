import { NextResponse } from "next/server";
import { geminiErrorMessage } from "@/lib/server/gemini";
import { evaluateStarTurn } from "@/lib/server/star-evaluator";

const MAX_QUESTION_CHARS = 2_000;
const MAX_ANSWER_CHARS = 10_000;

function badRequest(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

// Body: `{ question, answer, targetRole?, competencies? }` where `answer` is everything
// the candidate has said in response to `question` so far. Returns `{ evaluation }`.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const question = str(body?.question);
  const answer = str(body?.answer);
  const targetRole = str(body?.targetRole) || undefined;
  const competencies = Array.isArray(body?.competencies)
    ? body.competencies.filter((c: unknown): c is string => typeof c === "string").slice(0, 10)
    : undefined;

  if (!answer) return badRequest("answer is required");
  if (question.length > MAX_QUESTION_CHARS || answer.length > MAX_ANSWER_CHARS) {
    return badRequest("Transcript chunk is too long");
  }

  try {
    const evaluation = await evaluateStarTurn({ question, answer, targetRole, competencies });
    return NextResponse.json({ evaluation });
  } catch (err) {
    console.error("evaluate-turn failed", err);
    return badRequest(geminiErrorMessage(err) ?? "Couldn't evaluate that answer", 502);
  }
}
