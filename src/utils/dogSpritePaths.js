/** @format */

// src/utils/dogSpritePaths.js
import { ASSETS } from '@/game/assetPaths.js';

export const DOG_STAGE_IDS = Object.freeze(['PUPPY', 'ADULT', 'SENIOR']);
export const DOG_STAGE_SHORT = Object.freeze(['pup', 'adult', 'senior']);

export const DOG_STATIC_SPRITE_FILES_BY_STAGE_ID = Object.freeze({
  PUPPY: 'jack_russell_puppy.png',
  ADULT: 'jack_russell_adult.png',
  SENIOR: 'jack_russell_senior.png',
});

export const DOG_STAGE_LABEL_BY_STAGE_ID = Object.freeze({
  PUPPY: 'Puppy',
  ADULT: 'Adult',
  SENIOR: 'Senior',
});

export function normalizeDogStageId(stageLike) {
  const s = String(stageLike || 'PUPPY')
    .trim()
    .toLowerCase();

  if (s.startsWith('adult') || s.includes('adult')) return 'ADULT';
  if (s.startsWith('sen') || s.includes('senior')) return 'SENIOR';

  // Accept `pup`, `puppy`, legacy stage strings
  return 'PUPPY';
}

export function normalizeDogStageShort(stageLike) {
  const id = normalizeDogStageId(stageLike);
  if (id === 'ADULT') return 'adult';
  if (id === 'SENIOR') return 'senior';
  return 'pup';
}

/**
 * Normalize cleanliness to a render condition key.
 * Accepts both tier IDs (FRESH/DIRTY/FLEAS/MANGE) and condition strings.
 */
export function normalizeDogCondition(conditionLike) {
  const c = String(conditionLike || 'clean')
    .trim()
    .toLowerCase();

  if (c === 'dirty' || c === 'dirt') return 'dirty';
  if (c === 'fleas' || c === 'flea') return 'fleas';
  if (c === 'mange') return 'mange';

  // Tier IDs
  if (c === 'dir' || c === 'dirty' || c === 'tier_dirty') return 'dirty';
  if (c === 'fleas' || c === 'tier_fleas') return 'fleas';
  if (c === 'mange' || c === 'tier_mange') return 'mange';

  // Treat "fresh" as clean
  return 'clean';
}

export function getDogStageLabel(stageLike) {
  const id = normalizeDogStageId(stageLike);
  return DOG_STAGE_LABEL_BY_STAGE_ID[id] || 'Puppy';
}

/**
 * Static 9x9-ish sheet used by the non-Pixi animator.
 */
export function getDogStaticSpriteUrl(stageLike) {
  const id = normalizeDogStageId(stageLike);
  const file =
    DOG_STATIC_SPRITE_FILES_BY_STAGE_ID[id] ||
    DOG_STATIC_SPRITE_FILES_BY_STAGE_ID.PUPPY;
  return ASSETS.sprite(file);
}

/**
 * Pixi sheet path: /assets/sprites/jr/<stage>_<condition>.png
 */
export function getDogPixiSheetUrl(stageLike, conditionLike) {
  const stage = normalizeDogStageShort(stageLike);
  const condition = normalizeDogCondition(conditionLike);
  return `/assets/sprites/jr/${stage}_${condition}.png`;
}
