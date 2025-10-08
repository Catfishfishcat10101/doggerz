// src/config/app.js
export const COPYRIGHT = "Doggerz © 2025 — No grind. Just vibes.";
export const SUPPORT_EMAIL = "support@doggerz.app"; // change later
export const MAX_USERNAME_LEN = 24;
export const MIN_PASSWORD_LEN = 8;
export const NETWORK_TIMEOUT_MS = 15_000;

// Accessibility toggles (fallback defaults; UI can override)
export const ACCESSIBILITY_DEFAULTS = Object.freeze({
  reduceMotion: false,
  highContrast: true,
  focusVisibleAlways: true,
});
export const ACCESSIBILITY_LOCAL_STORAGE_KEY = "doggerz-accessibility";

// Local storage keys
export const AUTH_LOCAL_STORAGE_KEY = "doggerz-auth";
export const ONBOARDING_LOCAL_STORAGE_KEY = "doggerz-onboarding";
export const THEME_LOCAL_STORAGE_KEY = "doggerz-theme";
export const ANALYTICS_LOCAL_STORAGE_KEY = "doggerz-analytics";

// Theme options
export const THEMES = Object.freeze({
	LIGHT: "light",
	DARK: "dark",
	SYSTEM: "system",
});
export const DEFAULT_THEME = THEMES.DARK;

// Analytics options
export const ANALYTICS_OPTIONS = Object.freeze({
	ENABLED: "enabled",
	DISABLED: "disabled",
});
export const DEFAULT_ANALYTICS = ANALYTICS_OPTIONS.ENABLED;
