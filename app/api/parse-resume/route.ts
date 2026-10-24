import { NextResponse } from "next/server";
import { parseResume, type ResumeInput } from "@/lib/server/resume-parser";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MIN_TEXT_CHARS = 50;
const MAX_TEXT_CHARS = 50_000;

function badRequest(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

// Accepts either multipart/form-data with a `file` (PDF or .txt) or `text` field,
// or JSON `{ text }` for pasted resumes.
async function readInput(req: Request): Promise<ResumeInput | string> {
  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file");
    const text = form.get("text");

    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_FILE_BYTES) return "File must be 5 MB or smaller";
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      const isText = file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt");
      if (isPdf) return { kind: "pdf", data: Buffer.from(await file.arrayBuffer()), fileName: file.name };
      if (isText) return { kind: "text", text: await file.text(), fileName: file.name };
      return "Upload a PDF or .txt file";
    }
    if (typeof text === "string") return { kind: "text", text };
    return "No resume provided";
  }

  if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => null);
    if (typeof body?.text === "string") return { kind: "text", text: body.text };
  }
  return "No resume provided";
}

export async function POST(req: Request) {
  const input = await readInput(req);
  if (typeof input === "string") return badRequest(input);

  if (input.kind === "text") {
    input.text = input.text.trim();
    if (input.text.length < MIN_TEXT_CHARS) return badRequest("Resume text is too short");
    if (input.text.length > MAX_TEXT_CHARS) return badRequest("Resume text is too long");
  }

  try {
    const resume = await parseResume(input);
    return NextResponse.json({ resume });
  } catch (err) {
    console.error("parse-resume failed", err);
    return badRequest("We couldn't parse that resume. Try again or paste the text instead.", 502);
  }
}
