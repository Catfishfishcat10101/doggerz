// src/features/game/stage3d/dog/dogModelResolver.js
import {
  DOG_MODEL_PATH_BY_STAGE,
  DOG_MODEL_STAGE_KEYS,
  LEGACY_DOG_MODEL_PATH,
} from "./dogModelMap.js";

const STAGE_ALIASES = Object.freeze({
  puppy: DOG_MODEL_STAGE_KEYS.PUPPY,
  pup: DOG_MODEL_STAGE_KEYS.PUPPY,
  juvenile: DOG_MODEL_STAGE_KEYS.PUPPY,
  adult: DOG_MODEL_STAGE_KEYS.ADULT,
  grown: DOG_MODEL_STAGE_KEYS.ADULT,
  mature: DOG_MODEL_STAGE_KEYS.ADULT,
  senior: DOG_MODEL_STAGE_KEYS.SENIOR,
  elder: DOG_MODEL_STAGE_KEYS.SENIOR,
  elderly: DOG_MODEL_STAGE_KEYS.SENIOR,
});

function normalizeStageText(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase();
}

export function resolveDogModelStageKey(stage = "") {
  const key = normalizeStageText(stage);
  if (!key) return DOG_MODEL_STAGE_KEYS.PUPPY;

  if (STAGE_ALIASES[key]) return STAGE_ALIASES[key];
  if (key.includes("senior") || key.includes("elder")) {
    return DOG_MODEL_STAGE_KEYS.SENIOR;
  }
  if (
    key.includes("adult") ||
    key.includes("grown") ||
    key.includes("mature")
  ) {
    return DOG_MODEL_STAGE_KEYS.ADULT;
  }
  return DOG_MODEL_STAGE_KEYS.PUPPY;
}

export function resolveDogLifeStage({ scene = null, dog = null } = {}) {
  return resolveDogModelStageKey(
    scene?.currentLifeStage ||
      scene?.stageKey ||
      scene?.stageLabel ||
      dog?.currentLifeStage ||
      dog?.lifeStage ||
      dog?.stage
  );
}

export function resolveDogModelPath({
  scene = null,
  dog = null,
  useStageModels = false,
} = {}) {
  if (!useStageModels) return LEGACY_DOG_MODEL_PATH;

  const stageKey = resolveDogLifeStage({ scene, dog });
  return (
    DOG_MODEL_PATH_BY_STAGE[stageKey] ||
    DOG_MODEL_PATH_BY_STAGE[DOG_MODEL_STAGE_KEYS.PUPPY]
  );
}

export function resolveDogModelProfile({
  scene = null,
  dog = null,
  action = "",
  mood = "",
  useStageModels = false,
} = {}) {
  const stageKey = resolveDogLifeStage({ scene, dog });

  return Object.freeze({
    stageKey,
    modelPath: resolveDogModelPath({ scene, dog, useStageModels }),
    action: String(
      action || scene?.currentAction || scene?.requestedAction || ""
    ),
    mood: String(mood || scene?.moodLabel || scene?.mood || ""),
    useStageModels: Boolean(useStageModels),
  });
}
