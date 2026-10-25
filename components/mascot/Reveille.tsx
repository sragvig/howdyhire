// Miss Rev: an original, friendly collie illustration (inline SVG, no external art).
//   happy     – default smile
//   listening – ears perk and wiggle (live interview)
//   cheer     – happy closed eyes + tongue (great scores, "Gig 'em!")
export type RevMood = "happy" | "listening" | "cheer";

export function Reveille({
  mood = "happy",
  size = 64,
  className = "",
  title = "Miss Rev",
}: {
  mood?: RevMood;
  size?: number;
  className?: string;
  title?: string;
}) {
  const sable = "#B87A3D";
  const sableDark = "#8A5526";
  const fur = "#FFF8EC";
  const ink = "#2B1D16";
  const earAnim = mood === "listening" ? "animate-ear" : "";

  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className={className} role="img" aria-label={title}>
      <title>{title}</title>

      {/* ears (tipped collie ears) */}
      <g className={earAnim} style={{ transformOrigin: "38px 40px" }}>
        <path d="M28 46 C22 30 22 16 30 10 C38 14 46 24 50 34 Z" fill={sable} />
        <path d="M31 40 C28 30 28 21 32 16 C37 20 42 27 44 33 Z" fill="#E9B98A" />
        <path d="M30 10 C33 9 37 11 39 15 C35 15 32 14 30 10 Z" fill={sableDark} />
      </g>
      <g className={earAnim} style={{ transformOrigin: "82px 40px", animationDelay: "0.2s" }}>
        <path d="M92 46 C98 30 98 16 90 10 C82 14 74 24 70 34 Z" fill={sable} />
        <path d="M89 40 C92 30 92 21 88 16 C83 20 78 27 76 33 Z" fill="#E9B98A" />
        <path d="M90 10 C87 9 83 11 81 15 C85 15 88 14 90 10 Z" fill={sableDark} />
      </g>

      {/* fluffy white ruff */}
      <path
        d="M24 84 C20 96 30 108 42 106 C46 114 56 116 60 110 C64 116 74 114 78 106 C90 108 100 96 96 84 C88 92 32 92 24 84 Z"
        fill={fur}
        stroke="#EADBC4"
        strokeWidth="1.5"
      />

      {/* head */}
      <path d="M26 60 C26 38 42 28 60 28 C78 28 94 38 94 60 C94 80 80 92 60 92 C40 92 26 80 26 60 Z" fill={sable} />
      {/* white blaze + muzzle */}
      <path d="M60 30 C55 38 53 48 52 58 C47 62 42 70 43 78 C46 88 54 92 60 92 C66 92 74 88 77 78 C78 70 73 62 68 58 C67 48 65 38 60 30 Z" fill={fur} />

      {/* cheeks */}
      <circle cx="39" cy="70" r="5" fill="#F2A7A7" opacity="0.45" />
      <circle cx="81" cy="70" r="5" fill="#F2A7A7" opacity="0.45" />

      {/* eyes */}
      {mood === "cheer" ? (
        <g stroke={ink} strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M41 58 Q46 52 51 58" />
          <path d="M69 58 Q74 52 79 58" />
        </g>
      ) : (
        <g>
          <ellipse cx="46" cy="57" rx="4.5" ry={mood === "listening" ? 5.5 : 5} fill={ink} />
          <ellipse cx="74" cy="57" rx="4.5" ry={mood === "listening" ? 5.5 : 5} fill={ink} />
          <circle cx="47.6" cy="55" r="1.6" fill="#fff" />
          <circle cx="75.6" cy="55" r="1.6" fill="#fff" />
        </g>
      )}

      {/* nose + mouth */}
      <ellipse cx="60" cy="70" rx="6" ry="4.4" fill={ink} />
      <ellipse cx="58.2" cy="68.8" rx="1.8" ry="1" fill="#fff" opacity="0.6" />
      {mood !== "listening" && <path d="M55.5 78 C55.5 86 64.5 86 64.5 78 Z" fill="#E86A7A" />}
      <path
        d="M60 74.5 V77.5 M60 77.5 C57 81 53.5 81 51.5 78.5 M60 77.5 C63 81 66.5 81 68.5 78.5"
        stroke={ink}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* maroon bandana with a gold tag */}
      <path d="M38 95 C50 101 70 101 82 95 L60 113 Z" fill="#500000" />
      <circle cx="60" cy="103" r="3.5" fill="#E6C200" stroke="#A8871F" strokeWidth="1" />
    </svg>
  );
}

// Miss Rev in a cream circle, for headers, badges, and the live stage.
export function RevAvatar({ mood = "happy", size = 48, ring = true }: { mood?: RevMood; size?: number; ring?: boolean }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-cream-200 ${
        ring ? "ring-2 ring-gold-300 ring-offset-2 ring-offset-cream-50" : ""
      }`}
      style={{ width: size, height: size }}
    >
      <Reveille mood={mood} size={Math.round(size * 0.92)} className="translate-y-[6%]" />
    </span>
  );
}

// Miss Rev saying something: avatar + speech bubble.
export function RevSays({
  children,
  mood = "happy",
  size = 52,
  className = "",
}: {
  children: React.ReactNode;
  mood?: RevMood;
  size?: number;
  className?: string;
}) {
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <RevAvatar mood={mood} size={size} />
      <div className="relative min-w-0 flex-1 rounded-2xl rounded-tl-md border border-stone-200 bg-surface px-4 py-3 text-sm leading-relaxed text-fg shadow-sm">
        {children}
      </div>
    </div>
  );
}
