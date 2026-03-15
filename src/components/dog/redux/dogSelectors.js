// src/components/dog/redux/dogSelectors.js

import { createSelector } from "@reduxjs/toolkit";
import {
  getDogPixiSheetUrl,
  getDogStageLabel,
  getDogStaticSpriteUrl,
} from "@/utils/dogSpritePaths.js";
import { derivePersonalityAnimationHint } from "@/features/dog/dogEngine.js";
import { derivePersonalityProfile } from "@/features/dog/personalityProfile.js";
import {
  getHealthAnimationState,
  resolveDogAnimationState,
} from "@/components/dog/dogAnimationEngine.js";

const EMPTY_DOG = Object.freeze({});

export const selectDog = (state) => state?.dog || EMPTY_DOG;

export const selectDogAnimation = createSelector([selectDog], (dog) =>
  derivePersonalityAnimationHint(dog?.personality?.traits || {})
);
export const selectDogPersonalityProfile = createSelector([selectDog], (dog) =>
  dog?.personalityProfile && typeof dog.personalityProfile === "object"
    ? dog.personalityProfile
    : derivePersonalityProfile(dog || {})
);

function normalizeAction(action) {
  return String(action || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_");
}

function resolveDog(stateOrDog) {
  if (!stateOrDog) return EMPTY_DOG;

  if (
    typeof stateOrDog === "object" &&
    (stateOrDog.lifeStage || stateOrDog.cleanlinessTier || stateOrDog.stage)
  ) {
    return stateOrDog;
  }

  return selectDog(stateOrDog) || EMPTY_DOG;
}

export function selectDogRenderParams(stateOrDog) {
  const dog = resolveDog(stateOrDog);
  return resolveDogAnimationState(dog);
}

function buildDogRenderModel(stateOrDog) {
  const dog = resolveDog(stateOrDog);
  const { stage, condition, anim, isSleeping, restState, animCategory } =
    selectDogRenderParams(dog);
  const personalityProfile =
    dog?.personalityProfile && typeof dog.personalityProfile === "object"
      ? dog.personalityProfile
      : derivePersonalityProfile(dog || {});

  const stageLabel = dog.lifeStage?.label || getDogStageLabel(stage);
  const healthAnimation = getHealthAnimationState(dog);
  const actionBoost = /zoomies/.test(
    normalizeAction(dog.lastAction || dog.last_action)
  )
    ? 1.55
    : 1;

  const staticSpriteUrl = getDogStaticSpriteUrl(stage);
  const pixiSheetUrl = getDogPixiSheetUrl(stage, condition);
  const pixiSheetFallbackUrl = getDogPixiSheetUrl(stage, "clean");

  return {
    stage,
    stageLabel,
    condition,
    anim,
    isSleeping,
    restState,
    animCategory,
    healthBand: healthAnimation.healthBand,
    animationSpeedMultiplier:
      healthAnimation.animationSpeedMultiplier * actionBoost,
    ignoreToys: healthAnimation.ignoreToys,
    personalityProfile,
    ghostSyncRate: Number(dog?.legacyJourney?.spiritSyncRate || 0),
    ghostMimicAction: dog?.legacyJourney?.ghostMimicAction || null,
    ghostMimicMatch: Boolean(dog?.legacyJourney?.ghostMimicMatch),
    staticSpriteUrl,
    pixiSheetUrl,
    pixiSheetFallbackUrl,
  };
}

export const selectDogRenderModel = createSelector([selectDog], (dog) =>
  buildDogRenderModel(dog)
);

export function selectDogRenderModelFromDog(dogLike) {
  return buildDogRenderModel(dogLike);
}

export const selectDogTrustProfile = createSelector(
  [selectDog],
  (dog) =>
    (dog?.personalityProfile && typeof dog.personalityProfile === "object"
      ? dog.personalityProfile
      : derivePersonalityProfile(dog || {})
    ).trust
);

export const selectDogStressSignals = createSelector(
  [selectDog],
  (dog) =>
    (dog?.personalityProfile && typeof dog.personalityProfile === "object"
      ? dog.personalityProfile
      : derivePersonalityProfile(dog || {})
    ).stressSignals
);

export function selectDogSpriteHint(stateOrDog) {
  const dog = resolveDog(stateOrDog);
  const { stage, condition } = selectDogRenderParams(dog);

  const breedRaw = dog.breed || dog.species || dog.type || "jack_russell";
  const breed = String(breedRaw)
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");

  return `${breed}_${stage}_${condition}.png`;
}
