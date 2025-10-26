// src/config/app.js
export { APP_COPYRIGHT as COPYRIGHT, SUPPORT_EMAIL } from "./seo.js";
export { NETWORK_TIMEOUT_MS } from "./env.js";

export {
  ACCESSIBILITY_DEFAULTS,
  loadAccessibility,
  saveAccessibility,
} from "./accessibility.js";

export {
  LS as STORAGE_KEYS,
  AUTH_LOCAL_STORAGE_KEY,
  ONBOARDING_LOCAL_STORAGE_KEY,
  THEME_LOCAL_STORAGE_KEY,
  ANALYTICS_LOCAL_STORAGE_KEY,
  ACCESSIBILITY_LOCAL_STORAGE_KEY,
} from "./storageKeys.js";

export { THEMES, DEFAULT_THEME } from "./theme.js";

export {
  ANALYTICS_OPTIONS,
  DEFAULT_ANALYTICS,
  EVENTS,
  track,
} from "./analytics.js";
