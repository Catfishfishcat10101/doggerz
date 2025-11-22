// src/utils/lifecycle.js
// @ts-nocheck

// Reuse your central game constants so we don't duplicate definitions.
import { GAME_DAYS_PER_REAL_DAY, LIFE_STAGES } from "@/constants/game.js";

// Flattened stages for lookup
const ALL_STAGES = Object.entries(LIFE_STAGES).map(([key, stage]) => ({
  id: key,
  ...stage,
}));

/**
 * Given an age in "game days", pick the correct life stage bucket.
 * Returns one of the LIFE_STAGES entries with an added `id` field.
 */
export function getLifeStageForAge(ageInGameDays) {
  if (!Number.isFinite(ageInGameDays) || ageInGameDays < 0) {
    // default to puppy
    return { id: "PUPPY", ...LIFE_STAGES.PUPPY };
  }

  const match = ALL_STAGES.find(
    (stage) => ageInGameDays >= stage.min && ageInGameDays <= stage.max
  ) || { id: "SENIOR", ...LIFE_STAGES.SENIOR };

  return match;
}

/**
 * Convert adoption timestamp → age info.
 *
 * Returns:
 * {
 *   ageInGameDays: number,
 *   stageId: "PUPPY" | "ADULT" | "SENIOR",
 *   stageLabel: string,
 *   stage: { id, min, max, label }
 * }
 */
export function calculateDogAge(adoptedAtMs, now = Date.now()) {
  if (!adoptedAtMs || !Number.isFinite(adoptedAtMs)) return null;

  // 24 hours in ms, divided by how many game days per real day
  const msPerGameDay = (24 * 60 * 60 * 1000) / GAME_DAYS_PER_REAL_DAY;

  const ageInGameDays = Math.max(
    0,
    Math.floor((now - adoptedAtMs) / msPerGameDay)
  );

  const stage = getLifeStageForAge(ageInGameDays);

  return {
    ageInGameDays,
    stageId: stage.id,
    stageLabel: stage.label,
    stage,
  };
}

/**
 * Map a life stage → appropriate sprite sheet path.
 *
 * These are served from /public/sprites so the paths are:
 *   /sprites/jack_russell_puppy.png
 *   /sprites/jack_russell_adult.png
 *   /sprites/jack_russell_senior.png
 */
export function getSpriteForLifeStage(stageId) {
  switch (stageId) {
    case "PUPPY":
      return "/sprites/jack_russell_puppy.png";
    case "ADULT":
      return "/sprites/jack_russell_adult.png";
    case "SENIOR":
    default:
      return "/sprites/jack_russell_senior.png";
  }
}
