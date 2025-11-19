// src/constants/game.js

// Core tuning knobs
export const SKILL_LEVEL_STEP = 50;
export const DEFAULT_TICK_INTERVAL = 120; // seconds
export const CLOUD_SAVE_DEBOUNCE = 3000;
export const GAME_DAYS_PER_REAL_DAY = 4;

// Lifecycle / age stages (in-game days)
export const LIFE_STAGES = {
  PUPPY: { min: 0, max: 180, label: "Puppy" },
  ADULT: { min: 181, max: 2555, label: "Adult" },
  SENIOR: { min: 2556, max: 5475, label: "Senior" },
};

// How each life stage tweaks stat decay
export const LIFECYCLE_STAGE_MODIFIERS = {
  PUPPY: {
    hunger: 1.15, // gets hungry faster
    happiness: 1,
    energy: 0.85, // burns less energy
    cleanliness: 0.95,
  },
  ADULT: {
    hunger: 1,
    happiness: 1,
    energy: 1,
    cleanliness: 1,
  },
  SENIOR: {
    hunger: 0.9, // eats a bit less
    happiness: 1.05,
    energy: 1.2, // tires more quickly
    cleanliness: 1.15,
  },
};

// Cleanliness thresholds → tiers
export const CLEANLINESS_THRESHOLDS = {
  FRESH: 75,
  DIRTY: 50,
  FLEAS: 25,
  MANGE: 0,
};

// Per-tier effects on gameplay
export const CLEANLINESS_TIER_EFFECTS = {
  FRESH: {
    label: "Fresh",
    pottyGainMultiplier: 1,
  },
  DIRTY: {
    label: "Dirty",
    happinessTickPenalty: 1,
    pottyGainMultiplier: 1.1,
    journalSummary: "Your pup is tracking in a little dirt. Bath soon?",
  },
  FLEAS: {
    label: "Fleas",
    happinessTickPenalty: 2,
    energyTickPenalty: 1,
    cleanlinessTickPenalty: 1,
    pottyGainMultiplier: 1.25,
    journalSummary:
      "Scratching nonstop. Looks like your pup picked up some hitchhikers.",
  },
  MANGE: {
    label: "Mange",
    happinessTickPenalty: 4,
    energyTickPenalty: 2,
    cleanlinessTickPenalty: 2,
    pottyGainMultiplier: 1.5,
    journalSummary:
      "Skin is irritated and patchy. Needs a vet visit and serious TLC.",
  },
};

/**
 * Mini “what does your dog want?” system.
 * dogSlice’s polls use this to spawn prompts & apply effects.
 */
export const DOG_POLL_CONFIG = {
  // How often to consider spawning a poll (ms)
  intervalMs: 1000 * 60 * 25, // ~25 minutes

  // How long the player has to respond (ms)
  timeoutMs: 1000 * 60 * 2, // 2 minutes

  prompts: [
    {
      id: "walk_outside",
      prompt: "Could we go outside for a quick walk?",
      effects: {
        happiness: +10,
        energy: -5,
        cleanliness: -3,
      },
    },
    {
      id: "play_fetch",
      prompt: "I brought you a toy. Want to play fetch?",
      effects: {
        happiness: +12,
        energy: -8,
      },
    },
    {
      id: "snack_time",
      prompt: "I’m feeling snacky. Maybe a small treat?",
      effects: {
        hunger: -15,
        happiness: +6,
      },
    },
    {
      id: "bath_suggestion",
      prompt: "I feel kind of grimy. Is it bath time?",
      effects: {
        cleanliness: +25,
        happiness: -4, // baths are betrayal
      },
    },
  ],
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
