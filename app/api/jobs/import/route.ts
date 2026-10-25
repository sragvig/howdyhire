import { NextResponse } from "next/server";
import { encodeJobPayload, validateJobPayload } from "@/lib/job-import";

// Accepts { title, company, description, url? } as JSON or form data and sends the user to
// /interview with that job loaded as the active interview context.
//
// - Browser form posts (and any caller not asking for JSON) get a 303 redirect.
// - Callers sending `Accept: application/json` (e.g. the Chrome extension's background worker,
//   which can't follow a redirect into a tab) get `{ redirectTo }` to open themselves.
export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";
  const wantsJson = (req.headers.get("accept") ?? "").includes("application/json");

  let raw: unknown = null;
  if (contentType.includes("application/json")) {
    raw = await req.json().catch(() => null);
  } else if (contentType.includes("form")) {
    raw = Object.fromEntries((await req.formData().catch(() => new FormData())).entries());
  }

  const result = validateJobPayload(raw);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });

  const redirectTo = `/interview?import=${encodeJobPayload(result.payload)}`;
  if (wantsJson) return NextResponse.json({ redirectTo });
  return NextResponse.redirect(new URL(redirectTo, req.url), 303);
}
