/** @format */

// src/store/store.js

import { configureStore } from "@reduxjs/toolkit";

import dogReducer from "@/store/dogSlice.js";
import { dogTickMiddleware } from "@/store/middleware/dogTick.js";
import { trainingReactionMiddleware } from "@/store/middleware/trainingReactionMiddleware.js";
import userReducer from "@/store/userSlice.js";
import settingsReducer from "@/store/settingsSlice.js";
import weatherReducer from "@/store/weatherSlice.js";
import workflowsReducer from "@/store/workflowSlice.js";
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
      trainingReactionMiddleware,
      createDebugLoggingMiddleware()
    ),
  devTools: !isProd,
});

export default store;
