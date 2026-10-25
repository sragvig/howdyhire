// Core data structures for HowdyHire.

// ---------------------------------------------------------------------------
// Resume
// ---------------------------------------------------------------------------

export interface ExperienceEntry {
  id: string;
  role: string;
  organization: string;
  location?: string;
  startDate: string; // ISO "YYYY-MM" or free text from the parser
  endDate?: string; // omitted when current
  current: boolean;
  highlights: string[];
}

export interface ProjectEntry {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
}

export interface EducationEntry {
  institution: string;
  degree: string;
  major?: string;
  graduationDate?: string;
  gpa?: number;
}

export interface ResumeData {
  candidateName: string;
  email?: string;
  summary?: string;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  skills: {
    technical: string[];
    soft: string[];
  };
  targetRoles: string[]; // roles the candidate appears suited for / is seeking
  parsedAt: string; // ISO timestamp
  sourceFileName?: string;
}

// ---------------------------------------------------------------------------
// Job posting (Aggie Job Board)
// ---------------------------------------------------------------------------

export type EmploymentType = "internship" | "co-op" | "full-time" | "part-time";

export type JobCategory = "engineering" | "business" | "other";

export interface Competency {
  name: string; // e.g. "Leadership", "Conflict Resolution"
  description?: string;
  weight: number; // relative importance, 1-5
}

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  description: string;
  keyCompetencies: Competency[];
  location?: string;
  employmentType?: EmploymentType;
  category?: JobCategory;
  postingUrl?: string;
  source: "aggie-board" | "custom";
}

// ---------------------------------------------------------------------------
// Interview session
// ---------------------------------------------------------------------------

export type InterviewerPersona = "friendly" | "strict" | "grilling";

export type SessionStatus = "idle" | "active" | "scoring" | "complete";

export interface StarScore {
  situation: number; // 0-10
  task: number;
  action: number;
  result: number;
}

export interface QuestionFeedback {
  question: string;
  competency?: string;
  transcript: string;
  star: StarScore;
  strengths: string[];
  improvements: string[];
  coachingNote?: string; // from the post-interview Gemini report
  sampleAnswer?: string; // stronger STAR rewrite, only for answers that needed work
}

export interface FillerWordCount {
  word: string;
  count: number;
}

// Client-side delivery analytics computed from the candidate's transcript.
export interface SpeechAnalytics {
  totalWords: number;
  speakingMs: number;
  wordsPerMinute: number | null; // null when there wasn't enough timing data
  timingMethod: "voice-activity" | "turn-timing";
  fillers: FillerWordCount[]; // sorted by count, descending
  fillerTotal: number;
  fillersPer100Words: number;
  firstPersonSingular: number; // I / me / my
  firstPersonPlural: number; // we / us / our
}

export interface Feedback {
  overallScore: number; // 0-100
  summary: string;
  questions: QuestionFeedback[];
  report?: SessionReport;
  reportError?: string; // set when the AI report couldn't be generated; local scores still apply
  speech?: SpeechAnalytics;
  transcript?: TranscriptEntry[]; // full cleaned conversation, kept for the Practice Library
}

export type ReadinessTier = "interview-ready" | "almost-ready" | "developing" | "needs-practice";

export interface StarComponentInsight {
  strength: string;
  weakness: string;
}

export interface SessionReport {
  overallScore: number; // 0-100
  readinessTier: ReadinessTier;
  headline: string;
  starBreakdown: Record<"situation" | "task" | "action" | "result", StarComponentInsight>;
  keyStrengths: { title: string; evidence: string }[];
  improvements: { title: string; detail: string; competency?: string }[];
  aggieSpirit: string; // feedback framed around Texas A&M core values
  generatedAt: string; // ISO timestamp
}

export type InterviewDuration = 2 | 5 | 10 | 15 | 20; // minutes

export interface InterviewSessionConfig {
  persona: InterviewerPersona;
  durationMinutes: InterviewDuration;
  questionCount: number; // derived from duration
  focusCompetencies: string[]; // subset of JobPosting.keyCompetencies names
}

export interface InterviewSession {
  id: string | null; // assigned when the interview starts
  status: SessionStatus;
  config: InterviewSessionConfig;
  resume: ResumeData | null;
  job: JobPosting | null;
  startedAt?: string;
  endedAt?: string;
  feedback?: Feedback;
  error?: string;
}

// ---------------------------------------------------------------------------
// Live interview: transcript + real-time STAR evaluation
// ---------------------------------------------------------------------------

export type StarElement = "situation" | "task" | "action" | "result";

export interface TranscriptEntry {
  id: string;
  speaker: "interviewer" | "candidate";
  text: string;
  at: string; // ISO timestamp
}

export interface StarElementResult {
  present: boolean;
  score: number; // 0-10
  evidence?: string; // short quote/paraphrase from the answer
}

export interface StarEvaluation {
  isBehavioralAnswer: boolean; // false for small talk, clarifying questions, etc.
  situation: StarElementResult;
  task: StarElementResult;
  action: StarElementResult;
  result: StarElementResult;
  strengths: string[];
  coachingTip: string;
}

// One interviewer question and everything the candidate said in response.
export interface AnswerRecord {
  id: string;
  question: string;
  answer: string;
  evaluation?: StarEvaluation;
  heuristic?: Record<StarElement, boolean>; // instant client-side cue detection
  evaluating: boolean;
  evaluationError?: string;
}

// ---------------------------------------------------------------------------
// Practice Library (saved past interviews)
// ---------------------------------------------------------------------------

export interface PastInterview {
  id: string; // InterviewSession.id
  completedAt: string; // ISO timestamp
  startedAt?: string;
  persona: InterviewerPersona;
  durationMinutes: InterviewDuration;
  candidateName?: string;
  job: Pick<JobPosting, "id" | "title" | "company" | "description" | "keyCompetencies" | "source">;
  feedback: Feedback;
}
