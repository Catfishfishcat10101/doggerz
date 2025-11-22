// src/utils/lifecycle.js
// @ts-nocheck

import { LIFE_STAGES, GAME_DAYS_PER_REAL_DAY } from "@/constants/game.js";

/**
 * Convert adoption timestamp → game age (in "game days") + stage info.
 *
 * GAME_DAYS_PER_REAL_DAY controls how fast time moves, e.g.
 *  - 4  => 1 real day = 4 game days
 *  - 8  => 1 real day = 8 game days
 */
export function calculateDogAge(adoptedAtMs, now = Date.now()) {
  if (!adoptedAtMs) return null;

  const MS_PER_REAL_DAY = 24 * 60 * 60 * 1000;
  const msPerGameDay = MS_PER_REAL_DAY / GAME_DAYS_PER_REAL_DAY;

  const diffMs = Math.max(0, now - adoptedAtMs);
  const ageInGameDays = Math.floor(diffMs / msPerGameDay);

  let stageId = "PUPPY";

  for (const [key, cfg] of Object.entries(LIFE_STAGES)) {
    if (ageInGameDays >= cfg.min && ageInGameDays <= cfg.max) {
      stageId = key;
      break;
    }
  }

  const label = LIFE_STAGES[stageId]?.label ?? "Puppy";

  return {
    ageInGameDays,
    stageId,
    label,
  };
}

/**
 * Convenience helper: compute age info from a dog object.
 */
export function getDogAgeInfo(dog, now = Date.now()) {
  if (!dog || !dog.adoptedAtMs) return null;
  return calculateDogAge(dog.adoptedAtMs, now);
}
// End of src/utils/lifecycle.js