import { ResumeUpload } from "@/components/resume/ResumeUpload";
import { PageHeader } from "@/components/ui/PageHeader";

export default function ResumePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        eyebrow="Step 1 · Import context"
        title="Your resume"
        description="Your interviewer uses this to ask about your real projects, roles, and tools, never generic questions."
      />
      <ResumeUpload />
    </div>
  );
}
