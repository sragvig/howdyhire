// Shared class recipes so buttons and surfaces stay consistent across the app.

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50";

export const btn = {
  primary: `${base} bg-gradient-to-b from-maroon-600 to-aggie px-4 py-2.5 text-white shadow-lg shadow-maroon-950/50 ring-1 ring-inset ring-white/15 hover:from-maroon-500 hover:to-maroon-700 hover:shadow-maroon-700/40 disabled:hover:from-maroon-600 disabled:hover:to-aggie`,
  secondary: `${base} border border-line bg-white/5 px-4 py-2.5 text-fg hover:border-line-strong hover:bg-white/10`,
  ghost: `${base} px-3 py-2 text-fg-muted hover:bg-white/5 hover:text-fg`,
  danger: `${base} bg-gradient-to-b from-red-500 to-red-700 px-4 py-2.5 text-white shadow-lg shadow-red-950/40 ring-1 ring-inset ring-white/15 hover:from-red-400 hover:to-red-600`,
  onMaroon: `${base} bg-white px-4 py-2.5 text-aggie shadow-lg shadow-black/20 hover:bg-gold-200`,
  onMaroonGhost: `${base} border border-white/25 px-4 py-2.5 text-white hover:border-white/40 hover:bg-white/10`,
};

export const surface =
  "rounded-2xl border border-line bg-surface shadow-xl shadow-black/20 backdrop-blur-md print:shadow-none print:backdrop-blur-none";

// For cards the user can pick or click: lift + maroon glow on hover.
export const interactiveSurface = `${surface} transition-all duration-300 hover:-translate-y-0.5 hover:border-maroon-400/40 hover:shadow-maroon-900/30`;

export const input =
  "w-full rounded-xl border border-line bg-white/5 px-3.5 py-2.5 text-sm text-fg placeholder:text-fg-subtle transition-all duration-300 focus:border-maroon-400/60 focus:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-maroon-500/30 disabled:opacity-60";

export const chip = "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium";
export const chipMaroon = `${chip} bg-maroon-500/15 text-accent ring-1 ring-inset ring-maroon-400/25`;
export const chipGold = `${chip} bg-gold-400/15 text-gold ring-1 ring-inset ring-gold-400/30`;
export const chipNeutral = `${chip} bg-white/5 text-fg-muted ring-1 ring-inset ring-white/10`;
