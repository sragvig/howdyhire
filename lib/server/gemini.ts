import "server-only";
import { GoogleGenAI, type ContentListUnion } from "@google/genai";

export const GEMINI_MODEL = "gemini-2.5-flash";

let client: GoogleGenAI | null = null;

function getClient() {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
    client = new GoogleGenAI({ apiKey });
  }
  return client;
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
}
