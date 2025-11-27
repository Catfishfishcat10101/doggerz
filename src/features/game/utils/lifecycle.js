// src/features/game/utils/lifecycle.js
// @ts-nocheck
//
// Doggerz lifecycle helpers.
// - Converts adoption timestamp → "game days" + life stage.
// - No sprite imports here; pure math so it can be used by Redux, pages, etc.

/** How many in-game days pass per real-world day. */
export const GAME_DAYS_PER_REAL_DAY = 4;

export const LIFE_STAGES = {
  PUPPY: {
    id: "PUPPY",
    label: "Puppy",
    min: 0,
    max: 180, // inclusive
  },
  ADULT: {
    id: "ADULT",
    label: "Adult",
    min: 181,
    max: 2555,
  },
  SENIOR: {
    id: "SENIOR",
    label: "Senior",
    min: 2556,
    max: 5475,
  },
};

/**
 * Milliseconds for a single "game day" based on GAME_DAYS_PER_REAL_DAY.
 */
export function getMsPerGameDay() {
  return (24 * 60 * 60 * 1000) / GAME_DAYS_PER_REAL_DAY;
}

/**
 * Given total game-days since adoption, return the life-stage definition.
 */
export function getLifeStageForDays(totalGameDays) {
  let days = Number.isFinite(totalGameDays) ? totalGameDays : 0;
  if (days < 0) days = 0;

  if (days >= LIFE_STAGES.SENIOR.min) return LIFE_STAGES.SENIOR;
  if (days >= LIFE_STAGES.ADULT.min) return LIFE_STAGES.ADULT;
  return LIFE_STAGES.PUPPY;
}

/**
 * Convert adoption timestamp to game age + stage info.
 *
 * Returns:
 * {
 *   adoptedAt: number,
 *   days: number,           // total game days since adoption
 *   stage: "PUPPY"|"ADULT"|"SENIOR",
 *   label: string,          // "Puppy" | "Adult" | "Senior"
 *   daysIntoStage: number,
 *   stageLength: number,
 *   progressInStage: number // 0..1
 * }
 */
export function calculateDogAge(adoptedAtMs, nowMs = Date.now()) {
  if (!adoptedAtMs) return null;
  if (!Number.isFinite(adoptedAtMs)) return null;

  const msPerDay = getMsPerGameDay();
  const diff = Math.max(0, nowMs - adoptedAtMs);
  const totalGameDays = Math.floor(diff / msPerDay);

  const stageDef = getLifeStageForDays(totalGameDays);
  const daysIntoStage = Math.max(0, totalGameDays - stageDef.min);
  const stageLength = Math.max(1, stageDef.max - stageDef.min);
  const progressInStage = Math.min(1, daysIntoStage / stageLength);

  return {
    adoptedAt: adoptedAtMs,
    days: totalGameDays,
    stage: stageDef.id,
    label: stageDef.label,
    daysIntoStage,
    stageLength,
    progressInStage,
  };
}
