import type { AnswerRecord, Feedback, StarElement, StarEvaluation } from "@/types";

export const STAR_ELEMENTS: { key: StarElement; label: string; hint: string }[] = [
  { key: "situation", label: "Situation", hint: "Set the scene: where, when, who" },
  { key: "task", label: "Task", hint: "Your responsibility or goal" },
  { key: "action", label: "Action", hint: "What you specifically did" },
  { key: "result", label: "Result", hint: "The outcome, ideally measurable" },
];

export function missingElements(evaluation: StarEvaluation): StarElement[] {
  return STAR_ELEMENTS.map((e) => e.key).filter((k) => !evaluation[k].present);
}

function answerScore(e: StarEvaluation) {
  return ((e.situation.score + e.task.score + e.action.score + e.result.score) / 40) * 100;
}

// Rolls the per-answer evaluations up into end-of-session feedback.
export function buildFeedback(answers: AnswerRecord[]): Feedback {
  const scored = answers.filter(
    (a): a is AnswerRecord & { evaluation: StarEvaluation } => !!a.evaluation?.isBehavioralAnswer,
  );

  if (scored.length === 0) {
    return {
      overallScore: 0,
      summary: "No behavioral answers were captured. Try a longer session and answer at least one full question.",
      questions: [],
    };
  }

  const overallScore = Math.round(scored.reduce((sum, a) => sum + answerScore(a.evaluation), 0) / scored.length);

  const averages = STAR_ELEMENTS.map(({ key, label }) => ({
    label,
    avg: scored.reduce((sum, a) => sum + a.evaluation[key].score, 0) / scored.length,
  })).sort((a, b) => b.avg - a.avg);
  const strongest = averages[0];
  const weakest = averages[averages.length - 1];

  return {
    overallScore,
    summary:
      `You answered ${scored.length} behavioral question${scored.length === 1 ? "" : "s"}. ` +
      `Your strongest STAR element was ${strongest.label}` +
      (weakest.avg < strongest.avg ? `; focus next on ${weakest.label}.` : "."),
    questions: scored.map((a) => ({
      question: a.question,
      transcript: a.answer,
      star: {
        situation: a.evaluation.situation.score,
        task: a.evaluation.task.score,
        action: a.evaluation.action.score,
        result: a.evaluation.result.score,
      },
      strengths: a.evaluation.strengths,
      improvements: a.evaluation.coachingTip ? [a.evaluation.coachingTip] : [],
    })),
  };
}
