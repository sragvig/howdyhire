import { NextResponse } from "next/server";
import { FetchPageError, fetchPageText } from "@/lib/server/fetch-page";
import { NotAJobPostingError, parseJobPosting } from "@/lib/server/job-parser";

const MIN_TEXT_CHARS = 80;

function badRequest(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

// Body: `{ url }` to import a posting from a link, or `{ text }` for a pasted description.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const url = typeof body?.url === "string" ? body.url.trim() : "";
  const pasted = typeof body?.text === "string" ? body.text.trim() : "";

  if (!url && !pasted) return badRequest("Provide a job posting URL or description");

  let text = pasted;
  if (url) {
    try {
      text = await fetchPageText(url);
    } catch (err) {
      if (err instanceof FetchPageError) return badRequest(`${err.message}. Try pasting the description instead.`);
      throw err;
    }
  }
  if (text.length < MIN_TEXT_CHARS) {
    return badRequest(
      url
        ? "That page didn't have enough text (it may require a login). Paste the description instead."
        : "Description is too short",
    );
  }

  try {
    const job = await parseJobPosting(text, url || undefined);
    return NextResponse.json({ job });
  } catch (err) {
    if (err instanceof NotAJobPostingError) {
      return badRequest(
        url
          ? "That page doesn't look like a job posting (it may require a login). Paste the description instead."
          : err.message,
        422,
      );
    }
    console.error("parse-job failed", err);
    return badRequest("We couldn't read that job posting. Try again.", 502);
  }
}
