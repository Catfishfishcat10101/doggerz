// src/utils/lifecycle.js
// @ts-nocheck

// For now we just use the same sheet for all life stages.
// Later you can plug in puppy/adult/senior-specific sheets.
import jackRussellSheet from "@/assets/sprites/jack_russell_directions.png";

// How many in-game days pass per real-world day.
export const GAME_DAYS_PER_REAL_DAY = 4;

// Life stages defined in *game days*
export const LIFE_STAGES = {
  PUPPY: { id: "PUPPY", min: 0, max: 180, label: "Puppy" },
  ADULT: { id: "ADULT", min: 181, max: 2555, label: "Adult" },
  SENIOR: { id: "SENIOR", min: 2556, max: 5475, label: "Senior" },
};

const ALL_STAGES = Object.values(LIFE_STAGES);

/**
 * Convert adoption timestamp → { ageInGameDays, stageId, stageLabel, stage }.
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
 * Given an age in game days, pick the correct life stage bucket.
 */
export function getLifeStageForAge(ageInGameDays) {
  if (!Number.isFinite(ageInGameDays) || ageInGameDays < 0) {
    return LIFE_STAGES.PUPPY;
  }

  const match = ALL_STAGES.find(
    (stage) => ageInGameDays >= stage.min && ageInGameDays <= stage.max
  );

  return match || LIFE_STAGES.SENIOR;
}

/**
 * ✅ This is the export EnhancedDogSprite is asking for.
 * For now we just return the same sprite sheet for every stage so
 * the game renders. Later you can swap based on stageId.
 */
export function getSpriteForLifeStage(stageId) {
  switch (stageId) {
    case LIFE_STAGES.PUPPY.id:
    case LIFE_STAGES.ADULT.id:
    case LIFE_STAGES.SENIOR.id:
    default:
      return jackRussellSheet;
  }
}
