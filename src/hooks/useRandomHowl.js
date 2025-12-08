// src/hooks/useRandomHowl.js
// @ts-nocheck

import { useEffect, useState } from "react";
import { useTimeOfDay } from "./useTimeOfDay.js";
import { shouldHowlAtMoon } from "@/utils/weather.js";

/**
 * Periodically rolls a random chance for a “howl” event.
 * Returns a boolean that flips to true briefly when a howl should trigger.
 */
export function useRandomHowl(intervalMs = 30_000) {
  const timeOfDay = useTimeOfDay();
  const [shouldHowlNow, setShouldHowlNow] = useState(false);

  useEffect(() => {
    let resetId;

    const tick = () => {
      const howl = shouldHowlAtMoon(timeOfDay);
      if (howl) {
        setShouldHowlNow(true);

        // Auto-reset after a short window so you can detect “edges”
        resetId = setTimeout(() => setShouldHowlNow(false), 2000);
      }
    };

    const id = setInterval(tick, intervalMs);
    return () => {
      clearInterval(id);
      if (resetId) clearTimeout(resetId);
    };
  }, [timeOfDay, intervalMs]);

  return shouldHowlNow;
}
