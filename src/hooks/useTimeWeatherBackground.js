// src/hooks/useTimeWeatherBackground.js
// @ts-nocheck

import { useMemo } from "react";
import { useAppSelector } from "@/redux/hooks.js";

/**
 * Simple hook that returns an inline style object for
 * a time-of-day + weather-aware background.
 *
 * It expects (optionally) a weather slice at state.weather.condition,
 * but safely falls back to "clear" if it isn't there.
 */
export default function useTimeWeatherBackground() {
  // NOTE: no TypeScript annotation here – plain JS only.
  const condition = useAppSelector(
    (state) => state.weather?.condition || "clear"
  );

  const hour = new Date().getHours();
  const isNight = hour < 6 || hour >= 19;

  const style = useMemo(() => {
    const base = {
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    };

    if (isNight) {
      // Night gradients
      if (condition === "rain" || condition === "storm") {
        return {
          ...base,
          backgroundImage:
            "radial-gradient(circle at top, #0f172a, #020617 45%, #000000 100%)",
        };
      }

      // Clear or cloudy night
      return {
        ...base,
        backgroundImage:
          "radial-gradient(circle at top, #020617, #020617 40%, #000000 100%)",
      };
    }

    // Daytime gradients
    if (condition === "rain" || condition === "storm") {
      return {
        ...base,
        backgroundImage:
          "linear-gradient(to bottom, #1d283a 0%, #020617 60%, #000000 100%)",
      };
    }

    if (condition === "snow") {
      return {
        ...base,
        backgroundImage:
          "linear-gradient(to bottom, #e5f3ff 0%, #93c5fd 35%, #0f172a 100%)",
      };
    }

    // Clear / default day
    return {
      ...base,
      backgroundImage:
        "linear-gradient(to bottom, #0ea5e9 0%, #22c55e 45%, #0f172a 100%)",
    };
  }, [condition, isNight]);

  return { condition, isNight, style };
}
