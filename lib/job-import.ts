// Shared by POST /api/jobs/import (server) and the interview page (client): validates an
// imported job posting and round-trips it through a URL-safe token.

export interface ImportedJobPayload {
  title: string;
  company: string;
  description: string;
  url?: string; // where the posting was found, if known
}

const MAX_TITLE = 200;
const MAX_COMPANY = 200;
const MIN_DESCRIPTION = 50;
// Long enough for any real posting while keeping the redirect URL a sane size.
export const MAX_DESCRIPTION = 10_000;

const clean = (v: unknown) => (typeof v === "string" ? v.replace(/\s+\n/g, "\n").trim() : "");

export function validateJobPayload(raw: unknown): { payload: ImportedJobPayload } | { error: string } {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const title = clean(r.title).slice(0, MAX_TITLE);
  const company = clean(r.company).slice(0, MAX_COMPANY);
  const description = clean(r.description).slice(0, MAX_DESCRIPTION);
  const url = clean(r.url);

  if (!title) return { error: "title is required" };
  if (!company) return { error: "company is required" };
  if (description.length < MIN_DESCRIPTION) return { error: `description must be at least ${MIN_DESCRIPTION} characters` };

  return { payload: { title, company, description, ...(/^https?:\/\//i.test(url) && { url: url.slice(0, 2_000) }) } };
}

// base64url(JSON), UTF-8 safe, using only APIs available in both Node and the browser.
export function encodeJobPayload(payload: ImportedJobPayload) {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeJobPayload(token: string): ImportedJobPayload | null {
  try {
    const b64 = token.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
    const json = new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
    const result = validateJobPayload(JSON.parse(json));
    return "payload" in result ? result.payload : null;
  } catch {
    return null;
  }
}
