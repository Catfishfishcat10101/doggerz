// src/hooks/environment/useDayNightBackground.js

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTimeOfDay } from "@/utils/weather.js";
import { withBaseUrl } from "@/utils/assetUtils.js";

const DAY_START_HOUR = 6;
const NIGHT_START_HOUR = 19; // 7 PM → night visuals

function deriveIsNightFromHour(h) {
  return !(h >= DAY_START_HOUR && h < NIGHT_START_HOUR);
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
 * // Geolocation removed; ZIP-only behavior
 */

/**
 * @param {DayNightOptions} [options]
 */
export function useDayNightBackground(options = {}) {
  const { zip, pollIntervalMs = 5 * 60 * 1000, enableImages = true } = options;
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
  const effectiveZip =
    zip || import.meta.env.VITE_WEATHER_DEFAULT_ZIP || "10001";
  const weatherApiEnabled = isUsableOpenWeatherKey(apiKey);

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

  const weatherQuery = useQuery({
    queryKey: ["day-night-weather", effectiveZip, apiKey],
    enabled: weatherApiEnabled,
    refetchInterval: pollIntervalMs,
    queryFn: async ({ signal }) => {
      const url = `https://api.openweathermap.org/data/2.5/weather?zip=${effectiveZip},US&appid=${apiKey}`;
      const resp = await fetch(url, { signal });
      if (!resp.ok) {
        throw new Error(`Weather fetch failed ${resp.status}`);
      }

      const data = await resp.json();
      const tzOffsetSeconds = data?.timezone;
      const sunrise = Number(data?.sys?.sunrise);
      const sunset = Number(data?.sys?.sunset);

      if (!Number.isFinite(sunrise) || !Number.isFinite(sunset)) {
        if (typeof tzOffsetSeconds !== "number") {
          throw new Error("Missing timezone/sun times");
        }
        const locationNow = new Date(Date.now() + tzOffsetSeconds * 1000);
        const localHour = locationNow.getHours();
        return {
          isNight: deriveIsNightFromHour(localHour),
          timeOfDayBucket: getTimeOfDay(),
        };
      }

      const nowSec = Math.floor(Date.now() / 1000);
      const tw = 45 * 60;

      let bucket;
      if (nowSec < sunrise - tw || nowSec >= sunset + tw) {
        bucket = "night";
      } else if (nowSec >= sunrise - tw && nowSec <= sunrise + tw) {
        bucket = "dawn";
      } else if (nowSec >= sunset - tw && nowSec <= sunset + tw) {
        bucket = "dusk";
      } else {
        bucket = "afternoon";
      }

      return {
        isNight: bucket === "night",
        timeOfDayBucket: bucket,
      };
    },
  });

  const fallbackLocal = (() => {
    void localTickAt;
    const hour = new Date().getHours();
    return {
      isNight: deriveIsNightFromHour(hour),
      timeOfDayBucket: getTimeOfDay(),
    };
  })();

  const isNight = weatherQuery.data?.isNight ?? fallbackLocal.isNight;
  const timeOfDayBucket =
    weatherQuery.data?.timeOfDayBucket ?? fallbackLocal.timeOfDayBucket;
  const lastUpdatedAt =
    weatherApiEnabled && weatherQuery.dataUpdatedAt
      ? weatherQuery.dataUpdatedAt
      : localTickAt;
  const error = weatherQuery.error?.message || null;

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
    timeOfDayBucket,
  };
}

export const useDayNight = useDayNightBackground;

export default useDayNightBackground;
