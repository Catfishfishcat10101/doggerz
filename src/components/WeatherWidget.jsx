// src/components/WeatherWidget.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getWeatherByZip } from "@/utils/weather.js";
import {
  WEATHER_API_KEY,
  DEFAULT_WEATHER_ZIP,
} from "@/constants/game.js";

const ZIP_STORAGE_KEY = "doggerz:weatherZip";

const safeLocalStorage = {
  get(key) {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(key);
    } catch (err) {
      console.warn("[WeatherWidget] localStorage read failed", err);
      return null;
    }
  },
  set(key, value) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, value);
    } catch (err) {
      console.warn("[WeatherWidget] localStorage write failed", err);
    }
  },
};

const formatTemp = (temp) => `${temp ?? "--"}\u00B0F`;

export default function WeatherWidget() {
  const hasApiKey = Boolean(WEATHER_API_KEY);
  const initialZip = useMemo(() => {
    const stored = safeLocalStorage.get(ZIP_STORAGE_KEY);
    if (stored && /^\d{5}$/.test(stored)) {
      return stored;
    }
    return DEFAULT_WEATHER_ZIP;
  }, []);

  const [zipInput, setZipInput] = useState(initialZip);
  const [zip, setZip] = useState(initialZip);
  const [weather, setWeather] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!hasApiKey || !zip) return;
    let cancelled = false;

    const fetchWeather = async () => {
      setStatus("loading");
      setError(null);
      try {
        const data = await getWeatherByZip(zip);
        if (!cancelled) {
          setWeather(data);
          setStatus("ready");
        }
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          setError(err.message || "Failed to load weather");
        }
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000); // refresh every 30 min

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [zip, hasApiKey]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const cleaned = zipInput.trim();
    if (!/^\d{5}$/.test(cleaned)) {
      setError("Enter a valid 5-digit US ZIP code.");
      return;
    }
    setZip(cleaned);
    safeLocalStorage.set(ZIP_STORAGE_KEY, cleaned);
  };

  if (!hasApiKey) {
    return (
      <div className="text-xs text-zinc-400 space-y-1">
        <p className="font-semibold text-zinc-200">Weather offline</p>
        <p>
          Add <code>VITE_OPENWEATHER_API_KEY</code> to your <code>.env.local</code> to enable
          live weather. You can grab a free key at openweathermap.org.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-sky-300">
            Local weather
          </p>
          <p className="text-sm text-zinc-200">ZIP {zip}</p>
        </div>
        {weather?.timestamp && (
          <p>
            Updated {new Date(weather.timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="text-4xl font-semibold text-white">
          {status === "loading" ? "--" : formatTemp(weather?.temp)}
        </div>
        <div className="text-xs text-zinc-300 space-y-1">
          <p className="capitalize">{weather?.description || "Fetching forecast…"}</p>
          <p>Sunrise: {weather?.sunrise ? new Date(weather.sunrise).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "--"}</p>
          <p>Sunset: {weather?.sunset ? new Date(weather.sunset).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "--"}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          value={zipInput}
          onChange={(e) => setZipInput(e.target.value)}
          className="flex-1 rounded-md bg-zinc-950/60 border border-zinc-700 px-3 py-2 text-sm text-white"
          placeholder="ZIP"
          maxLength={5}
          aria-label="ZIP code"
        />
        <button
          type="submit"
          className="px-3 py-2 rounded-md bg-sky-500 text-sm font-semibold text-black"
        >
          Save
        </button>
      </form>

      {error && <p className="text-xs text-rose-300">{error}</p>}
    </div>
  );
}
