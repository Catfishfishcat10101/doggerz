// src/store/weatherSlice.js
// src/redux/weatherSlice.js
// Lightweight weather state (local, not persisted to cloud yet)
// condition: 'sun' | 'cloud' | 'rain' | 'snow' | 'unknown'

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  condition: "unknown",
  intensity: "medium",
  status: "idle", // idle | loading | ok | error | disabled
  lastChangedAt: Date.now(),
  lastFetchedAt: null,
  zip: null,
  source: "none", // none | openweather | openmeteo
  details: null,
  error: null,
};

const order = ["sun", "cloud", "rain", "snow"];

const weatherSlice = createSlice({
  name: "weather",
  initialState,
  reducers: {
    setWeather(state, { payload }) {
      const next = String(payload?.condition || "").toLowerCase();
      if (!next) return;
      if (state.condition !== next) {
        state.condition = next;
        state.lastChangedAt = Date.now();
      }
      if (payload?.intensity) {
        state.intensity = String(payload.intensity);
      }
    },
    setWeatherLoading(state, { payload }) {
      state.status = "loading";
      state.error = null;
      if (payload?.zip != null) {
        state.zip = String(payload.zip || "").trim() || state.zip;
      }
    },
    setWeatherSnapshot(state, { payload }) {
      const nextCondition = String(
        payload?.condition || "unknown"
      ).toLowerCase();
      const nextSource = String(payload?.source || "none").toLowerCase();
      const fetchedAt = Number(payload?.fetchedAt) || Date.now();
      const nextIntensity = String(payload?.intensity || "medium");

      state.lastFetchedAt = fetchedAt;
      state.zip = payload?.zip || state.zip;
      state.source = nextSource;
      state.details = payload?.details || null;
      state.error = payload?.error || null;
      state.status = nextSource === "none" ? "disabled" : "ok";
      state.intensity = nextIntensity;

      if (state.condition !== nextCondition) {
        state.condition = nextCondition;
        state.lastChangedAt = Date.now();
      }
    },
    setWeatherError(state, { payload }) {
      state.status = "error";
      state.error = String(payload || "Weather fetch failed");
    },
    cycleWeather(state) {
      const idx = order.indexOf(state.condition);
      state.condition = order[(idx + 1) % order.length];
      state.lastChangedAt = Date.now();
    },
  },
});

export const {
  setWeather,
  setWeatherLoading,
  setWeatherSnapshot,
  setWeatherError,
  cycleWeather,
} = weatherSlice.actions;
export const selectWeatherCondition = (s) => s.weather.condition;
export const selectWeatherIntensity = (s) => s.weather.intensity;
export const selectWeatherStatus = (s) => s.weather.status;
export const selectWeatherDetails = (s) => s.weather.details;
export const selectWeatherError = (s) => s.weather.error;
export const selectWeatherZip = (s) => s.weather.zip;
export const selectWeatherLastFetchedAt = (s) => s.weather.lastFetchedAt;
export default weatherSlice.reducer;
