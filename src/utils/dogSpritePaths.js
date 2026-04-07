/** @format */

// src/utils/dogSpritePaths.js
// Sprite asset path helpers for static renders and Pixi sheets.

import { withBaseUrl } from "@/utils/assetUtils.js";

export const DOG_STAGE_IDS = Object.freeze(["PUPPY", "ADULT", "SENIOR"]);
export const DOG_STAGE_SHORT = Object.freeze(["pup", "adult", "senior"]);
export const DOG_CONDITION_IDS = Object.freeze([
  "clean",
  "dirty",
  "fleas",
  "mange",
]);

const AVAILABLE_STAGE_CONDITION_FILES = Object.freeze({
  adult: Object.freeze(new Set(["clean"])),
  pup: Object.freeze(new Set(["clean"])),
  senior: Object.freeze(new Set(["clean"])),
});

const AVAILABLE_STAGE_ANIMATION_FILES = Object.freeze({
  adult: Object.freeze(new Set()),
  pup: Object.freeze(
    new Set([
      "bark",
      "beg",
      "dance",
      "deep_rem_sleep",
      "drink",
      "eat",
      "fetch",
      "gate_watch",
      "highfive",
      "idle",
      "idle_resting",
      "jump",
      "lay_down",
      "lethargic_lay",
      "light_sleep",
      "paw",
      "scratch",
      "shake",
      "sit",
      "sleep",
      "sniff",
      "turn_walk_left",
      "turn_walk_right",
      "wag",
      "walk",
      "walk_left",
      "walk_right",
    ])
  ),
  senior: Object.freeze(new Set()),
});

const DEFAULT_SPRITE_DIR = "/assets/sprites";
const DEFAULT_ATLAS_DIR = "/assets/atlas";
const DOG_SPRITE_REV = "2026-03-30-jrt-puppy-round-3";
const DOG_SPRITE_FILE_ALIASES = Object.freeze({
  bark: "bark",
  beg: "beg",
  bow: "bow",
  crawl: "walk",
  dance: "dance",
  eat: "eat",
  fetch: "fetch",
  gate_watch: "gate_watch",
  highfive: "highfive",
  idle_resting: "idle_resting",
  jump: "jump",
  lay_down: "lay_down",
  lethargic_lay: "lethargic_lay",
  light_sleep: "light_sleep",
  limping: "walk",
  paw: "paw",
  play_dead: "deep_rem_sleep",
  point_position: "bark",
  roll_over: "fetch",
  scratch: "scratch",
  shake: "shake",
  shivering: "idle",
  sit: "sit",
  sleep: "sleep",
  sniff: "sniff",
  spin: "dance",
  stay: "bark",
  territorial_bark: "bark",
  thrashing: "dance",
  wag: "wag",
  wave: "bow",
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

export function normalizeDogConditionId(conditionLike) {
  const key = normalizeDogCondition(conditionLike);
  return DOG_CONDITION_IDS.includes(key) ? key : "clean";
}

export function getDogStageLabel(stageLike) {
  const id = normalizeDogStageId(stageLike);
  return DOG_STAGE_LABEL_BY_STAGE_ID[id] || "Puppy";
}

/**
 * Static fallback sprite used while strips load (or if strips fail).
 */
export function getDogStaticSpriteUrl(_stageLike) {
  // Until the full staged sprite set is regenerated, use the authored puppy
  // idle sheet as the single stable static fallback across the app.
  return withBaseUrl(
    `${DEFAULT_SPRITE_DIR}/jr/pup_idle.png?v=${DOG_SPRITE_REV}`
  );
}

/**
 * Pixi sheet path: /assets/sprites/jr/<stage>_<condition>.png
 */
export function getDogPixiSheetUrl(_stageLike, _conditionLike) {
  const stage = normalizeDogStageShort(_stageLike);
  const condition = normalizeDogConditionId(_conditionLike);
  const stageConditions = AVAILABLE_STAGE_CONDITION_FILES[stage];
  const routedCondition =
    stageConditions?.has(condition) || !stageConditions?.has("clean")
      ? condition
      : "clean";
  return withBaseUrl(
    `${DEFAULT_SPRITE_DIR}/jr/${stage}_${routedCondition}.png?v=${DOG_SPRITE_REV}`
  );
}

/**
 * Preferred custom sprite sheets dropped in /public/assets/sprites/jr.
 * These are animation-specific files and are used before generic stage_condition sheets.
 */
export function getDogAnimSpriteUrl(_stageLike, _animLike) {
  const stage = normalizeDogStageShort(_stageLike);
  const anim = String(_animLike || "idle")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_");
  const assetAnim = DOG_SPRITE_FILE_ALIASES[anim] || anim;
  const routedStage = AVAILABLE_STAGE_ANIMATION_FILES[stage]?.has(assetAnim)
    ? stage
    : AVAILABLE_STAGE_ANIMATION_FILES.pup.has(assetAnim)
      ? "pup"
      : stage;
  return withBaseUrl(
    `${DEFAULT_SPRITE_DIR}/jr/${routedStage}_${assetAnim}.png?v=${DOG_SPRITE_REV}`
  );
}

/**
 * Atlas helpers (generated by scripts/generate-sprites.js).
 * Files live in /public/assets/atlas as jr_<stage>.json/png by default.
 */
export function getDogAtlasJsonUrl(stageLike, baseDir = DEFAULT_ATLAS_DIR) {
  const stage = normalizeDogStageShort(stageLike);
  return withBaseUrl(`${baseDir}/jr_${stage}.json`);
}

export function getDogAtlasImageUrl(stageLike, baseDir = DEFAULT_ATLAS_DIR) {
  const stage = normalizeDogStageShort(stageLike);
  return withBaseUrl(`${baseDir}/jr_${stage}.png`);
}

export function getDogAtlasUrls(stageLike, baseDir = DEFAULT_ATLAS_DIR) {
  return {
    jsonUrl: getDogAtlasJsonUrl(stageLike, baseDir),
    imageUrl: getDogAtlasImageUrl(stageLike, baseDir),
  };
}
