/** @format */
// src/pages/Game.jsx

import { useMemo } from "react";
import { useSelector } from "react-redux";

import MainGame from "@/features/game/MainGame.jsx";
import GrowthCelebration from "@/features/game/GrowthCelebration.jsx";
import { selectWeatherCondition } from "@/redux/weatherSlice.js";
import { selectUserZip } from "@/redux/userSlice.js";
import { selectSettings } from "@/redux/settingsSlice.js";
import { useDayNightBackground } from "@/features/game/useDayNightBackground.jsx";
import WeatherFXCanvas from "@/components/WeatherFXCanvas.jsx";
import {
  getWeatherAccent,
  getWeatherLabel,
  normalizeWeatherCondition,
} from "@/utils/weather.js";

function titleCase(s) {
  const str = String(s || "").trim();
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function shouldReduceEffects(perfMode) {
  const mode = String(perfMode || "auto").toLowerCase();
  if (mode === "on") return true;
  if (mode === "off") return false;
  if (typeof window === "undefined") return false;
  try {
    if (navigator?.connection?.saveData) return true;
    const mem = Number(navigator?.deviceMemory || 0);
    if (mem && mem <= 4) return true;
    const cores = Number(navigator?.hardwareConcurrency || 0);
    if (cores && cores <= 4) return true;
  } catch {
    // ignore
  }
  return false;
}

export default function GamePage() {
  const zip = useSelector(selectUserZip);
  const weather = useSelector(selectWeatherCondition);
  const settings = useSelector(selectSettings);

  const perfReduced = shouldReduceEffects(settings?.perfMode);
  const showBackgroundPhotos = true;
  const {
    isNight,
    timeOfDayBucket,
    style: dayNightStyle,
  } = useDayNightBackground({
    zip,
    enableImages: showBackgroundPhotos,
  });

  const reduceMotion =
    settings?.reduceMotion === "on" ||
    (settings?.reduceMotion !== "off" &&
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  const reduceTransparency = settings?.reduceTransparency === true;
  const showWeatherFx = settings?.showWeatherFx !== false && !perfReduced;
  const showVignette = false;
  const showGrain = false;

  const weatherKey = useMemo(
    () => normalizeWeatherCondition(weather),
    [weather]
  );
  const weatherLabel = useMemo(() => getWeatherLabel(weatherKey), [weatherKey]);
  const weatherAccent = useMemo(
    () => getWeatherAccent(weatherKey),
    [weatherKey]
  );

  const scene = useMemo(
    () => ({
      label: "Backyard",
      timeOfDay: isNight ? "Night" : titleCase(timeOfDayBucket || "Day"),
      weather: weatherLabel,
      weatherKey,
      weatherAccent,
    }),
    [isNight, timeOfDayBucket, weatherLabel, weatherKey, weatherAccent]
  );

  return (
    <div
      className="relative min-h-dvh overflow-hidden"
      style={{ ...dayNightStyle, "--weather-accent": weatherAccent }}
      data-weather={weatherKey}
    >
      {/* Extra vignette + grain to sell depth behind the UI */}
      {showVignette ? (
        <div className="pointer-events-none absolute inset-0 bg-black/40" />
      ) : null}
      {showGrain ? (
        <div className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.6),transparent_55%)]" />
      ) : null}

      <WeatherFXCanvas
        mode={showWeatherFx ? weatherKey : "none"}
        reduceMotion={reduceMotion}
        reduceTransparency={reduceTransparency}
        className="z-0"
      />

      <div className="relative z-10">
        <MainGame scene={scene} />
      </div>
      <GrowthCelebration />
    </div>
  );
}
