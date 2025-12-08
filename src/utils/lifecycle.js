// src/utils/lifecycle.js
// @ts-nocheck

// Keep this file self-contained so it can't break if constants imports are wrong.

// How many in-game days pass per real day
export const GAME_DAYS_PER_REAL_DAY = 4;

// Lifecycle / age stages (in-game days)
// Adjusted so the expected lifespan aligns with ~17 dog years.
// 17 years * 365 days = 6205 game-days.
export const LIFE_STAGES = {
  PUPPY: { min: 0, max: 180, label: "Puppy" },
  ADULT: { min: 181, max: 2555, label: "Adult" },
  // Senior spans from around 7 years onward; extend max to target ~17 years.
  SENIOR: { min: 2556, max: 6205, label: "Senior" },
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
/**
 * Get life stage info for an age measured in game-days.
 * @param {number} ageInGameDays Number of in-game days (may be fractional)
 * @returns {{id:string, min:number, max:number, label:string}} life stage info
 */
export function getLifeStageForAge(ageInGameDays) {
  if (!Number.isFinite(ageInGameDays) || ageInGameDays < 1) {
    // default to puppy
    return { id: "PUPPY", ...LIFE_STAGES.PUPPY };
  }

  const match = ALL_STAGES.find(
    (stage) => ageInGameDays >= stage.min && ageInGameDays <= stage.max,
  ) || { id: "SENIOR", ...LIFE_STAGES.SENIOR };

  return match;
}

/**
 * Calculates the dog's age in "game days" and life stage info
 * from the timestamp it was adopted.
 */
/**
 * Calculate the dog's age derived values.
 * @param {number} adoptedAtMs timestamp when the dog was adopted (ms since epoch)
 * @param {number} [now=Date.now()] optional 'now' timestamp to compute age against
 * @returns {{ageInGameDays:number, stageId:string, stageLabel:string, stage:object}|null}
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
 * Map a life-stage id to a default sprite.
 */
export function getSpriteForLifeStage(stageId) {
  switch (
    String(stageId || "PUPPY")
      .toUpperCase()
      .trim()
  ) {
    case "PUPPY":
      return "/sprites/jack_russell_puppy.png";
    case "ADULT":
      return "/sprites/jack_russell_adult.png";
    case "SENIOR":
    default:
      return "/sprites/jack_russell_senior.png";
  }
}

/**
 * Flexible helper: accepts a stage id string or a dog object plus cleanliness tier.
 * Right now, cleanlinessTier is reserved for later variants (dirty, fleas, etc.).
 */
/**
 * Return a sprite path for a given life-stage or dog object.
 * @param {string|object} stageOrObj stage id string (e.g. 'PUPPY') or dog object
 * @param {string} [cleanlinessTier] optional cleanliness tier (e.g. 'DIRTY')
 * @returns {string} URL path to sprite asset
 */
export function getSpriteForStageAndTier(stageOrObj, cleanlinessTier) {
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
    PUPPY: "/sprites/jack_russell_puppy.png",
    ADULT: "/sprites/jack_russell_adult.png",
    SENIOR: "/sprites/jack_russell_senior.png",
  };

  // Choose sprite by stage (fallback to puppy)
  const src = SPRITES[stageKey] || SPRITES.PUPPY;

  // Later you can branch on `tier` to return different variants like DIRTY/MANGE sprites.
  return src;
}
