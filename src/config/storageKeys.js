// src/config/storageKeys.js

// Central registry of *every* LocalStorage key used by Doggerz.
// Using a single KEYS object prevents naming drift across the app.

export const LS = {
  AUTH_RETURN_TO: "doggerz:returnTo",       // where to redirect after login
  SETTINGS: "doggerz:settings",             // UI + accessibility settings
  GAME_STATE: "doggerz:game",               // session-level game progress
  THEME: "doggerz:theme",                   // selected theme
  ONBOARDING: "doggerz:onboarding",         // onboarding/tutorial state
  ANALYTICS: "doggerz:analytics",           // analytics opt-in
  ACCESSIBILITY: "doggerz:accessibility",   // contrast, font size, etc.
};

/* Optional: named exports for common keys */
export const AUTH_LOCAL_STORAGE_KEY = LS.AUTH_RETURN_TO;
export const ONBOARDING_LOCAL_STORAGE_KEY = LS.ONBOARDING;
export const THEME_LOCAL_STORAGE_KEY = LS.THEME;
export const ANALYTICS_LOCAL_STORAGE_KEY = LS.ANALYTICS;
export const ACCESSIBILITY_LOCAL_STORAGE_KEY = LS.ACCESSIBILITY;

// Export full registry for raw access
export { LS as STORAGE_KEYS };
