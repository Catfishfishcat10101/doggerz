/** @format */

// src/utils/lifecycle.js

import { withBaseUrl } from "@/utils/assetUrl.js";

// How many in-game "dog days" pass per real day.
// Tuning: higher => faster aging. Keep this high enough for visible progress,
// but not so high that stages churn too quickly.
export const GAME_DAYS_PER_REAL_DAY = 24;
export const MS_PER_GAME_DAY = (24 * 60 * 60 * 1000) / GAME_DAYS_PER_REAL_DAY;

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
 * Convert adoption timestamp -> age info.
 *
 * Compatibility: older code expects { stage, label, days }
 * while newer code may expect { stageId, stageLabel, ageInGameDays }.
 */
export function calculateDogAge(adoptedAtMs, now = Date.now()) {
  if (!adoptedAtMs || !Number.isFinite(adoptedAtMs)) return null;

  const ageInGameDays = Math.max(
    0,
    Math.floor((now - adoptedAtMs) / MS_PER_GAME_DAY)
  );

  const stageInfo = getLifeStageForAge(ageInGameDays);
  const nextStage = getNextLifeStage(stageInfo.id);
  const daysUntilNextStage = nextStage
    ? Math.max(0, nextStage.min - ageInGameDays)
    : null;

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
    daysUntilNextStage,
    nextStage,
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

export function getNextLifeStage(stageId) {
  const key = String(stageId || "PUPPY").toUpperCase().trim();
  if (key === "PUPPY") return { id: "ADULT", ...LIFE_STAGES.ADULT };
  if (key === "ADULT") return { id: "SENIOR", ...LIFE_STAGES.SENIOR };
  return null;
}

export function getDogAgeProgress(adoptedAtMs, now = Date.now()) {
  const age = calculateDogAge(adoptedAtMs, now);
  if (!age) return null;

  const { stageInfo } = age;
  const total = Math.max(1, stageInfo.max - stageInfo.min);
  const elapsed = Math.max(0, age.ageInGameDays - stageInfo.min);
  const pct = Math.max(0, Math.min(1, elapsed / total));

  return {
    ...age,
    stageProgress: pct,
    stageProgressPct: Math.round(pct * 100),
  };
}

/**
 * Map a life stage to the static Jack Russell sprite.
 */
export function getSpriteForLifeStage(_stageId) {
  const stage = String(_stageId || "PUPPY").toUpperCase();
  if (stage.startsWith("ADULT")) {
    return withBaseUrl("/sprites/jack_russell_adult.webp");
  }
  if (stage.startsWith("SENIOR")) {
    return withBaseUrl("/sprites/jack_russell_senior.webp");
  }
  return withBaseUrl("/sprites/jack_russell_puppy.webp");
}

/**
 * Helper: stage + cleanliness tier -> sprite path.
 * For now we only ship clean renders, so condition falls back to stage base.
 */
export function getSpriteForStageAndTier(_stageOrObj, _cleanlinessTier) {
  const stage =
    typeof _stageOrObj === "string"
      ? _stageOrObj
      : _stageOrObj?.stage || _stageOrObj?.stageId || _stageOrObj?.id;
  return getSpriteForLifeStage(stage || "PUPPY");
}

export function getAgeBucketLabel(days) {
  if (!Number.isFinite(days)) return "Unknown";
  if (days < 30) return "New pup";
  if (days < 120) return "Growing";
  if (days < 360) return "Young";
  if (days < 1200) return "Adult";
  if (days < 2500) return "Mature";
  return "Golden";
}
