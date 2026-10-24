"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, Trash2, Upload } from "lucide-react";
import type { ResumeData } from "@/types";
import { useSession } from "@/components/providers/SessionProvider";
import { Card } from "@/components/dashboard/Card";

function Tags({ items }: { items: string[] }) {
  if (items.length === 0) return <p className="text-sm text-stone-400">None found</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((s) => (
        <span key={s} className="rounded-full bg-maroon-50 px-2 py-0.5 text-xs text-maroon-800">
          {s}
        </span>
      ))}
    </div>
  );
}

function ResumeSummary({ resume }: { resume: ResumeData }) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-lg font-semibold">{resume.candidateName}</p>
        {resume.summary && <p className="mt-1 text-sm text-stone-600">{resume.summary}</p>}
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">Target roles</h3>
        <Tags items={resume.targetRoles} />
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">Experience</h3>
        <ul className="space-y-3">
          {resume.experience.map((e) => (
            <li key={e.id} className="text-sm">
              <p className="font-medium">
                {e.role} · <span className="text-stone-600">{e.organization}</span>
              </p>
              <p className="text-xs text-stone-500">
                {e.startDate} – {e.current ? "Present" : e.endDate ?? ""}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {resume.projects.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">Projects</h3>
          <ul className="space-y-1 text-sm">
            {resume.projects.map((p) => (
              <li key={p.id}>
                <span className="font-medium">{p.name}</span>
                {p.technologies.length > 0 && (
                  <span className="text-stone-500"> — {p.technologies.join(", ")}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">Technical skills</h3>
          <Tags items={resume.skills.technical} />
        </div>
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">Soft skills</h3>
          <Tags items={resume.skills.soft} />
        </div>
      </div>
    </div>
  );
}

export function ResumeUpload() {
  const { session, setResume, clearResume } = useSession();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pasted, setPasted] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locked = session.status !== "idle";

  async function submit(body: FormData) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/parse-resume", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setResume(data.resume);
      setPasted("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function handleFile(file: File | undefined) {
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    submit(form);
  }

  function handlePaste(e: React.FormEvent) {
    e.preventDefault();
    const form = new FormData();
    form.append("text", pasted);
    submit(form);
  }

  if (session.resume) {
    return (
      <Card
        title="Parsed resume"
        icon={<FileText className="h-5 w-5" />}
        action={
          <button
            type="button"
            onClick={clearResume}
            disabled={locked}
            className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" /> Replace
          </button>
        }
      >
        <ResumeSummary resume={session.resume} />
      </Card>
    );
  }

  return (
    <Card title="Upload your resume" icon={<Upload className="h-5 w-5" />}>
      <div className="space-y-5">
        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (!loading && !locked) handleFile(e.dataTransfer.files[0]);
          }}
          className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-stone-300 px-6 py-10 text-center transition-colors hover:border-maroon-300 hover:bg-maroon-50/40"
        >
          {loading ? (
            <Loader2 className="h-8 w-8 animate-spin text-aggie" />
          ) : (
            <Upload className="h-8 w-8 text-stone-400" />
          )}
          <p className="mt-3 text-sm font-medium text-stone-700">
            {loading ? "Parsing with Gemini…" : "Drop a PDF or .txt, or click to browse"}
          </p>
          <p className="mt-1 text-xs text-stone-500">Max 5 MB</p>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.txt,application/pdf,text/plain"
            className="sr-only"
            disabled={loading || locked}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </label>

        <div className="flex items-center gap-3 text-xs uppercase text-stone-400">
          <div className="h-px flex-1 bg-stone-200" /> or paste text <div className="h-px flex-1 bg-stone-200" />
        </div>

        <form onSubmit={handlePaste} className="space-y-3">
          <textarea
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            rows={8}
            placeholder="Paste your resume text here…"
            disabled={loading || locked}
            className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-aggie focus:outline-none focus:ring-1 focus:ring-aggie disabled:bg-stone-50"
          />
          <button
            type="submit"
            disabled={loading || locked || pasted.trim().length === 0}
            className="inline-flex items-center gap-2 rounded-md bg-aggie px-4 py-2 text-sm font-semibold text-white hover:bg-maroon-700 disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Parse resume
          </button>
        </form>

        {error && <p className="text-sm text-red-700">{error}</p>}
      </div>
    </Card>
  );
}
