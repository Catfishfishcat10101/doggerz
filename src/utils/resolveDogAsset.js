/** @format */

// src/utils/resolveDogAsset.js
import { DOGS, getAsset } from "@/config/assets.js";

/**
 * Resolve the best dog asset based on current state.
 * Designed to grow later (actions, sprite sheets, accessories).
 *
 * @param {object} opts
 * @param {"puppy"|"adult"|"senior"} opts.lifeStage
 * @param {"clean"|"dirty"|"fleas"|"mange"} [opts.cleanlinessTier]
 * @param {string} [opts.action] - placeholder for future sheets (idle/walk/etc.)
 * @returns {string} public URL to dog asset
 */
export function resolveDogAsset({
  lifeStage = "puppy",
  cleanlinessTier = "clean",
  action: _action = "idle",
} = {}) {
  // For now, we only have "clean" renders. Map anything -> clean as fallback.
  const stage = ["puppy", "adult", "senior"].includes(lifeStage)
    ? lifeStage
    : "puppy";

  const preferred = getAsset(DOGS, [stage, cleanlinessTier], null);
  if (preferred) return preferred;

  const stageClean = getAsset(DOGS, [stage, "clean"], null);
  if (stageClean) return stageClean;

  return DOGS.puppy.clean;
}
