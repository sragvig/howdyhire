import type {
  Feedback,
  InterviewerPersona,
  InterviewSession,
  InterviewSessionConfig,
  JobPosting,
  ResumeData,
  SessionStatus,
} from "@/types";

export type SessionAction =
  | { type: "SET_RESUME"; resume: ResumeData }
  | { type: "CLEAR_RESUME" }
  | { type: "SET_JOB"; job: JobPosting }
  | { type: "CLEAR_JOB" }
  | { type: "SET_PERSONA"; persona: InterviewerPersona }
  | { type: "UPDATE_CONFIG"; config: Partial<InterviewSessionConfig> }
  | { type: "START"; id: string; at: string }
  | { type: "BEGIN_SCORING"; at: string }
  | { type: "COMPLETE"; feedback: Feedback }
  | { type: "UPDATE_FEEDBACK"; feedback: Feedback }
  | { type: "FAIL"; error: string }
  | { type: "RESET" };

// Legal lifecycle transitions: idle -> active -> scoring -> complete -> idle.
const TRANSITIONS: Record<SessionStatus, SessionStatus[]> = {
  idle: ["active"],
  active: ["scoring", "idle"],
  scoring: ["complete", "idle"],
  complete: ["idle"],
};

export function canTransition(from: SessionStatus, to: SessionStatus) {
  return TRANSITIONS[from].includes(to);
}

export const DEFAULT_CONFIG: InterviewSessionConfig = {
  persona: "friendly",
  questionCount: 5,
  focusCompetencies: [],
};

export function createSession(
  overrides: Partial<InterviewSession> = {},
): InterviewSession {
  return {
    id: null,
    status: "idle",
    config: DEFAULT_CONFIG,
    resume: null,
    job: null,
    ...overrides,
  };
}

export function isReadyToStart(session: InterviewSession) {
  return session.status === "idle" && !!session.resume && !!session.job;
}

export function sessionReducer(
  state: InterviewSession,
  action: SessionAction,
): InterviewSession {
  // Inputs and config are locked once the interview is underway.
  const editable = state.status === "idle";

  switch (action.type) {
    case "SET_RESUME":
      return editable ? { ...state, resume: action.resume } : state;
    case "CLEAR_RESUME":
      return editable ? { ...state, resume: null } : state;
    case "SET_JOB":
      return editable
        ? {
            ...state,
            job: action.job,
            config: {
              ...state.config,
              focusCompetencies: action.job.keyCompetencies.map((c) => c.name),
            },
          }
        : state;
    case "CLEAR_JOB":
      return editable
        ? { ...state, job: null, config: { ...state.config, focusCompetencies: [] } }
        : state;
    case "SET_PERSONA":
      // Persona can also change mid-interview; the agent is told via a contextual update.
      return editable || state.status === "active"
        ? { ...state, config: { ...state.config, persona: action.persona } }
        : state;
    case "UPDATE_CONFIG":
      return editable
        ? { ...state, config: { ...state.config, ...action.config } }
        : state;

    case "START":
      if (!isReadyToStart(state)) return state;
      return {
        ...state,
        id: action.id,
        status: "active",
        startedAt: action.at,
        endedAt: undefined,
        feedback: undefined,
        error: undefined,
      };
    case "BEGIN_SCORING":
      if (!canTransition(state.status, "scoring")) return state;
      return { ...state, status: "scoring", endedAt: action.at };
    case "COMPLETE":
      if (!canTransition(state.status, "complete")) return state;
      return { ...state, status: "complete", feedback: action.feedback };
    case "UPDATE_FEEDBACK":
      // e.g. retrying the AI report after the session has completed
      return state.status === "complete" ? { ...state, feedback: action.feedback } : state;
    case "FAIL":
      return { ...state, status: "idle", error: action.error };
    case "RESET":
      // Start a fresh session but keep the candidate's inputs and preferences.
      return createSession({
        resume: state.resume,
        job: state.job,
        config: state.config,
      });
  }
}
