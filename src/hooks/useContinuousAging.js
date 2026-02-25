import { useEffect, useState } from "react";
import { MS_PER_GAME_DAY } from "@/utils/lifecycle.js";

const DAYS_TO_ADULT = 30;
const STARTING_SCALE = 0.4;
const MAX_SCALE = 1;

function parseTimestamp(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function clamp01(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

/**
 * Continuous age and growth-scale mapping.
 * Uses core lifecycle timing so visual growth stays aligned with game logic.
 */
export function useContinuousAging(
  birthDateTimestamp,
  {
    daysToAdult = DAYS_TO_ADULT,
    startingScale = STARTING_SCALE,
    maxScale = MAX_SCALE,
    intervalMs = 10_000,
  } = {}
) {
  const [gameAgeInDays, setGameAgeInDays] = useState(0);
  const [growthScale, setGrowthScale] = useState(1);

  useEffect(() => {
    const birthMs = parseTimestamp(birthDateTimestamp);
    if (!birthMs) {
      setGameAgeInDays(0);
      setGrowthScale(1);
      return undefined;
    }

    const msPerGameDay =
      Number(MS_PER_GAME_DAY) > 0 ? Number(MS_PER_GAME_DAY) : 43_200_000;

    const update = () => {
      const now = Date.now();
      const elapsedRealMs = Math.max(0, now - birthMs);
      const exactGameAge = elapsedRealMs / msPerGameDay;
      const progress = clamp01(
        exactGameAge / Math.max(1, Number(daysToAdult) || DAYS_TO_ADULT)
      );
      const nextScale =
        Number(startingScale) +
        progress * (Number(maxScale) - Number(startingScale));

      setGameAgeInDays(exactGameAge);
      setGrowthScale(nextScale);
    };

    update();
    const id = window.setInterval(
      update,
      Math.max(1000, Math.round(intervalMs))
    );
    return () => window.clearInterval(id);
  }, [birthDateTimestamp, daysToAdult, intervalMs, maxScale, startingScale]);

  return { gameAgeInDays, growthScale };
}

export default useContinuousAging;
