const DEFAULT_MIN_STAT = 0;
const DEFAULT_MAX_STAT = 100;

export const CORE_PET_STAT_DECAY_PER_HOUR = Object.freeze({
  hunger: 8,
  thirst: 7,
  happiness: 6,
  energy: 8,
  cleanliness: 3,
  health: 2,
  affection: 5,
  mentalStimulation: 4,
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
}) {
  const next = { ...(stats || {}) };

  Object.keys(next).forEach((key) => {
    const current = clampPetStat(next[key], DEFAULT_MIN_STAT, DEFAULT_MAX_STAT);
    const delta = Number(decayByStat[key] || 0);

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
