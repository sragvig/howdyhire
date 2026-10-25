import { connection, NextResponse } from "next/server";

const SIGNED_URL_ENDPOINT = "https://api.elevenlabs.io/v1/convai/conversation/get-signed-url";
const TIMEOUT_MS = 10_000;

function error(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

// Returns `{ signedUrl }` for starting a private ElevenLabs agent conversation.
// The API key stays on the server; signed URLs are short-lived, so never cache them.
export async function GET() {
  // Signed URLs are per-request; never prerender or cache this route at build time.
  await connection();
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
  if (!apiKey || !agentId) {
    console.error("signed-url: ELEVENLABS_API_KEY or NEXT_PUBLIC_ELEVENLABS_AGENT_ID is not set");
    return error("Voice interviews aren't configured on the server.", 500);
  }

  let res: Response;
  try {
    res = await fetch(`${SIGNED_URL_ENDPOINT}?agent_id=${encodeURIComponent(agentId)}`, {
      headers: { "xi-api-key": apiKey },
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    console.error("signed-url: request to ElevenLabs failed", err);
    const timedOut = err instanceof Error && err.name === "TimeoutError";
    return error(timedOut ? "ElevenLabs took too long to respond." : "Couldn't reach ElevenLabs.", 502);
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error(`signed-url: ElevenLabs returned ${res.status}`, detail.slice(0, 500));
    if (res.status === 401 || res.status === 403) {
      return error("The ElevenLabs API key was rejected.", 502);
    }
    if (res.status === 404 || res.status === 422) return error("The ElevenLabs agent wasn't found.", 502);
    if (res.status === 429) return error("ElevenLabs is rate limiting requests. Try again shortly.", 503);
    return error("ElevenLabs couldn't start a conversation.", 502);
  }

  const data = await res.json().catch(() => null);
  if (typeof data?.signed_url !== "string") {
    console.error("signed-url: unexpected response shape from ElevenLabs");
    return error("ElevenLabs returned an unexpected response.", 502);
  }

  return NextResponse.json({ signedUrl: data.signed_url }, { headers: { "Cache-Control": "no-store" } });
}
