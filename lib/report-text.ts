import type { Feedback, InterviewSession } from "@/types";
import { getPersona } from "./personas";
import { STAR_ELEMENTS } from "./star";
import { READINESS } from "./readiness";

const rule = (title: string) => `\n${title.toUpperCase()}\n${"-".repeat(title.length)}\n`;

// Plain-text version of the report for download.
export function reportToText(feedback: Feedback, session: InterviewSession) {
  const { report } = feedback;
  const lines: string[] = [];

  lines.push("HOWDYHIRE INTERVIEW REPORT");
  lines.push("==========================");
  if (session.job) lines.push(`Role: ${session.job.title} at ${session.job.company}`);
  if (session.resume) lines.push(`Candidate: ${session.resume.candidateName}`);
  lines.push(`Interviewer: ${getPersona(session.config.persona).label}`);
  if (session.startedAt) lines.push(`Date: ${new Date(session.startedAt).toLocaleString()}`);
  lines.push("");
  lines.push(`Overall score: ${feedback.overallScore}/100`);
  if (report) lines.push(`Readiness: ${READINESS[report.readinessTier].label}`);
  lines.push("");
  lines.push(feedback.summary);

  if (report) {
    lines.push(rule("STAR breakdown"));
    for (const { key, label } of STAR_ELEMENTS) {
      lines.push(`${label}`);
      lines.push(`  + ${report.starBreakdown[key].strength}`);
      lines.push(`  - ${report.starBreakdown[key].weakness}`);
    }

    lines.push(rule("Key strengths"));
    for (const s of report.keyStrengths) lines.push(`* ${s.title}: ${s.evidence}`);

    lines.push(rule("Areas for improvement"));
    for (const i of report.improvements) {
      lines.push(`* ${i.title}${i.competency ? ` [${i.competency}]` : ""}: ${i.detail}`);
    }
  }

  lines.push(rule("Question by question"));
  feedback.questions.forEach((q, i) => {
    const total = q.star.situation + q.star.task + q.star.action + q.star.result;
    lines.push(`Q${i + 1}. ${q.question || "(question not captured)"}`);
    lines.push(
      `Score: ${Math.round((total / 40) * 100)}/100 (S ${q.star.situation}, T ${q.star.task}, A ${q.star.action}, R ${q.star.result})`,
    );
    lines.push(`Your answer: ${q.transcript}`);
    if (q.coachingNote) lines.push(`Coaching note: ${q.coachingNote}`);
    for (const tip of q.improvements) lines.push(`Tip: ${tip}`);
    lines.push("");
  });

  return lines.join("\n");
}

export function downloadText(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
