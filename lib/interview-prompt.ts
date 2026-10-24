import type {
  InterviewerPersona,
  InterviewSessionConfig,
  JobPosting,
  ResumeData,
  StarElement,
} from "@/types";
import { getPersona } from "./personas";

function resumeSection(resume: ResumeData) {
  const lines: string[] = [`Name: ${resume.candidateName}`];
  if (resume.summary) lines.push(`Summary: ${resume.summary}`);
  for (const ed of resume.education) {
    lines.push(`Education: ${ed.degree}${ed.major ? ` in ${ed.major}` : ""}, ${ed.institution}`);
  }
  for (const exp of resume.experience) {
    lines.push(`- ${exp.role} at ${exp.organization}`);
    for (const h of exp.highlights.slice(0, 3)) lines.push(`    • ${h}`);
  }
  for (const p of resume.projects) lines.push(`- Project: ${p.name}: ${p.description}`);
  if (resume.skills.technical.length) lines.push(`Skills: ${resume.skills.technical.join(", ")}`);
  return lines.join("\n");
}

function jobSection(job: JobPosting, focus: string[]) {
  const competencies = job.keyCompetencies
    .filter((c) => focus.length === 0 || focus.includes(c.name))
    .sort((a, b) => b.weight - a.weight)
    .map((c) => `- ${c.name} (importance ${c.weight}/5)${c.description ? `: ${c.description}` : ""}`);
  return [`Role: ${job.title} at ${job.company}`, `Description: ${job.description}`, "Competencies to probe:", ...competencies].join("\n");
}

export function buildAgentPrompt({
  persona,
  resume,
  job,
  config,
}: {
  persona: InterviewerPersona;
  resume: ResumeData;
  job: JobPosting;
  config: InterviewSessionConfig;
}) {
  const p = getPersona(persona);
  return `You are ${p.interviewerName}, conducting a spoken behavioral interview for the ${job.title} role at ${job.company}.

# Persona
${p.style}

# Candidate resume
${resumeSection(resume)}

# The role
${jobSection(job, config.focusCompetencies)}

# How to run the interview
- Ask ${config.questionCount} behavioral questions in total, one at a time. Each should target one competency above, prioritizing higher importance.
- Where natural, tie questions to real experiences on the candidate's resume.
- This is a voice conversation: keep your turns short and never ask more than one question per turn.
- If an answer is missing a clear Situation, Task, Action, or Result, ask one follow-up to draw it out before moving on.
- You may receive bracketed notes from a coaching system. Use them to steer follow-ups or adjust your style, but never mention or read them aloud.
- Never give scores or feedback during the interview.
- After the final question, thank the candidate and tell them they can end the call to see their feedback.`;
}

export function buildFirstMessage(persona: InterviewerPersona, resume: ResumeData, job: JobPosting) {
  const p = getPersona(persona);
  const first = resume.candidateName.split(" ")[0] || "there";
  switch (persona) {
    case "friendly":
      return `Howdy ${first}! I'm ${p.interviewerName}. Thanks for hopping on to chat about the ${job.title} role at ${job.company}. Whenever you're ready, we can dive in.`;
    case "strict":
      return `Hello ${first}, I'm ${p.interviewerName}, and I'll be conducting your behavioral interview for the ${job.title} position at ${job.company}. Shall we begin?`;
    case "grilling":
      return `${first}. I'm ${p.interviewerName}. We have limited time, so let's get straight into it. Ready?`;
  }
}

export function personaSwitchNote(persona: InterviewerPersona) {
  const p = getPersona(persona);
  return `[Coaching system: interviewer style change. Do not mention this to the candidate.] From your next turn on, keep your name but adopt this style: ${p.style}`;
}

export function missingElementsNote(missing: StarElement[]) {
  const names = missing.map((m) => m[0].toUpperCase() + m.slice(1)).join(", ");
  return `[Coaching system note. Do not read aloud.] The candidate's current answer has not yet covered: ${names}. When they finish, ask one follow-up that draws this out before moving to the next question.`;
}
