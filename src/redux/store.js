/** @format */

// src/redux/store.js

import { configureStore } from "@reduxjs/toolkit";

import dogReducer from "@/redux/dogSlice.js";
import userReducer from "@/redux/userSlice.js";
import settingsReducer from "@/redux/settingsSlice.js";
import weatherReducer from "@/redux/weatherSlice.js";
import workflowsReducer from "@/redux/workflowSlice.js";
import trainingTreeReducer from "@/redux/trainingTreeSlice.js";

const isProd = import.meta.env.PROD;

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
      immutableCheck: !isProd,
      actionCreatorCheck: false,
    }),
  devTools: !isProd,
});

export default store;
