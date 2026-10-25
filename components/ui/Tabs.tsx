"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export interface TabItem {
  id: string;
  label: string;
  icon: LucideIcon;
  content: ReactNode;
}

// Accessible tabs (arrow keys, Home/End). Every panel stays in the DOM so printing shows them all.
export function Tabs({ tabs, initial }: { tabs: TabItem[]; initial?: string }) {
  const [active, setActive] = useState(initial ?? tabs[0]?.id);
  const base = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(e: KeyboardEvent, index: number) {
    const last = tabs.length - 1;
    const next =
      e.key === "ArrowRight" ? (index === last ? 0 : index + 1)
      : e.key === "ArrowLeft" ? (index === 0 ? last : index - 1)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : null;
    if (next === null) return;
    e.preventDefault();
    setActive(tabs[next].id);
    refs.current[next]?.focus();
  }

  return (
    <div>
      <div role="tablist" aria-label="Recap sections" className="flex gap-2 overflow-x-auto pb-1 print:hidden">
        {tabs.map((tab, i) => {
          const selected = tab.id === active;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              id={`${base}-tab-${tab.id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`${base}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(tab.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                selected
                  ? "bg-aggie text-cream-50 shadow-sm"
                  : "border border-stone-200 bg-surface text-fg-muted hover:-translate-y-0.5 hover:border-maroon-200 hover:text-accent"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`${base}-panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`${base}-tab-${tab.id}`}
          tabIndex={0}
          className={`mt-6 animate-fade-up focus-visible:outline-none print:mt-8 print:block ${tab.id === active ? "" : "hidden"}`}
        >
          <h2 className="mb-4 hidden font-display text-xl font-bold text-fg print:block">{tab.label}</h2>
          {tab.content}
        </div>
      ))}
    </div>
  );
}
