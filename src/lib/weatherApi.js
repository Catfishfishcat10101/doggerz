// src/lib/weatherApi.js

import { createTimeoutSignal } from "@/utils/abortSignal.js";

export const WEATHER_REQUEST_TIMEOUT_MS = 5000;

function toFiniteCoordinate(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Number(n.toFixed(5)) : null;
}

function isUsableOpenWeatherKey(key) {
  const k = String(key || "").trim();
  if (!k) return false;
  const upper = k.toUpperCase();
  if (upper === "CHANGE_ME" || upper === "CHANGEME") return false;
  if (upper === "YOUR_API_KEY" || upper === "YOUR_API_KEY_HERE") return false;
  if (upper === "REPLACE_ME" || upper === "REPLACEME") return false;
  if (upper.startsWith("EXAMPLE")) return false;
  return true;
}

function normalizeConditionFromOpenWeather(data) {
  const items = Array.isArray(data?.weather) ? data.weather : [];
  const mains = items
    .map((w) => String(w?.main || "").toLowerCase())
    .filter(Boolean);
  const descriptions = items
    .map((w) => String(w?.description || "").toLowerCase())
    .filter(Boolean);

  if (
    mains.some((m) => m === "thunderstorm" || m === "drizzle" || m === "rain")
  ) {
    return "rain";
  }
  if (mains.some((m) => m === "snow")) return "snow";
  if (mains.some((m) => m === "clouds")) return "cloud";

  if (
    mains.some(
      (m) =>
        m === "mist" ||
        m === "smoke" ||
        m === "haze" ||
        m === "dust" ||
        m === "fog" ||
        m === "sand" ||
        m === "ash" ||
        m === "squall" ||
        m === "tornado"
    )
  ) {
    return "cloud";
  }

  if (descriptions.some((d) => d.includes("cloud") || d.includes("overcast"))) {
    return "cloud";
  }

  if (mains.some((m) => m === "clear")) {
    const cloudsPct = Number(data?.clouds?.all);
    if (Number.isFinite(cloudsPct) && cloudsPct >= 25) return "cloud";
    return "sun";
  }

  const cloudsPct = Number(data?.clouds?.all);
  if (Number.isFinite(cloudsPct)) return cloudsPct >= 25 ? "cloud" : "sun";

  return "unknown";
}

function normalizeIntensityFromOpenWeather(data) {
  const items = Array.isArray(data?.weather) ? data.weather : [];
  const mains = items
    .map((w) => String(w?.main || "").toLowerCase())
    .filter(Boolean);
  const descriptions = items
    .map((w) => String(w?.description || "").toLowerCase())
    .filter(Boolean);

  if (mains.some((m) => m === "thunderstorm")) return "heavy";
  if (mains.some((m) => m === "drizzle")) return "light";
  if (mains.some((m) => m === "rain")) {
    if (
      descriptions.some((d) => d.includes("heavy") || d.includes("torrential"))
    ) {
      return "heavy";
    }
    if (
      descriptions.some((d) => d.includes("light") || d.includes("drizzle"))
    ) {
      return "light";
    }
    return "medium";
  }
  if (mains.some((m) => m === "snow")) {
    if (descriptions.some((d) => d.includes("heavy"))) return "heavy";
    if (descriptions.some((d) => d.includes("light"))) return "light";
    return "medium";
  }

  return "medium";
}

function normalizeConditionFromMeteoCode(code) {
  const c = Number(code);
  if (!Number.isFinite(c)) return "unknown";
  if (c === 0) return "sun";
  if ([1, 2, 3, 45, 48].includes(c)) return "cloud";
  if ([71, 73, 75, 77, 85, 86].includes(c)) return "snow";
  if (
    [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(c)
  ) {
    return "rain";
  }
  return "unknown";
}

function normalizeIntensityFromMeteoCode(code) {
  const c = Number(code);
  if (!Number.isFinite(c)) return "medium";
  if ([51, 53, 55, 56, 57].includes(c)) return "light";
  if ([61, 63, 65, 66, 67].includes(c)) return c >= 65 ? "heavy" : "medium";
  if ([80, 81, 82, 95, 96, 99].includes(c))
    return c === 80 ? "medium" : "heavy";
  if ([71, 73, 75, 77, 85, 86].includes(c)) return c >= 75 ? "heavy" : "medium";
  return "medium";
}

async function fetchLatLonForZip(zip, signal) {
  const url = `https://api.zippopotam.us/us/${encodeURIComponent(zip)}`;
  const request = createTimeoutSignal({
    parentSignal: signal,
    timeoutMs: WEATHER_REQUEST_TIMEOUT_MS,
    message: `ZIP lookup timed out after ${WEATHER_REQUEST_TIMEOUT_MS}ms`,
  });
  try {
    const resp = await fetch(url, { signal: request.signal });
    if (!resp.ok) throw new Error(`ZIP lookup failed ${resp.status}`);
    const data = await resp.json();
    const place = Array.isArray(data?.places) ? data.places[0] : null;
    const lat = Number(place?.latitude);
    const lon = Number(place?.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      throw new Error("ZIP lookup missing coordinates");
    }
    return {
      lat,
      lon,
      name:
        typeof place?.["place name"] === "string" ? place["place name"] : null,
    };
  } finally {
    request.cleanup();
  }
}

function buildOpenMeteoSnapshot(data, details = {}) {
  const code = data?.current?.weather_code;
  const condition = normalizeConditionFromMeteoCode(code);
  const intensity = normalizeIntensityFromMeteoCode(code);

  return {
    condition,
    intensity,
    fetchedAt: Date.now(),
    source: "openmeteo",
    details: {
      ...details,
      weatherCode: Number.isFinite(Number(code)) ? Number(code) : null,
      timezone: typeof data?.timezone === "string" ? data.timezone : null,
      timezoneOffsetSeconds: Number.isFinite(Number(data?.utc_offset_seconds))
        ? Number(data.utc_offset_seconds)
        : null,
      isDay: Number(data?.current?.is_day) === 1,
    },
  };
}

function buildOpenWeatherSnapshot(data, details = {}) {
  const condition = normalizeConditionFromOpenWeather(data);
  const intensity = normalizeIntensityFromOpenWeather(data);
  const cloudsPct = Number.isFinite(Number(data?.clouds?.all))
    ? Number(data.clouds.all)
    : null;
  const first = Array.isArray(data?.weather) ? data.weather[0] : null;

  return {
    condition,
    intensity,
    fetchedAt: Date.now(),
    source: "openweather",
    details: {
      ...details,
      name: typeof data?.name === "string" ? data.name : details?.name || null,
      weatherMain: first?.main ? String(first.main) : null,
      weatherId: Number.isFinite(Number(first?.id)) ? Number(first.id) : null,
      cloudsPct,
      timezoneOffsetSeconds: Number.isFinite(Number(data?.timezone))
        ? Number(data.timezone)
        : null,
      sunriseAt: Number.isFinite(Number(data?.sys?.sunrise))
        ? Number(data.sys.sunrise) * 1000
        : null,
      sunsetAt: Number.isFinite(Number(data?.sys?.sunset))
        ? Number(data.sys.sunset) * 1000
        : null,
    },
  };
}

async function fetchOpenMeteoSnapshot({ lat, lon, signal, details = {} }) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(
    lat
  )}&longitude=${encodeURIComponent(
    lon
  )}&current=weather_code,is_day&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`;

  const request = createTimeoutSignal({
    parentSignal: signal,
    timeoutMs: WEATHER_REQUEST_TIMEOUT_MS,
    message: `Open-Meteo timed out after ${WEATHER_REQUEST_TIMEOUT_MS}ms`,
  });

  try {
    const resp = await fetch(url, { signal: request.signal });
    if (!resp.ok) throw new Error(`Open-Meteo fetch failed ${resp.status}`);
    const data = await resp.json();
    return buildOpenMeteoSnapshot(data, details);
  } finally {
    request.cleanup();
  }
}

async function fetchOpenWeatherByCoords({
  lat,
  lon,
  apiKey,
  signal,
  details = {},
}) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${encodeURIComponent(
    lat
  )}&lon=${encodeURIComponent(lon)}&appid=${apiKey}`;

  const request = createTimeoutSignal({
    parentSignal: signal,
    timeoutMs: WEATHER_REQUEST_TIMEOUT_MS,
    message: `OpenWeather timed out after ${WEATHER_REQUEST_TIMEOUT_MS}ms`,
  });
  try {
    const resp = await fetch(url, { signal: request.signal });
    if (!resp.ok) {
      throw new Error(`Weather fetch failed ${resp.status}`);
    }
    const data = await resp.json();
    return buildOpenWeatherSnapshot(data, details);
  } finally {
    request.cleanup();
  }
}

export async function fetchWeatherSnapshot({ zip, coords, signal }) {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
  const effectiveZip = String(zip || "").trim();
  const lat = toFiniteCoordinate(coords?.latitude ?? coords?.lat);
  const lon = toFiniteCoordinate(coords?.longitude ?? coords?.lon);
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lon);

  if (hasCoords) {
    const locationDetails = {
      location: {
        latitude: lat,
        longitude: lon,
      },
      liveWeather: true,
    };

    if (!isUsableOpenWeatherKey(apiKey)) {
      try {
        return {
          ...(await fetchOpenMeteoSnapshot({
            lat,
            lon,
            signal,
            details: locationDetails,
          })),
          zip: effectiveZip || null,
        };
      } catch (err) {
        return {
          condition: "sun",
          intensity: "light",
          zip: effectiveZip || null,
          fetchedAt: Date.now(),
          source: "fallback",
          details: {
            ...locationDetails,
            reason: "openmeteo_fallback",
          },
          error: err?.message || "Open-Meteo failed",
        };
      }
    }

    return {
      ...(await fetchOpenWeatherByCoords({
        lat,
        lon,
        apiKey,
        signal,
        details: locationDetails,
      })),
      zip: effectiveZip || null,
    };
  }

  if (!/^\d{5}$/.test(effectiveZip)) {
    return {
      condition: "unknown",
      intensity: "medium",
      zip: null,
      fetchedAt: Date.now(),
      source: "none",
      details: null,
      error: "Weather ZIP unavailable",
    };
  }

  if (!isUsableOpenWeatherKey(apiKey)) {
    try {
      const { lat, lon, name } = await fetchLatLonForZip(effectiveZip, signal);
      return {
        ...(await fetchOpenMeteoSnapshot({
          lat,
          lon,
          signal,
          details: {
            name,
            zip: effectiveZip,
            liveWeather: true,
            location: {
              latitude: lat,
              longitude: lon,
            },
          },
        })),
        zip: effectiveZip,
      };
    } catch (err) {
      return {
        condition: "sun",
        intensity: "light",
        zip: effectiveZip,
        fetchedAt: Date.now(),
        source: "fallback",
        details: {
          liveWeather: false,
          reason: "openmeteo_fallback",
        },
        error: err?.message || "Open-Meteo failed",
      };
    }
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?zip=${encodeURIComponent(
    effectiveZip
  )},US&appid=${apiKey}`;

  const request = createTimeoutSignal({
    parentSignal: signal,
    timeoutMs: WEATHER_REQUEST_TIMEOUT_MS,
    message: `OpenWeather timed out after ${WEATHER_REQUEST_TIMEOUT_MS}ms`,
  });
  let data;
  try {
    const resp = await fetch(url, { signal: request.signal });
    if (!resp.ok) {
      throw new Error(`Weather fetch failed ${resp.status}`);
    }
    data = await resp.json();
  } finally {
    request.cleanup();
  }

  return {
    ...buildOpenWeatherSnapshot(data, {
      zip: effectiveZip,
      liveWeather: true,
    }),
    zip: effectiveZip,
  };
}
