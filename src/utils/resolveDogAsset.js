/** @format */

// src/utils/resolveDogAsset.js
import { DOGS, getAsset } from "@/config/assets.js";
import { withBaseUrl } from "@/utils/assetUrl.js";
import {
  getDogStaticSpriteUrl,
  normalizeDogConditionId,
  normalizeDogStageId,
} from "@/utils/dogSpritePaths.js";

const STAGE_ID_TO_KEY = Object.freeze({
  PUPPY: "puppy",
  ADULT: "adult",
  SENIOR: "senior",
});

/**
 * Resolve the best dog asset based on current state.
 * Designed to grow later (actions, sprite sheets, accessories).
 *
 * @param {object} opts
 * @param {string} opts.lifeStage
 * @param {string} [opts.cleanlinessTier]
 * @param {string} [opts.action] - placeholder for future sheets (idle/walk/etc.)
 * @param {string} [opts.fallbackUrl] - optional fallback asset
 * @returns {string} public URL to dog asset
 */
export function resolveDogAsset({
  lifeStage = "puppy",
  cleanlinessTier = "clean",
  action: _action = "idle",
  fallbackUrl = "",
} = {}) {
  const stageId = normalizeDogStageId(lifeStage);
  const stageKey = STAGE_ID_TO_KEY[stageId] || "puppy";
  const condition = normalizeDogConditionId(cleanlinessTier);

  const preferred = getAsset(DOGS, [stageKey, condition], null);
  if (preferred) return withBaseUrl(preferred);

  const stageClean = getAsset(DOGS, [stageKey, "clean"], null);
  if (stageClean) return withBaseUrl(stageClean);

  if (fallbackUrl) return withBaseUrl(fallbackUrl);

  return getDogStaticSpriteUrl(stageId);
}
