// Shared class recipes so buttons and surfaces stay consistent: solid colors, soft shadows, no gradients.

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0";

export const btn = {
  primary: `${base} bg-aggie px-4 py-2.5 text-cream-50 shadow-sm hover:-translate-y-0.5 hover:bg-maroon-700 hover:shadow-md dark:bg-maroon-600 dark:hover:bg-maroon-500`,
  secondary: `${base} border border-stone-200 bg-surface px-4 py-2.5 text-fg shadow-sm hover:-translate-y-0.5 hover:border-maroon-200 hover:bg-maroon-50`,
  ghost: `${base} px-3 py-2 text-fg-muted hover:bg-stone-100 hover:text-fg`,
  danger: `${base} bg-red-700 px-4 py-2.5 text-white shadow-sm hover:-translate-y-0.5 hover:bg-red-900 hover:shadow-md`,
  gold: `${base} bg-gold-400 px-4 py-2.5 text-maroon-900 shadow-sm hover:-translate-y-0.5 hover:bg-gold-300 hover:shadow-md`,
  onMaroon: `${base} bg-cream-50 px-4 py-2.5 text-aggie shadow-sm hover:-translate-y-0.5 hover:bg-gold-50`,
  onMaroonGhost: `${base} border border-white/30 px-4 py-2.5 text-cream-50 hover:bg-white/10`,
};

export const surface = "rounded-2xl border border-stone-200 bg-surface shadow-sm";

// Clickable cards: gentle lift on hover.
export const interactiveSurface = `${surface} transition-all duration-200 hover:-translate-y-0.5 hover:border-maroon-200 hover:shadow-md`;

// Tactile "3D" choice cards: a thicker bottom edge that presses down when selected.
export const choiceCard = (selected: boolean) =>
  `relative rounded-2xl border-2 border-b-[5px] text-left transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
    selected
      ? "translate-y-[2px] border-aggie border-b-[3px] bg-maroon-50 shadow-none dark:border-maroon-400"
      : "border-stone-200 border-b-stone-300 bg-surface shadow-sm enabled:hover:-translate-y-0.5 enabled:hover:border-maroon-200 enabled:hover:border-b-maroon-300 enabled:hover:shadow-md"
  }`;

export const input =
  "w-full rounded-xl border border-stone-200 bg-surface px-3.5 py-2.5 text-sm text-fg placeholder:text-stone-400 transition-all duration-200 focus:border-maroon-300 focus:outline-none focus:ring-2 focus:ring-maroon-100 disabled:opacity-60";

export const chip = "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium";
export const chipMaroon = `${chip} bg-maroon-50 text-accent ring-1 ring-inset ring-maroon-100`;
export const chipGold = `${chip} bg-gold-50 text-gold-700 ring-1 ring-inset ring-gold-200`;
export const chipGreen = `${chip} bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200`;
export const chipNeutral = `${chip} bg-stone-100 text-stone-600`;

export const iconTile = "flex items-center justify-center rounded-xl bg-maroon-50 text-accent ring-1 ring-inset ring-maroon-100";
