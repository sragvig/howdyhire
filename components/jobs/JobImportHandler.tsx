"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { JobPosting } from "@/types";
import { decodeJobPayload } from "@/lib/job-import";
import { useSession } from "@/components/providers/SessionProvider";
import { useToast } from "@/components/ui/Toast";

// Picks up `/interview?import=<token>` (from POST /api/jobs/import), loads the job as the active
// interview context, then enriches it with key competencies via /api/parse-job. Progress is shown
// with toasts; the header's Active Job pill shows the job itself.
export function JobImportHandler() {
  const params = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const { session, setJob, reset } = useSession();
  const handled = useRef<string | null>(null);
  const sessionRef = useRef(session);
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const token = params.get("import");

  useEffect(() => {
    if (!token || handled.current === token) return;
    handled.current = token;
    // Drop the token from the address bar so a refresh doesn't re-import.
    router.replace("/interview", { scroll: false });

    void (async () => {
      const payload = decodeJobPayload(token);
      if (!payload) {
        toast({ tone: "error", title: "Couldn't import that job", description: "The job link is invalid or incomplete." });
        return;
      }
      const { status: current } = sessionRef.current;
      if (current === "active" || current === "scoring") {
        toast({ tone: "error", title: "Interview in progress", description: "Finish the current interview before importing a new job." });
        return;
      }
      if (current === "complete") reset(); // start a fresh session for the imported job

      const job: JobPosting = {
        id: `import-${crypto.randomUUID()}`,
        source: "custom",
        title: payload.title,
        company: payload.company,
        description: payload.description,
        postingUrl: payload.url,
        keyCompetencies: [],
      };
      setJob(job);
      toast({ tone: "info", title: `Imported: ${payload.title}`, description: `${payload.company} · analyzing key competencies…` });

      try {
        const res = await fetch("/api/parse-job", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: `${payload.title} at ${payload.company}\n\n${payload.description}` }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !Array.isArray(data?.job?.keyCompetencies)) throw new Error(data?.error ?? "Analysis failed");

        const enriched: JobPosting = {
          ...job,
          keyCompetencies: data.job.keyCompetencies,
          location: data.job.location,
          employmentType: data.job.employmentType,
          category: data.job.category,
        };
        // Only apply if the user hasn't picked a different job or started meanwhile.
        if (sessionRef.current.job?.id === job.id) setJob(enriched);
        toast({
          tone: "gigem",
          title: "Ready to practice",
          description: enriched.keyCompetencies.length
            ? `Focus: ${enriched.keyCompetencies.map((c) => c.name).join(", ")}`
            : undefined,
          durationMs: 6000,
        });
      } catch (err) {
        toast({
          tone: "info",
          title: "Job loaded",
          description: `Couldn't analyze competencies (${err instanceof Error ? err.message : "analysis failed"}). Your interviewer will use the description directly.`,
          durationMs: 7000,
        });
      }
    })();
  }, [token, router, setJob, reset, toast]);

  return null;
}
