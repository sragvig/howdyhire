import Image from "next/image";

// Reveille mascot, from the official local image (public/reveille-jr.png). The artwork already has a
// round cream background, so it's always shown cropped to a circle.
const SRC = "/reveille-jr.png";
const ALT = "Reveille IX Mascot";

// Moods add a little motion; the artwork itself is the same.
//   happy     – still
//   listening – gentle head tilt (live interview)
//   cheer     – soft bob (great scores, "Gig 'em!")
export type RevMood = "happy" | "listening" | "cheer";

const MOTION: Record<RevMood, string> = {
  happy: "",
  listening: "animate-ear",
  cheer: "animate-bob",
};

export function Reveille({
  mood = "happy",
  size = 64,
  className = "",
  priority = false,
}: {
  mood?: RevMood;
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  // Serve the original high-res PNG (unoptimized) so the optimizer can't hand back a stale or
  // downsampled copy; the browser scales it down crisply. Intrinsic size is at least 256px, and
  // CSS sets the on-screen size, so a small avatar never upscales a small file.
  const intrinsic = Math.max(256, size);
  return (
    <Image
      src={SRC}
      alt={ALT}
      width={intrinsic}
      height={intrinsic}
      quality={100}
      unoptimized
      priority={priority}
      className={`block shrink-0 rounded-full object-contain ${MOTION[mood]} ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

// Circular avatar with a maroon frame, for headers, badges, and chat bubbles.
export function RevAvatar({ mood = "happy", size = 48, ring = true }: { mood?: RevMood; size?: number; ring?: boolean }) {
  return (
    <span
      className={`inline-flex shrink-0 rounded-full border-2 border-maroon-800 bg-surface-muted ${
        ring ? "ring-2 ring-gold-300 ring-offset-2 ring-offset-surface" : ""
      }`}
      style={{ width: size, height: size }}
    >
      <Reveille mood={mood} size={size - 4} />
    </span>
  );
}

// The mascot saying something: avatar + speech bubble.
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
