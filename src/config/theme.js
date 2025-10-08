// Central theming tokens (tailwind-friendly but JS-first for logic/UI copy).
export const COLORS = Object.freeze({
  bg: "bg-zinc-950",
  text: "text-zinc-100",
  muted: "text-zinc-400",
  card: "bg-zinc-900/60",
  border: "border-zinc-800/70",
  success: "text-emerald-400",
  danger: "text-red-400",
  warning: "text-amber-300",
});

export const RADII = Object.freeze({
  sm: "rounded-md",
  md: "rounded-xl",
  lg: "rounded-2xl",
});

export const EASING = Object.freeze({
  out: "cubic-bezier(0.16, 1, 0.3, 1)",
});

export const DURATION = Object.freeze({
  fast: 120,
  medium: 200,
  slow: 320,
});

// Derived UI strings (keep copy centralized)
export const COPY = Object.freeze({
  offlineReady: "Ready to work offline.",
  updateAvailable: "Update available. Reload to apply?",
});

