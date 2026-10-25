import type { InterviewDuration } from "@/types";

export interface DurationOption {
  minutes: InterviewDuration;
  label: string;
  detail: string;
  questions: number;
}

export const DURATIONS: DurationOption[] = [
  { minutes: 2, label: "Demo", detail: "2 min · ~3 questions", questions: 3 },
  { minutes: 5, label: "5 min", detail: "~4 questions", questions: 4 },
  { minutes: 10, label: "10 min", detail: "~6 questions", questions: 6 },
  { minutes: 15, label: "15 min", detail: "~8 questions", questions: 8 },
  { minutes: 20, label: "20 min", detail: "~10 questions", questions: 10 },
];

export function getDuration(minutes: InterviewDuration) {
  return DURATIONS.find((d) => d.minutes === minutes) ?? DURATIONS[0];
}

// When to warn the agent that time is nearly up: the last minute, or the last quarter of a short demo.
export function warningLeadMs(minutes: InterviewDuration) {
  return Math.min(60_000, minutes * 60_000 * 0.25);
}

// After the limit, give the agent this long to wrap up before the call is ended automatically.
export const WRAP_UP_GRACE_MS = 30_000;
