// src/utils/lifecycle.js
// @ts-nocheck

// Temporary spritesheet: reuse your existing jack_russell_directions.png
// until you have real 2048x2048 puppy/adult/senior sheets.
import jackRussellSheet from "@/assets/sprites/jack_russell_directions.png";

/**
 * How many in-game days pass per real-world day.
 * 4 = 1 real day → 4 game days.
 */
export const GAME_DAYS_PER_REAL_DAY = 4;

/**
 * Life stage bands in *game days*.
 */
export const LIFE_STAGES = {
  PUPPY: { min: 0, max: 180, label: "Puppy" },
  ADULT: { min: 181, max: 2555, label: "Adult" },
  SENIOR: { min: 2556, max: 5475, label: "Senior" },
};

/**
 * Given age in game days, return stage + label.
 */
function getLifeStageForGameDays(gameDays) {
  if (!Number.isFinite(gameDays) || gameDays < 0) {
    return { stage: "PUPPY", label: LIFE_STAGES.PUPPY.label };
  }

  if (gameDays <= LIFE_STAGES.PUPPY.max) {
    return { stage: "PUPPY", label: LIFE_STAGES.PUPPY.label };
  }

  if (gameDays <= LIFE_STAGES.ADULT.max) {
    return { stage: "ADULT", label: LIFE_STAGES.ADULT.label };
  }

  return { stage: "SENIOR", label: LIFE_STAGES.SENIOR.label };
}

/**
 * Convert adoption timestamp → game age (in game days) + stage info.
 *
 * @param {number} adoptedAtMs - timestamp (ms) when the dog was adopted
 * @param {number} [nowMs] - override "now" for testing
 * @returns {{ days: number; stage: string; label: string } | null}
 */
export function calculateDogAge(adoptedAtMs, nowMs = Date.now()) {
  if (!adoptedAtMs || !Number.isFinite(adoptedAtMs)) return null;

  const msPerGameDay = (24 * 60 * 60 * 1000) / GAME_DAYS_PER_REAL_DAY; // real ms per game day

  const diffMs = Math.max(0, nowMs - adoptedAtMs);
  const ageInGameDays = Math.floor(diffMs / msPerGameDay);

  const { stage, label } = getLifeStageForGameDays(ageInGameDays);

  return {
    days: ageInGameDays,
    stage, // "PUPPY" | "ADULT" | "SENIOR"
    label, // "Puppy" | "Adult" | "Senior"
  };
}

/**
 * Return sprite metadata for a given life stage.
 *
 * EnhancedDogSprite expects:
 * {
 *   image: string;       // URL / import for the sheet
 *   frameWidth: number;
 *   frameHeight: number;
 *   framesPerRow: number;
 *   sheetHeight?: number;
 * }
 *
 * For now we always return the same jack russell sheet; later you’ll
 * branch on stage and swap in puppy/adult/senior 2048x2048 sheets.
 */
export function getSpriteForLifeStage(stageKey) {
  const key = (stageKey || "PUPPY").toString().toUpperCase();

  // Later, when you have real assets:
  // if (key === "PUPPY") return { image: puppySheet, ... };
  // if (key === "ADULT") return { image: adultSheet, ... };
  // if (key === "SENIOR") return { image: seniorSheet, ... };

  return {
    image: jackRussellSheet,
    frameWidth: 128,
    frameHeight: 128,
    framesPerRow: 16,
    sheetHeight: 2048, // used for backgroundSize; doesn't have to be exact
  };
}
