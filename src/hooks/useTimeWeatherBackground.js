// src/hooks/useTimeWeatherBackground.js
// Tiny adapter hook so BackyardBackground can decide day vs night.
// For now we just mirror useDayNightBackground; you can extend later.

import useDayNightBackground from "./useDayNightBackground.jsx";

export function useTimeWeatherBackground(zipCode = "00000") {
  const { timeOfDay } = useDayNightBackground(zipCode);
  return timeOfDay; // "day" | "night"
}
