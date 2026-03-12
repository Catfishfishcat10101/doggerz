import jrManifest from "@/components/dog/jrManifest.json";
import { DOG_ANIMATIONS } from "@/animation/dogAnimationMap.js";
import { getObedienceCommand } from "@/logic/obedienceCommands.js";
import { LIFE_STAGES } from "@/logic/dogLifeStages.js";
import {
  DOG_ANIMATION_CATEGORIES,
  getDogAnimationCategory,
} from "@/utils/mapPoseToDogAction.js";

const DEFAULT_COLUMNS = Math.max(1, Number(jrManifest?.columns || 8));
const DEFAULT_ANIM = String(jrManifest?.defaultAnim || "idle").toLowerCase();
const DEFAULT_FPS = Math.max(1, Number(jrManifest?.defaultFps || 8));
const ANIM_ROWS = Array.isArray(jrManifest?.rows) ? jrManifest.rows : [];
const ANIM_ALIASES =
  jrManifest?.aliases && typeof jrManifest.aliases === "object"
    ? jrManifest.aliases
    : {};
const MANIFEST_ANIMS = new Set(
  ANIM_ROWS.map((row) => normalizeDogAnimKey(row?.anim || "")).filter(Boolean)
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

export function normalizeDogAnimKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_");
}

function canResolveAnimKey(value) {
  const key = normalizeDogAnimKey(value);
  if (!key) return false;
  if (MANIFEST_ANIMS.has(key)) return true;

  const alias = normalizeDogAnimKey(ANIM_ALIASES[key] || "");
  return Boolean(alias && MANIFEST_ANIMS.has(alias));
}

export function getManifestAnimMeta(anim) {
  const key = resolveManifestAnimKey(anim);
  const rowIndex = Math.max(
    0,
    ANIM_ROWS.findIndex((row) => normalizeDogAnimKey(row?.anim || "") === key)
  );
  const row = ANIM_ROWS[rowIndex] || null;
  return {
    key,
    rowIndex,
    frames: Math.max(1, Number(row?.frames || DEFAULT_COLUMNS)),
    columns: Math.max(1, Number(row?.columns || DEFAULT_COLUMNS)),
    fps: Math.max(1, Number(row?.fps || DEFAULT_FPS)),
  };
}

export function resolveManifestAnimKey(anim) {
  const key = normalizeDogAnimKey(anim || DEFAULT_ANIM);
  if (!key) return DEFAULT_ANIM;

  const exactMatch = ANIM_ROWS.some(
    (row) => normalizeDogAnimKey(row?.anim || "") === key
  );
  if (exactMatch) return key;

  const alias = normalizeDogAnimKey(ANIM_ALIASES[key] || "");
  if (!alias) return DEFAULT_ANIM;

  const aliasMatch = ANIM_ROWS.some(
    (row) => normalizeDogAnimKey(row?.anim || "") === alias
  );
  return aliasMatch ? alias : DEFAULT_ANIM;
}

function resolveTrainedCommandAnim(commandId) {
  const normalized = normalizeDogAnimKey(commandId);
  if (!normalized) return null;
  const command = getObedienceCommand(normalized);
  const animationKey = normalizeDogAnimKey(command?.animationKey || "");
  if (animationKey && canResolveAnimKey(animationKey)) {
    return animationKey;
  }
  return canResolveAnimKey(normalized) ? normalized : null;
}

function resolveExplicitAnim(
  lastAction,
  lastTrainedCommandId,
  trainingReaction
) {
  const normalized = normalizeDogAnimKey(lastAction);
  if (!normalized) return null;

  if (normalized === "train_ignore" || normalized === "train_reinterpret") {
    const reactionAnim = resolveTrainedCommandAnim(
      trainingReaction?.performedActionId ||
        trainingReaction?.performedCommandId
    );
    if (reactionAnim) return reactionAnim;
  }

  if (normalized === "train_zoomies") {
    return "walk";
  }

  if (
    (normalized === "train" || normalized === "train_perfect") &&
    lastTrainedCommandId
  ) {
    const trainedAnim = resolveTrainedCommandAnim(lastTrainedCommandId);
    if (trainedAnim) return trainedAnim;
  }

  const mapped = normalizeDogAnimKey(DOG_ANIMATIONS[normalized] || "");
  if (mapped && canResolveAnimKey(mapped)) return mapped;

  if (canResolveAnimKey(normalized)) return normalized;
  return null;
}

function resolveRestState({ anim, isSleeping, dog }) {
  const key = normalizeDogAnimKey(anim);
  if (!isSleeping) {
    return key === "idle" ? "idle_resting" : null;
  }

  const sleepMode = normalizeDogAnimKey(dog?.sleep?.mode || "");
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
  const key = normalizeDogAnimKey(anim);
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

export function getHealthAnimationState(dog) {
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

export function resolveViewportAnim({
  anim = "idle",
  behaviorState = "idle",
  dogIsSleeping = false,
} = {}) {
  const requested = normalizeDogAnimKey(anim);
  const behavior = normalizeDogAnimKey(behaviorState);
  if (dogIsSleeping) {
    return resolveManifestAnimKey(requested || "deep_rem_sleep");
  }
  if (behavior === "walk") {
    if (!requested || requested === "idle" || requested === "walk") {
      return "walk";
    }
  }
  return resolveManifestAnimKey(requested || "idle");
}

export function resolveDogAnimationState(dog = {}) {
  const rawStage =
    dog.lifeStage?.stage || dog.stage || dog.life_stage || LIFE_STAGES.PUPPY;
  const lowerStage = String(rawStage || "").toLowerCase();
  const stage =
    lowerStage.startsWith("pup") || lowerStage.includes("puppy")
      ? "pup"
      : lowerStage.startsWith("adult") || lowerStage.includes("adult")
        ? "adult"
        : "senior";

  const lastAction = normalizeDogAnimKey(dog.lastAction || dog.last_action);
  const aiState = normalizeDogAnimKey(dog.aiState || "");
  const isSleeping =
    Boolean(dog.isAsleep || dog.is_sleeping) ||
    lastAction === "sleep" ||
    lastAction === "sleep_auto" ||
    aiState === "sleep";

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

  const lastTrainedCommandId = normalizeDogAnimKey(
    dog?.memory?.lastTrainedCommandId
  );
  const trainingReaction =
    dog?.memory?.lastTrainingReaction &&
    typeof dog.memory.lastTrainingReaction === "object"
      ? dog.memory.lastTrainingReaction
      : null;

  const explicitAnim = resolveExplicitAnim(
    lastAction,
    lastTrainedCommandId,
    trainingReaction
  );

  let anim = explicitAnim;
  if (!anim) {
    anim = normalizeDogAnimKey(DOG_ANIMATIONS[aiState] || "");
  }
  if (!anim) {
    const happiness = Number(dog?.stats?.happiness ?? 0);
    const isBarking =
      lastAction.includes("bark") ||
      lastAction.includes("howl") ||
      lastAction === "speak" ||
      (lastAction === "train" && lastTrainedCommandId === "speak");
    const isWalking =
      lastAction === "walk" ||
      lastAction === "walking" ||
      lastAction === "zoomies" ||
      lastAction.includes("run") ||
      lastAction === "play" ||
      lastAction === "fetch";
    const isScratch =
      lastAction.includes("scratch") ||
      lastAction.includes("itch") ||
      lastAction.includes("dig");
    const isTrick =
      TRICK_ACTIONS.has(lastAction) ||
      (lastAction === "train" && Boolean(lastTrainedCommandId));
    const isWag =
      lastAction.includes("wag") ||
      (!isWalking && !isTrick && !isScratch && happiness >= 80);

    anim = isSleeping
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
  }

  const requestedAnim = applyJointStiffnessAnimationLimit(anim, dog, stage);
  const resolvedAnim = resolveManifestAnimKey(requestedAnim);
  const restState = resolveRestState({
    anim: requestedAnim,
    isSleeping,
    dog,
  });
  const resolvedRestState = restState
    ? resolveManifestAnimKey(restState)
    : null;
  const animCategory = resolveAnimCategory({
    anim: requestedAnim,
    lastAction,
    restState: resolvedRestState,
  });
  const manifestMeta = getManifestAnimMeta(resolvedAnim);

  return {
    stage,
    condition,
    isSleeping,
    lastAction,
    aiState,
    requestedAnim,
    anim: resolvedAnim,
    restState: resolvedRestState,
    animCategory,
    manifestMeta,
  };
}
