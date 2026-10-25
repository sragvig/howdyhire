import { JobBoardFeed } from "@/components/jobs/JobBoardFeed";
import { PageHeader } from "@/components/ui/PageHeader";

export default function JobsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        eyebrow="Step 1 · Add your context"
        title="Job Board"
        description="Pick a role and your interviewer will ask about the skills it needs. Jobs from the Chrome extension show up here too."
      />
      <JobBoardFeed />
    </div>
  );
}
