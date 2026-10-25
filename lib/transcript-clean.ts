// Strips voice/style tags the agent or ASR may emit, e.g. "[happy]" or "STAR[gentle]".
const TAG_PATTERN = /(?:STAR)?\[\w+\]\s*/gi;

export function cleanTranscriptText(text: string) {
  return text.replace(TAG_PATTERN, "").replace(/\s{2,}/g, " ").trim();
}
