// src/utils/lifecycle.js
// @ts-nocheck

// Keep this file self-contained so it can't break if constants imports are wrong.

// How many in-game days pass per real day
export const GAME_DAYS_PER_REAL_DAY = 4;

// Lifecycle / age stages (in-game days)
export const LIFE_STAGES = {
  PUPPY: { min: 0, max: 180, label: "Puppy" },
  ADULT: { min: 181, max: 2555, label: "Adult" },
  SENIOR: { min: 2556, max: 5475, label: "Senior" },
};

// Flattened stages for lookup
const ALL_STAGES = Object.entries(LIFE_STAGES).map(([key, stage]) => ({
  id: key,
  ...stage,
}));

/**
 * Given an age in "game days", pick the correct life stage bucket.
 * Returns one of the LIFE_STAGES entries with an added `id` field.
 */
export function getLifeStageForAge(ageInGameDays) {
  if (!Number.isFinite(ageInGameDays) || ageInGameDays < 0) {
    // default to puppy
    return { id: "PUPPY", ...LIFE_STAGES.PUPPY };
  }

  const match = ALL_STAGES.find(
    (stage) => ageInGameDays >= stage.min && ageInGameDays <= stage.max,
  ) || { id: "SENIOR", ...LIFE_STAGES.SENIOR };

  return match;
}

/**
 * Convert adoption timestamp → age info.
 *
 * Returns:
 * {
 *   ageInGameDays: number,
 *   stageId: "PUPPY" | "ADULT" | "SENIOR",
 *   stageLabel: string,
 *   stage: { id, min, max, label }
 * }
 */
export function calculateDogAge(adoptedAtMs, now = Date.now()) {
  if (!adoptedAtMs || !Number.isFinite(adoptedAtMs)) return null;

  const msPerGameDay = (24 * 60 * 60 * 1000) / GAME_DAYS_PER_REAL_DAY;

  const ageInGameDays = Math.max(
    0,
    Math.floor((now - adoptedAtMs) / msPerGameDay),
  );

  const stage = getLifeStageForAge(ageInGameDays);

  return {
    ageInGameDays,
    stageId: stage.id,
    stageLabel: stage.label,
    stage,
  };
}

/**
 * Map a life stage → appropriate sprite sheet path.
 *
 * These are served from /public/sprites so the paths are:
 *   /sprites/jack_russell_puppy.png
 *   /sprites/jack_russell_adult.png
 *   /sprites/jack_russell_senior.png
 */
export function getSpriteForLifeStage(stageId) {
  switch (stageId) {
    case "PUPPY":
      return "/sprites/jack_russell_puppy.png";
    case "ADULT":
      return "/sprites/jack_russell_adult.png";
    case "SENIOR":
    default:
      return "/sprites/jack_russell_senior.png";
  }
}

/*
  Helper: getSpriteForStageAndTier
  - Accepts either (stageKey, cleanlinessTier) or a dog-like object:
      getSpriteForStageAndTier('PUPPY', 'FRESH')
      getSpriteForStageAndTier({ stage: 'ADULT', cleanlinessTier: 'DIRTY' })
  - Returns a string path to the spritesheet (adjust paths to your public/assets layout).
*/
export function getSpriteForStageAndTier(stageOrObj, cleanlinessTier) {
  // Resolve inputs
  let stageKey;
  let tier = cleanlinessTier;

  if (stageOrObj && typeof stageOrObj === "object") {
    stageKey =
      stageOrObj.stage ||
      stageOrObj.lifeStage ||
      (stageOrObj.lifeStage && stageOrObj.lifeStage.stage) ||
      stageOrObj.stageKey;
    tier =
      tier ||
      stageOrObj.cleanlinessTier ||
      stageOrObj.cleanliness ||
      stageOrObj.tier;
  } else {
    stageKey = stageOrObj;
  }

  stageKey = String(stageKey || "PUPPY")
    .toUpperCase()
    .trim();
  tier = String(tier || "FRESH")
    .toUpperCase()
    .trim();

  // Simple mapping — adjust to your actual asset locations
  const SPRITES = {
    PUPPY: "/assets/sprites/jack_russell_puppy.png",
    ADULT: "/assets/sprites/jack_russell_adult.png",
    SENIOR: "/assets/sprites/jack_russell_senior.png",
  };

  // Choose sprite by stage (fallback to puppy)
  const src = SPRITES[stageKey] || SPRITES.PUPPY;

  // Return string path; component can import or use fetch depending on asset pipeline
  return src;
}
