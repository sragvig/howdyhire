import "server-only";
import type { SessionReport, StarScore } from "@/types";
import { generateJson } from "./gemini";
import { tierForScore } from "@/lib/readiness";

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
  sampleAnswer?: string;
}

const insight = (criterion: string) => ({
  type: "object",
  description: `Judge on: ${criterion}`,
  properties: {
    strength: { type: "string", description: `One sentence on what the candidate did well (${criterion})` },
    weakness: { type: "string", description: `One sentence on the most important gap (${criterion})` },
  },
  required: ["strength", "weakness"],
});

const SUMMARY_SCHEMA = {
  type: "object",
  properties: {
    overallScore: { type: "integer", minimum: 0, maximum: 100 },
    headline: {
      type: "string",
      description: "Executive summary: 2-3 sentences on overall performance, addressed to the candidate",
    },
    starBreakdown: {
      type: "object",
      properties: {
        situation: insight("clarity and context setting"),
        task: insight("how clearly the problem and their personal responsibility were defined"),
        action: insight("specific personal contributions; 'I' statements versus vague 'we' language"),
        result: insight("quantifiable outcomes and lessons learned"),
      },
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
    aggieSpirit: {
      type: "string",
      description:
        "2-3 upbeat sentences connecting the candidate's answers to Aggie Core Values (Respect, Excellence, Leadership, Loyalty, Integrity, Selfless Service), citing a specific moment. End with \"Gig 'em!\"",
    },
    questionNotes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          index: { type: "integer" },
          coachingNote: { type: "string", description: "2-3 sentences: what worked and how to make this answer stronger" },
          sampleAnswer: {
            type: "string",
            description:
              "Only if the answer needed improvement (any STAR score below 7): a 4-6 sentence rewrite of the candidate's SAME story " +
              "with strong STAR structure and 'I' statements. Use only facts they gave. Never add roles, actions, meetings, " +
              "events, or metrics they didn't mention: put a bracketed placeholder instead, e.g. [the first step you took], " +
              "[your role], [number]. A thin answer should produce a template with more placeholders, not invented detail. " +
              "Omit for strong answers.",
          },
        },
        required: ["index", "coachingNote"],
      },
    },
  },
  required: ["overallScore", "headline", "starBreakdown", "keyStrengths", "improvements", "aggieSpirit", "questionNotes"],
};

const SYSTEM_INSTRUCTION = `You are a career coach writing a post-interview report for a Texas A&M student who just finished a mock behavioral interview.
The transcript came from speech-to-text, so ignore filler words and transcription errors.
Per-answer STAR scores (0-10) from a live evaluator are included. Ground overallScore in them, adjusted for how well the answers demonstrate the role's competencies.
Calibrate: 85+ means ready for a real interview, 70-84 almost ready, 50-69 developing, below 50 needs significant practice.
Every strength and improvement must reference what the candidate actually said. Never invent experiences.
Tailor improvements to the target job's competencies. Write directly to the candidate ("you"). Be honest but encouraging.
Return one questionNotes entry per question, using the question's index.
Sample answers must never invent experiences, employers, or numbers: they rephrase the candidate's own story.`;


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
      aggieSpirit: raw.aggieSpirit ?? "",
      generatedAt: new Date().toISOString(),
    },
    questionNotes: (questionNotes ?? []).filter((n) => Number.isInteger(n.index)),
  };
}
