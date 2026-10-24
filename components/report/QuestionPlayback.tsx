"use client";

import { useState } from "react";
import { ChevronDown, Lightbulb, MessageCircleQuestion, ThumbsUp, UserRound } from "lucide-react";
import type { QuestionFeedback } from "@/types";
import { STAR_ELEMENTS } from "@/lib/star";
import { questionScore } from "./QuestionScoreChart";

function PlaybackItem({ q, index, interviewerName }: { q: QuestionFeedback; index: number; interviewerName: string }) {
  const [open, setOpen] = useState(index === 0);
  const score = questionScore(q);

  return (
    <li className="rounded-xl border border-stone-200 bg-white shadow-sm print:break-inside-avoid print:shadow-none">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-4 p-4 text-left"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-maroon-50 text-sm font-bold text-aggie">
          Q{index + 1}
        </span>
        <span className="min-w-0 flex-1">
          <span className="line-clamp-2 text-sm font-medium text-stone-900">
            {q.question || "(question not captured)"}
          </span>
          <span className="mt-1 flex gap-1">
            {STAR_ELEMENTS.map(({ key, label }) => (
              <span
                key={key}
                title={`${label}: ${q.star[key]}/10`}
                className={`rounded px-1.5 text-[10px] font-semibold ${
                  q.star[key] >= 5 ? "bg-emerald-100 text-emerald-900" : "bg-stone-100 text-stone-500"
                }`}
              >
                {label[0]} {q.star[key]}
              </span>
            ))}
          </span>
        </span>
        <span className="text-right">
          <span className="block text-lg font-bold tabular-nums text-stone-900">{score}</span>
          <span className="block text-[10px] uppercase tracking-wide text-stone-400">score</span>
        </span>
        <ChevronDown className={`h-5 w-5 shrink-0 text-stone-400 transition-transform print:hidden ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Collapsed items still print in full. */}
      <div className={`space-y-4 border-t border-stone-100 p-4 ${open ? "" : "hidden print:block"}`}>
        <div className="flex gap-3">
          <MessageCircleQuestion className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
          <div className="text-sm">
            <p className="text-xs font-semibold text-aggie">{interviewerName}</p>
            <p className="text-stone-700">{q.question || "(not captured)"}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
          <div className="text-sm">
            <p className="text-xs font-semibold text-stone-500">You</p>
            <p className="whitespace-pre-wrap text-stone-700">{q.transcript}</p>
          </div>
        </div>

        {(q.coachingNote || q.improvements.length > 0 || q.strengths.length > 0) && (
          <div className="rounded-lg border-l-4 border-aggie bg-maroon-50 p-4 text-sm">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-aggie">
              <Lightbulb className="h-3.5 w-3.5" /> Coaching notes
            </p>
            {q.coachingNote && <p className="text-maroon-950">{q.coachingNote}</p>}
            {q.strengths.length > 0 && (
              <ul className="mt-2 space-y-1">
                {q.strengths.map((s) => (
                  <li key={s} className="flex gap-2 text-stone-700">
                    <ThumbsUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700" /> {s}
                  </li>
                ))}
              </ul>
            )}
            {!q.coachingNote &&
              q.improvements.map((tip) => (
                <p key={tip} className="mt-2 text-stone-700">
                  {tip}
                </p>
              ))}
          </div>
        )}
      </div>
    </li>
  );
}

export function QuestionPlayback({ questions, interviewerName }: { questions: QuestionFeedback[]; interviewerName: string }) {
  return (
    <ol className="space-y-3">
      {questions.map((q, i) => (
        <PlaybackItem key={i} q={q} index={i} interviewerName={interviewerName} />
      ))}
    </ol>
  );
}
