// src/utils/lifecycle.js
import { GAME_DAYS_PER_REAL_DAY, LIFE_STAGES } from "@/constants/game.js";

/**
 * Convert adoption timestamp → in-game age + lifecycle stage.
 *
 * Returns:
 * { stage: "PUPPY" | "ADULT" | "SENIOR", label: string, days: number }
 */
export function calculateDogAge(adoptedAtMs) {
  if (!adoptedAtMs || !Number.isFinite(adoptedAtMs)) {
    return { stage: "PUPPY", label: LIFE_STAGES.PUPPY.label, days: 0 };
  }

  const now = Date.now();
  const realDaysElapsed = (now - adoptedAtMs) / (1000 * 60 * 60 * 24);
  const gameDays = Math.max(
    0,
    Math.floor(realDaysElapsed * GAME_DAYS_PER_REAL_DAY)
  );

  // Generic resolution based on LIFE_STAGES config
  let resolvedStageKey = null;
  let resolvedStage = null;

  for (const [key, def] of Object.entries(LIFE_STAGES)) {
    const min = def.min ?? 0;
    const max = def.max ?? Number.POSITIVE_INFINITY;

    if (gameDays >= min && gameDays <= max) {
      resolvedStageKey = key;
      resolvedStage = def;
      break;
    }
  }

  // If age exceeds all configured ranges, treat as SENIOR forever
  if (!resolvedStage) {
    resolvedStageKey = "SENIOR";
    resolvedStage = LIFE_STAGES.SENIOR || { label: "Senior" };
  }

  return {
    stage: resolvedStageKey,
    label: resolvedStage.label || resolvedStageKey,
    days: gameDays,
  };
}

/**
 * Resolve sprite sheet path for a given stage key.
 * These paths assume your PNGs live in /public/sprites/.
 */
export function getSpriteSheet(stage) {
  const key = typeof stage === "string" ? stage.toUpperCase() : "ADULT";

  const sheets = {
    PUPPY: "/sprites/jack_russell_puppy.png",
    ADULT: "/sprites/jack_russell_adult.png",
    SENIOR: "/sprites/jack_russell_senior.png",
  };

  return sheets[key] || sheets.ADULT;
}
