/** @format */

import { fetchWeatherSnapshot } from "@/lib/weatherApi.js";
import { loadLocalSave, saveLocalSave } from "@/logic/LocalSaveManager.js";

const WEATHER_CACHE_KEY_PREFIX = "doggerz:weather:";
const DEFAULT_WEATHER_CACHE_TTL_MS = 10 * 60_000;

function normalizeZip(zip) {
  return (
    String(zip || "").trim() ||
    String(import.meta.env.VITE_WEATHER_DEFAULT_ZIP || "").trim() ||
    "10001"
  );
}

function getWeatherCacheKey(zip) {
  return `${WEATHER_CACHE_KEY_PREFIX}${normalizeZip(zip)}`;
}

function isFresh(snapshot, ttlMs) {
  const fetchedAt = Number(snapshot?.fetchedAt || 0);
  return fetchedAt > 0 && Date.now() - fetchedAt <= ttlMs;
}

export async function loadCachedWeatherSnapshot(zip) {
  return loadLocalSave(getWeatherCacheKey(zip), null);
}

export async function saveCachedWeatherSnapshot(zip, snapshot) {
  if (!snapshot || typeof snapshot !== "object") return false;
  return saveLocalSave(getWeatherCacheKey(zip), snapshot);
}

export async function fetchRealTimeWeather({
  zip,
  signal,
  cacheTtlMs = DEFAULT_WEATHER_CACHE_TTL_MS,
  forceRefresh = false,
} = {}) {
  const effectiveZip = normalizeZip(zip);
  if (!forceRefresh) {
    const cached = await loadCachedWeatherSnapshot(effectiveZip);
    if (cached && isFresh(cached, cacheTtlMs)) {
      return { ...cached, fromCache: true };
    }
  }

  try {
    const snapshot = await fetchWeatherSnapshot({
      zip: effectiveZip,
      signal,
    });
    await saveCachedWeatherSnapshot(effectiveZip, snapshot);
    return { ...snapshot, fromCache: false };
  } catch (error) {
    const cached = await loadCachedWeatherSnapshot(effectiveZip);
    if (cached) {
      return {
        ...cached,
        fromCache: true,
        stale: true,
        error: error?.message || "Weather fetch failed",
      };
    }
    throw error;
  }
}
