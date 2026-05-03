// src/features/game/stage3d/dog/dogModelMap.js
import { withBaseUrl } from "@/utils/assetUtils.js";

export const DOG_MODEL_STAGE_KEYS = Object.freeze({
  PUPPY: "PUPPY",
  ADULT: "ADULT",
  SENIOR: "SENIOR",
});

export const LEGACY_DOG_MODEL_PATH = withBaseUrl(
  "/assets/models/dog/jackrussell-doggerz.glb"
);

export const DOG_MODEL_PATH_BY_STAGE = Object.freeze({
  [DOG_MODEL_STAGE_KEYS.PUPPY]: withBaseUrl(
    "/assets/models/dog/jackrussell-puppy.glb"
  ),
  [DOG_MODEL_STAGE_KEYS.ADULT]: withBaseUrl(
    "/assets/models/dog/jackrussell-adult.glb"
  ),
  [DOG_MODEL_STAGE_KEYS.SENIOR]: withBaseUrl(
    "/assets/models/dog/jackrussell-senior.glb"
  ),
});

export const REQUIRED_DOG_MODEL_FILES = Object.freeze([
  "jackrussell-puppy.glb",
  "jackrussell-adult.glb",
  "jackrussell-senior.glb",
]);
