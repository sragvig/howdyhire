import "server-only";
import type { ReadinessTier, SessionReport, StarScore } from "@/types";
import { generateJson } from "./gemini";

export interface SummaryInput {
  job: {
    title: string;
    company: string;
    description: string;
    competencies: string[];
  };
  persona?: string;
  questions: { question: string; answer: string; star: StarScore }[];
}

export interface QuestionNote {
  index: number;
  coachingNote: string;
}

const insight = {
  type: "object",
  properties: {
    strength: { type: "string", description: "One sentence on what the candidate did well for this element" },
    weakness: { type: "string", description: "One sentence on the most important gap for this element" },
  },
  required: ["strength", "weakness"],
};

const SUMMARY_SCHEMA = {
  type: "object",
  properties: {
    overallScore: { type: "integer", minimum: 0, maximum: 100 },
    headline: { type: "string", description: "Two-sentence overall assessment addressed to the candidate" },
    starBreakdown: {
      type: "object",
      properties: { situation: insight, task: insight, action: insight, result: insight },
      required: ["situation", "task", "action", "result"],
    },
    keyStrengths: {
      type: "array",
      minItems: 1,
      maxItems: 4,
      items: {
        type: "object",
        properties: {
          title: { type: "string", description: "2-4 words, e.g. 'Clear communication'" },
          evidence: { type: "string", description: "One sentence citing a specific moment from the interview" },
        },
        required: ["title", "evidence"],
      },
    },
    improvements: {
      type: "array",
      minItems: 1,
      maxItems: 5,
      items: {
        type: "object",
        properties: {
          title: { type: "string", description: "Short imperative, e.g. 'Quantify your results'" },
          detail: { type: "string", description: "1-2 sentences of concrete advice tied to the target role" },
          competency: { type: "string", description: "The job competency this addresses, copied exactly from the list" },
        },
        required: ["title", "detail"],
      },
    },
    questionNotes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          index: { type: "integer" },
          coachingNote: { type: "string", description: "2-3 sentences: what worked and how to make this answer stronger" },
        },
        required: ["index", "coachingNote"],
      },
    },
  },
  required: ["overallScore", "headline", "starBreakdown", "keyStrengths", "improvements", "questionNotes"],
};

const SYSTEM_INSTRUCTION = `You are a career coach writing a post-interview report for a Texas A&M student who just finished a mock behavioral interview.
The transcript came from speech-to-text, so ignore filler words and transcription errors.
Per-answer STAR scores (0-10) from a live evaluator are included. Ground overallScore in them, adjusted for how well the answers demonstrate the role's competencies.
Calibrate: 85+ means ready for a real interview, 70-84 almost ready, 50-69 developing, below 50 needs significant practice.
Every strength and improvement must reference what the candidate actually said. Never invent experiences.
Tailor improvements to the target job's competencies. Write directly to the candidate ("you"). Be honest but encouraging.
Return one questionNotes entry per question, using the question's index.`;

export function tierForScore(score: number): ReadinessTier {
  if (score >= 85) return "interview-ready";
  if (score >= 70) return "almost-ready";
  if (score >= 50) return "developing";
  return "needs-practice";
}

type RawSummary = Omit<SessionReport, "readinessTier" | "generatedAt"> & { questionNotes: QuestionNote[] };

export async function generateSessionSummary(
  input: SummaryInput,
): Promise<{ report: SessionReport; questionNotes: QuestionNote[] }> {
  const transcript = input.questions
    .map(
      (q, i) =>
        `## Question ${i} (index ${i})\nInterviewer: ${q.question || "(not captured)"}\nCandidate: ${q.answer}\n` +
        `Live STAR scores: S ${q.star.situation}, T ${q.star.task}, A ${q.star.action}, R ${q.star.result}`,
    )
    .join("\n\n");

  const contents = [
    `# Target role\n${input.job.title} at ${input.job.company}\n${input.job.description}`,
    `Competencies: ${input.job.competencies.join(", ") || "(none listed)"}`,
    input.persona && `Interviewer style: ${input.persona}`,
    `# Interview transcript\n${transcript}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const { questionNotes, ...raw } = await generateJson<RawSummary>({
    contents,
    schema: SUMMARY_SCHEMA,
    systemInstruction: SYSTEM_INSTRUCTION,
  });

  const overallScore = Math.min(100, Math.max(0, Math.round(raw.overallScore)));
  return {
    report: {
      ...raw,
      overallScore,
      // Derived here rather than by the model so the tier always matches the score.
      readinessTier: tierForScore(overallScore),
      keyStrengths: raw.keyStrengths ?? [],
      improvements: raw.improvements ?? [],
      generatedAt: new Date().toISOString(),
    },
    questionNotes: (questionNotes ?? []).filter((n) => Number.isInteger(n.index)),
  };
}
