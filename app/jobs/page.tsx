import { JobBoardFeed } from "@/components/jobs/JobBoardFeed";

export default function JobsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">Job Board</h1>
        <p className="mt-1 text-sm text-stone-600">
          Pick a role and your interviewer will focus on the competencies it calls for.
        </p>
      </div>
      <JobBoardFeed />
    </div>
  );
}
