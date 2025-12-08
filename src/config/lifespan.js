// src/config/lifespan.js
// Centralized lifespan tuning constants. Update these values to change the
// expected lifespan behavior across the app and the analysis scripts.

export const TARGET_EXPECTED_YEARS = 17;
// How many years beyond the expected lifespan we spread increased risk (in years)
export const AGE_RISK_WINDOW_YEARS = 3;
export const AGE_RISK_WINDOW_DAYS = AGE_RISK_WINDOW_YEARS * 365;
// Multiplier matching the original tuning in dogSlice
export const MULTIPLIER = 60;

// Factor for adaptive base probability calculation (used to derive baseProb)
export const BASE_PROB_FACTOR = 1.5;

export default {
  TARGET_EXPECTED_YEARS,
  AGE_RISK_WINDOW_YEARS,
  AGE_RISK_WINDOW_DAYS,
  MULTIPLIER,
  BASE_PROB_FACTOR,
};
