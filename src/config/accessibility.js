/**src/config/accessibility.js */

const STORE_KEY = "doggerz:accessibility";

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const ACCESSIBILITY_DEFAULTS = {
  // Based on your photophobia note: start glare-safe true and motion reduced.
  glareSafe: true,
  reducedMotion: prefersReducedMotion ?? true,
  highContrast: false,
  largeText: false, // toggles root font-size bump
};

function readStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStore(state) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    // no-op
  }
}

function setClass(cond, className) {
  const el = document.documentElement;
  if (!el) return;
  el.classList.toggle(className, !!cond);
}

function applyCSSVars(state) {
  const root = document.documentElement;
  if (!root) return;

  // Large text: bump base font size slightly (works well with Tailwind rems)
  root.style.setProperty("--doggerz-fontScale", state.largeText ? "1.125" : "1");

  // Glare-safe: slightly lower max luminance & saturation you can use in Tailwind via var()
  root.style.setProperty("--doggerz-contrastBoost", state.highContrast ? "1.2" : "1");
  root.style.setProperty("--doggerz-glareFilter", state.glareSafe ? "contrast(0.95) brightness(0.95)" : "none");
}

/** Apply classes that Tailwind can key on via `@layer utilities` (optional) */
function applyUtilityClasses(state) {
  setClass(state.reducedMotion, "reduce-motion");
  setClass(state.highContrast, "theme-hc");
  setClass(state.glareSafe, "glare-safe");
  setClass(state.largeText, "text-lg-root");
}

/** Merge, persist, and apply */
export function initAccessibility(partial = {}) {
  const state = { ...ACCESSIBILITY_DEFAULTS, ...(readStore() || {}), ...(partial || {}) };
  applyCSSVars(state);
  applyUtilityClasses(state);
  writeStore(state);
  return state;
}

export function getAccessibility() {
  return { ...ACCESSIBILITY_DEFAULTS, ...(readStore() || {}) };
}

export function updateAccessibility(patch) {
  const next = { ...getAccessibility(), ...(patch || {}) };
  applyCSSVars(next);
  applyUtilityClasses(next);
  writeStore(next);
  return next;
}

/** Convenience toggles */
export const setReducedMotion = (v) => updateAccessibility({ reducedMotion: !!v });
export const setHighContrast  = (v) => updateAccessibility({ highContrast: !!v });
export const setGlareSafe     = (v) => updateAccessibility({ glareSafe: !!v });
export const setLargeText     = (v) => updateAccessibility({ largeText: !!v });

/**
 * Hook helper (no React import here): call in your app entry, e.g. in main.jsx:
 *   import { initAccessibility } from "@/config/accessibility";
 *   initAccessibility();
 */
