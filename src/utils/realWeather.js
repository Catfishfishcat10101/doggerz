// src/utils/realWeather.js
// @ts-nocheck

const LS_KEY = "doggerz.weather.cache";
const TTL_MS = 10 * 60 * 1000; // 10 minutes

function loadCache() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCache(cache) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(cache));
  } catch {
    // ignore write failures (quota, privacy settings)
  }
}

function mapWeather(json) {
  if (!json) return null;
  const c = json.main && json.main.temp - 273.15;
  const tempC = Number.isFinite(c) ? Math.round(c) : null;
  const tempF = tempC != null ? Math.round((tempC * 9) / 5 + 32) : null;
  const condition =
    (json.weather && json.weather[0] && json.weather[0].main) || "Clear";
  const description =
    (json.weather && json.weather[0] && json.weather[0].description) ||
    "clear sky";
  const icon =
    (json.weather && json.weather[0] && json.weather[0].icon) || "01d";
  const isDay = icon.endsWith("d");
  return { tempC, tempF, condition, description, icon, isDay, raw: json };
}

export async function fetchWeatherByZip(zip, { country = "US" } = {}) {
  const key = (zip || "").toString().trim();
  if (!key) return null;

  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
  if (!apiKey) {
    // No API key; fail gracefully with null
    if (import.meta.env.DEV) {
      console.warn(
        "[Weather] Missing VITE_OPENWEATHER_API_KEY, skipping fetch.",
      );
    }
    return null;
  }

  const cacheKey = `${key}-${country}`;
  const cache = loadCache();
  const entry = cache[cacheKey];
  if (entry && Date.now() - entry.when < TTL_MS) {
    return entry.data;
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?zip=${encodeURIComponent(
    key,
  )},${encodeURIComponent(country)}&appid=${encodeURIComponent(apiKey)}`;

  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const data = mapWeather(json);
    cache[cacheKey] = { when: Date.now(), data };
    saveCache(cache);
    return data;
  } catch (err) {
    if (import.meta.env.DEV) console.warn("[Weather] fetch failed:", err);
    return null;
  }
}
