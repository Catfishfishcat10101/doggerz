// src/utils/lifecycle.js
// @ts-nocheck
//
// Doggerz lifecycle + sprite helpers.
// - Converts adoption timestamp → "game days" + life stage.
// - Chooses sprite sheet per life stage + cleanliness tier.
//
// Sprite atlas is built from the jackrussell folder:
//  - puppy / adult / senior
//  - each has FRESH, DIRTY, FLEAS, MANGE variants

import puppyHdSvg from "@/assets/sprites/jackrussell/jack_russell_puppy_hd.svg";
import puppySvg from "@/assets/sprites/jackrussell/jack_russell_puppy.svg";
import puppyFresh from "@/assets/sprites/jackrussell/jack_russell_puppy.png";
import puppyDirty from "@/assets/sprites/jackrussell/jack_russell_puppy_dirty.png";
import puppyFleas from "@/assets/sprites/jackrussell/jack_russell_puppy_fleas.png";
import puppyMange from "@/assets/sprites/jackrussell/jack_russell_puppy_mange.png";

import adultSvg from "@/assets/sprites/jackrussell/jack_russell_adult.svg";
import adultFresh from "@/assets/sprites/jackrussell/jack_russell_adult.png";
import adultDirty from "@/assets/sprites/jackrussell/jack_russell_adult_dirty.png";
import adultFleas from "@/assets/sprites/jackrussell/jack_russell_adult_fleas.png";
import adultMange from "@/assets/sprites/jackrussell/jack_russell_adult_mange.png";

import seniorHdSvg from "@/assets/sprites/jackrussell/jack_russell_senior_hd.svg";
import seniorSvg from "@/assets/sprites/jackrussell/jack_russell_senior.svg";
import seniorFresh from "@/assets/sprites/jackrussell/jack_russell_senior.png";
import seniorDirty from "@/assets/sprites/jackrussell/jack_russell_senior_dirty.png";
import seniorFleas from "@/assets/sprites/jackrussell/jack_russell_senior_fleas.png";
import seniorMange from "@/assets/sprites/jackrussell/jack_russell_senior_mange.png";

// How fast the in-game dog ages vs real time.
// 4 = 1 real day = 4 game days.
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
 * ms for a single "game day" based on GAME_DAYS_PER_REAL_DAY
 */
export function getMsPerGameDay() {
  return (24 * 60 * 60 * 1000) / GAME_DAYS_PER_REAL_DAY;
}

/**
 * Given total game-days since adoption, return stage definition.
 */
export function getLifeStageForDays(totalGameDays) {
  if (totalGameDays >= LIFE_STAGES.SENIOR.min) return LIFE_STAGES.SENIOR;
  if (totalGameDays >= LIFE_STAGES.ADULT.min) return LIFE_STAGES.ADULT;
  return LIFE_STAGES.PUPPY;
}

/**
 * Convert adoption timestamp to game age and stage info.
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

// Sprite atlas: stage → cleanliness tier → sheet
const SPRITE_ATLAS = {
  PUPPY: {
    // Prefer HD SVG -> SVG -> PNG for the fresh sheet
    FRESH: puppyHdSvg || puppySvg || puppyFresh,
    DIRTY: puppyDirty,
    FLEAS: puppyFleas,
    MANGE: puppyMange,
  },
  ADULT: {
    FRESH: adultSvg || adultFresh,
    DIRTY: adultDirty,
    FLEAS: adultFleas,
    MANGE: adultMange,
  },
  SENIOR: {
    FRESH: seniorHdSvg || seniorSvg || seniorFresh,
    DIRTY: seniorDirty,
    FLEAS: seniorFleas,
    MANGE: seniorMange,
  },
};

/**
 * Map (life stage, cleanliness tier) → sprite sheet URL.
 *
 * stageId: "PUPPY" | "ADULT" | "SENIOR"
 * cleanlinessTier: "FRESH" | "DIRTY" | "FLEAS" | "MANGE"
 */
export function getSpriteForStageAndTier(stageId, cleanlinessTier = "FRESH") {
  const safeStage = SPRITE_ATLAS[stageId] || SPRITE_ATLAS.PUPPY;
  const safeTier =
    cleanlinessTier && safeStage[cleanlinessTier] ? cleanlinessTier : "FRESH";

  return safeStage[safeTier] || safeStage.FRESH || puppyFresh;
}

/**
 * Backwards-compat: if you only care about stage.
 * (Used if any old code still calls this.)
 */
export function getSpriteForLifeStage(stageId) {
  return getSpriteForStageAndTier(stageId, "FRESH");
}

// Dev helper
if (import.meta.env.DEV) {
  console.log("[lifecycle] sprite atlas (dev):", {
    puppyFresh: SPRITE_ATLAS.PUPPY.FRESH,
    adultFresh: SPRITE_ATLAS.ADULT.FRESH,
    seniorFresh: SPRITE_ATLAS.SENIOR.FRESH,
  });
}
