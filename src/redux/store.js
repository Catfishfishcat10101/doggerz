/** @format */

// src/redux/store.js

import { configureStore } from "@reduxjs/toolkit";

import dogReducer from "@/redux/dogSlice.js";
import userReducer from "@/redux/userSlice.js";
import settingsReducer from "@/redux/settingsSlice.js";
import weatherReducer from "@/redux/weatherSlice.js";
import workflowsReducer from "@/redux/workflowSlice.js";
import trainingTreeReducer from "@/redux/trainingTreeSlice.js";

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
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
  devTools: import.meta?.env?.MODE !== "production",
});

export default store;
