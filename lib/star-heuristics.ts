import type { StarElement } from "@/types";

// Instant, client-side cue matching so badges react the moment the candidate speaks.
// Gemini's evaluation remains the source of truth once it arrives.
const CUES: Record<StarElement, RegExp[]> = {
  situation: [
    /\b(when|while) (i|we) (was|were|worked|interned|led)\b/,
    /\b(last|this past|one) (year|summer|fall|spring|semester|week|month|time)\b/,
    /\b(at|in|during) (my|our|the) (previous |last |first )?(job|internship|role|team|class|project|company|club|org|organization|semester|co-?op)\b/,
    /\bback (in|when)\b/,
    /\bthere was (a|one) time\b/,
    /\bthe (situation|context|background) was\b/,
  ],
  task: [
    /\bi (was|am) (responsible|tasked|asked|assigned|in charge|charged)\b/,
    /\bmy (role|job|goal|task|responsibility|objective|assignment) (was|is)\b/,
    /\b(i|we) (needed|had|were supposed) to\b/,
    /\bthe (goal|challenge|problem|task|objective) was\b/,
    /\b(it was|was) (up to|on) me\b/,
  ],
  action: [
    /\bi (decided|organized|led|built|created|implemented|reached out|talked|scheduled|set up|designed|wrote|analyzed|proposed|started|took|coordinated|developed|met|spoke|reorganized|split|ran|delegated|researched|presented|volunteered|initiated|mentored|negotiated|prioritized|fixed|debugged|automated|rewrote|tested|asked|called|focused)\b/,
    /\b(so|then|first|next) i\b/,
    /\bthe (first|next) (thing|step) i\b/,
    /\bmy approach was\b/,
  ],
  result: [
    /\b(as a result|in the end|ultimately|the outcome|the result|ended up|at the end of the day)\b/,
    /\b(resulted in|led to|which meant)\b/,
    /\b(increased|reduced|decreased|improved|saved|cut|grew|boosted|doubled|tripled|won|placed|achieved|delivered|launched|shipped|exceeded)\b/,
    /\b\d+(\.\d+)?\s?(%|percent|x|hours|days|weeks|dollars|users|people)\b/,
    /\bi (learned|realized)\b/,
  ],
};

export function detectStarCues(text: string): Record<StarElement, boolean> {
  const t = text.toLowerCase();
  return {
    situation: CUES.situation.some((re) => re.test(t)),
    task: CUES.task.some((re) => re.test(t)),
    action: CUES.action.some((re) => re.test(t)),
    result: CUES.result.some((re) => re.test(t)),
  };
}
