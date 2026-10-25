"use client";

import { useState } from "react";
import { Link2, Loader2, Sparkles, TextCursorInput } from "lucide-react";
import type { JobPosting } from "@/types";
import { btn, input } from "@/components/ui/styles";

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
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-300 ${
        mode === m ? "bg-gradient-to-b from-maroon-600 to-aggie text-white shadow-md shadow-maroon-900/50" : "text-fg-muted hover:text-fg"
      }`}
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="inline-flex rounded-xl border border-line bg-white/5 p-1">
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
          className={input}
        />
      ) : (
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Paste the full job description here…"
          rows={6}
          disabled={disabled || loading}
          className={input}
        />
      )}

      {mode === "url" && (
        <p className="text-xs text-fg-subtle">
          Postings behind a login (like Handshake or HireAggies) can&apos;t be fetched. Use the Chrome extension or paste the description.
        </p>
      )}
      {error && <p className="text-sm text-bad">{error}</p>}

      <button type="submit" disabled={disabled || loading || !value.trim()} className={btn.primary}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {loading ? "Analyzing…" : "Import posting"}
      </button>
    </form>
  );
}
