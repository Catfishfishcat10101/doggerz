/** @format */

// src/constants/game.js
// Central game tuning + shared constants.
// Keep this file dependency-light so it can be safely imported across UI + reducers.

export const CLEANLINESS_TIER_ORDER = ['FRESH', 'DIRTY', 'FLEAS', 'MANGE'];

// Cleanliness tiers are derived from a `cleanliness` 0–100 value.
// Higher value => cleaner.
export const CLEANLINESS_THRESHOLDS = {
  // 70–100
  FRESH: 70,
  // 45–69
  DIRTY: 45,
  // 25–44
  FLEAS: 25,
  // <25 => MANGE
};

// Effects applied each tick and copy shown when a tier change is detected.
// Note: tick penalties are intended to be tiny, steady nudges.
export const CLEANLINESS_TIER_EFFECTS = {
  FRESH: {
    label: 'Fresh',
    journalSummary: 'Feeling squeaky clean and ready to zoom.',
    happinessTickPenalty: 0,
    energyTickPenalty: 0,
  },
  DIRTY: {
    label: 'Muddy paws',
    journalSummary: 'I picked up some mystery grime. Bath time soon?',
    happinessTickPenalty: 1,
    energyTickPenalty: 0,
  },
  FLEAS: {
    label: 'Fleas',
    journalSummary: 'I’m itchy… a bath would help a lot.',
    happinessTickPenalty: 2,
    energyTickPenalty: 1,
  },
  MANGE: {
    label: 'Mange',
    journalSummary: 'I feel gross and tired. Please take care of me.',
    happinessTickPenalty: 3,
    energyTickPenalty: 2,
  },
};

export function resolveCleanlinessTierFromValue(value = 0) {
  const v = Number(value);
  const clamped = Number.isFinite(v) ? Math.max(0, Math.min(100, v)) : 0;
  if (clamped >= CLEANLINESS_THRESHOLDS.FRESH) return 'FRESH';
  if (clamped >= CLEANLINESS_THRESHOLDS.DIRTY) return 'DIRTY';
  if (clamped >= CLEANLINESS_THRESHOLDS.FLEAS) return 'FLEAS';
  return 'MANGE';
}

// Lifecycle utilities are kept in src/utils/lifecycle.js.
// Re-exporting here gives callers a single import location when appropriate.
export {
  GAME_DAYS_PER_REAL_DAY,
  LIFE_STAGES,
  getLifeStageForAge,
  calculateDogAge,
  getSpriteForLifeStage,
  getSpriteForStageAndTier,
} from '../utils/lifecycle.js';
