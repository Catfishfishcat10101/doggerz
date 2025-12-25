/** @format */

// src/features/dog/dogSelectors.js

import {
  getDogPixiSheetUrl,
  getDogStageLabel,
  getDogStaticSpriteUrl,
} from '@/utils/dogSpritePaths.js';

export const selectDog = (state) => state?.dog || {}; // change if your store path differs

/**
 * Accept either a Redux `state` or a `dog` object and return the dog object.
 * This makes the selectors tolerant to callers that pass the dog slice directly.
 */
function _resolveDog(stateOrDog) {
  if (!stateOrDog) return {};

  // Heuristics: if object has `lifeStage` or `cleanlinessTier` assume it's a dog
  if (
    typeof stateOrDog === 'object' &&
    (stateOrDog.lifeStage || stateOrDog.cleanlinessTier || stateOrDog.stage)
  ) {
    return stateOrDog;
  }

  // Otherwise assume it's the Redux state
  return selectDog(stateOrDog) || {};
}

/**
 * Derive lightweight render params for sprite components.
 * Returns an object: `{ stage, condition, anim }` where:
 * - `stage` is one of `pup|adult|senior` (lowercase)
 * - `condition` is `clean|dirty|fleas|mange` (maps from cleanlinessTier or cleanliness)
 * - `anim` is a simple animation hint: `sleep|bark|walk|idle`
 */
export function selectDogRenderParams(stateOrDog) {
  const dog = _resolveDog(stateOrDog) || {};

  // life stage may be at dog.lifeStage.stage, dog.stage, or legacy `stage` strings
  const rawStage =
    dog.lifeStage?.stage || dog.stage || dog.life_stage || 'PUPPY';
  const lowerStage = String(rawStage || '').toLowerCase();

  const stage =
    lowerStage.startsWith('pup') || lowerStage.includes('puppy')
      ? 'pup'
      : lowerStage.startsWith('adult') || lowerStage.includes('adult')
      ? 'adult'
      : 'senior';

  // Allow multiple possible cleanliness fields and be resilient to casing
  const tierRaw =
    dog.cleanlinessTier || dog.cleanliness_tier || dog.cleanliness || 'FRESH';
  const tier = String(tierRaw).toUpperCase();
  const condition =
    tier === 'DIRTY'
      ? 'dirty'
      : tier === 'FLEAS'
      ? 'fleas'
      : tier === 'MANGE'
      ? 'mange'
      : 'clean';

  // Animation hint: prefer explicit flags, then lastAction heuristics
  const isSleeping =
    !!dog.isAsleep ||
    !!dog.is_sleeping ||
    (dog.lastAction || '').toLowerCase().includes('sleep');
  const last = (dog.lastAction || dog.last_action || '')
    .toString()
    .toLowerCase();
  const isBarking = last.includes('bark') || last === 'bark';
  const isWalking =
    last === 'walk' ||
    last === 'walking' ||
    last === 'zoomies' ||
    last.includes('run');

  const anim = isSleeping
    ? 'sleep'
    : isBarking
    ? 'bark'
    : isWalking
    ? 'walk'
    : 'idle';

  return { stage, condition, anim };
}

/**
 * Canonical render model for dog visuals.
 *
 * Returns:
 *   {
 *     stage: "pup"|"adult"|"senior",
 *     stageLabel: string,
 *     condition: "clean"|"dirty"|"fleas"|"mange",
 *     anim: "sleep"|"bark"|"walk"|"idle",
 *     staticSpriteUrl: string,
 *     pixiSheetUrl: string,
 *     pixiSheetFallbackUrl: string,
 *   }
 */
export function selectDogRenderModel(stateOrDog) {
  const dog = _resolveDog(stateOrDog) || {};
  const { stage, condition, anim } = selectDogRenderParams(dog);

  // Prefer existing label if provided by the state, otherwise derive from stage.
  const stageLabel = dog.lifeStage?.label || getDogStageLabel(stage);

  const staticSpriteUrl = getDogStaticSpriteUrl(stage);
  const pixiSheetUrl = getDogPixiSheetUrl(stage, condition);
  const pixiSheetFallbackUrl = getDogPixiSheetUrl(stage, 'clean');

  return {
    stage,
    stageLabel,
    condition,
    anim,
    staticSpriteUrl,
    pixiSheetUrl,
    pixiSheetFallbackUrl,
  };
}

/**
 * Provide a lightweight filename hint for sprite selection.
 * Returns a best-effort filename like `jack_russell_pup_clean.png`.
 * Note: callers may prefer to use a centralized asset helper instead of this
 * hint when switching to an atlas or different naming scheme.
 */
export function selectDogSpriteHint(stateOrDog) {
  const dog = _resolveDog(stateOrDog) || {};
  const { stage, condition } = selectDogRenderParams(dog);

  const breedRaw = dog.breed || dog.species || dog.type || 'jack_russell';
  const breed = String(breedRaw)
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');

  return `${breed}_${stage}_${condition}.png`;
}
