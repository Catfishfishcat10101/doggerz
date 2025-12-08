// src/features/game/components/BackyardBackground.jsx
import React from "react";
import { useTimeWeatherBackground } from "@/hooks/useTimeWeatherBackground.js";

/**
 * Backyard background that swaps between day and night.
 * Expects images at:
 *   public/backgrounds/backyard-day.png
 *   public/backgrounds/backyard-night.png
 */
export default function BackyardBackground(props = {}) {
  const { zipCode } = props || {};
  let timeOfDay = "day";
  try {
    const hookResult = useTimeWeatherBackground(zipCode);
    let resultObj = {};
    if (typeof hookResult === "string") {
      resultObj.timeOfDay = hookResult;
    } else if (hookResult && typeof hookResult === "object") {
      resultObj = hookResult;
    }
    timeOfDay = resultObj.timeOfDay || resultObj.time || "day";
  } catch (err) {
    // If the hook isn't available in this environment, fallback to day.
    timeOfDay = "day";
  }

  const mode = String(timeOfDay).toLowerCase() === "night" ? "night" : "day";

  const backgroundUrl =
    mode === "night"
      ? "/backgrounds/backyard-night.png"
      : "/backgrounds/backyard-day.png";

  return (
    <div
      className="absolute inset-0 -z-10 bg-center bg-cover bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundUrl})` }}
    />
  );
}
