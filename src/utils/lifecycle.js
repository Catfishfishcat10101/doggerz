// src/utils/lifecycle.js
// @ts-nocheck

// Reuse the shared game constants so everything stays in sync.
import { LIFE_STAGES, GAME_DAYS_PER_REAL_DAY } from "@/constants/game.js";

// For now we still point at your existing sprite sheet;
// later we can branch by stage or breed.
import puppySheet from "@/assets/sprites/jack_russell_directions.png";

/**
 * Convert adoption timestamp → game age (in "game days") + stage label.
 *
 * Returns:
 *   {
 *     ageInGameDays: number,
 *     stageId: "PUPPY" | "ADULT" | "SENIOR",
 *     label: string
 *   }
 */
export function calculateDogAge(adoptedAtMs, now = Date.now()) {
  if (!adoptedAtMs) return null;

  const msPerRealDay = 24 * 60 * 60 * 1000;
  const msPerGameDay = msPerRealDay / GAME_DAYS_PER_REAL_DAY;

  const ageInGameDays = Math.floor((now - adoptedAtMs) / msPerGameDay);

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
 * Life-stage → sprite sheet path.
 * Later we can fork to puppy/adult/senior sheets.
 */
export function getSpriteForLifeStage(stageId) {
  switch (stageId) {
    case "PUPPY":
    case "ADULT":
    case "SENIOR":
    default:
      // All stages use the same sheet for now
      return puppySheet;
  }
};
