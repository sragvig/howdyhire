import { ResumeUpload } from "@/components/resume/ResumeUpload";

export default function ResumePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">Resume</h1>
        <p className="mt-1 text-sm text-stone-600">
          Your interviewer uses this to ask about your real experiences.
        </p>
      </div>
      <ResumeUpload />
    </div>
  );
}
