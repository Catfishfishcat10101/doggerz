// src/config/storageKeys.js

export const LS = Object.freeze({
  AUTH: "doggerz-auth",
  ONBOARDING: "doggerz-onboarding",
  THEME: "doggerz-theme",
  ANALYTICS: "doggerz-analytics",
  ACCESSIBILITY: "doggerz-accessibility",
  DOG: "doggerz:dog", // 🐶 local dog object (used for name check, etc.)
});

export const SS = Object.freeze({
  returnTo: "doggerz:returnTo", // used for redirect logic post-auth
});

// Back-compat individual constants (optional)
export const AUTH_LOCAL_STORAGE_KEY = LS.AUTH;
export const ONBOARDING_LOCAL_STORAGE_KEY = LS.ONBOARDING;
export const THEME_LOCAL_STORAGE_KEY = LS.THEME;
export const ANALYTICS_LOCAL_STORAGE_KEY = LS.ANALYTICS;
export const ACCESSIBILITY_LOCAL_STORAGE_KEY = LS.ACCESSIBILITY;
export const DOG_LOCAL_STORAGE_KEY = LS.DOG;
