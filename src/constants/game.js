// src/constants/game.js
// Core game constants for Doggerz. Usage: import from "@/constants/game.js"
// Keys are grouped and documented for maintainability.

/* ---------------- Core tuning knobs ---------------- */

export const DEFAULT_TICK_INTERVAL = 120; // seconds between passive ticks
export const CLOUD_SAVE_DEBOUNCE = 3000; // ms between cloud saves
export const GAME_DAYS_PER_REAL_DAY = 4;

// Lifecycle / age stages (in-game days)
export const LIFE_STAGES = {
  PUPPY: { min: 0, max: 180, label: "Puppy" },
  ADULT: { min: 181, max: 2555, label: "Adult" },
  SENIOR: { min: 2556, max: 5475, label: "Senior" },
};

// How each life stage tweaks stat decay
export const LIFECYCLE_STAGE_MODIFIERS = {
  ADULT: {
    cleanliness: 1,
    energy: 1,
    happiness: 1,
    hunger: 1,
  },
  PUPPY: {
    cleanliness: 0.95,
    energy: 0.85, // burns less energy
    happiness: 1,
    hunger: 1.15, // gets hungry faster
  },
  SENIOR: {
    cleanliness: 1.15,
    energy: 1.2, // tires more quickly
    happiness: 1.05,
    hunger: 0.9, // eats a bit less
  },
};

/* ---------------- Cleanliness tiers ---------------- */

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
    happinessTickPenalty: 1,
    journalSummary: "Your pup is tracking in a little dirt. Bath soon?",
    label: "Dirty",
    pottyGainMultiplier: 1.1,
  },
  FLEAS: {
    cleanlinessTickPenalty: 1,
    energyTickPenalty: 1,
    happinessTickPenalty: 2,
    journalSummary:
      "Scratching nonstop. Looks like your pup picked up some hitchhikers.",
    label: "Fleas",
    pottyGainMultiplier: 1.25,
  },
  MANGE: {
    cleanlinessTickPenalty: 2,
    energyTickPenalty: 2,
    happinessTickPenalty: 4,
    journalSummary:
      "Skin is irritated and patchy. Needs a vet visit and serious TLC.",
    label: "Mange",
    pottyGainMultiplier: 1.5,
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

/* ---------------- Dog polls (wants/needs) ---------- */

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
