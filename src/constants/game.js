// src/constants/game.js
export const CLEANLINESS_TIER_EFFECTS = {
  FRESH: {
    label: "Fresh",
    journalSummary: "Freshly pampered and glowing.",
    penalties: { happiness: 0, energy: 0 },
  },
  DIRTY: {
    label: "Dirty",
    journalSummary: "A little grubby — time for a bath.",
    penalties: { happiness: -5, energy: -3 },
  },
  FLEAS: {
    label: "Fleas",
    journalSummary: "Scratching a lot — flea treatment advised.",
    penalties: { happiness: -12, energy: -6 },
  },
  MANGE: {
    label: "Mange",
    journalSummary: "Severe skin issues — seek vet care.",
    penalties: { happiness: -30, energy: -15 },
  },
};

// Basic life stage keys (expand in constants/game.js as needed)
export const LIFE_STAGES = {
  PUPPY: "PUPPY",
  ADULT: "ADULT",
  SENIOR: "SENIOR",
};

// Numeric thresholds used to resolve cleanliness tiers in dogSlice
export const CLEANLINESS_THRESHOLDS = {
  // value >= 75 -> FRESH
  FRESH: 75,
  // value >= 50 -> DIRTY
  DIRTY: 50,
  // value >= 25 -> FLEAS
  FLEAS: 25,
};

// Backwards-compatible convenience constants (both upper and lower-case)
export const PUPPY = "PUPPY";
export const ADULT = "ADULT";
export const SENIOR = "SENIOR";

export const puppy = "puppy";
export const adult = "adult";
export const senior = "senior";

export const FRESH = "FRESH";
export const DIRTY = "DIRTY";
export const FLEAS = "FLEAS";
export const MANGE = "MANGE";

export const fresh = "fresh";
export const dirty = "dirty";
export const fleas = "fleas";
export const mange = "mange";

// Mood tags used across the app (prefixed to avoid collisions with cleanliness constants)
export const MOOD_HAPPY = "HAPPY";
export const MOOD_HUNGRY = "HUNGRY";
export const MOOD_SLEEPY = "SLEEPY";
export const MOOD_LONELY = "LONELY";
export const MOOD_NEUTRAL = "NEUTRAL";

export const mood_happy = "happy";
export const mood_hungry = "hungry";
export const mood_sleepy = "sleepy";
export const mood_lonely = "lonely";
export const mood_neutral = "neutral";
