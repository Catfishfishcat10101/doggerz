// src/features/game/stage3d/dog/dogModelMap.js
import { withBaseUrl } from "@/utils/assetUtils.js";

export const DOG_MODEL_STAGE_KEYS = Object.freeze({
  PUPPY: "PUPPY",
  ADULT: "ADULT",
  SENIOR: "SENIOR",
});

export const DOGGERZ_JACK_RUSSELL_MODEL_FILE = "jackrussell-doggerz.glb";

export const DOG_MODEL_GLTF_PATH = withBaseUrl(
  `/assets/models/dog/${DOGGERZ_JACK_RUSSELL_MODEL_FILE}`
);

export const LEGACY_DOG_MODEL_PATH = DOG_MODEL_GLTF_PATH;

export const DOG_MODEL_PATH_BY_STAGE = Object.freeze({
  [DOG_MODEL_STAGE_KEYS.PUPPY]: DOG_MODEL_GLTF_PATH,
  [DOG_MODEL_STAGE_KEYS.ADULT]: DOG_MODEL_GLTF_PATH,
  [DOG_MODEL_STAGE_KEYS.SENIOR]: DOG_MODEL_GLTF_PATH,
});

export const REQUIRED_DOG_MODEL_FILES = Object.freeze([
  DOGGERZ_JACK_RUSSELL_MODEL_FILE,
]);
