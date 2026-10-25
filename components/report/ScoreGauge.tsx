// Score ring for the recap hero: maroon arc on a soft track.
export function ScoreGauge({ score }: { score: number }) {
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const filled = (Math.min(100, Math.max(0, score)) / 100) * circumference;

  return (
    <div className="relative h-36 w-36 shrink-0" role="img" aria-label={`STAR score ${score} out of 100`}>
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#ede7da" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={score >= 85 ? "#d4af37" : "#500000"}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          className="transition-[stroke-dasharray] duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-4xl font-bold leading-none tabular-nums text-aggie">{score}</span>
        <span className="mt-1 text-xs font-medium text-fg-subtle">STAR score</span>
      </div>
    </div>
  );
}
