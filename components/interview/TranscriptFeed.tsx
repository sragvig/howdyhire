"use client";

import { useEffect, useRef } from "react";
import { MessageSquareText } from "lucide-react";
import type { TranscriptEntry } from "@/types";
import { Card } from "@/components/dashboard/Card";

export function TranscriptFeed({ entries, interviewerName }: { entries: TranscriptEntry[]; interviewerName: string }) {
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [entries]);

  return (
    <Card title="Live transcript" icon={<MessageSquareText className="h-5 w-5" />}>
      <div ref={scroller} className="h-80 space-y-3 overflow-y-auto pr-1" aria-live="polite">
        {entries.length === 0 ? (
          <p className="pt-24 text-center text-sm text-stone-400">The conversation will appear here.</p>
        ) : (
          entries.map((e) => {
            const isCandidate = e.speaker === "candidate";
            return (
              <div key={e.id} className={`flex ${isCandidate ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                    isCandidate ? "rounded-br-sm bg-aggie text-white" : "rounded-bl-sm bg-stone-100 text-stone-800"
                  }`}
                >
                  <p className={`mb-0.5 text-xs font-semibold ${isCandidate ? "text-maroon-200" : "text-aggie"}`}>
                    {isCandidate ? "You" : interviewerName}
                  </p>
                  {e.text}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
