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
    <Card title="Conversation" icon={<MessageSquareText />}>
      <div ref={scroller} className="h-80 space-y-3 overflow-y-auto pr-1" aria-live="polite">
        {entries.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <MessageSquareText className="h-8 w-8 text-stone-300" />
            <p className="mt-2 text-sm text-fg-subtle">Your conversation will show up here as you talk.</p>
          </div>
        ) : (
          entries.map((e) => {
            const isCandidate = e.speaker === "candidate";
            return (
              <div key={e.id} className={`flex animate-fade-up ${isCandidate ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    isCandidate ? "rounded-br-md bg-aggie text-cream-50" : "rounded-bl-md bg-surface-muted text-fg"
                  }`}
                >
                  <p className={`mb-0.5 text-[11px] font-semibold ${isCandidate ? "text-white/70" : "text-accent"}`}>
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
