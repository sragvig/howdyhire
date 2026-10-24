import "server-only";
import type { JobPosting } from "@/types";
import { generateJson } from "./gemini";

const JOB_SCHEMA = {
  type: "object",
  properties: {
    isJobPosting: {
      type: "boolean",
      description: "false if the text is not a job posting (login wall, error page, etc.)",
    },
    title: { type: "string" },
    company: { type: "string" },
    location: { type: "string" },
    employmentType: { type: "string", enum: ["internship", "co-op", "full-time", "part-time"] },
    category: { type: "string", enum: ["engineering", "business", "other"] },
    description: { type: "string", description: "Concise summary of the role, 2-4 sentences" },
    keyCompetencies: {
      type: "array",
      description: "4-6 behavioral competencies an interviewer would probe",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          weight: { type: "integer", minimum: 1, maximum: 5 },
        },
        required: ["name", "weight"],
      },
    },
  },
  required: ["isJobPosting", "title", "company", "description", "keyCompetencies"],
};

const SYSTEM_INSTRUCTION = `You turn job postings into structured data for a behavioral interview simulator.
keyCompetencies are behavioral traits (e.g. Teamwork, Ownership, Communicating Technical Ideas), not tools or languages.
Weight competencies by how strongly the posting emphasizes them.
Use "Unknown" for title or company only if the posting truly omits them.`;

type RawJob = Omit<JobPosting, "id" | "source" | "postingUrl"> & { isJobPosting: boolean };

export class NotAJobPostingError extends Error {}

// Hard cap so a huge scraped page doesn't blow up the prompt.
const MAX_INPUT_CHARS = 30_000;

export async function parseJobPosting(text: string, postingUrl?: string): Promise<JobPosting> {
  const { isJobPosting, ...raw } = await generateJson<RawJob>({
    contents: `Extract the job posting below.\n\n${text.slice(0, MAX_INPUT_CHARS)}`,
    schema: JOB_SCHEMA,
    systemInstruction: SYSTEM_INSTRUCTION,
  });

  if (!isJobPosting) throw new NotAJobPostingError("That doesn't look like a job posting");

  return {
    ...raw,
    keyCompetencies: (raw.keyCompetencies ?? []).map((c) => ({
      ...c,
      weight: Math.min(5, Math.max(1, Math.round(c.weight))),
    })),
    id: crypto.randomUUID(),
    source: "custom",
    postingUrl,
  };
}
