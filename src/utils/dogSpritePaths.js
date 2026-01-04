/** @format */

// src/utils/dogSpritePaths.js
// NOTE: Sprite assets have been removed. Functions kept for compatibility.

import { withBaseUrl } from "@/utils/assetUrl.js";

export const DOG_STAGE_IDS = Object.freeze(["PUPPY", "ADULT", "SENIOR"]);
export const DOG_STAGE_SHORT = Object.freeze(["pup", "adult", "senior"]);

export const DOG_STATIC_SPRITE_FILES_BY_STAGE_ID = Object.freeze({
  // Sprites have been removed - these are stubbed
  PUPPY: "doggerz-192.png",
  ADULT: "doggerz-192.png",
  SENIOR: "doggerz-192.png",
});

export const DOG_STAGE_LABEL_BY_STAGE_ID = Object.freeze({
  PUPPY: "Puppy",
  ADULT: "Adult",
  SENIOR: "Senior",
});

export function normalizeDogStageId(stageLike) {
  const s = String(stageLike || "PUPPY")
    .trim()
    .toLowerCase();

  if (s.startsWith("adult") || s.includes("adult")) return "ADULT";
  if (s.startsWith("sen") || s.includes("senior")) return "SENIOR";

  // Accept `pup`, `puppy`, legacy stage strings
  return "PUPPY";
}

export function normalizeDogStageShort(stageLike) {
  const id = normalizeDogStageId(stageLike);
  if (id === "ADULT") return "adult";
  if (id === "SENIOR") return "senior";
  return "pup";
}

/**
 * Normalize cleanliness to a render condition key.
 * Accepts both tier IDs (FRESH/DIRTY/FLEAS/MANGE) and condition strings.
 */
export function normalizeDogCondition(conditionLike) {
  const c = String(conditionLike || "clean")
    .trim()
    .toLowerCase();

  if (c === "dirty" || c === "dirt") return "dirty";
  if (c === "fleas" || c === "flea") return "fleas";
  if (c === "mange") return "mange";

  // Tier IDs
  if (c === "dir" || c === "dirty" || c === "tier_dirty") return "dirty";
  if (c === "fleas" || c === "tier_fleas") return "fleas";
  if (c === "mange" || c === "tier_mange") return "mange";

  // Treat "fresh" as clean
  return "clean";
}

export function getDogStageLabel(stageLike) {
  const id = normalizeDogStageId(stageLike);
  return DOG_STAGE_LABEL_BY_STAGE_ID[id] || "Puppy";
}

/**
 * Static fallback sprite used while strips load (or if strips fail).
 * NOTE: Sprite assets removed - returns app icon.
 */
export function getDogStaticSpriteUrl(_stageLike) {
  return withBaseUrl("/icons/doggerz-192.png");
}

/**
 * Pixi sheet path: /assets/sprites/jr/<stage>_<condition>.png
 * NOTE: Sprite assets removed - returns placeholder path.
 */
export function getDogPixiSheetUrl(_stageLike, _conditionLike) {
  return withBaseUrl("/icons/doggerz-192.png");
}
