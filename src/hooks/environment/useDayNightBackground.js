// src/hooks/environment/useDayNightBackground.js

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SunCalc from "suncalc";
import { getGrantedLocationSnapshot } from "@/lib/locationReality.js";
import { WEATHER_REQUEST_TIMEOUT_MS } from "@/lib/weatherApi.js";
import { createTimeoutSignal } from "@/utils/abortSignal.js";
import { getTimeOfDay } from "@/utils/weather.js";
import { withBaseUrl } from "@/utils/assetUtils.js";

const DAY_START_HOUR = 6;
const NIGHT_START_HOUR = 19; // 7 PM → night visuals
const TWILIGHT_WINDOW_MS = 45 * 60 * 1000;

function deriveIsNightFromHour(h) {
  return !(h >= DAY_START_HOUR && h < NIGHT_START_HOUR);
}

function clamp01(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function normalizeZip(value) {
  const digits = String(value || "").replace(/\D+/g, "").slice(0, 5);
  return /^\d{5}$/.test(digits) ? digits : null;
}

function getApproximateSunriseBlend(dateLike) {
  const date = dateLike instanceof Date ? dateLike : new Date(dateLike);
  const minutes = date.getHours() * 60 + date.getMinutes();
  const start = 6 * 60;
  const peak = 7 * 60;
  const end = 8 * 60;
  if (minutes < start || minutes >= end) return 0;
  if (minutes <= peak) return clamp01((minutes - start) / (peak - start));
  return clamp01(1 - (minutes - peak) / (end - peak));
}

function getDateAtOffset(nowMs, utcOffsetSeconds) {
  const localOffsetMs = new Date(nowMs).getTimezoneOffset() * 60 * 1000;
  return new Date(nowMs + localOffsetMs + Number(utcOffsetSeconds || 0) * 1000);
}

function deriveSunWindowModel({
  nowMs = Date.now(),
  sunriseMs,
  sunsetMs,
  source = "zip",
}) {
  const sunrise = Number(sunriseMs);
  const sunset = Number(sunsetMs);
  if (!Number.isFinite(sunrise) || !Number.isFinite(sunset)) return null;

  const dawnStart = sunrise - TWILIGHT_WINDOW_MS;
  const dawnEnd = sunrise + TWILIGHT_WINDOW_MS;
  const duskStart = sunset - TWILIGHT_WINDOW_MS;
  const duskEnd = sunset + TWILIGHT_WINDOW_MS;
  const solarMidpoint = sunrise + (sunset - sunrise) / 2;

  let timeOfDayBucket = "afternoon";
  let sunriseProgress = 0;

  if (nowMs < dawnStart || nowMs >= duskEnd) {
    timeOfDayBucket = "night";
  } else if (nowMs < dawnEnd) {
    timeOfDayBucket = "dawn";
    if (nowMs <= sunrise) {
      sunriseProgress = clamp01((nowMs - dawnStart) / TWILIGHT_WINDOW_MS);
    } else {
      sunriseProgress = clamp01(
        1 - (nowMs - sunrise) / TWILIGHT_WINDOW_MS
      );
    }
  } else if (nowMs >= duskStart) {
    timeOfDayBucket = "dusk";
  } else {
    timeOfDayBucket = nowMs < solarMidpoint ? "morning" : "afternoon";
  }

  return {
    isNight: timeOfDayBucket === "night",
    timeOfDayBucket,
    sunriseProgress,
    source,
  };
}

function deriveLocalFallbackModel(nowMs = Date.now()) {
  const date = new Date(nowMs);
  return {
    isNight: deriveIsNightFromHour(date.getHours()),
    timeOfDayBucket: getTimeOfDay(date),
    sunriseProgress: getApproximateSunriseBlend(date),
    source: "local",
  };
}

function isUsableOpenWeatherKey(key) {
  const k = String(key || "").trim();
  if (!k) return false;
  const upper = k.toUpperCase();
  // Common placeholders / examples that should behave like "no key"
  if (upper === "CHANGE_ME" || upper === "CHANGEME") return false;
  if (upper === "YOUR_API_KEY" || upper === "YOUR_API_KEY_HERE") return false;
  if (upper === "REPLACE_ME" || upper === "REPLACEME") return false;
  if (upper.startsWith("EXAMPLE")) return false;
  return true;
}

/**
 * @typedef {Object} DayNightOptions
 * @property {string} [zip]
 * @property {number} [pollIntervalMs]
 * @property {boolean} [enableImages]
 * @property {boolean} [usePreciseLocation]
 */

/**
 * @param {DayNightOptions} [options]
 */
export function useDayNightBackground(options = {}) {
  const {
    zip,
    pollIntervalMs = 5 * 60 * 1000,
    enableImages = true,
    usePreciseLocation = false,
  } = options;
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
  const effectiveZip = normalizeZip(zip);
  const weatherApiEnabled = isUsableOpenWeatherKey(apiKey) && Boolean(effectiveZip);

  const [localTickAt, setLocalTickAt] = useState(Date.now());
  const [imageMode, setImageMode] = useState("unknown"); // "single" | "composite" | "none"
  const [available, setAvailable] = useState({
    // resolved URLs (preferred format first), or null if not present
    day: null,
    night: null,
  });

  useEffect(() => {
    const id = setInterval(() => {
      setLocalTickAt(Date.now());
    }, pollIntervalMs);
    return () => clearInterval(id);
  }, [pollIntervalMs]);

  const locationQuery = useQuery({
    queryKey: ["day-night-solar", usePreciseLocation],
    enabled: usePreciseLocation,
    refetchInterval: pollIntervalMs,
    staleTime: pollIntervalMs,
    refetchIntervalInBackground: false,
    queryFn: async () => {
      const position = await getGrantedLocationSnapshot({
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: pollIntervalMs,
      });
      if (!position) {
        throw new Error("Location permission unavailable");
      }

      const latitude = Number(position?.latitude);
      const longitude = Number(position?.longitude);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        throw new Error("Location coordinates unavailable");
      }

      const nowMs = Date.now();
      const now = new Date(nowMs);
      const sunTimes = SunCalc.getTimes(now, latitude, longitude);
      const solarModel = deriveSunWindowModel({
        nowMs,
        sunriseMs: sunTimes?.sunrise?.getTime?.(),
        sunsetMs: sunTimes?.sunset?.getTime?.(),
        source: "solar",
      });
      if (solarModel) {
        return solarModel;
      }

      const sunPosition = SunCalc.getPosition(now, latitude, longitude);
      return {
        isNight: Number(sunPosition?.altitude || 0) < 0,
        timeOfDayBucket: getTimeOfDay(now),
        sunriseProgress: 0,
        source: "solar",
      };
    },
  });

  const weatherQuery = useQuery({
    queryKey: ["day-night-weather", effectiveZip, apiKey],
    enabled: weatherApiEnabled,
    refetchInterval: pollIntervalMs,
    queryFn: async ({ signal }) => {
      const url = `https://api.openweathermap.org/data/2.5/weather?zip=${effectiveZip},US&appid=${apiKey}`;
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
      const nowMs = Date.now();
      const tzOffsetSeconds = data?.timezone;
      const sunModel = deriveSunWindowModel({
        nowMs,
        sunriseMs: Number(data?.sys?.sunrise) * 1000,
        sunsetMs: Number(data?.sys?.sunset) * 1000,
        source: "zip",
      });
      if (sunModel) return sunModel;

      if (typeof tzOffsetSeconds !== "number") {
        throw new Error("Missing timezone/sun times");
      }

      const locationNow = getDateAtOffset(nowMs, tzOffsetSeconds);
      return {
        isNight: deriveIsNightFromHour(locationNow.getHours()),
        timeOfDayBucket: getTimeOfDay(locationNow),
        sunriseProgress: getApproximateSunriseBlend(locationNow),
        source: "zip",
      };
    },
  });

  const fallbackLocal = (() => {
    void localTickAt;
    return deriveLocalFallbackModel(localTickAt);
  })();

  const resolvedModel =
    locationQuery.data || weatherQuery.data || fallbackLocal;
  const isNight = resolvedModel.isNight;
  const timeOfDayBucket = resolvedModel.timeOfDayBucket;
  const sunriseProgress = clamp01(resolvedModel.sunriseProgress);
  const source = resolvedModel.source || "local";
  const lastUpdatedAt =
    locationQuery.data && locationQuery.dataUpdatedAt
      ? locationQuery.dataUpdatedAt
      : weatherApiEnabled && weatherQuery.dataUpdatedAt
      ? weatherQuery.dataUpdatedAt
      : localTickAt;
  const error =
    (usePreciseLocation && locationQuery.error?.message) ||
    weatherQuery.error?.message ||
    null;

  // Detect available background assets once at mount
  useEffect(() => {
    let mounted = true;
    if (!enableImages) {
      setAvailable({ day: null, night: null });
      setImageMode("none");
      return () => {
        mounted = false;
      };
    }

    const checkImage = (url) =>
      new Promise((resolve) => {
        try {
          const img = new Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          const cacheBust = import.meta.env.DEV ? `?v=${Date.now()}` : "";
          img.src = `${url}${cacheBust}`;
        } catch {
          resolve(false);
        }
      });

    const firstAvailableUrl = async (urls) => {
      for (const u of urls) {
        const ok = await checkImage(u);
        if (ok) return u;
      }
      return null;
    };

    const run = async () => {
      const day = await firstAvailableUrl([
        withBaseUrl("/backgrounds/backyard-day-wide.svg"),
        withBaseUrl("/backgrounds/backyard-day.svg"),
        withBaseUrl("/backgrounds/backyard-day-wide.webp"),
        withBaseUrl("/backgrounds/backyard-day.webp"),
      ]);
      const night = await firstAvailableUrl([
        withBaseUrl("/backgrounds/backyard-night-wide.svg"),
        withBaseUrl("/backgrounds/backyard-night.svg"),
        withBaseUrl("/backgrounds/backyard-night-wide.webp"),
        withBaseUrl("/backgrounds/backyard-night.webp"),
      ]);

      if (!mounted) return;
      setAvailable({
        day,
        night,
      });

      if (day || night) {
        setImageMode("single");
      } else {
        setImageMode("none");
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [enableImages]);

  let gradient;
  if (isNight) {
    gradient = "linear-gradient(180deg, #0f172a 0%, #020617 55%, #000000 100%)";
  } else if (timeOfDayBucket === "dusk") {
    gradient = "linear-gradient(180deg, #fb923c 0%, #0f172a 65%, #020617 100%)";
  } else if (timeOfDayBucket === "dawn") {
    gradient = "linear-gradient(180deg, #fcd34d 0%, #0f172a 60%, #020617 100%)";
  } else {
    gradient = "linear-gradient(180deg, #38bdf8 0%, #0f172a 60%, #020617 100%)";
  }

  // Build layered background style with graceful fallbacks
  let backgroundImage = gradient;
  let backgroundSize = "cover";
  let backgroundPosition = "center";
  let backgroundRepeat = "no-repeat";

  const pickSingleUrl = () => {
    if (!isNight && available.day) return available.day;
    if (isNight && available.night) return available.night;
    // Prefer night assets for dusk/evening if available.
    if (
      (timeOfDayBucket === "dusk" || timeOfDayBucket === "evening") &&
      available.night
    ) {
      return available.night;
    }
    return available.day || available.night || null;
  };

  if (imageMode === "single") {
    const url = pickSingleUrl();
    if (url) {
      backgroundImage = `${gradient}, url('${url}')`;
      backgroundSize = "cover, cover";
      backgroundPosition = "center, center";
      backgroundRepeat = "no-repeat, no-repeat";
    }
  }

  const style = {
    backgroundImage,
    backgroundSize,
    backgroundPosition,
    backgroundRepeat,
  };

  return {
    isNight,
    style,
    lastUpdatedAt,
    error,
    source,
    sunriseProgress,
    timeOfDayBucket,
  };
}

export const useDayNight = useDayNightBackground;

export default useDayNightBackground;
