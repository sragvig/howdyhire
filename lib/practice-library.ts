import type { InterviewSession, PastInterview } from "@/types";

// Completed interviews are kept in this browser's localStorage, newest first.
const STORAGE_KEY = "howdyhire.practiceLibrary.v1";
const CHANGE_EVENT = "howdyhire:practice-library";
const MAX_ENTRIES = 50;

const EMPTY: PastInterview[] = [];
let cachedRaw: string | null | undefined;
let cached: PastInterview[] = EMPTY;

function readRaw() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null; // storage blocked (private mode, disabled site data)
  }
}

function isPastInterview(v: unknown): v is PastInterview {
  const e = v as PastInterview;
  return (
    !!e &&
    typeof e.id === "string" &&
    typeof e.completedAt === "string" &&
    !!e.job &&
    typeof e.job.title === "string" &&
    !!e.feedback &&
    Array.isArray(e.feedback.questions)
  );
}

// Snapshot for useSyncExternalStore: returns the same array until storage actually changes.
export function getLibrarySnapshot(): PastInterview[] {
  const raw = readRaw();
  if (raw === cachedRaw) return cached;
  cachedRaw = raw;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cached = Array.isArray(parsed) ? parsed.filter(isPastInterview) : EMPTY;
  } catch {
    cached = EMPTY;
  }
  return cached;
}

export const getServerLibrarySnapshot = () => EMPTY;

export function subscribeLibrary(onChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) onChange(); // other tabs
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function write(entries: PastInterview[]) {
  // If storage is full, drop the oldest sessions until it fits.
  for (let items = entries.slice(0, MAX_ENTRIES); items.length > 0; items = items.slice(0, -1)) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      window.dispatchEvent(new Event(CHANGE_EVENT));
      return true;
    } catch {
      // QuotaExceededError or storage unavailable; retry with fewer entries
    }
  }
  console.warn("Practice Library: couldn't save to localStorage");
  return false;
}

// Insert or update (e.g. after a report retry) by session id.
export function saveInterview(entry: PastInterview) {
  const others = getLibrarySnapshot().filter((e) => e.id !== entry.id);
  return write([entry, ...others].sort((a, b) => b.completedAt.localeCompare(a.completedAt)));
}

export function deleteInterview(id: string) {
  return write(getLibrarySnapshot().filter((e) => e.id !== id));
}

export function toPastInterview(session: InterviewSession, completedAt: string): PastInterview | null {
  if (session.status !== "complete" || !session.feedback || !session.id || !session.job) return null;
  const { id, title, company, description, keyCompetencies, source } = session.job;
  return {
    id: session.id,
    completedAt,
    startedAt: session.startedAt,
    persona: session.config.persona,
    durationMinutes: session.config.durationMinutes,
    candidateName: session.resume?.candidateName,
    job: { id, title, company, description, keyCompetencies, source },
    feedback: session.feedback,
  };
}
