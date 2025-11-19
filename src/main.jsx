// src/constants/game.js
export const SKILL_LEVEL_STEP = 50;
export const DEFAULT_TICK_INTERVAL = 120; // seconds
export const CLOUD_SAVE_DEBOUNCE = 3000;
export const GAME_DAYS_PER_REAL_DAY = 4;

export const LIFE_STAGES = {
  PUPPY: { min: 0, max: 180, label: "Puppy" },
  ADULT: { min: 181, max: 2555, label: "Adult" },
  SENIOR: { min: 2556, max: 5475, label: "Senior" },
};

export const LIFECYCLE_STAGE_MODIFIERS = {
  PUPPY: {
    hunger: 1.15,
    happiness: 1,
    energy: 0.85,
    cleanliness: 0.95,
  },
  ADULT: {
    hunger: 1,
    happiness: 1,
    energy: 1,
    cleanliness: 1,
  },
  SENIOR: {
    hunger: 0.9,
    happiness: 1.05,
    energy: 1.2,
    cleanliness: 1.15,
  },
};

export const CLEANLINESS_THRESHOLDS = {
  FRESH: 75,
  DIRTY: 50,
  FLEAS: 25,
  MANGE: 0,
};

export const CLEANLINESS_TIER_EFFECTS = {
  FRESH: {
    label: "Fresh",
    pottyGainMultiplier: 1,
  },
  DIRTY: {
    label: "Dirty",
    happinessTickPenalty: 1,
    pottyGainMultiplier: 1.1,
    journalSummary: "Needs bath soon.",
  },
  FLEAS: {
    label: "Fleas",
    happinessTickPenalty: 2,
    energyTickPenalty: 1,
    cleanlinessTickPenalty: 1,
    pottyGainMultiplier: 1.25,
    journalSummary: "Scratching nonstop!",
  },
  MANGE: {
    label: "Mange",
    happinessTickPenalty: 4,
    energyTickPenalty: 2,
    cleanlinessTickPenalty: 2,
    pottyGainMultiplier: 1.5,
    journalSummary: "Needs immediate attention!",
  },
};

/**
 * Resolve cleanliness tier key ("FRESH" | "DIRTY" | "FLEAS" | "MANGE")
 * from a cleanliness value (0–100).
 */
export function resolveCleanlinessTier(cleanliness) {
  const v = Number.isFinite(cleanliness) ? cleanliness : 0;

  if (v >= CLEANLINESS_THRESHOLDS.FRESH) return "FRESH";
  if (v >= CLEANLINESS_THRESHOLDS.DIRTY) return "DIRTY";
  if (v >= CLEANLINESS_THRESHOLDS.FLEAS) return "FLEAS";
  return "MANGE";
}

/**
 * Get cleanliness tier key + effect descriptor in one shot.
 * Returns: { tier, label, ...effectFields }
 */
export function getCleanlinessEffects(cleanliness) {
  const tier = resolveCleanlinessTier(cleanliness);
  const base = CLEANLINESS_TIER_EFFECTS[tier] || CLEANLINESS_TIER_EFFECTS.FRESH;
  return {
    tier,
    ...base,
  };
}
