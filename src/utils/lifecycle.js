/** @format */

// src/utils/lifecycle.js
// @ts-nocheck

// Keep this file self-contained so it can't break if imports elsewhere are wrong.
// Note: sprite path helpers live in a small shared module to keep URLs consistent.

import {
  getDogStaticSpriteUrl,
  normalizeDogStageId,
} from '@/utils/dogSpritePaths.js';

/**
 * How many in-game "dog days" pass per real day.
 * Used for age calculations and any "time moves differently" UI.
 */
export const GAME_DAYS_PER_REAL_DAY = 4;

/**
 * Lifecycle / age stages in in-game days.
 * You can tweak these min/max thresholds without touching the rest of the code.
 */
export const LIFE_STAGES = {
  PUPPY: { min: 0, max: 180, label: 'Puppy' },
  ADULT: { min: 181, max: 2555, label: 'Adult' },
  SENIOR: { min: 2556, max: 5475, label: 'Senior' },
};

// Flattened stages for lookup
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
    // Default to puppy
    return { id: 'PUPPY', ...LIFE_STAGES.PUPPY };
  }

  const match = ALL_STAGES.find(
    (stage) => ageInGameDays >= stage.min && ageInGameDays <= stage.max
  ) || { id: 'SENIOR', ...LIFE_STAGES.SENIOR };

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
 * Human-readable label for a life stage ID.
 * Accepts "PUPPY" | "ADULT" | "SENIOR" (case-insensitive).
 */
export function getLifeStageLabel(stageId) {
  const key = String(stageId || 'PUPPY')
    .toUpperCase()
    .trim();
  const stage = LIFE_STAGES[key];
  return stage?.label ?? 'Puppy';
}

/**
 * Central map of sprite sheets by life stage.
 * These paths are served from /public/sprites.
 */
const STAGE_SPRITES = {
  PUPPY: getDogStaticSpriteUrl('PUPPY'),
  ADULT: getDogStaticSpriteUrl('ADULT'),
  SENIOR: getDogStaticSpriteUrl('SENIOR'),
};

/**
 * Simple helper: life stage → sprite path.
 */
export function getSpriteForLifeStage(stageId) {
  const key = normalizeDogStageId(stageId);
  return STAGE_SPRITES[key] || STAGE_SPRITES.PUPPY;
}

/**
 * Pick the correct sprite sheet path for the current stage + cleanliness.
 *
 * For now cleanlinessTier is ignored, but the parameter is kept so you can
 * branch later for DIRTY / FLEAS / MANGE sprite variants.
 *
 * Accepts either:
 *   getSpriteForStageAndTier("PUPPY", "FRESH")
 *   getSpriteForStageAndTier({ stageId: "ADULT", cleanlinessTier: "DIRTY" })
 */
export function getSpriteForStageAndTier(stageOrObj, cleanlinessTier) {
  let stageKey;

  if (stageOrObj && typeof stageOrObj === 'object') {
    stageKey =
      stageOrObj.stageId ||
      stageOrObj.stage ||
      stageOrObj.lifeStage ||
      stageOrObj.stageKey;
  } else {
    stageKey = stageOrObj;
  }

  const key = normalizeDogStageId(stageKey);

  // cleanlinessTier is currently unused, but left here for future branching:
  // e.g. change sprite based on DIRTY / FLEAS / MANGE variants.

  return STAGE_SPRITES[key] || STAGE_SPRITES.PUPPY;
}
