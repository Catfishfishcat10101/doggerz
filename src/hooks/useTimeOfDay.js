// src/hooks/useTimeOfDay.js
// @ts-nocheck

import { useEffect, useState } from "react";
import { getTimeOfDay, getAmbientWeatherHint } from "@/utils/weather.js";

/**
 * Keeps a time-of-day bucket in sync with the real clock.
 * Re-checks every 60 seconds by default.
 */
export function useTimeOfDay(pollMs = 60_000) {
  const [timeOfDay, setTimeOfDay] = useState(() => getTimeOfDay());

  useEffect(() => {
    const update = () => setTimeOfDay(getTimeOfDay());
    update(); // run once immediately

    const id = setInterval(update, pollMs);
    return () => clearInterval(id);
  }, [pollMs]);

  return timeOfDay;
}

/**
 * Convenience hook that returns { timeOfDay, hint } for UI.
 */
export function useAmbientWeatherHint(pollMs = 60_000) {
  const timeOfDay = useTimeOfDay(pollMs);
  const [hint, setHint] = useState(() => getAmbientWeatherHint());

  useEffect(() => {
    // whenever time-of-day changes, recompute hint
    setHint(getAmbientWeatherHint());
  }, [timeOfDay]);

  return { timeOfDay, hint };
}
