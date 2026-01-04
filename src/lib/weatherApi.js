// src/lib/weatherApi.js
// Browser-side helper for real weather calls (OpenWeather-style).
// Currently safe to import even if you never call it.

import { getEnv } from "./env.js";

const OPEN_WEATHER_BASE = "https://api.openweathermap.org/data/2.5/weather";

/**
 * Fetch current weather by ZIP (US by default).
 * Returns a normalized shape focusing on the parts Doggerz cares about.
 */
export async function fetchWeatherByZip(zip, country = "US") {
  const apiKey = getEnv("VITE_OPENWEATHER_API_KEY");
  if (!apiKey) {
    console.warn(
      "[Doggerz] No VITE_OPENWEATHER_API_KEY; using fallback clear weather."
    );
    return {
      tempK: 293.15,
      condition: "clear",
      raw: null,
    };
  }

  const url = `${OPEN_WEATHER_BASE}?zip=${encodeURIComponent(
    zip
  )},${country}&appid=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) {
    console.warn("[Doggerz] Weather request failed:", res.status);
    return {
      tempK: 293.15,
      condition: "clear",
      raw: null,
    };
  }

  const json = await res.json();
  const condition = (json.weather?.[0]?.main || "Clear").toLowerCase();

  return {
    tempK: json.main?.temp ?? 293.15,
    condition,
    raw: json,
  };
}
