"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { RevAvatar } from "@/components/mascot/Reveille";

type Tone = "success" | "info" | "error" | "gigem";

interface ToastInput {
  title: string;
  description?: string;
  tone?: Tone;
  durationMs?: number;
}

interface ToastItem extends ToastInput {
  id: string;
}

const ToastContext = createContext<(toast: ToastInput) => void>(() => {});

const ICONS = { success: CheckCircle2, info: Info, error: AlertTriangle };
const ICON_STYLE = {
  success: "bg-emerald-50 text-emerald-700",
  info: "bg-maroon-50 text-accent",
  error: "bg-red-50 text-bad",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
  }, []);

  const show = useCallback(
    (toast: ToastInput) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev.slice(-2), { ...toast, id }]); // keep at most 3 on screen
      timers.current.set(id, setTimeout(() => dismiss(id), toast.durationMs ?? 4500));
    },
    [dismiss],
  );

  const value = useMemo(() => show, [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 print:hidden"
      >
        {toasts.map((t) => {
          const tone = t.tone ?? "info";
          return (
            <div
              key={t.id}
              role="status"
              className="pointer-events-auto flex w-full max-w-sm animate-toast-in items-start gap-3 rounded-2xl border border-stone-200 bg-surface p-3.5 shadow-lg"
            >
              {tone === "gigem" ? (
                <RevAvatar mood="cheer" size={36} ring={false} />
              ) : (
                (() => {
                  const Icon = ICONS[tone];
                  return (
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${ICON_STYLE[tone]}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                  );
                })()
              )}
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm font-semibold text-fg">{t.title}</p>
                {t.description && <p className="mt-0.5 text-xs text-fg-muted">{t.description}</p>}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="rounded-lg p-1 text-fg-subtle transition-colors hover:bg-stone-100 hover:text-fg"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
