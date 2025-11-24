// src/redux/weatherSlice.js
// Lightweight weather state (local, not persisted to cloud yet)
// condition: 'sun' | 'rain' | 'snow'

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  condition: "sun",
  lastChangedAt: Date.now(),
};

const order = ["sun", "rain", "snow"];

const weatherSlice = createSlice({
  name: "weather",
  initialState,
  reducers: {
    setWeather(state, { payload }) {
      if (!payload || !payload.condition) return;
      state.condition = payload.condition;
      state.lastChangedAt = Date.now();
    },
    cycleWeather(state) {
      const idx = order.indexOf(state.condition);
      state.condition = order[(idx + 1) % order.length];
      state.lastChangedAt = Date.now();
    },
  },
});

export const { setWeather, cycleWeather } = weatherSlice.actions;
export const selectWeatherCondition = (s) => s.weather.condition;
export default weatherSlice.reducer;
