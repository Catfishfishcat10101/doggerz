// src/config/dogConfig.js

// One source of truth for growth curves, needs budgets, and skill catalog.
// Keep this file framework-agnostic so it’s unit-testable.

const DAYS = (n) => n; // semantic sugar

export const GROWTH = {
  // Real-world durations for stages (in days). Make these BIG to “take a long time”.
  STAGES: [
    { id: "newborn",    label: "Newborn",     minDays: DAYS(0),   maxDays: DAYS(7) },
    { id: "puppy",      label: "Puppy",       minDays: DAYS(7),   maxDays: DAYS(45) },
    { id: "adolescent", label: "Adolescent",  minDays: DAYS(45),  maxDays: DAYS(180) },
    { id: "adult",      label: "Adult",       minDays: DAYS(180), maxDays: DAYS(540) },
    { id: "senior",     label: "Senior",      minDays: DAYS(540), maxDays: Infinity },
  ],

  // Time multiplier. 1 = real time; 0.5 = slower than real; 5 = faster (for testing).
  // In production keep this near 1 for long-tail progression.
  TIME_MULTIPLIER: Number(import.meta.env.VITE_DOG_TIME_MULTIPLIER ?? 1),

  // Energy/hunger/happiness budgets (per real-time hour at TIME_MULTIPLIER = 1)
  NEEDS: {
    HUNGER_DECAY_PER_HR: 3,
    ENERGY_DECAY_PER_HR: 4,
    HAPPINESS_DECAY_PER_HR: 1,
    TRAIN_ENERGY_COST: 8,
    FEED_HUNGER_GAIN: 25,
    REST_ENERGY_GAIN: 25,
    PET_HAPPINESS_GAIN: 10,
  },

  // Trainable skills (IDs are stable keys for saves/achievements)
  SKILLS: [
    { id: "sit",         label: "Sit" },
    { id: "shake",       label: "Shake" },
    { id: "down",        label: "Lie Down" },
    { id: "roll",        label: "Roll Over" },
    { id: "speak",       label: "Bark" },
    { id: "high_five",   label: "High Five" },
    { id: "find_it",     label: "Find It" },
    { id: "scent_work",  label: "Scent Work" },
    { id: "tug_of_war",  label: "Tug of War" },
    { id: "speak_on_command", label: "Speak on Command" },
    { id: "quiet",       label: "Quiet" },
  ],

};

// ---------------------------
// Convenience helpers
// ---------------------------

/** Return the stage object for a given age in days. */
export function getStageByDays(ageDays = 0) {
  const d = Math.max(0, Number(ageDays) || 0);
  const s = GROWTH.STAGES.find((s) => d >= s.minDays && d < s.maxDays);
  return s ?? GROWTH.STAGES[GROWTH.STAGES.length - 1];
}

/** Human label for a given age in days. */
export function getStageLabel(ageDays) {
  return getStageByDays(ageDays).label;
}

/** Convert real milliseconds -> “dog time” seconds after multiplier. */
export function msToDogSeconds(deltaMs) {
  const mult = Number(GROWTH.TIME_MULTIPLIER) || 1;
  return (deltaMs / 1000) * mult;
}

/** Decay/gain calculators per hour, scaled by multiplier. */
export function needsPerHour() {
  const m = Number(GROWTH.TIME_MULTIPLIER) || 1;
  const N = GROWTH.NEEDS;
  return {
    hungerDecay: N.HUNGER_DECAY_PER_HR * m,
    energyDecay: N.ENERGY_DECAY_PER_HR * m,
    happinessDecay: N.HAPPINESS_DECAY_PER_HR * m,
    trainEnergyCost: N.TRAIN_ENERGY_COST,
    feedHungerGain: N.FEED_HUNGER_GAIN,
    restEnergyGain: N.REST_ENERGY_GAIN,
    petHappinessGain: N.PET_HAPPINESS_GAIN,
  };
}
