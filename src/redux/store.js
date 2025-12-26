// src/redux/store.js
// @ts-nocheck

import { configureStore } from "@reduxjs/toolkit";
// use your real reducers — these paths match the project's conventions
import dogReducer from "@/redux/dogSlice.js";
import userReducer from "@/redux/userSlice.js";
import settingsReducer from '@/redux/settingsSlice.js';
import weatherReducer from '@/redux/weatherSlice.js';

const store = configureStore({
  reducer: {
    dog: dogReducer,
    user: userReducer,
    settings: settingsReducer,
    weather: weatherReducer,
  },
});

export default store;
