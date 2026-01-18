/** @format */

// src/redux/store.js

import { configureStore } from "@reduxjs/toolkit";

import dogReducer, { DOG_STORAGE_KEY } from "@/redux/dogSlice.js";
import userReducer from "@/redux/userSlice.js";
import settingsReducer from "@/redux/settingsSlice.js";
import weatherReducer from "@/redux/weatherSlice.js";
import workflowsReducer from "@/redux/workflowSlice.js";
import trainingTreeReducer from "@/redux/trainingTreeSlice.js";

function getPreloadedDogState() {
  try {
    if (typeof localStorage === "undefined") return undefined;
    const raw = localStorage.getItem(DOG_STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return undefined;
    // Reuse dogSlice's hydrate reducer to merge defaults + derive fields.
    return dogReducer(undefined, { type: "dog/hydrateDog", payload: parsed });
  } catch {
    return undefined;
  }
}

const preloadedDog = getPreloadedDogState();

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
  preloadedState: preloadedDog ? { dog: preloadedDog } : undefined,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
  devTools: import.meta?.env?.MODE !== "production",
});

export default store;
