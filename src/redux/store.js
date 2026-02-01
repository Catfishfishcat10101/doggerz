/** @format */

// src/redux/store.js

import { configureStore } from "@reduxjs/toolkit";

import dogReducer, {
  DOG_STORAGE_KEY,
  getDogStorageKey,
} from "@/redux/dogSlice.js";
import userReducer from "@/redux/userSlice.js";
import settingsReducer, {
  SETTINGS_STORAGE_KEY,
  hydrateSettings,
} from "@/redux/settingsSlice.js";
import weatherReducer from "@/redux/weatherSlice.js";
import workflowsReducer from "@/redux/workflowSlice.js";
import trainingTreeReducer from "@/redux/trainingTreeSlice.js";

function safeLoadJson(key) {
  try {
    if (typeof localStorage === "undefined") return undefined;
    const raw = localStorage.getItem(key);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function getPreloadedDogState() {
  const guestKey = getDogStorageKey(null);
  const parsed = safeLoadJson(guestKey) || safeLoadJson(DOG_STORAGE_KEY);
  if (!parsed) return undefined;
  // Reuse dogSlice's hydrate reducer to merge defaults + derive fields.
  return dogReducer(undefined, { type: "dog/hydrateDog", payload: parsed });
}

function getPreloadedSettingsState() {
  const parsed = safeLoadJson(SETTINGS_STORAGE_KEY);
  if (!parsed) return undefined;
  return settingsReducer(undefined, hydrateSettings(parsed));
}

const preloadedDog = getPreloadedDogState();
const preloadedSettings = getPreloadedSettingsState();

/**
 * Configure Redux store
 * Notes:
 * - If you have other reducers (ui, settings, auth, inventory, etc.), add them here.
 * - This file is intentionally conservative: no custom middleware unless you already use it.
 */
export const store = configureStore({
  reducer: {
    dog: dogReducer,
    user: userReducer,
    settings: settingsReducer,
    weather: weatherReducer,
    workflows: workflowsReducer,
    trainingTree: trainingTreeReducer,
  },
  preloadedState:
    preloadedDog || preloadedSettings
      ? {
          ...(preloadedDog ? { dog: preloadedDog } : {}),
          ...(preloadedSettings ? { settings: preloadedSettings } : {}),
        }
      : undefined,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
  devTools: import.meta?.env?.MODE !== "production",
});

export default store;
