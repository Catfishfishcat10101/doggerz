// src/config/analytics.js
import { LS } from "./storageKeys.js";

export const ANALYTICS_OPTIONS = Object.freeze({
  ENABLED: "enabled",
  DISABLED: "disabled",
});
export const DEFAULT_ANALYTICS = ANALYTICS_OPTIONS.ENABLED;

export function isAnalyticsEnabled() {
  try {
    const v = localStorage.getItem(LS.ANALYTICS);
    return (v || DEFAULT_ANALYTICS) === ANALYTICS_OPTIONS.ENABLED;
  } catch {
    return DEFAULT_ANALYTICS === ANALYTICS_OPTIONS.ENABLED;
  }
}

// Minimal event map + tracker you can swap later
export const EVENTS = Object.freeze({ page_view: "page_view" });
export function track(event, payload) {
  if (!isAnalyticsEnabled()) return;
  if (import.meta.env.DEV) console.debug("[analytics]", event, payload);
}
