// src/utils/lifecycle.js
// @ts-nocheck

import { LIFE_STAGES, GAME_DAYS_PER_REAL_DAY } from "@/constants/game.js";

const DEFAULT_SPRITE_SRC = "/sprites/jack_russell_directions.png";

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

export function getSpriteForLifeStage(stageId) {
  switch (stageId) {
    case "PUPPY":
    case "ADULT":
    case "SENIOR":
    default:
      return DEFAULT_SPRITE_SRC;
  }
}
