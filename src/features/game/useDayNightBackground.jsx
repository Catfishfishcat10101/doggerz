// src/features/game/useDayNightBackground.jsx

import { useEffect, useState, useRef } from "react";
import { getTimeOfDay } from "@/utils/weather.js";

const DAY_START_HOUR = 6;
const NIGHT_START_HOUR = 19; // 7 PM → night visuals

function deriveIsNightFromHour(h) {
  return !(h >= DAY_START_HOUR && h < NIGHT_START_HOUR);
}

function isUsableOpenWeatherKey(key) {
  const k = String(key || '').trim();
  if (!k) return false;
  const upper = k.toUpperCase();
  // Common placeholders / examples that should behave like "no key"
  if (upper === 'CHANGE_ME' || upper === 'CHANGEME') return false;
  if (upper === 'YOUR_API_KEY' || upper === 'YOUR_API_KEY_HERE') return false;
  if (upper === 'REPLACE_ME' || upper === 'REPLACEME') return false;
  if (upper.startsWith('EXAMPLE')) return false;
  return true;
}

/**
 * @typedef {Object} DayNightOptions
 * @property {string} [zip]
 * @property {number} [pollIntervalMs]
 * // Geolocation removed; ZIP-only behavior
 */

/**
 * @param {DayNightOptions} [options]
 */
export function useDayNightBackground(options = {}) {
  const {
    zip,
    pollIntervalMs = 5 * 60 * 1000,
  } = options;

  const [isNight, setIsNight] = useState(() =>
    deriveIsNightFromHour(new Date().getHours()),
  );
  const [timeOfDayBucket, setTimeOfDayBucket] = useState(() => getTimeOfDay());
  const [lastUpdatedAt, setLastUpdatedAt] = useState(Date.now());
  const [error, setError] = useState(null);
  const [imageMode, setImageMode] = useState("unknown"); // "single" | "composite" | "none"
  const [available, setAvailable] = useState({
    // resolved URLs (preferred format first), or null if not present
    day: null,
    night: null,
    dawn: null,
    dusk: null,
    composite: null,
  });
  const abortRef = useRef(null);

  // Geolocation removed; always use ZIP (or default ZIP) if API is available

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
      const effectiveZip =
        zip || import.meta.env.VITE_WEATHER_DEFAULT_ZIP || "10001"; // NYC fallback

      // No API key → local-only mode using client clock
      if (!isUsableOpenWeatherKey(apiKey)) {
        const now = new Date();
        const hour = now.getHours();
        if (cancelled) return;

        setIsNight(deriveIsNightFromHour(hour));
        setTimeOfDayBucket(getTimeOfDay());
        setLastUpdatedAt(Date.now());
        setError(null);
        return;
      }

      try {
        // kill any in-flight request before starting a new one
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        // ZIP-only request to OpenWeather
        const url = `https://api.openweathermap.org/data/2.5/weather?zip=${effectiveZip},US&appid=${apiKey}`;
        const resp = await fetch(url, { signal: controller.signal });

        if (!resp.ok) {
          throw new Error(`Weather fetch failed ${resp.status}`);
        }

        const data = await resp.json();
        const tzOffsetSeconds = data?.timezone; // seconds shift from UTC (may be 0/negative)
        const sunrise = Number(data?.sys?.sunrise); // UTC seconds
        const sunset = Number(data?.sys?.sunset); // UTC seconds

        // If sunrise/sunset are missing, fall back to hour-based using TZ offset
        if (!Number.isFinite(sunrise) || !Number.isFinite(sunset)) {
          if (typeof tzOffsetSeconds !== "number") {
            throw new Error("Missing timezone/sun times");
          }
          const utcNowMs = Date.now();
          const locationNow = new Date(utcNowMs + tzOffsetSeconds * 1000);
          const localHour = locationNow.getHours();
          if (cancelled) return;
          setIsNight(deriveIsNightFromHour(localHour));
          setTimeOfDayBucket(getTimeOfDay());
          setLastUpdatedAt(Date.now());
          setError(null);
          return;
        }

        // Use sunrise/sunset for realistic classification with twilight blending
        const nowSec = Math.floor(Date.now() / 1000); // UTC seconds
        const TWILIGHT_MIN = 45; // configurable window
        const tw = TWILIGHT_MIN * 60;

        let bucket;
        if (nowSec < sunrise - tw || nowSec >= sunset + tw) {
          bucket = "night";
        } else if (nowSec >= sunrise - tw && nowSec <= sunrise + tw) {
          bucket = "dawn";
        } else if (nowSec >= sunset - tw && nowSec <= sunset + tw) {
          bucket = "dusk";
        } else {
          // broad daylight; we don’t distinguish morning/afternoon here
          bucket = "afternoon";
        }

        if (cancelled) return;

        setIsNight(bucket === "night");
        setTimeOfDayBucket(bucket);
        setLastUpdatedAt(Date.now());
        setError(null);
      } catch (e) {
        if (cancelled) return;

        console.warn("[useDayNightBackground]", e);
        setError(e.message || "Failed to load timezone");

        // Fallback: client time
        const now = new Date();
        const hour = now.getHours();
        setIsNight(deriveIsNightFromHour(hour));
        setTimeOfDayBucket(getTimeOfDay());
        setLastUpdatedAt(Date.now());
      }
    };

    run();
    const id = setInterval(run, pollIntervalMs);

    return () => {
      cancelled = true;
      clearInterval(id);
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [zip, pollIntervalMs]);

  // Detect available background assets once at mount
  useEffect(() => {
    let mounted = true;
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
        "/backgrounds/backyard-day-wide.webp",
        "/backgrounds/backyard-day.webp",
      ]);
      const night = await firstAvailableUrl([
        "/backgrounds/backyard-night-wide.webp",
        "/backgrounds/backyard-night.webp",
      ]);

      // Optional assets (not shipped in repo yet) — keep support for future drops.
      const dawn = await firstAvailableUrl([
        "/backgrounds/backyard-dawn.webp",
        "/backgrounds/backyard-dawn.png",
      ]);
      const dusk = await firstAvailableUrl([
        "/backgrounds/backyard-dusk.webp",
        "/backgrounds/backyard-dusk.png",
      ]);
      const composite = await firstAvailableUrl([
        "/backgrounds/backyard-split.webp",
      ]);

      if (!mounted) return;
      setAvailable({
        day,
        night,
        dawn,
        dusk,
        composite,
      });

      if (day || night || dawn || dusk) {
        setImageMode("single");
      } else if (composite) {
        setImageMode("composite");
      } else {
        setImageMode("none");
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, []);

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
    if (timeOfDayBucket === "dawn" && available.dawn) return available.dawn;
    if (timeOfDayBucket === "dusk" && available.dusk) return available.dusk;
    if (!isNight && available.day) return available.day;
    if (isNight && available.night) return available.night;
    // Fallbacks if requested bucket asset not present
    if (timeOfDayBucket === "dawn" && available.day) return available.day;
    if (timeOfDayBucket === "dusk" && available.night) return available.night;
    return null;
  };

  if (imageMode === "single") {
    const url = pickSingleUrl();
    if (url) {
      backgroundImage = `${gradient}, url('${url}')`;
      backgroundSize = "cover, cover";
      backgroundPosition = "center, center";
      backgroundRepeat = "no-repeat, no-repeat";
    }
  } else if (imageMode === "composite") {
    const compositeUrl = available.composite || "/backgrounds/backyard-split.webp";
    // For composite, use left half for day/dawn, right half for night/dusk
    const isRight = isNight || timeOfDayBucket === "dusk";
    const pos = isRight ? "100% 50%" : "0% 50%";
    backgroundImage = `${gradient}, url('${compositeUrl}')`;
    backgroundSize = "cover, 200% 100%";
    backgroundPosition = `center, ${pos}`;
    backgroundRepeat = "no-repeat, no-repeat";
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

export default useDayNightBackground;
