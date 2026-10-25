"use client";

import { createContext, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from "react";
import type {
  Feedback,
  InterviewerPersona,
  InterviewSession,
  InterviewSessionConfig,
  JobPosting,
  ResumeData,
} from "@/types";
import { createSession, isReadyToStart, sessionReducer } from "@/lib/session-reducer";
import { saveInterview, toPastInterview } from "@/lib/practice-library";
import { useToast } from "@/components/ui/Toast";

interface SessionContextValue {
  session: InterviewSession;
  isReadyToStart: boolean;
  setResume: (resume: ResumeData) => void;
  clearResume: () => void;
  setJob: (job: JobPosting) => void;
  clearJob: () => void;
  setPersona: (persona: InterviewerPersona) => void;
  updateConfig: (config: Partial<InterviewSessionConfig>) => void;
  start: () => void;
  beginScoring: () => void;
  complete: (feedback: Feedback) => void;
  updateFeedback: (feedback: Feedback) => void;
  fail: (error: string) => void;
  reset: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

// The parsed resume is kept in localStorage so it survives refreshes and new tabs
// (e.g. a job imported from the Chrome extension opens /interview in a fresh tab).
const RESUME_STORAGE_KEY = "howdyhire.resume.v1";

function forgetSavedResume() {
  try {
    localStorage.removeItem(RESUME_STORAGE_KEY);
  } catch {
    // storage unavailable
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, dispatch] = useReducer(sessionReducer, undefined, () => createSession());
  const toast = useToast();

  // Actions must keep a stable identity: consumers list them as effect deps (e.g. the interview
  // engine's leave-page cleanup), and a new identity per session change would re-run those effects.
  const actions = useMemo<Omit<SessionContextValue, "session" | "isReadyToStart">>(
    () => ({
      setResume: (resume) => dispatch({ type: "SET_RESUME", resume }),
      clearResume: () => {
        forgetSavedResume();
        dispatch({ type: "CLEAR_RESUME" });
      },
      setJob: (job) => dispatch({ type: "SET_JOB", job }),
      clearJob: () => dispatch({ type: "CLEAR_JOB" }),
      setPersona: (persona) => dispatch({ type: "SET_PERSONA", persona }),
      updateConfig: (config) => dispatch({ type: "UPDATE_CONFIG", config }),
      start: () =>
        dispatch({ type: "START", id: crypto.randomUUID(), at: new Date().toISOString() }),
      beginScoring: () => dispatch({ type: "BEGIN_SCORING", at: new Date().toISOString() }),
      complete: (feedback) => dispatch({ type: "COMPLETE", feedback }),
      updateFeedback: (feedback) => dispatch({ type: "UPDATE_FEEDBACK", feedback }),
      fail: (error) => dispatch({ type: "FAIL", error }),
      reset: () => dispatch({ type: "RESET" }),
    }),
    [],
  );

  const value = useMemo<SessionContextValue>(
    () => ({ session, isReadyToStart: isReadyToStart(session), ...actions }),
    [session, actions],
  );

  // Restore the saved resume once on load (unless one was already set).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RESUME_STORAGE_KEY);
      const saved = raw ? JSON.parse(raw) : null;
      if (saved && typeof saved.candidateName === "string" && Array.isArray(saved.experience)) {
        dispatch({ type: "SET_RESUME", resume: saved });
      }
    } catch {
      forgetSavedResume(); // corrupt or unreadable
    }
  }, []);

  useEffect(() => {
    if (!session.resume) return;
    try {
      localStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify(session.resume));
    } catch {
      // storage full or unavailable; the resume still works for this tab
    }
  }, [session.resume]);

  // Auto-save every completed interview to the Practice Library. Re-saves on feedback updates
  // (e.g. a report retry) under the same id, keeping the original completion time.
  const completedAt = useRef<{ id: string; at: string } | null>(null);
  useEffect(() => {
    if (session.status !== "complete" || !session.id) return;
    const firstSave = completedAt.current?.id !== session.id;
    if (firstSave) completedAt.current = { id: session.id, at: new Date().toISOString() };
    const entry = toPastInterview(session, completedAt.current!.at);
    if (entry && saveInterview(entry) && firstSave) {
      toast({ tone: "gigem", title: "Saved to your Practice Library", description: "Gig 'em! Reopen this scorecard anytime." });
    }
  }, [session, toast]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within a SessionProvider");
  return ctx;
}
