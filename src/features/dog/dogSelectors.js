/** @format */

// src/features/dog/dogSelectors.js

import {
  getDogPixiSheetUrl,
  getDogStageLabel,
  getDogStaticSpriteUrl,
} from "@/utils/dogSpritePaths.js";

export const selectDog = (state) => state?.dog || {}; // change if your store path differs

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
  rest: "sleep",
  nap: "sleep",
};

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

/**
 * Accept either a Redux `state` or a `dog` object and return the dog object.
 * This makes the selectors tolerant to callers that pass the dog slice directly.
 */
function _resolveDog(stateOrDog) {
  if (!stateOrDog) return {};

  // Heuristics: if object has `lifeStage` or `cleanlinessTier` assume it's a dog
  if (
    typeof stateOrDog === "object" &&
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
 * - `anim` is a simple animation hint:
 *   `sleep|bark|scratch|trick|wag|walk|idle`
 */
export function selectDogRenderParams(stateOrDog) {
  const dog = _resolveDog(stateOrDog) || {};

  // life stage may be at dog.lifeStage.stage, dog.stage, or legacy `stage` strings
  const rawStage =
    dog.lifeStage?.stage || dog.stage || dog.life_stage || "PUPPY";
  const lowerStage = String(rawStage || "").toLowerCase();

  const stage =
    lowerStage.startsWith("pup") || lowerStage.includes("puppy")
      ? "pup"
      : lowerStage.startsWith("adult") || lowerStage.includes("adult")
        ? "adult"
        : "senior";

  // Allow multiple possible cleanliness fields and be resilient to casing
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

  // Animation hint: prefer explicit flags, then lastAction heuristics
  const last = normalizeAction(dog.lastAction || dog.last_action);
  const lastTrainedCommandId = normalizeAction(
    dog?.memory?.lastTrainedCommandId
  );
  const explicitAnim = resolveExplicitAnim(last, lastTrainedCommandId);
  if (explicitAnim) {
    return { stage, condition, anim: explicitAnim };
  }
  const happiness = Number(dog?.stats?.happiness ?? 0);
  const isSleeping =
    !!dog.isAsleep ||
    !!dog.is_sleeping ||
    last.includes("sleep") ||
    last.includes("rest");
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
  const isScratch = last.includes("scratch") || last.includes("itch");
  const isTrick =
    TRICK_ACTIONS.has(last) || (last === "train" && !!lastTrainedCommandId);
  const isWag =
    last.includes("wag") ||
    (!isWalking && !isTrick && !isScratch && happiness >= 80);

  const anim = isSleeping
    ? "sleep"
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
 *     anim: "sleep"|"bark"|"scratch"|"trick"|"wag"|"walk"|"idle",
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
  const pixiSheetFallbackUrl = getDogPixiSheetUrl(stage, "clean");

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

  const breedRaw = dog.breed || dog.species || dog.type || "jack_russell";
  const breed = String(breedRaw)
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");

  return `${breed}_${stage}_${condition}.png`;
}
