/** @format */

// src/constants/game.js
// Shared game constants.

// Effects used by reducers and UI. The reducer currently reads
// effects.penalties.{happinessTickPenalty,energyTickPenalty}.
export const CLEANLINESS_TIER_EFFECTS = {
  FRESH: {
    label: 'Fresh',
    journalSummary: 'Feeling squeaky clean and ready to zoom.',
    penalties: { happinessTickPenalty: 0, energyTickPenalty: 0 },
  },
  DIRTY: {
    label: 'Muddy paws',
    journalSummary: 'I picked up some mystery grime. Bath time soon?',
    penalties: { happinessTickPenalty: 1, energyTickPenalty: 0 },
  },
  FLEAS: {
    label: 'Fleas',
    journalSummary: 'I’m itchy… a bath would help a lot.',
    penalties: { happinessTickPenalty: 2, energyTickPenalty: 1 },
  },
  MANGE: {
    label: 'Mange',
    journalSummary: 'I feel gross and tired. Please take care of me.',
    penalties: { happinessTickPenalty: 3, energyTickPenalty: 2 },
  },
};

// Basic life stage keys (expand as needed)
export const LIFE_STAGES = Object.freeze({
  PUPPY: 'PUPPY',
  ADULT: 'ADULT',
  SENIOR: 'SENIOR',
});

// Stable list of tiers (helps UI + safelisting)
export const CLEANLINESS_TIERS = Object.freeze([
  'FRESH',
  'DIRTY',
  'FLEAS',
  'MANGE',
]);

/**
 * Get a human-friendly label for a cleanliness tier.
 * Returns the configured label when available, otherwise returns the tier id.
 */
export function getCleanlinessLabel(tier) {
  if (!tier) return '';
  const key = String(tier).toUpperCase();
  return CLEANLINESS_TIER_EFFECTS[key]?.label || key || '';
}

Object.freeze(CLEANLINESS_TIER_EFFECTS);
