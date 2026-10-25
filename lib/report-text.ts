import type { Feedback, InterviewerPersona } from "@/types";
import { getPersona } from "./personas";
import { STAR_ELEMENTS } from "./star";
import { READINESS } from "./readiness";

const rule = (title: string) => `\n${title.toUpperCase()}\n${"-".repeat(title.length)}\n`;

// What a report needs to know about the interview it describes (live session or library entry).
export interface ReportContext {
  jobTitle?: string;
  company?: string;
  candidateName?: string;
  persona: InterviewerPersona;
  startedAt?: string;
  durationMinutes?: number;
}

// Plain-text version of the report for download.
export function reportToText(feedback: Feedback, ctx: ReportContext) {
  const { report } = feedback;
  const lines: string[] = [];

  lines.push("HOWDYHIRE INTERVIEW REPORT");
  lines.push("==========================");
  if (ctx.jobTitle) lines.push(`Role: ${ctx.jobTitle}${ctx.company ? ` at ${ctx.company}` : ""}`);
  if (ctx.candidateName) lines.push(`Candidate: ${ctx.candidateName}`);
  lines.push(`Interviewer: ${getPersona(ctx.persona).label}`);
  if (ctx.durationMinutes) lines.push(`Length: ${ctx.durationMinutes} minutes`);
  if (ctx.startedAt) lines.push(`Date: ${new Date(ctx.startedAt).toLocaleString()}`);
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

    if (report.aggieSpirit) {
      lines.push(rule("Aggie spirit"));
      lines.push(report.aggieSpirit);
    }
  }

  const { speech } = feedback;
  if (speech) {
    lines.push(rule("Pacing & filler words"));
    lines.push(`Pace: ${speech.wordsPerMinute !== null ? `${speech.wordsPerMinute} words per minute` : "not enough speech to estimate"}`);
    lines.push(`Words spoken: ${speech.totalWords}`);
    lines.push(`Filler words: ${speech.fillerTotal} (${speech.fillersPer100Words} per 100 words)`);
    for (const f of speech.fillers) lines.push(`  "${f.word}": ${f.count}`);
    lines.push(`"I" vs "we": ${speech.firstPersonSingular} / ${speech.firstPersonPlural}`);
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
    if (q.sampleAnswer) lines.push(`Stronger STAR version: ${q.sampleAnswer}`);
    lines.push("");
  });

  if (feedback.transcript?.length) {
    lines.push(rule("Full transcript"));
    for (const t of feedback.transcript) lines.push(`${t.speaker === "candidate" ? "You" : "Interviewer"}: ${t.text}`);
  }

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
