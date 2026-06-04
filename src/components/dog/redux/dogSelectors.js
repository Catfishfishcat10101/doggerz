// src/components/dog/redux/dogSelectors.js

import { createSelector } from "@reduxjs/toolkit";
import { derivePersonalityAnimationHint } from "@/features/dog/dogEngine.js";
import { derivePersonalityProfile } from "@/features/dog/personalityProfile.js";
import { DOG_ACTIONS } from "@/features/game/rendering/DogAction.js";

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

function resolveStage3DAction(action) {
  const key = normalizeAction(action);
  if (!key) return "";

  if (
    [
      "sleep",
      "sleeping",
      "sleep_auto",
      "rest",
      "resting",
      "lie",
      "lay",
      "lay_down",
      "lie_down",
      "lightsleep",
      "deep_sleep",
      "deepremsleep",
      "dream",
    ].includes(key)
  ) {
    return "sleepLoop";
  }

  if (["sleep_start", "sleepstart"].includes(key)) return "sleepStart";
  if (["sleep_end", "sleepend", "wake", "wakeup"].includes(key)) {
    return "sleepEnd";
  }

  if (["walk", "walking", "heel", "move"].includes(key)) return "walk";
  if (["run", "running", "zoomies", "sprint"].includes(key)) return "run";
  if (
    [
      "speak",
      "bark",
      "barking",
      "return_annoyed",
      "returnannoyed",
      "territorial_bark",
    ].includes(key)
  ) {
    return "speak";
  }
  if (["sit", "sitting", "stay", "wait"].includes(key)) return "sit";
  if (
    ["eat", "feed", "quick_feed", "quickfeed", "food", "feeding"].includes(key)
  ) {
    return "eat";
  }
  if (["drink", "water", "drinking"].includes(key)) return "drink";
  if (["potty", "poop", "pee", "defecate"].includes(key)) return "potty";
  if (["sniff", "sniffing", "investigate"].includes(key)) return "sniff";
  if (["dig_start", "digstart"].includes(key)) return "digStart";
  if (["dig_end", "digend"].includes(key)) return "digEnd";
  if (key.includes("dig")) return "digLoop";
  if (
    ["shake", "paw", "high_five", "highfive", "wave", "cmd_paw"].includes(key)
  ) {
    return "sit";
  }
  if (
    ["scratch", "itch", "itchy", "dirty", "fleas", "mange", "bath", "bathe"].includes(
      key
    )
  ) {
    return "idleAlt";
  }
  if (["play", "fetch", "toy", "wag"].includes(key)) return "idleAlt";
  if (["idle", "idle_resting", "idle_calm", "idle_sleepy"].includes(key)) {
    return "idle";
  }

  return key;
}

function getDogStageLabel(stage) {
  const key = String(stage || "").toLowerCase();
  if (key.includes("senior")) return "Senior";
  if (key.includes("adult")) return "Adult";
  return "Puppy";
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

function resolveDogRenderAction(dog) {
  const lastAction = normalizeAction(dog?.lastAction || dog?.last_action);
  const aiState = normalizeAction(dog?.aiState || "");
  const desiredAction = normalizeAction(
    dog?.animation?.desiredAction || dog?.desiredAction || ""
  );
  const overrideAction = normalizeAction(
    dog?.animation?.overrideAction || dog?.animation?.oneShot || ""
  );

  if (overrideAction) return resolveStage3DAction(overrideAction);
  if (desiredAction) return resolveStage3DAction(desiredAction);

  const isSleeping =
    Boolean(dog?.isAsleep || dog?.is_sleeping) ||
    lastAction === "sleep_auto" ||
    aiState === "sleep";
  if (isSleeping) return "sleepLoop";

  if (dog?.moving === true || dog?.position?.moving === true) {
    return "walk";
  }

  if (
    lastAction.includes("run") ||
    lastAction === "walk" ||
    lastAction === "walking" ||
    lastAction === "play" ||
    lastAction === "fetch"
  ) {
    return lastAction.includes("run") ? "run" : "walk";
  }

  return (
    resolveStage3DAction(lastAction) ||
    resolveStage3DAction(aiState) ||
    DOG_ACTIONS.idle
  );
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

  const anim = resolveDogRenderAction(dog);
  const isSleeping = String(anim || "").toLowerCase().startsWith("sleep");

  return {
    stage,
    condition,
    anim,
    isSleeping,
    restState: isSleeping ? "sleepLoop" : null,
    animCategory: isSleeping ? "rest" : "active",
  };
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

  const identityProfile =
    dog?.identity && typeof dog.identity === "object" ? dog.identity : null;

  return {
    dogIdentityId: String(identityProfile?.profileId || "").trim() || null,
    visualIdentity:
      String(identityProfile?.visualIdentity || "").trim() || "jr_canonical_v1",
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
