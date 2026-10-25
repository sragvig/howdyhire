"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { getServerThemeSnapshot, getThemeSnapshot, setTheme, subscribeTheme } from "@/lib/theme";

// Light/dark switch: a pill with a sliding knob.
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerThemeSnapshot);
  const dark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Dark mode"
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(dark ? "light" : "dark")}
      className="relative inline-flex h-9 w-[4.25rem] shrink-0 items-center rounded-full border border-stone-200 bg-surface-muted p-1 shadow-sm transition-colors duration-200 hover:border-maroon-200"
    >
      <span
        aria-hidden
        className={`absolute top-1 flex h-7 w-7 items-center justify-center rounded-full shadow-sm transition-all duration-300 ${
          dark ? "left-[calc(100%-2rem)] bg-maroon-600 text-gold-300" : "left-1 bg-gold-400 text-maroon-900"
        }`}
      >
        {dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </span>
      <Sun aria-hidden className={`ml-1 h-3.5 w-3.5 transition-opacity ${dark ? "text-fg-subtle opacity-100" : "opacity-0"}`} />
      <Moon aria-hidden className={`ml-auto mr-1 h-3.5 w-3.5 transition-opacity ${dark ? "opacity-0" : "text-fg-subtle opacity-100"}`} />
    </button>
  );
}
