// src/features/weather/RealTimeWeatherFetcher.js
//src/logic/RealTimeWeatherFetcher.js
import { fetchWeatherSnapshot } from "@/lib/weatherApi.js";
import {
  loadLocalSave,
  saveLocalSave,
} from "@/lib/storage/LocalSaveManager.js";
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

function normalizeWeatherSnapshot(snapshot, fallback = {}) {
  const base = snapshot && typeof snapshot === "object" ? snapshot : {};

  return {
    condition: base.condition || "unknown",
    intensity: base.intensity || "medium",
    zip: base.zip ?? fallback.zip ?? null,
    fetchedAt: Number(base.fetchedAt) > 0 ? Number(base.fetchedAt) : Date.now(),
    source: base.source || "network",
    details: base.details ?? null,
    error: base.error ?? null,
    disabled: Boolean(base.disabled),
    ...base,
  };
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
  const effectiveCacheTtlMs = Number.isFinite(Number(cacheTtlMs))
    ? Math.max(0, Number(cacheTtlMs))
    : DEFAULT_WEATHER_CACHE_TTL_MS;
  if (!effectiveZip && !effectiveCoords) {
    debugWarn(
      "Weather",
      "weather fetch skipped because no valid location is available"
    );
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
    cacheTtlMs: effectiveCacheTtlMs,
  });
  if (!forceRefresh) {
    const cached = await loadCachedWeatherSnapshot({
      zip: effectiveZip,
      coords: effectiveCoords,
    });
    if (cached && isFresh(cached, effectiveCacheTtlMs)) {
      debugLog("Weather", "using fresh cache", {
        zip: effectiveZip,
        coords: effectiveCoords,
        fetchedAt: cached?.fetchedAt || null,
      });
      return { ...cached, fromCache: true };
    }
  }

  try {
    const snapshot = normalizeWeatherSnapshot(
      await fetchWeatherSnapshot({
        zip: effectiveZip,
        coords: effectiveCoords,
        signal,
      }),
      { zip: effectiveZip }
    );
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
    if (error?.name === "AbortError") {
      throw error;
    }

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
