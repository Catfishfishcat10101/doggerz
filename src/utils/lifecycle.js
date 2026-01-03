/** @format */

// src/utils/lifecycle.js
// @ts-nocheck

import { withBaseUrl } from '@/utils/assetUrl.js';

// Keep this file self-contained so it can't break if constants imports are wrong.

// How many in-game days pass per real day.
// Tuning: keep this low so puppies don't age up too fast.
export const GAME_DAYS_PER_REAL_DAY = 1;

// Lifecycle / age stages (in-game days)
export const LIFE_STAGES = {
  PUPPY: { min: 0, max: 180, label: 'Puppy' },
  ADULT: { min: 181, max: 2555, label: 'Adult' },
  SENIOR: { min: 2556, max: 5475, label: 'Senior' },
};

// Flattened stages for lookup
const ALL_STAGES = Object.entries(LIFE_STAGES).map(([key, stage]) => ({
  id: key,
  ...stage,
}));

/**
 * Given an age in "game days", pick the correct life stage bucket.
 * Returns one of the LIFE_STAGES entries with an added `id` field.
 */
export function getLifeStageForAge(ageInGameDays) {
  if (!Number.isFinite(ageInGameDays) || ageInGameDays < 0) {
    // default to puppy
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

  // Compatibility: older code expects { stage, label, days }
  // while newer code may expect { stageId, stageLabel, ageInGameDays }.
  return {
    // primary numeric
    days: ageInGameDays,
    ageInGameDays,

    // stage identifiers
    stage: stage.id,
    label: stage.label,
    stageId: stage.id,
    stageLabel: stage.label,

    // richer info (avoid clobbering the string `stage` above)
    stageInfo: stage,
  };
}

/**
 * Map a life stage → appropriate sprite sheet path.
 *
 * These are served from /public/sprites so the paths are:
 *   /sprites/jack_russell_puppy.webp
 *   /sprites/jack_russell_adult.webp
 *   /sprites/jack_russell_senior.webp
 */
export function getSpriteForLifeStage(stageId) {
  switch (stageId) {
    case 'PUPPY':
      return withBaseUrl('/sprites/jack_russell_puppy.webp');
    case 'ADULT':
      return withBaseUrl('/sprites/jack_russell_adult.webp');
    case 'SENIOR':
    default:
      return withBaseUrl('/sprites/jack_russell_senior.webp');
  }
}

/*
  Helper: getSpriteForStageAndTier
  - Accepts either (stageKey, cleanlinessTier) or a dog-like object:
      getSpriteForStageAndTier('PUPPY', 'FRESH')
      getSpriteForStageAndTier({ stage: 'ADULT', cleanlinessTier: 'DIRTY' })
  - Returns a string path to the spritesheet (adjust paths to your public/assets layout).
*/
export function getSpriteForStageAndTier(stageOrObj, cleanlinessTier) {
  // Resolve inputs
  let stageKey;
  let tier = cleanlinessTier;

  if (stageOrObj && typeof stageOrObj === 'object') {
    stageKey =
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

  stageKey = String(stageKey || 'PUPPY')
    .toUpperCase()
    .trim();
  // Keep the tier parsing for future art variants, but don't treat it as a hard requirement.
  // (Prefix with _ to avoid lint warnings until tier-specific sprites exist.)
  const _tierKey = String(tier || 'FRESH')
    .toUpperCase()
    .trim();

  // Tier-specific sprites are not shipped yet; keep the interface and
  // route everything through the canonical public sprite paths.
  // (We intentionally ignore `tier` until art exists.)
  return getSpriteForLifeStage(stageKey);
}
