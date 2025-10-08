// src/config/accessibility.js
import { LS } from "./storageKeys.js";

export const ACCESSIBILITY_DEFAULTS = Object.freeze({
  reduceMotion: false,
  highContrast: true,
  focusVisibleAlways: true,
});

export function loadAccessibility() {
  try {
    const raw = localStorage.getItem(LS.ACCESSIBILITY);
    return raw ? { ...ACCESSIBILITY_DEFAULTS, ...JSON.parse(raw) } : { ...ACCESSIBILITY_DEFAULTS };
  } catch {
    return { ...ACCESSIBILITY_DEFAULTS };
  }
}

export function saveAccessibility(a11y) {
  try { localStorage.setItem(LS.ACCESSIBILITY, JSON.stringify(a11y)); } catch {}
}
