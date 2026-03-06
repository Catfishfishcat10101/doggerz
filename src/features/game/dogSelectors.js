// src/features/game/dogSelectors.js

import { createSelector } from "@reduxjs/toolkit";
import {
  getDogPixiSheetUrl,
  getDogStageLabel,
  getDogStaticSpriteUrl,
} from "@/utils/dogSpritePaths.js";
import {
  DOG_ANIMATION_CATEGORIES,
  getDogAnimationCategory,
} from "@/utils/mapPoseToDogAction.js";
import { derivePersonalityAnimationHint } from "@/logic/dogEngine.js";
import { derivePersonalityProfile } from "@/logic/personalityProfile.js";

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

const TRICK_ACTIONS = new Set([
  "sit",
  "stay",
  "roll",
  "rollover",
  "roll_over",
  "spin",
  "jump",
  "paw",
  "bow",
  "beg",
  "play_dead",
  "playdead",
  "highfive",
  "wave",
  "shake",
  "crawl",
  "fetch",
  "dance",
]);

const EXPLICIT_ANIMS = new Set([
  "idle",
  "wag",
  "sleep",
  "bark",
  "scratch",
  "eat",
  "sit",
  "lay_down",
  "roll_over",
  "play_dead",
  "beg",
  "bow",
  "jump",
  "spin",
  "wave",
  "fetch",
  "walk_left",
  "walk_right",
  "turn_walk_right",
  "sniff",
]);

const EXPLICIT_ACTION_ALIASES = {
  feed: "eat",
  feed_quick: "eat",
  water: "wag",
  drink: "wag",
  sniff_kibble_reject: "sniff",
  pet: "wag",
  pet_cuddle: "wag",
  pet_side_eye: "idle",
  pet_doze_off: "sleep",
  play: "walk",
  pet_zoomies: "walk",
  zoomies: "walk",
  rest: "idle_resting",
  nap: "light_sleep",
  train_doze_off: "sleep",
  territorial_bark: "bark",
  gate_watch: "idle",
  point_position: "idle",
  limping: "walk",
  shivering: "idle",
  lethargic_lay: "sleep",
  sore: "walk",
  dental_pain: "idle",
  button_heist: "fetch",
  surprise_fetch_recover: "fetch",
  surprise_cleanup: "sit",
  surprise_fetch_cleanup: "fetch",
  guilty_paws: "sit",
  potty_fakeout: "sit",
};

function sanitizeAnimForCurrentSpriteSet(anim) {
  const key = normalizeAction(anim);
  // Keep passthrough; manifest aliases + rows handle compatibility.
  return key || null;
}

function normalizeAction(action) {
  return String(action || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_");
}

function resolveExplicitAnim(lastAction, lastTrainedCommandId) {
  const normalized = normalizeAction(lastAction);
  if (!normalized) return null;

  if (
    normalized === "train" &&
    lastTrainedCommandId &&
    EXPLICIT_ANIMS.has(lastTrainedCommandId)
  ) {
    return lastTrainedCommandId;
  }

  const alias = EXPLICIT_ACTION_ALIASES[normalized];
  if (alias && EXPLICIT_ANIMS.has(alias)) return alias;

  if (EXPLICIT_ANIMS.has(normalized)) return normalized;
  return null;
}

function resolveRestState({ anim, isSleeping, dog }) {
  const key = normalizeAction(anim);
  if (!isSleeping) {
    return key === "idle" ? "idle_resting" : null;
  }

  const sleepMode = normalizeAction(dog?.sleep?.mode || "");
  const hasDream = Boolean(dog?.dreams?.active?.id || dog?.dreams?.active);
  if (hasDream) return "deep_rem_sleep";
  if (sleepMode === "nap") return "light_sleep";
  return "deep_rem_sleep";
}

function resolveAnimCategory({ anim, lastAction, restState }) {
  const categoryFromLast = getDogAnimationCategory(lastAction);
  if (categoryFromLast !== DOG_ANIMATION_CATEGORIES.ACTIVE) {
    return categoryFromLast;
  }
  if (restState) return DOG_ANIMATION_CATEGORIES.REST;
  return getDogAnimationCategory(anim);
}

function applyJointStiffnessAnimationLimit(anim, dog, stage) {
  const key = normalizeAction(anim);
  const stiffness = Number(dog?.healthSilo?.jointStiffness || 0);
  if (stage !== "senior" || stiffness < 55) return key;

  if (
    key === "jump" ||
    key === "spin" ||
    key === "fetch" ||
    key === "trick" ||
    key === "turn_walk_right" ||
    key === "walk_right" ||
    key === "walk_left"
  ) {
    return "walk";
  }
  return key;
}

function getHealthAnimationState(dog) {
  const health = Math.max(0, Math.min(100, Number(dog?.stats?.health ?? 0)));
  if (health <= 19) {
    return {
      healthBand: "lethargic",
      animationSpeedMultiplier: 0.4,
      ignoreToys: true,
    };
  }
  if (health <= 49) {
    return {
      healthBand: "unwell",
      animationSpeedMultiplier: 0.7,
      ignoreToys: false,
    };
  }
  return {
    healthBand: "normal",
    animationSpeedMultiplier: 1,
    ignoreToys: false,
  };
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

  const rawStage =
    dog.lifeStage?.stage || dog.stage || dog.life_stage || "PUPPY";
  const lowerStage = String(rawStage || "").toLowerCase();

  const stage =
    lowerStage.startsWith("pup") || lowerStage.includes("puppy")
      ? "pup"
      : lowerStage.startsWith("adult") || lowerStage.includes("adult")
        ? "adult"
        : "senior";

  const last = normalizeAction(dog.lastAction || dog.last_action);
  const isSleeping =
    !!dog.isAsleep ||
    !!dog.is_sleeping ||
    last === "sleep" ||
    last === "sleep_auto";

  const tierRaw =
    dog.cleanlinessTier || dog.cleanliness_tier || dog.cleanliness || "FRESH";
  const tier = String(tierRaw).toUpperCase();
  const condition =
    tier === "DIRTY"
      ? "dirty"
      : tier === "FLEAS"
        ? "fleas"
        : tier === "MANGE"
          ? "mange"
          : "clean";

  const lastTrainedCommandId = normalizeAction(
    dog?.memory?.lastTrainedCommandId
  );
  const explicitAnim = resolveExplicitAnim(last, lastTrainedCommandId);
  if (explicitAnim) {
    const resolvedAnim = applyJointStiffnessAnimationLimit(
      sanitizeAnimForCurrentSpriteSet(explicitAnim) || "idle",
      dog,
      stage
    );
    const restState = resolveRestState({ anim: resolvedAnim, isSleeping, dog });
    const animCategory = resolveAnimCategory({
      anim: resolvedAnim,
      lastAction: last,
      restState,
    });
    return {
      stage,
      condition,
      anim: resolvedAnim,
      isSleeping,
      restState,
      animCategory,
    };
  }

  const happiness = Number(dog?.stats?.happiness ?? 0);
  const isBarking =
    last.includes("bark") ||
    last.includes("howl") ||
    last === "speak" ||
    (last === "train" && lastTrainedCommandId === "speak");
  const isWalking =
    last === "walk" ||
    last === "walking" ||
    last === "zoomies" ||
    last.includes("run") ||
    last === "play" ||
    last === "fetch";
  const isScratch =
    last.includes("scratch") || last.includes("itch") || last.includes("dig");
  const isTrick =
    TRICK_ACTIONS.has(last) || (last === "train" && !!lastTrainedCommandId);
  const isWag =
    last.includes("wag") ||
    (!isWalking && !isTrick && !isScratch && happiness >= 80);

  const animRaw = isSleeping
    ? "idle"
    : isBarking
      ? "bark"
      : isScratch
        ? "scratch"
        : isTrick
          ? "trick"
          : isWag
            ? "wag"
            : isWalking
              ? "walk"
              : "idle";
  const anim = applyJointStiffnessAnimationLimit(animRaw, dog, stage);

  const restState = resolveRestState({ anim, isSleeping, dog });
  const animCategory = resolveAnimCategory({
    anim,
    lastAction: last,
    restState,
  });

  return { stage, condition, anim, isSleeping, restState, animCategory };
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
    animationSpeedMultiplier: healthAnimation.animationSpeedMultiplier,
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
