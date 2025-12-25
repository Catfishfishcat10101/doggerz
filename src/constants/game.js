//src/constants/game.js
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

// Export a stable list of tiers (keeps callers consistent and helps safelisting)
export const CLEANLINESS_TIERS = Object.freeze([
  "FRESH",
  "DIRTY",
  "FLEAS",
  "MANGE",
]);

/**
 * Get a human-friendly label for a cleanliness tier.
 * Returns the configured label when available, otherwise returns the tier id.
 */
export function getCleanlinessLabel(tier) {
  if (!tier) return "";
  const key = String(tier).toUpperCase();
  return (
    (CLEANLINESS_TIER_EFFECTS[key] && CLEANLINESS_TIER_EFFECTS[key].label) ||
    key ||
    ""
  );
}

// Freeze exported objects to reduce accidental mutation at runtime
Object.freeze(CLEANLINESS_TIER_EFFECTS);
Object.freeze(LIFE_STAGES);
