"use client";

import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";
import type {
  Feedback,
  InterviewerPersona,
  InterviewSession,
  InterviewSessionConfig,
  JobPosting,
  ResumeData,
} from "@/types";
import { createSession, isReadyToStart, sessionReducer } from "@/lib/session-reducer";

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

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, dispatch] = useReducer(sessionReducer, undefined, () => createSession());

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      isReadyToStart: isReadyToStart(session),
      setResume: (resume) => dispatch({ type: "SET_RESUME", resume }),
      clearResume: () => dispatch({ type: "CLEAR_RESUME" }),
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
    [session],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within a SessionProvider");
  return ctx;
}
