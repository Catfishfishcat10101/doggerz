/** @format */

// src/redux/store.js

import { configureStore } from "@reduxjs/toolkit";

import dogReducer from "@/redux/dogSlice.js";
import userReducer from "@/redux/userSlice.js";
import settingsReducer from "@/redux/settingsSlice.js";
import weatherReducer from "@/redux/weatherSlice.js";
import workflowsReducer from "@/redux/workflowSlice.js";

const isProd = import.meta.env.PROD;

export const store = configureStore({
  reducer: {
    dog: dogReducer,
    user: userReducer,
    settings: settingsReducer,
    weather: weatherReducer,
    workflows: workflowsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActionPaths: ["meta.arg", "meta.baseQueryMeta"],
        warnAfter: 64,
      },
      immutableCheck: !isProd,
    }),
  devTools: !isProd,
});

export default store;
