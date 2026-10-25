import type {
  InterviewerPersona,
  InterviewSessionConfig,
  JobPosting,
  ResumeData,
  StarElement,
} from "@/types";
import { getPersona } from "./personas";

// The 2-3 competencies the interview should focus on, highest weight first.
export function topCompetencies(job: JobPosting, focus: string[], count = 3) {
  return job.keyCompetencies
    .filter((c) => focus.length === 0 || focus.includes(c.name))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, count);
}

// Resume tools/skills that the job description also mentions: the strongest hooks for technical probing.
export function overlappingSkills(resume: ResumeData, job: JobPosting) {
  const description = job.description.toLowerCase();
  return resume.skills.technical.filter((skill) => {
    const s = skill.toLowerCase().trim();
    return s.length > 1 && new RegExp(`(^|[^a-z0-9])${s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`).test(description);
  });
}

// Concrete, nameable things from the resume the interviewer should ask about.
function resumeHooks(resume: ResumeData) {
  const lines: string[] = [];
  for (const exp of resume.experience) {
    lines.push(`- Role: ${exp.role} at ${exp.organization}${exp.current ? " (current)" : ""}`);
    for (const h of exp.highlights.slice(0, 3)) lines.push(`    • ${h}`);
  }
  for (const p of resume.projects) {
    const tech = p.technologies.length ? ` [${p.technologies.join(", ")}]` : "";
    lines.push(`- Project: ${p.name}${tech}: ${p.description}`);
  }
  return lines.length ? lines.join("\n") : "- (No experience or projects listed; ask about classes, clubs, or teams instead.)";
}

function candidateSection(resume: ResumeData) {
  const lines = [`Name: ${resume.candidateName}`];
  if (resume.summary) lines.push(`Summary: ${resume.summary}`);
  for (const ed of resume.education) {
    lines.push(`Education: ${ed.degree}${ed.major ? ` in ${ed.major}` : ""}, ${ed.institution}`);
  }
  if (resume.skills.technical.length) lines.push(`Technical skills: ${resume.skills.technical.join(", ")}`);
  return lines.join("\n");
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
  const top = topCompetencies(job, config.focusCompetencies);
  const overlap = overlappingSkills(resume, job);
  const firstProject = resume.projects[0]?.name;
  const firstRole = resume.experience[0] && `${resume.experience[0].role} at ${resume.experience[0].organization}`;
  const exampleHook = firstProject ?? firstRole ?? "the TAMU Robotics team";
  const exampleSkill = top[0]?.name ?? "teamwork";

  return `You are ${p.interviewerName}, conducting a spoken behavioral interview for the ${job.title} role at ${job.company}.

# Persona
${p.style}

# Time limit
This interview is strictly ${config.durationMinutes} minutes long. Plan for about ${config.questionCount} main questions and pace yourself to fit.
- Keep follow-ups short; with little time left, skip follow-ups and move on.
- You will receive bracketed time notes. When told time is almost up, ask no new main questions: let the candidate finish, then wrap up.
- When told time is up, thank the candidate in one or two sentences and tell them they can end the call to see their feedback.

# The role
${job.title} at ${job.company}
${job.description}

## Top skills to assess (ask about these first, highest priority first)
${top.map((c, i) => `${i + 1}. ${c.name}${c.description ? `: ${c.description}` : ""}`).join("\n") || "1. General behavioral competencies"}

# The candidate
${candidateSection(resume)}

## Resume hooks (name these specifically in your questions)
${resumeHooks(resume)}
${overlap.length ? `\n## Tools on the resume that this job also uses\n${overlap.join(", ")}. Probe how the candidate actually used these.\n` : ""}
# How to ask questions: high-precision targeting
- Every main question must combine (a) something specific from the candidate's resume (a named project, tool, organization, or role) with (b) one of the top skills above.
- Never ask generic boilerplate. Bad: "Tell me about a leadership experience." Good: "I saw on your resume you worked on ${exampleHook}. Tell me about a time ${exampleSkill.toLowerCase()} was tested on that project."
- Cover the top skills in priority order; spread questions across different resume items rather than repeating one.
- Only reference things that are actually on the resume. Never invent details about the candidate.
- This is a voice conversation: keep your turns short and never ask more than one question per turn.
- If an answer is missing a clear Situation, Task, Action, or Result, ask one follow-up to draw it out (time permitting).
- You may receive bracketed notes from a coaching system. Use them to steer follow-ups, pacing, or style, but never mention or read them aloud.
- Never give scores or feedback during the interview.`;
}

// Session variables for the agent (usable as {{variables}} in the agent's dashboard prompt or first message).
export function buildDynamicVariables({
  resume,
  job,
  config,
}: {
  resume: ResumeData;
  job: JobPosting;
  config: InterviewSessionConfig;
}) {
  return {
    candidate_name: resume.candidateName,
    job_title: job.title,
    company: job.company,
    interview_minutes: config.durationMinutes,
    question_count: config.questionCount,
    top_skills: topCompetencies(job, config.focusCompetencies)
      .map((c) => c.name)
      .join(", "),
  };
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
  return `[Coaching system: interviewer style change. Do not mention this to the candidate.] From your next turn on, keep your name and voice but adopt this style: ${p.style}`;
}

export function missingElementsNote(missing: StarElement[]) {
  const names = missing.map((m) => m[0].toUpperCase() + m.slice(1)).join(", ");
  return `[Coaching system note. Do not read aloud.] The candidate's current answer has not yet covered: ${names}. When they finish, ask one follow-up that draws this out before moving to the next question.`;
}

export function timeWarningNote(secondsLeft: number) {
  return `[Time note. Do not read aloud.] About ${secondsLeft} seconds remain. Do not start a new main question. Let the candidate finish their current answer, then wrap up.`;
}

export const TIME_UP_NOTE =
  "[Time note. Do not read aloud.] Time is up. As soon as the candidate finishes their sentence, thank them briefly and tell them they can end the call to see their feedback.";
