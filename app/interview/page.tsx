import { Suspense } from "react";
import { InterviewRoom } from "@/components/interview/InterviewRoom";
import { JobImportHandler } from "@/components/jobs/JobImportHandler";

export default function InterviewPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-4">
      {/* Reads ?import= (search params are runtime data, so keep it inside Suspense). */}
      <Suspense fallback={null}>
        <JobImportHandler />
      </Suspense>
      <InterviewRoom />
    </div>
  );
}
