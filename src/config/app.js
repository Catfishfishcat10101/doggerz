// src/config/app.js

// Basic app meta
export { APP_COPYRIGHT as COPYRIGHT, SUPPORT_EMAIL } from "./seo.js";

// Environment / network config
export { NETWORK_TIMEOUT_MS } from "./env.js";

// Accessibility preferences & helpers
export {
  ACCESSIBILITY_DEFAULTS,
  loadAccessibility,
  saveAccessibility,
} from "./accessibility.js";

// LocalStorage keys (central registry)
export {
  LS as STORAGE_KEYS,
  AUTH_LOCAL_STORAGE_KEY,
  ONBOARDING_LOCAL_STORAGE_KEY,
  THEME_LOCAL_STORAGE_KEY,
  ANALYTICS_LOCAL_STORAGE_KEY,
  ACCESSIBILITY_LOCAL_STORAGE_KEY,
} from "./storageKeys.js";

// Theme configuration
export { THEMES, DEFAULT_THEME } from "./theme.js";

// Analytics configuration + tracker
export {
  ANALYTICS_OPTIONS,
  DEFAULT_ANALYTICS,
  EVENTS,
  track,
} from "./analytics.js";
