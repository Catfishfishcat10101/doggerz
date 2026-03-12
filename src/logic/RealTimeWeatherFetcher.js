/** @format */

import { fetchWeatherSnapshot } from "@/lib/weatherApi.js";
import { loadLocalSave, saveLocalSave } from "@/logic/LocalSaveManager.js";
import { debugError, debugLog, debugWarn } from "@/utils/debugLogger.js";

const WEATHER_CACHE_KEY_PREFIX = "doggerz:weather:";
const DEFAULT_WEATHER_CACHE_TTL_MS = 10 * 60_000;

function normalizeZip(zip) {
  const raw = String(zip || "").trim();
  return /^\d{5}$/.test(raw) ? raw : null;
}

function normalizeCoords(coords) {
  const lat = Number(coords?.latitude ?? coords?.lat);
  const lon = Number(coords?.longitude ?? coords?.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return {
    latitude: Number(lat.toFixed(3)),
    longitude: Number(lon.toFixed(3)),
  };
}

function getWeatherCacheScope({ zip, coords }) {
  const normalizedCoords = normalizeCoords(coords);
  if (normalizedCoords) {
    return `coords:${normalizedCoords.latitude},${normalizedCoords.longitude}`;
  }
  return normalizeZip(zip) || "unset";
}

function getWeatherCacheKey({ zip, coords }) {
  return `${WEATHER_CACHE_KEY_PREFIX}${getWeatherCacheScope({ zip, coords })}`;
}

function isFresh(snapshot, ttlMs) {
  const fetchedAt = Number(snapshot?.fetchedAt || 0);
  return fetchedAt > 0 && Date.now() - fetchedAt <= ttlMs;
}

export async function loadCachedWeatherSnapshot({ zip, coords } = {}) {
  const snapshot = await loadLocalSave(
    getWeatherCacheKey({ zip, coords }),
    null
  );
  if (snapshot) {
    debugLog("Weather", "loaded cached snapshot", {
      zip: normalizeZip(zip),
      coords: normalizeCoords(coords),
      fetchedAt: snapshot?.fetchedAt || null,
    });
  }
  return snapshot;
}

export async function saveCachedWeatherSnapshot(
  { zip, coords } = {},
  snapshot
) {
  if (!snapshot || typeof snapshot !== "object") return false;
  return saveLocalSave(getWeatherCacheKey({ zip, coords }), snapshot);
}

export async function fetchRealTimeWeather({
  zip,
  coords,
  signal,
  cacheTtlMs = DEFAULT_WEATHER_CACHE_TTL_MS,
  forceRefresh = false,
} = {}) {
  const effectiveZip = normalizeZip(zip);
  const effectiveCoords = normalizeCoords(coords);
  if (!effectiveZip && !effectiveCoords) {
    debugWarn("Weather", "weather fetch skipped because zip is unavailable");
    return {
      condition: "unknown",
      intensity: "medium",
      zip: null,
      fetchedAt: Date.now(),
      source: "none",
      details: null,
      error: "Weather ZIP unavailable",
      disabled: true,
    };
  }
  debugLog("Weather", "fetch requested", {
    zip: effectiveZip,
    coords: effectiveCoords,
    forceRefresh,
    cacheTtlMs,
  });
  if (!forceRefresh) {
    const cached = await loadCachedWeatherSnapshot({
      zip: effectiveZip,
      coords: effectiveCoords,
    });
    if (cached && isFresh(cached, cacheTtlMs)) {
      debugLog("Weather", "using fresh cache", {
        zip: effectiveZip,
        coords: effectiveCoords,
        fetchedAt: cached?.fetchedAt || null,
      });
      return { ...cached, fromCache: true };
    }
  }

  try {
    const snapshot = await fetchWeatherSnapshot({
      zip: effectiveZip,
      coords: effectiveCoords,
      signal,
    });
    await saveCachedWeatherSnapshot(
      { zip: effectiveZip, coords: effectiveCoords },
      snapshot
    );
    debugLog("Weather", "network fetch succeeded", {
      zip: effectiveZip,
      coords: effectiveCoords,
      fetchedAt: snapshot?.fetchedAt || null,
      condition: snapshot?.condition || null,
    });
    return { ...snapshot, fromCache: false };
  } catch (error) {
    const cached = await loadCachedWeatherSnapshot({
      zip: effectiveZip,
      coords: effectiveCoords,
    });
    if (cached) {
      debugWarn(
        "Weather",
        "network fetch failed, falling back to stale cache",
        {
          zip: effectiveZip,
          coords: effectiveCoords,
          error: error?.message || "Weather fetch failed",
        }
      );
      return {
        ...cached,
        fromCache: true,
        stale: true,
        error: error?.message || "Weather fetch failed",
      };
    }
    debugError("Weather", "network fetch failed with no cache", {
      zip: effectiveZip,
      coords: effectiveCoords,
      error: error?.message || "Weather fetch failed",
    });
    throw error;
  }
}
