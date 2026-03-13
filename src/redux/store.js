/** @format */

// src/redux/store.js

import { configureStore } from "@reduxjs/toolkit";

import dogReducer from "@/redux/dogSlice.js";
import { dogTickMiddleware } from "@/redux/middleware/dogTick.js";
import { heistMiddleware } from "@/redux/middleware/heistMiddleware.js";
import userReducer from "@/redux/userSlice.js";
import settingsReducer from "@/redux/settingsSlice.js";
import weatherReducer from "@/redux/weatherSlice.js";
import workflowsReducer from "@/redux/workflowSlice.js";
import {
  debugLog,
  isDebugLoggingEnabled,
  summarizeDogState,
} from "@/utils/debugLogger.js";

const isProd = import.meta.env.PROD;

const createDebugLoggingMiddleware = () => (storeApi) => (next) => (action) => {
  const enabled =
    isDebugLoggingEnabled(storeApi.getState()?.dog?.debug === true) ||
    storeApi.getState()?.dog?.debug === true;
  if (!enabled) return next(action);

  const prevState = storeApi.getState();
  const startedAt = performance.now();
  const result = next(action);
  const nextState = storeApi.getState();

  debugLog("Redux", "action", {
    type: action?.type || "unknown",
    payload: action?.payload,
    elapsedMs: Number((performance.now() - startedAt).toFixed(2)),
    dog: summarizeDogState(nextState),
    weather: {
      status: nextState?.weather?.status || null,
      zip: nextState?.weather?.zip || nextState?.user?.zip || null,
      lastFetchedAt: nextState?.weather?.lastFetchedAt || null,
    },
    routeRelevantChange:
      prevState?.dog?.lastAction !== nextState?.dog?.lastAction ||
      prevState?.dog?.isAsleep !== nextState?.dog?.isAsleep ||
      prevState?.weather?.status !== nextState?.weather?.status,
  });

  return result;
};

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
    }).concat(
      dogTickMiddleware,
      heistMiddleware,
      createDebugLoggingMiddleware()
    ),
  devTools: !isProd,
});

export default store;
