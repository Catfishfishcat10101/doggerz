// src/redux/store.js
// Doggerz: Central Redux store setup. Usage:
// import { store } from "@/redux/store.js"
// Extensible: Add new slices to the reducer object as needed.
// Reducer keys must match selector usage (e.g., selectUser(state) → user slice).
// @ts-nocheck

import { configureStore } from "@reduxjs/toolkit";
import dogReducer from "./dogSlice.js";
import userReducer from "./userSlice.js";
import weatherReducer from "./weatherSlice.js";

/**
 * Configure and export the Redux store for Doggerz.
 * Add new slices to the reducer object for extensibility.
 */
export const store = configureStore({
  reducer: {
    dog: dogReducer,
    user: userReducer, // 👈 must stay "user" because selectUser = state.user
    weather: weatherReducer,
    // Add new slices here as needed
  },
  // If you want to be explicit:
  // devTools: import.meta.env.DEV,
});

// Optional: type helpers if you decide to add TypeScript later
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
