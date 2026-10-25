import type { SpeechAnalytics } from "@/types";

// Multi-word fillers come first so "you know" isn't also counted elsewhere.
const FILLERS: { word: string; pattern: RegExp }[] = [
  { word: "you know", pattern: /\byou know\b(?! (how|what|that|when|where|why|if))/g },
  { word: "sort of", pattern: /\bsort of\b/g },
  { word: "kind of", pattern: /\bkind of\b/g },
  { word: "i mean", pattern: /\bi mean\b/g },
  { word: "um", pattern: /\bu+m+\b/g },
  { word: "uh", pattern: /\bu+h+\b/g },
  { word: "er", pattern: /\be+r+m*\b/g },
  { word: "basically", pattern: /\bbasically\b/g },
  { word: "actually", pattern: /\bactually\b/g },
  { word: "literally", pattern: /\bliterally\b/g },
  // Only filler "like": skip "I like", "would like", "looks like", "like to", etc.
  {
    word: "like",
    pattern:
      /(?<!\b(i|we|you|they|would|don't|didn't|really|feel|felt|look|looks|looked|seem|seems|sound|sounds|just|things|something)\s)\blike\b(?!\s(to|a\s(pro|charm)|that|this|it))/g,
  },
];

// Below this much measured speech, a WPM figure is too noisy to show.
const MIN_SPEAKING_MS = 15_000;

const count = (text: string, re: RegExp) => text.match(re)?.length ?? 0;

export function analyzeSpeech(
  candidateTurns: string[],
  speakingMs: number,
  timingMethod: SpeechAnalytics["timingMethod"],
): SpeechAnalytics {
  const text = candidateTurns.join(" ").toLowerCase().replace(/[^\p{L}\p{N}'\s]/gu, " ");
  const totalWords = text.split(/\s+/).filter(Boolean).length;

  const fillers = FILLERS.map(({ word, pattern }) => ({ word, count: count(text, pattern) }))
    .filter((f) => f.count > 0)
    .sort((a, b) => b.count - a.count);
  const fillerTotal = fillers.reduce((n, f) => n + f.count, 0);

  return {
    totalWords,
    speakingMs,
    wordsPerMinute: speakingMs >= MIN_SPEAKING_MS ? Math.round(totalWords / (speakingMs / 60_000)) : null,
    timingMethod,
    fillers,
    fillerTotal,
    fillersPer100Words: totalWords ? Math.round((fillerTotal / totalWords) * 1000) / 10 : 0,
    firstPersonSingular: count(text, /\b(i|me|my|myself)\b/g),
    firstPersonPlural: count(text, /\b(we|us|our|ourselves)\b/g),
  };
}

export type PaceBand = "slow" | "good" | "fast";

// Comfortable interview pace is roughly 120-160 WPM.
export function paceBand(wpm: number): PaceBand {
  if (wpm < 120) return "slow";
  if (wpm > 160) return "fast";
  return "good";
}
