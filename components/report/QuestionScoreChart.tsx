import type { QuestionFeedback } from "@/types";

export function questionScore(q: QuestionFeedback) {
  return Math.round(((q.star.situation + q.star.task + q.star.action + q.star.result) / 40) * 100);
}

const GRID = [0, 25, 50, 75, 100];

// Single-series column chart: STAR score per question, with a hover/focus tooltip.
export function QuestionScoreChart({ questions }: { questions: QuestionFeedback[] }) {
  return (
    <figure>
      <div className="flex gap-2">
        <div className="relative h-48 w-8 shrink-0 text-right text-xs tabular-nums text-fg-subtle">
          {GRID.map((g) => (
            <span key={g} className="absolute right-0 translate-y-1/2" style={{ bottom: `${g}%` }}>
              {g}
            </span>
          ))}
        </div>

        <div className="relative h-48 flex-1">
          {GRID.map((g) => (
            <div
              key={g}
              className={`absolute inset-x-0 border-t ${g === 0 ? "border-stone-300" : "border-dashed border-stone-200"}`}
              style={{ bottom: `${g}%` }}
            />
          ))}

          <div className="absolute inset-0 flex items-end justify-around gap-2 px-2">
            {questions.map((q, i) => {
              const score = questionScore(q);
              return (
                <div
                  key={i}
                  tabIndex={0}
                  className="group relative flex h-full max-w-14 flex-1 items-end justify-center outline-none"
                  aria-label={`Question ${i + 1}: ${score} out of 100`}
                >
                  <div
                    className="w-full max-w-10 rounded-t-lg bg-aggie transition-colors duration-200 group-hover:bg-maroon-600 group-focus-visible:bg-maroon-600"
                    style={{ height: `${Math.max(score, 1)}%` }}
                  />
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden w-56 -translate-x-1/2 rounded-xl border border-stone-200 bg-surface p-3 text-xs shadow-lg group-hover:block group-focus-visible:block">
                    <p className="font-semibold text-fg">
                      Q{i + 1} · {score}/100
                    </p>
                    <p className="mt-1 line-clamp-2 text-fg-muted">{q.question || "Question not captured"}</p>
                    <p className="mt-1.5 tabular-nums text-fg-subtle">
                      S {q.star.situation} · T {q.star.task} · A {q.star.action} · R {q.star.result}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="ml-10 flex justify-around gap-2 px-2 pt-2 text-xs text-fg-subtle">
        {questions.map((_, i) => (
          <span key={i} className="max-w-14 flex-1 text-center">
            Q{i + 1}
          </span>
        ))}
      </div>

      <table className="sr-only">
        <caption>STAR score by question</caption>
        <thead>
          <tr>
            <th>Question</th>
            <th>Score</th>
            <th>Situation</th>
            <th>Task</th>
            <th>Action</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q, i) => (
            <tr key={i}>
              <td>{q.question || `Question ${i + 1}`}</td>
              <td>{questionScore(q)}</td>
              <td>{q.star.situation}</td>
              <td>{q.star.task}</td>
              <td>{q.star.action}</td>
              <td>{q.star.result}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
