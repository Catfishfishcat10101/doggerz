/** @format */

function clamp(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function toNonNegativeInt(value, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return Math.max(0, Math.floor(fallback));
  return Math.max(0, Math.floor(n));
}

function normalizeMilestones(milestones = []) {
  return Array.from(
    new Set(
      (Array.isArray(milestones) ? milestones : [])
        .map((value) => toNonNegativeInt(value, 0))
        .filter((value) => value > 0)
    )
  ).sort((a, b) => a - b);
}

export function createExperienceState(seed = {}) {
  const level = Math.max(1, toNonNegativeInt(seed?.level, 1));
  const xp = Math.max(0, toNonNegativeInt(seed?.xp, 0));
  const baseThreshold = Math.max(
    10,
    toNonNegativeInt(seed?.baseThreshold, 100)
  );
  const thresholdStep = Math.max(0, toNonNegativeInt(seed?.thresholdStep, 20));
  const maxLevel = Math.max(level, toNonNegativeInt(seed?.maxLevel, 50));
  const growthMilestones = normalizeMilestones(
    seed?.growthMilestones || [3, 8, 15]
  );
  const reachedMilestones = normalizeMilestones(seed?.reachedMilestones || []);

  return {
    level,
    xp,
    baseThreshold,
    thresholdStep,
    maxLevel,
    growthMilestones,
    reachedMilestones,
  };
}

export function xpRequiredForLevel(level, config = {}) {
  const safeLevel = Math.max(1, toNonNegativeInt(level, 1));
  const baseThreshold = Math.max(
    10,
    toNonNegativeInt(config?.baseThreshold, 100)
  );
  const thresholdStep = Math.max(
    0,
    toNonNegativeInt(config?.thresholdStep, 20)
  );

  let total = 0;
  for (let idx = 1; idx < safeLevel; idx += 1) {
    total += baseThreshold + (idx - 1) * thresholdStep;
  }
  return total;
}

export function getLevelProgress(experienceState) {
  const state = createExperienceState(experienceState);
  const currentLevelStartXp = xpRequiredForLevel(state.level, state);
  const nextLevelStartXp = xpRequiredForLevel(state.level + 1, state);
  const inLevelXp = Math.max(0, state.xp - currentLevelStartXp);
  const levelSpan = Math.max(1, nextLevelStartXp - currentLevelStartXp);
  const progressPct = clamp((inLevelXp / levelSpan) * 100, 0, 100);

  return {
    level: state.level,
    inLevelXp,
    levelSpan,
    progressPct,
    currentLevelStartXp,
    nextLevelStartXp,
  };
}

export function addBondExperience(experienceState, gainedXp = 0) {
  const state = createExperienceState(experienceState);
  const delta = Math.max(0, toNonNegativeInt(gainedXp, 0));
  if (delta <= 0 || state.level >= state.maxLevel) {
    return {
      state,
      leveledUp: false,
      levelsGained: 0,
      growthTriggered: false,
      newMilestones: [],
      progress: getLevelProgress(state),
    };
  }

  const next = { ...state, xp: state.xp + delta };
  let nextLevel = state.level;
  while (
    nextLevel < next.maxLevel &&
    next.xp >= xpRequiredForLevel(nextLevel + 1, next)
  ) {
    nextLevel += 1;
  }

  const levelBefore = state.level;
  const levelAfter = nextLevel;
  next.level = levelAfter;

  const newlyReached = next.growthMilestones.filter(
    (milestone) =>
      milestone > levelBefore &&
      milestone <= levelAfter &&
      !next.reachedMilestones.includes(milestone)
  );
  if (newlyReached.length > 0) {
    next.reachedMilestones = normalizeMilestones([
      ...next.reachedMilestones,
      ...newlyReached,
    ]);
  }

  return {
    state: next,
    leveledUp: levelAfter > levelBefore,
    levelsGained: Math.max(0, levelAfter - levelBefore),
    growthTriggered: newlyReached.length > 0,
    newMilestones: newlyReached,
    progress: getLevelProgress(next),
  };
}

/**
 * Returns a multiplier applied to passive stat decay.
 * Higher level => smaller multiplier => slower decay.
 *
 * Default curve: level 1 => 1.0, level 10 => ~0.79, level 25 => ~0.57.
 */
export function getLevelDecayMultiplier(level, opts = {}) {
  const lvl = Math.max(1, toNonNegativeInt(level, 1));
  const perLevelSlowdown = clamp(
    Number(opts?.perLevelSlowdown ?? 0.03),
    0,
    0.25
  );
  return 1 / (1 + (lvl - 1) * perLevelSlowdown);
}
