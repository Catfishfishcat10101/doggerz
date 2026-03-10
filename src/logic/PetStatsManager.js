import { getLevelDecayMultiplier } from "@/logic/ExperienceAndLeveling.js";

const DEFAULT_MIN_STAT = 0;
const DEFAULT_MAX_STAT = 100;

export const CORE_PET_STAT_DECAY_PER_HOUR = Object.freeze({
  hunger: 2,
  thirst: 2,
  happiness: 2,
  energy: 2,
  cleanliness: 1,
  health: 1,
  affection: 2,
  mentalStimulation: 2,
});

export const NEEDS_THAT_RISE_WITH_NEGLECT = Object.freeze(
  new Set(["hunger", "thirst"])
);

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
    const delta = Number(decayByStat[key] || 0) * decayMultiplier;

    if (key === "energy" && sleeping) {
      next[key] = clampPetStat(
        current + Number(energyRecoveryGain || 0),
        DEFAULT_MIN_STAT,
        DEFAULT_MAX_STAT
      );
      return;
    }

    if (NEEDS_THAT_RISE_WITH_NEGLECT.has(key)) {
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
