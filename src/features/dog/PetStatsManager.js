// src/features/dog/PetStatsManager.js
//src/logic/PetStatsManager.js
import { getLevelDecayMultiplier } from "@/features/dog/ExperienceAndLeveling.js";

const DEFAULT_MIN_STAT = 0;
const DEFAULT_MAX_STAT = 100;

function toFiniteNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export const CORE_PET_STAT_DECAY_PER_HOUR = Object.freeze({
  hunger: 1.6,
  thirst: 1.5,
  happiness: 1.15,
  energy: 1.0,
  cleanliness: 0.65,
  health: 0,
  affection: 0.8,
  mentalStimulation: 1.1,
});

export const NEEDS_THAT_RISE_WITH_NEGLECT = Object.freeze({
  hunger: true,
  thirst: true,
});

export function clampPetStat(
  value,
  min = DEFAULT_MIN_STAT,
  max = DEFAULT_MAX_STAT
) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

export function normalizePetStats(stats, defaults = {}) {
  const base = stats && typeof stats === "object" ? stats : {};
  const merged = { ...defaults, ...base };

  Object.keys(merged).forEach((key) => {
    merged[key] = clampPetStat(merged[key], DEFAULT_MIN_STAT, DEFAULT_MAX_STAT);
  });

  return merged;
}

export function applyPetStatDecay({
  stats,
  decayByStat = {},
  sleeping = false,
  energyRecoveryGain = 0,
  level = 1,
  perLevelSlowdown = 0.03,
}) {
  const next = { ...(stats || {}) };
  const decayMultiplier = getLevelDecayMultiplier(level, { perLevelSlowdown });

  Object.keys(next).forEach((key) => {
    const current = clampPetStat(next[key], DEFAULT_MIN_STAT, DEFAULT_MAX_STAT);
    const delta = toFiniteNumber(decayByStat[key], 0) * decayMultiplier;

    if (key === "energy" && sleeping) {
      next[key] = clampPetStat(
        current + toFiniteNumber(energyRecoveryGain, 0),
        DEFAULT_MIN_STAT,
        DEFAULT_MAX_STAT
      );
      return;
    }

    if (NEEDS_THAT_RISE_WITH_NEGLECT[key]) {
      next[key] = clampPetStat(
        current + delta,
        DEFAULT_MIN_STAT,
        DEFAULT_MAX_STAT
      );
      return;
    }

    next[key] = clampPetStat(
      current - delta,
      DEFAULT_MIN_STAT,
      DEFAULT_MAX_STAT
    );
  });

  return next;
}
