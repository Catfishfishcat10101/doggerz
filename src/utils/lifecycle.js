/** @format */

// src/utils/lifecycle.js

import { withBaseUrl } from "@/utils/assetUrl.js";

// How many in-game "dog days" pass per real day.
// Tuning: higher => faster aging. Keep this high enough for visible progress,
// but not so high that stages churn too quickly.
export const GAME_DAYS_PER_REAL_DAY = 4;

// Lifecycle / age stages (in-game days)
export const LIFE_STAGES = {
  PUPPY: { min: 0, max: 180, label: "Puppy" },
  ADULT: { min: 181, max: 2555, label: "Adult" },
  SENIOR: { min: 2556, max: 5475, label: "Senior" },
};

const ALL_STAGES = Object.entries(LIFE_STAGES).map(([id, stage]) => ({
  id,
  ...stage,
}));

/**
 * Given an age in "game days", pick the correct life stage bucket.
 * Returns one of the LIFE_STAGES entries with an added `id` field.
 */
export function getLifeStageForAge(ageInGameDays) {
  if (!Number.isFinite(ageInGameDays) || ageInGameDays < 0) {
    return { id: "PUPPY", ...LIFE_STAGES.PUPPY };
  }

  return (
    ALL_STAGES.find(
      (stage) => ageInGameDays >= stage.min && ageInGameDays <= stage.max
    ) || { id: "SENIOR", ...LIFE_STAGES.SENIOR }
  );
}

/**
 * Convert adoption timestamp → age info.
 *
 * Compatibility: older code expects { stage, label, days }
 * while newer code may expect { stageId, stageLabel, ageInGameDays }.
 */
export function calculateDogAge(adoptedAtMs, now = Date.now()) {
  if (!adoptedAtMs || !Number.isFinite(adoptedAtMs)) return null;

  const msPerGameDay = (24 * 60 * 60 * 1000) / GAME_DAYS_PER_REAL_DAY;
  const ageInGameDays = Math.max(
    0,
    Math.floor((now - adoptedAtMs) / msPerGameDay)
  );

  const stageInfo = getLifeStageForAge(ageInGameDays);

  return {
    // numeric
    days: ageInGameDays,
    ageInGameDays,

    // stage identifiers
    stage: stageInfo.id,
    label: stageInfo.label,
    stageId: stageInfo.id,
    stageLabel: stageInfo.label,

    // richer info
    stageInfo,
  };
}

/**
 * Human-readable label for a life stage ID.
 */
export function getLifeStageLabel(stageId) {
  const key = String(stageId || "PUPPY")
    .toUpperCase()
    .trim();
  return LIFE_STAGES[key]?.label ?? "Puppy";
}

/**
 * Map a life stage → appropriate sprite sheet path.
 *
 * These are served from /public/sprites.
 */
export function getSpriteForLifeStage(stageId) {
  switch (
    String(stageId || "PUPPY")
      .toUpperCase()
      .trim()
  ) {
    case "ADULT":
      return withBaseUrl("/sprites/jrt_adult.webp");
    case "SENIOR":
      return withBaseUrl("/sprites/jrt_senior.webp");
    case "PUPPY":
    default:
      return withBaseUrl("/sprites/jrt_puppy.webp");
  }
}

/**
 * Helper: stage + cleanliness tier → sprite path.
 * Tier-specific sprites are not shipped yet, but the interface is kept.
 */
export function getSpriteForStageAndTier(stageOrObj, cleanlinessTier) {
  let stageKey;
  let tier = cleanlinessTier;

  if (stageOrObj && typeof stageOrObj === "object") {
    stageKey =
      stageOrObj.stageId ||
      stageOrObj.stage ||
      stageOrObj.lifeStage ||
      (stageOrObj.lifeStage && stageOrObj.lifeStage.stage) ||
      stageOrObj.stageKey;

    tier =
      tier ||
      stageOrObj.cleanlinessTier ||
      stageOrObj.cleanliness ||
      stageOrObj.tier;
  } else {
    stageKey = stageOrObj;
  }

  const stageNormalized = String(stageKey || "PUPPY")
    .toUpperCase()
    .trim();

  // Keep the tier parsing for future art variants. (Prefix with _ to avoid lint warnings.)
  const _tierKey = String(tier || "FRESH")
    .toUpperCase()
    .trim();
  void _tierKey;

  return getSpriteForLifeStage(stageNormalized);
}
