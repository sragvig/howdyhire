import "server-only";
import type { ResumeData } from "@/types";
import { generateJson } from "./gemini";

export type ResumeInput =
  | { kind: "text"; text: string; fileName?: string }
  | { kind: "pdf"; data: Buffer; fileName?: string };

const stringArray = { type: "array", items: { type: "string" } };

const RESUME_SCHEMA = {
  type: "object",
  properties: {
    candidateName: { type: "string" },
    email: { type: "string" },
    summary: { type: "string", description: "1-2 sentence professional summary" },
    education: {
      type: "array",
      items: {
        type: "object",
        properties: {
          institution: { type: "string" },
          degree: { type: "string" },
          major: { type: "string" },
          graduationDate: { type: "string" },
          gpa: { type: "number" },
        },
        required: ["institution", "degree"],
      },
    },
    experience: {
      type: "array",
      items: {
        type: "object",
        properties: {
          role: { type: "string" },
          organization: { type: "string" },
          location: { type: "string" },
          startDate: { type: "string", description: "YYYY-MM when known" },
          endDate: { type: "string", description: "YYYY-MM; omit if current" },
          current: { type: "boolean" },
          highlights: { ...stringArray, description: "Bullet points, verbatim where possible" },
        },
        required: ["role", "organization", "startDate", "current", "highlights"],
      },
    },
    projects: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          technologies: stringArray,
          url: { type: "string" },
        },
        required: ["name", "description", "technologies"],
      },
    },
    skills: {
      type: "object",
      properties: {
        technical: stringArray,
        soft: { ...stringArray, description: "Soft skills stated or clearly demonstrated" },
      },
      required: ["technical", "soft"],
    },
    targetRoles: {
      ...stringArray,
      description: "3-5 job titles this candidate is targeting or best suited for",
    },
  },
  required: ["candidateName", "education", "experience", "projects", "skills", "targetRoles"],
};

const SYSTEM_INSTRUCTION = `You extract structured data from student and early-career resumes.
Only use information present in the resume; never invent employers, dates, or metrics.
Leave optional fields out rather than guessing. Clubs, research, and leadership roles count as experience.
For targetRoles, infer from the candidate's stated objective, major, and experience.`;

type RawResume = Omit<ResumeData, "parsedAt" | "sourceFileName" | "experience" | "projects"> & {
  experience: Omit<ResumeData["experience"][number], "id">[];
  projects: Omit<ResumeData["projects"][number], "id">[];
};

export async function parseResume(input: ResumeInput): Promise<ResumeData> {
  const resumePart =
    input.kind === "pdf"
      ? { inlineData: { mimeType: "application/pdf", data: input.data.toString("base64") } }
      : { text: input.text };

  const raw = await generateJson<RawResume>({
    contents: [
      { role: "user", parts: [{ text: "Extract the structured data from this resume." }, resumePart] },
    ],
    schema: RESUME_SCHEMA,
    systemInstruction: SYSTEM_INSTRUCTION,
  });

  return {
    ...raw,
    education: raw.education ?? [],
    experience: (raw.experience ?? []).map((e) => ({
      ...e,
      highlights: e.highlights ?? [],
      id: crypto.randomUUID(),
    })),
    projects: (raw.projects ?? []).map((p) => ({
      ...p,
      technologies: p.technologies ?? [],
      id: crypto.randomUUID(),
    })),
    skills: { technical: raw.skills?.technical ?? [], soft: raw.skills?.soft ?? [] },
    targetRoles: raw.targetRoles ?? [],
    parsedAt: new Date().toISOString(),
    sourceFileName: input.fileName,
  };
}
