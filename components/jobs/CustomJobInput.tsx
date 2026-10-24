"use client";

import { useState } from "react";
import { Link2, Loader2, Sparkles, TextCursorInput } from "lucide-react";
import type { JobPosting } from "@/types";

type Mode = "url" | "text";

export function CustomJobInput({
  disabled,
  onImported,
}: {
  disabled?: boolean;
  onImported: (job: JobPosting) => void;
}) {
  const [mode, setMode] = useState<Mode>("url");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/parse-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "url" ? { url: value } : { text: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      onImported(data.job);
      setValue("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const tab = (m: Mode, label: string, Icon: typeof Link2) => (
    <button
      type="button"
      onClick={() => {
        setMode(m);
        setError(null);
      }}
      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium ${
        mode === m ? "bg-white text-aggie shadow-sm" : "text-stone-600 hover:text-stone-900"
      }`}
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="inline-flex rounded-lg bg-stone-100 p-1">
        {tab("url", "Paste URL", Link2)}
        {tab("text", "Paste description", TextCursorInput)}
      </div>

      {mode === "url" ? (
        <input
          type="url"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="https://careers.example.com/jobs/123"
          disabled={disabled || loading}
          className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-aggie focus:outline-none focus:ring-1 focus:ring-aggie disabled:bg-stone-50"
        />
      ) : (
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Paste the full job description here…"
          rows={6}
          disabled={disabled || loading}
          className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-aggie focus:outline-none focus:ring-1 focus:ring-aggie disabled:bg-stone-50"
        />
      )}

      {mode === "url" && (
        <p className="text-xs text-stone-500">
          Postings behind a login (like Handshake) can&apos;t be fetched — paste the description instead.
        </p>
      )}
      {error && <p className="text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={disabled || loading || !value.trim()}
        className="inline-flex items-center gap-2 rounded-md bg-aggie px-4 py-2 text-sm font-semibold text-white hover:bg-maroon-700 disabled:cursor-not-allowed disabled:bg-stone-300"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {loading ? "Analyzing…" : "Import posting"}
      </button>
    </form>
  );
}
