import { CheckCircle2, CircleAlert, Mic2, MessageSquareWarning, Timer, Type, UserRound, type LucideIcon } from "lucide-react";
import type { SpeechAnalytics } from "@/types";
import { paceBand } from "@/lib/speech-analytics";
import { surface } from "@/components/ui/styles";

const HESITATION_WORDS = new Set(["um", "uh", "er"]);

type Status = "good" | "watch" | "neutral";

const STATUS_PILL: Record<Status, string> = {
  good: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  watch: "bg-gold-50 text-gold-700 ring-gold-200",
  neutral: "bg-stone-100 text-stone-600 ring-stone-200",
};

function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  status,
  statusLabel,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  unit: string;
  status: Status;
  statusLabel: string;
}) {
  const StatusIcon = status === "watch" ? CircleAlert : CheckCircle2;
  return (
    <div className={`${surface} flex flex-col p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}>
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-maroon-50 text-aggie">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-3 text-xs font-medium text-fg-subtle">{label}</p>
      <p className="font-display text-3xl font-bold tabular-nums text-fg">
        {value} <span className="text-sm font-medium text-fg-subtle">{unit}</span>
      </p>
      <span className={`mt-3 inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_PILL[status]}`}>
        {status !== "neutral" && <StatusIcon className="h-3.5 w-3.5" />} {statusLabel}
      </span>
    </div>
  );
}

// Pacing and filler words as quick-scan stat cards plus filler chips.
export function DeliveryStats({ speech }: { speech: SpeechAnalytics }) {
  const wpm = speech.wordsPerMinute;
  const band = wpm !== null ? paceBand(wpm) : null;
  const hesitations = speech.fillers.filter((f) => HESITATION_WORDS.has(f.word)).reduce((n, f) => n + f.count, 0);
  const pronouns = speech.firstPersonSingular + speech.firstPersonPlural;
  const iPct = pronouns ? Math.round((speech.firstPersonSingular / pronouns) * 100) : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={Timer}
          label="Speaking pace"
          value={wpm !== null ? String(wpm) : "–"}
          unit="wpm"
          status={band === null ? "neutral" : band === "good" ? "good" : "watch"}
          statusLabel={band === null ? "Need more audio" : band === "good" ? "Just right" : band === "fast" ? "Slow down a bit" : "Pick up the pace"}
        />
        <StatCard
          icon={Mic2}
          label="Hesitations"
          value={String(hesitations)}
          unit="um / uh"
          status={hesitations <= 3 ? "good" : "watch"}
          statusLabel={hesitations <= 3 ? "Smooth delivery" : "Try a pause instead"}
        />
        <StatCard
          icon={MessageSquareWarning}
          label="Filler words"
          value={String(speech.fillerTotal)}
          unit={`· ${speech.fillersPer100Words}/100 words`}
          status={speech.fillersPer100Words <= 2 ? "good" : "watch"}
          statusLabel={speech.fillersPer100Words <= 2 ? "Nice and crisp" : "A few too many"}
        />
        <StatCard
          icon={UserRound}
          label="Ownership"
          value={iPct !== null ? `${iPct}%` : "–"}
          unit="“I” vs “we”"
          status={iPct === null ? "neutral" : iPct >= 60 ? "good" : "watch"}
          statusLabel={iPct === null ? "Not enough data" : iPct >= 60 ? "Owning your actions" : "Say “I” more"}
        />
      </div>

      <div className={`${surface} flex flex-wrap items-center gap-2 p-4`}>
        <span className="mr-1 inline-flex items-center gap-1.5 text-sm font-semibold text-fg">
          <Type className="h-4 w-4 text-aggie" /> {speech.totalWords.toLocaleString()} words spoken
        </span>
        {speech.fillers.length === 0 ? (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">No filler words. Gig &apos;em!</span>
        ) : (
          speech.fillers.map((f) => (
            <span key={f.word} className="rounded-full bg-cream-200 px-3 py-1 text-xs font-medium text-fg-muted ring-1 ring-inset ring-stone-200">
              &ldquo;{f.word}&rdquo; <span className="font-bold text-aggie">×{f.count}</span>
            </span>
          ))
        )}
      </div>
    </div>
  );
}
