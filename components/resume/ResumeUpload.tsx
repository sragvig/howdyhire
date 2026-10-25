"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, FileText, Loader2, RefreshCw, Upload } from "lucide-react";
import type { ResumeData } from "@/types";
import { useSession } from "@/components/providers/SessionProvider";
import { useToast } from "@/components/ui/Toast";
import { Card } from "@/components/dashboard/Card";
import { btn, chipMaroon, chipNeutral, input } from "@/components/ui/styles";

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-subtle">{children}</h3>
);

function Tags({ items, accent = false }: { items: string[]; accent?: boolean }) {
  if (items.length === 0) return <p className="text-sm text-fg-subtle">None found</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((s) => (
        <span key={s} className={accent ? chipMaroon : chipNeutral}>
          {s}
        </span>
      ))}
    </div>
  );
}

function ResumeSummary({ resume }: { resume: ResumeData }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-maroon-500 to-aggie font-display text-xl font-extrabold text-white ring-1 ring-inset ring-white/20">
          {resume.candidateName
            .split(" ")
            .map((p) => p[0])
            .slice(0, 2)
            .join("")}
        </span>
        <div className="min-w-0">
          <p className="font-display text-xl font-bold text-fg">{resume.candidateName}</p>
          {resume.summary && <p className="mt-0.5 text-sm text-fg-muted">{resume.summary}</p>}
        </div>
      </div>

      <div>
        <SectionLabel>Target roles</SectionLabel>
        <Tags items={resume.targetRoles} accent />
      </div>

      <div>
        <SectionLabel>Experience</SectionLabel>
        <ul className="space-y-3 border-l border-line pl-4">
          {resume.experience.map((e) => (
            <li key={e.id} className="relative text-sm">
              <span className="absolute -left-[1.3rem] top-1.5 h-2 w-2 rounded-full bg-gold-400 ring-4 ring-canvas" />
              <p className="font-medium text-fg">
                {e.role} <span className="text-fg-subtle">·</span> <span className="text-fg-muted">{e.organization}</span>
              </p>
              <p className="text-xs text-fg-subtle">
                {e.startDate} – {e.current ? "Present" : e.endDate ?? ""}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {resume.projects.length > 0 && (
        <div>
          <SectionLabel>Projects</SectionLabel>
          <ul className="space-y-1.5 text-sm">
            {resume.projects.map((p) => (
              <li key={p.id}>
                <span className="font-medium text-fg">{p.name}</span>
                {p.technologies.length > 0 && <span className="text-fg-subtle"> · {p.technologies.join(", ")}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <SectionLabel>Technical skills</SectionLabel>
          <Tags items={resume.skills.technical} />
        </div>
        <div>
          <SectionLabel>Soft skills</SectionLabel>
          <Tags items={resume.skills.soft} />
        </div>
      </div>
    </div>
  );
}

export function ResumeUpload() {
  const { session, setResume, clearResume } = useSession();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pasted, setPasted] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
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
      const first = String(data.resume.candidateName ?? "").split(" ")[0];
      toast({ tone: "gigem", title: `Howdy${first ? `, ${first}` : ""}!`, description: "Resume parsed. Your interviewer will ask about your real experience." });
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
      <div className="space-y-4">
        <Card
          title="Parsed resume"
          icon={<FileText />}
          action={
            <button type="button" onClick={clearResume} disabled={locked} className={btn.ghost}>
              <RefreshCw className="h-4 w-4" /> Replace
            </button>
          }
        >
          <ResumeSummary resume={session.resume} />
        </Card>
        <div className="flex justify-end">
          <Link href={session.job ? "/interview" : "/jobs"} className={btn.primary}>
            {session.job ? "Continue to Interview Studio" : "Next: pick a target role"} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Card title="Upload your resume" icon={<Upload />}>
      <div className="space-y-5">
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (!loading && !locked) handleFile(e.dataTransfer.files[0]);
          }}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-all duration-300 ${
            dragging
              ? "border-gold-400/70 bg-gold-400/5"
              : "border-line-strong hover:border-maroon-400/50 hover:bg-maroon-500/5"
          }`}
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-maroon-500/15 text-accent ring-1 ring-inset ring-maroon-400/25">
            {loading ? <Loader2 className="h-7 w-7 animate-spin" /> : <Upload className="h-7 w-7" />}
          </span>
          <p className="mt-4 font-medium text-fg">{loading ? "Parsing with Gemini…" : "Drop a PDF or .txt, or click to browse"}</p>
          <p className="mt-1 text-xs text-fg-subtle">Max 5 MB · saved on this device</p>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.txt,application/pdf,text/plain"
            className="sr-only"
            disabled={loading || locked}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </label>

        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-fg-subtle">
          <div className="h-px flex-1 bg-line" /> or paste text <div className="h-px flex-1 bg-line" />
        </div>

        <form onSubmit={handlePaste} className="space-y-3">
          <textarea
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            rows={8}
            placeholder="Paste your resume text here…"
            disabled={loading || locked}
            className={input}
          />
          <button type="submit" disabled={loading || locked || pasted.trim().length === 0} className={btn.primary}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Parse resume
          </button>
        </form>

        {error && <p className="text-sm text-bad">{error}</p>}
      </div>
    </Card>
  );
}
