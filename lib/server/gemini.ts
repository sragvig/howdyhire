import "server-only";
import { GoogleGenAI, type ContentListUnion } from "@google/genai";

export const GEMINI_MODEL = "gemini-3.8-flash";

let client: GoogleGenAI | null = null;

function getClient() {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

// Overloaded (503) and transient server errors are worth retrying. 429 is not: on the free
// tier it usually means the daily quota is exhausted, so retrying only adds latency.
const RETRYABLE_STATUS = new Set([500, 503]);
const RETRY_DELAYS_MS = [800, 2000];

function errorStatus(err: unknown) {
  const status = (err as { status?: unknown })?.status;
  return typeof status === "number" ? status : undefined;
}

function isRetryable(err: unknown) {
  const status = errorStatus(err);
  return status !== undefined && RETRYABLE_STATUS.has(status);
}

// User-facing explanation for Gemini failures the user can act on; undefined otherwise.
export function geminiErrorMessage(err: unknown): string | undefined {
  switch (errorStatus(err)) {
    case 429:
      return "The Gemini API quota has been reached. Try again later or upgrade the API plan.";
    case 503:
      return "Gemini is overloaded right now. Try again in a minute.";
  }
}

// Runs a structured-output request and returns the parsed JSON.
export async function generateJson<T>({
  contents,
  schema,
  systemInstruction,
}: {
  contents: ContentListUnion;
  schema: object;
  systemInstruction: string;
}): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      const response = await getClient().models.generateContent({
        model: GEMINI_MODEL,
        contents,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseJsonSchema: schema,
          temperature: 0.1,
        },
      });

      const text = response.text;
      if (!text) throw new Error("Gemini returned an empty response");
      return JSON.parse(text) as T;
    } catch (err) {
      const delay = RETRY_DELAYS_MS[attempt];
      if (delay === undefined || !isRetryable(err)) throw err;
      await new Promise((r) => setTimeout(r, delay + Math.random() * 300));
    }
  }
}
