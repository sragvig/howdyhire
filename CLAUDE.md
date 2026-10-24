# HowdyHire - Behavioral Interview Simulator

## Tech Stack
- Frontend: Next.js (App Router), React, Tailwind CSS, Lucide Icons
- Backend: Next.js API Routes / Node.js
- AI Engine: Google Gemini API (`@google/genai`) for parsing, matching, and STAR scoring
- Voice Engine: ElevenLabs Conversational AI Web SDK

## Rules & Conventions
- Keep components modular inside `/components`
- Use TypeScript interfaces for all data structures (Resume, JobDescription, Feedback)
- Always use the official `@google/genai` package for server-side text and analysis tasks using `gemini-2.5-flash`
- Handle ElevenLabs audio state cleanly (mic permission, active call, disconnected)
