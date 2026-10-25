// Hero score ring for use on a maroon background.
export function ScoreGauge({ score }: { score: number }) {
  const r = 54;
  const circumference = 2 * Math.PI * r;
  const filled = (Math.min(100, Math.max(0, score)) / 100) * circumference;

  return (
    <div className="relative h-40 w-40 shrink-0" role="img" aria-label={`STAR score ${score} out of 100`}>
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
        <defs>
          <linearGradient id="score-arc" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f3e3a8" />
            <stop offset="100%" stopColor="#d4af37" />
          </linearGradient>
        </defs>
        <circle cx="64" cy="64" r={r} fill="none" stroke="rgb(255 255 255 / 0.12)" strokeWidth="9" />
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke="url(#score-arc)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          className="transition-[stroke-dasharray] duration-1000 ease-out"
          style={{ filter: "drop-shadow(0 0 6px rgb(212 175 55 / 0.5))" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-200">STAR score</span>
        <span className="font-display text-5xl font-extrabold leading-none tabular-nums text-white">{score}</span>
        <span className="mt-0.5 text-xs text-maroon-200">out of 100</span>
      </div>
    </div>
  );
}
