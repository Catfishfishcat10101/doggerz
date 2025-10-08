// src/config/storageKeys.js
export const LS = Object.freeze({
  AUTH: "doggerz-auth",
  ONBOARDING: "doggerz-onboarding",
  THEME: "doggerz-theme",
  ANALYTICS: "doggerz-analytics",
  ACCESSIBILITY: "doggerz-accessibility",
});

// Back-compat individual constants (same names you used before)
export const AUTH_LOCAL_STORAGE_KEY = LS.AUTH;
export const ONBOARDING_LOCAL_STORAGE_KEY = LS.ONBOARDING;
export const THEME_LOCAL_STORAGE_KEY = LS.THEME;
export const ANALYTICS_LOCAL_STORAGE_KEY = LS.ANALYTICS;
export const ACCESSIBILITY_LOCAL_STORAGE_KEY = LS.ACCESSIBILITY;
