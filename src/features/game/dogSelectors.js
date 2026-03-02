// src/features/game/dogSelectors.js

import { createSelector } from "@reduxjs/toolkit";
import {
  getDogPixiSheetUrl,
  getDogStageLabel,
  getDogStaticSpriteUrl,
} from "@/utils/dogSpritePaths.js";
import { derivePersonalityAnimationHint } from "@/logic/dogEngine.js";

const EMPTY_DOG = Object.freeze({});

export const selectDog = (state) => state?.dog || EMPTY_DOG;

export const selectDogAnimation = createSelector([selectDog], (dog) =>
  derivePersonalityAnimationHint(dog?.personality?.traits || {})
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
  "walk",
  "wag",
  "sleep",
  "bark",
  "scratch",
  "trick",
  "eat",
  "sit",
  "stay",
  "laydown",
  "lay_down",
  "roll",
  "rollover",
  "roll_over",
  "playdead",
  "play_dead",
  "shake",
  "beg",
  "bow",
  "paw",
  "jump",
  "spin",
  "wave",
  "highfive",
  "high_five",
  "crawl",
  "fetch",
  "dance",
  "walk_left",
  "walk_right",
  "turn_walk_right",
  "front_flip",
]);

const EXPLICIT_ACTION_ALIASES = {
  feed: "eat",
  water: "wag",
  drink: "wag",
  pet: "wag",
  play: "walk",
  rest: "idle",
  nap: "idle",
};

function sanitizeAnimForCurrentSpriteSet(anim) {
  const key = normalizeAction(anim);
  // Current supplied strip maps "sleep" to the unwanted plate frame.
  // Keep the dog on idle until a dedicated sleep row is available.
  if (key === "sleep") return "idle";
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
    return {
      stage,
      condition,
      anim: sanitizeAnimForCurrentSpriteSet(explicitAnim) || "idle",
      isSleeping,
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

  const anim = isSleeping
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

  return { stage, condition, anim, isSleeping };
}

function buildDogRenderModel(stateOrDog) {
  const dog = resolveDog(stateOrDog);
  const { stage, condition, anim, isSleeping } = selectDogRenderParams(dog);

  const stageLabel = dog.lifeStage?.label || getDogStageLabel(stage);

  const staticSpriteUrl = getDogStaticSpriteUrl(stage);
  const pixiSheetUrl = getDogPixiSheetUrl(stage, condition);
  const pixiSheetFallbackUrl = getDogPixiSheetUrl(stage, "clean");

  return {
    stage,
    stageLabel,
    condition,
    anim,
    isSleeping,
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
