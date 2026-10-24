import type { ReadinessTier } from "@/types";

export const READINESS: Record<ReadinessTier, { label: string; description: string }> = {
  "interview-ready": { label: "Interview Ready", description: "You're prepared for the real thing." },
  "almost-ready": { label: "Almost Ready", description: "A little polish and you're there." },
  developing: { label: "Developing", description: "Solid foundation. Keep practicing STAR structure." },
  "needs-practice": { label: "Needs Practice", description: "Focus on fully structured answers next time." },
};
