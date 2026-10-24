import "server-only";
import type { StarEvaluation } from "@/types";
import { generateJson } from "./gemini";

const element = (what: string) => ({
  type: "object",
  properties: {
    present: { type: "boolean", description: `true only if the candidate clearly described ${what}` },
    score: { type: "integer", minimum: 0, maximum: 10 },
    evidence: { type: "string", description: "Short quote or paraphrase (max 15 words); omit if not present" },
  },
  required: ["present", "score"],
});

const STAR_SCHEMA = {
  type: "object",
  properties: {
    isBehavioralAnswer: {
      type: "boolean",
      description: "false for greetings, small talk, clarifying questions, or answers to non-behavioral questions",
    },
    situation: element("the context or background"),
    task: element("their specific responsibility or goal"),
    action: element("concrete steps they personally took"),
    result: element("the outcome or impact"),
    strengths: { type: "array", items: { type: "string" }, maxItems: 2 },
    coachingTip: {
      type: "string",
      description: "One actionable sentence, second person, targeting the weakest part of the answer",
    },
  },
  required: ["isBehavioralAnswer", "situation", "task", "action", "result", "strengths", "coachingTip"],
};

const SYSTEM_INSTRUCTION = `You are a behavioral interview coach scoring answers with the STAR method in real time.
The answer is a speech-to-text transcript: ignore filler words and minor transcription errors.
The candidate may still be mid-answer; evaluate only what they've said so far.
Scoring guide per element: 0 = absent, 1-4 = vague or generic, 5-7 = clear, 8-10 = specific and compelling (Results with numbers or concrete impact score highest).
Action should focus on what the candidate personally did; heavy "we" language without "I" lowers the Action score.
Keep strengths and the coaching tip short enough to read at a glance.`;

export interface EvaluateTurnInput {
  question: string;
  answer: string;
  targetRole?: string;
  competencies?: string[];
}

export async function evaluateStarTurn(input: EvaluateTurnInput): Promise<StarEvaluation> {
  const context = [
    input.targetRole && `Target role: ${input.targetRole}`,
    input.competencies?.length && `Competencies being assessed: ${input.competencies.join(", ")}`,
    `Interviewer question: ${input.question || "(not captured)"}`,
    `Candidate answer so far:\n${input.answer}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const raw = await generateJson<StarEvaluation>({
    contents: context,
    schema: STAR_SCHEMA,
    systemInstruction: SYSTEM_INSTRUCTION,
  });

  const clamp = (n: number) => Math.min(10, Math.max(0, Math.round(n ?? 0)));
  const fix = (e: StarEvaluation["situation"]) => ({ ...e, score: e.present ? clamp(e.score) : 0 });

  return {
    ...raw,
    situation: fix(raw.situation),
    task: fix(raw.task),
    action: fix(raw.action),
    result: fix(raw.result),
    strengths: raw.strengths ?? [],
  };
}
