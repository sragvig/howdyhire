"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, ThumbsUp, X } from "lucide-react";

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

const ICONS = { success: CheckCircle2, info: Info, error: AlertTriangle, gigem: ThumbsUp };
const ICON_STYLE: Record<Tone, string> = {
  success: "bg-emerald-500/15 text-good",
  info: "bg-maroon-500/20 text-accent",
  error: "bg-red-500/15 text-bad",
  gigem: "bg-gold-400/15 text-gold",
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
          const Icon = ICONS[tone];
          return (
            <div
              key={t.id}
              role="status"
              className="pointer-events-auto flex w-full max-w-sm animate-toast-in items-start gap-3 rounded-2xl border border-line bg-surface-strong/90 p-3.5 shadow-2xl shadow-black/40 backdrop-blur-md"
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${ICON_STYLE[tone]}`}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm font-semibold text-fg">{t.title}</p>
                {t.description && <p className="mt-0.5 text-xs text-fg-muted">{t.description}</p>}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="rounded-lg p-1 text-fg-subtle transition-colors hover:bg-white/10 hover:text-fg"
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
