import { useEffect, useState } from "react";

const API_KEY =
  import.meta.env.VITE_WEATHER_API_KEY ||
  import.meta.env.VITE_OPENWEATHER_API_KEY ||
  "";

const DEFAULT_WEATHER = "clear";
const DEFAULT_REFRESH_MS = 30 * 60 * 1000;

function mapOpenWeatherCodeToScene(id) {
  const code = Number(id);
  if (!Number.isFinite(code)) return DEFAULT_WEATHER;

  if (code >= 200 && code < 600) return "rain";
  if (code >= 600 && code < 700) return "snow";
  if (code >= 801 && code <= 804) return "clouds";
  if (code === 800) return "clear";

  return DEFAULT_WEATHER;
}

/**
 * Fetch real-time weather by US ZIP code and map to game-friendly keys.
 */
export function useRealWeather(
  zipCode,
  { pollIntervalMs = DEFAULT_REFRESH_MS } = {}
) {
  const [weather, setWeather] = useState(DEFAULT_WEATHER);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const zip = String(zipCode || "").trim();
    if (!zip) {
      setWeather(DEFAULT_WEATHER);
      return undefined;
    }

    let cancelled = false;
    let controller = null;

    const fetchWeather = async () => {
      if (!API_KEY) {
        setWeather(DEFAULT_WEATHER);
        return;
      }

      if (controller) {
        controller.abort();
      }
      controller = new AbortController();

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?zip=${encodeURIComponent(
            zip
          )},us&appid=${API_KEY}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`Weather fetch failed (${response.status})`);
        }

        const data = await response.json();
        const conditionId = data?.weather?.[0]?.id;
        const mapped = mapOpenWeatherCodeToScene(conditionId);

        if (!cancelled) {
          setWeather(mapped);
        }
      } catch (err) {
        if (cancelled) return;
        if (err?.name === "AbortError") return;
        setError(err?.message || "Weather fetch failed");
        setWeather(DEFAULT_WEATHER);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchWeather();
    const intervalId = window.setInterval(
      fetchWeather,
      Math.max(60_000, Number(pollIntervalMs) || DEFAULT_REFRESH_MS)
    );

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      if (controller) controller.abort();
    };
  }, [pollIntervalMs, zipCode]);

  return { weather, isLoading, error };
}

export default useRealWeather;
