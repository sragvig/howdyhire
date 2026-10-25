import { JobBoardFeed } from "@/components/jobs/JobBoardFeed";
import { PageHeader } from "@/components/ui/PageHeader";

export default function JobsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        eyebrow="Step 1 · Import context"
        title="Job Board"
        description="Pick a role and your interviewer will focus on the competencies it calls for. Postings from the Chrome extension land here too."
      />
      <JobBoardFeed />
    </div>
  );
}
