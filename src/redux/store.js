// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import dogReducer from "./dogSlice.js";
import userReducer from "./userSlice.js";

/** Global Redux store */
export const store = configureStore({
  reducer: {
    dog: dogReducer,
    user: userReducer,
  },
  devTools: import.meta.env.MODE !== "production",
});

// Optional helpers (uncomment if you want handy types via JSDoc in JS projects):
/**
 * @returns {import('@reduxjs/toolkit').EnhancedStore['getState']}
 */
// export const getState = () => store.getState();
/**
 * @type {import('@reduxjs/toolkit').EnhancedStore['dispatch']}
 */
// export const dispatch = store.dispatch;