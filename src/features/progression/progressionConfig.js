// src/features/progression/progressionConfig.js
import { createSelector } from "@reduxjs/toolkit";

const clamp = (value, min = 0, max = 100) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return min;
  return Math.max(min, Math.min(max, numeric));
};

const clampInt = (value, min = 0, max = Number.MAX_SAFE_INTEGER) => {
  const numeric = Math.floor(Number(value));
  if (!Number.isFinite(numeric)) return min;
  return Math.max(min, Math.min(max, numeric));
};

export const PROGRESSION_SCHEMA_VERSION = 1;

export const PROGRESSION_PHASES = Object.freeze([
  "locked",
  "introduced",
  "learning",
  "reliable",
  "mastered",
]);

export const PROGRESSION_STAGE_ORDER = Object.freeze([
  "PUPPY",
  "ADULT",
  "SENIOR",
]);

export const PROGRESSION_EVENT_TYPES = Object.freeze({
  DOG_ADOPTED: "dog.adopted",
  SESSION_STARTED: "dog.session_started",
  CARE_FEED: "care.feed",
  CARE_WATER: "care.water",
  CARE_PLAY: "care.play",
  CARE_PET: "care.pet",
  CARE_BATHE: "care.bathe",
  CARE_CLEANUP: "care.cleanup",
  POTTY_SUCCESS: "care.potty_success",
  POTTY_ACCIDENT: "care.potty_accident",
  TRAINING_SESSION: "training.session",
  TREASURE_FOUND: "story.treasure_found",
  LIFE_STAGE_CHANGED: "story.life_stage_changed",
});

export const PROGRESSION_LEVEL_CONFIG = Object.freeze({
  owner: Object.freeze({
    maxLevel: 50,
    baseXp: 32,
    stepXp: 18,
    curve: 1.18,
  }),
  bond: Object.freeze({
    maxLevel: 40,
    baseXp: 24,
    stepXp: 14,
    curve: 1.16,
  }),
});

export const TRAINING_TRACK_CONFIG = Object.freeze({
  potty: Object.freeze({
    id: "potty",
    label: "Potty Training",
    category: "potty",
    reliablePct: 60,
    masteredPct: 100,
  }),
  obedience: Object.freeze({
    category: "obedience",
    reliablePct: 70,
    masteredPct: 100,
  }),
});

export const CARE_STREAK_CONFIG = Object.freeze({
  completionThreshold: 3,
  milestoneDays: Object.freeze([3, 7, 14, 30]),
});

export const POTTY_STREAK_CONFIG = Object.freeze({
  milestoneDays: Object.freeze([3, 5, 10]),
});

export const PROGRESSION_REWARD_CONFIG = Object.freeze({
  [PROGRESSION_EVENT_TYPES.DOG_ADOPTED]: Object.freeze({
    ownerXp: 12,
    bondXp: 8,
  }),
  [PROGRESSION_EVENT_TYPES.SESSION_STARTED]: Object.freeze({
    ownerXp: 0,
    bondXp: 0,
  }),
  [PROGRESSION_EVENT_TYPES.CARE_FEED]: Object.freeze({
    ownerXp: 4,
    bondXp: 1,
    careCategory: "feed",
  }),
  [PROGRESSION_EVENT_TYPES.CARE_WATER]: Object.freeze({
    ownerXp: 3,
    bondXp: 1,
    careCategory: "water",
  }),
  [PROGRESSION_EVENT_TYPES.CARE_PLAY]: Object.freeze({
    ownerXp: 4,
    bondXp: 5,
    careCategory: "play",
  }),
  [PROGRESSION_EVENT_TYPES.CARE_PET]: Object.freeze({
    ownerXp: 2,
    bondXp: 6,
    careCategory: "pet",
  }),
  [PROGRESSION_EVENT_TYPES.CARE_BATHE]: Object.freeze({
    ownerXp: 5,
    bondXp: 1,
    careCategory: "bath",
  }),
  [PROGRESSION_EVENT_TYPES.CARE_CLEANUP]: Object.freeze({
    ownerXp: 4,
    bondXp: 2,
    careCategory: "cleanup",
  }),
  [PROGRESSION_EVENT_TYPES.POTTY_SUCCESS]: Object.freeze({
    ownerXp: 5,
    bondXp: 3,
    careCategory: "potty",
  }),
  [PROGRESSION_EVENT_TYPES.POTTY_ACCIDENT]: Object.freeze({
    ownerXp: 0,
    bondXp: 0,
    careCategory: "potty",
  }),
  [PROGRESSION_EVENT_TYPES.TRAINING_SESSION]: Object.freeze({
    careCategory: "training",
    ownerXpByOutcome: Object.freeze({
      perfect: 10,
      success: 8,
      reinterpret: 5,
      doze_off: 2,
      zoomies: 3,
      ignore: 1,
      fail: 1,
      blocked: 0,
      default: 2,
    }),
    bondXpByOutcome: Object.freeze({
      perfect: 8,
      success: 6,
      reinterpret: 4,
      doze_off: 1,
      zoomies: 1,
      ignore: 0,
      fail: 0,
      blocked: 0,
      default: 1,
    }),
  }),
  [PROGRESSION_EVENT_TYPES.TREASURE_FOUND]: Object.freeze({
    ownerXp: 6,
    bondXp: 4,
  }),
  [PROGRESSION_EVENT_TYPES.LIFE_STAGE_CHANGED]: Object.freeze({
    ownerXp: 14,
    bondXp: 10,
  }),
});

export const PROGRESSION_UNLOCK_RULES = Object.freeze([
  Object.freeze({
    id: "potty_training_panel",
    bucket: "features",
    title: "Potty routine unlocked",
    body: "House-training is now part of your shared story.",
    icon: "🪴",
    tone: "emerald",
    when: Object.freeze({
      eventCountAtLeast: Object.freeze({
        eventType: PROGRESSION_EVENT_TYPES.DOG_ADOPTED,
        count: 1,
      }),
    }),
  }),
  Object.freeze({
    id: "obedience_training",
    bucket: "features",
    title: "Obedience training unlocked",
    body: "Finishing potty training opened the door to focused obedience work.",
    icon: "🎯",
    tone: "sky",
    when: Object.freeze({
      trackPhaseAtLeast: Object.freeze({ trackId: "potty", phase: "mastered" }),
    }),
  }),
  Object.freeze({
    id: "training_treat_pouch",
    bucket: "items",
    title: "Training treat pouch unlocked",
    body: "You’ve earned a more intentional training rhythm.",
    icon: "🦴",
    tone: "amber",
    when: Object.freeze({ ownerLevelAtLeast: 3 }),
  }),
  Object.freeze({
    id: "comfort_cuddle",
    bucket: "interactions",
    title: "Comfort cuddle unlocked",
    body: "Bond now matters in a more personal, emotional way.",
    icon: "💞",
    tone: "rose",
    when: Object.freeze({ bondLevelAtLeast: 2 }),
  }),
  Object.freeze({
    id: "adult_story_arc",
    bucket: "features",
    title: "Adult story arc unlocked",
    body: "Your dog’s next chapter is ready when adulthood arrives.",
    icon: "🌿",
    tone: "emerald",
    when: Object.freeze({ lifeStageAtLeast: "ADULT" }),
  }),
  Object.freeze({
    id: "senior_story_arc",
    bucket: "features",
    title: "Senior story arc unlocked",
    body: "Golden-years moments are now part of the progression path.",
    icon: "🌙",
    tone: "amber",
    when: Object.freeze({ lifeStageAtLeast: "SENIOR" }),
  }),
]);

export const PROGRESSION_MEMORY_RULES = Object.freeze([
  Object.freeze({
    id: "first_outside_success",
    title: "First outside success",
    body: "The two of you figured out the first important house-rule together.",
    icon: "🌤️",
    tone: "emerald",
    when: Object.freeze({
      eventCountAtLeast: Object.freeze({
        eventType: PROGRESSION_EVENT_TYPES.POTTY_SUCCESS,
        count: 1,
      }),
    }),
  }),
  Object.freeze({
    id: "house_rules_click",
    title: "House rules clicked",
    body: "Potty training feels dependable now, and the home rhythm is real.",
    icon: "🏡",
    tone: "sky",
    when: Object.freeze({
      trackPhaseAtLeast: Object.freeze({ trackId: "potty", phase: "reliable" }),
    }),
  }),
  Object.freeze({
    id: "first_shared_language",
    title: "First shared language",
    body: "At least one command has become reliable. You’re communicating now.",
    icon: "🗣️",
    tone: "sky",
    when: Object.freeze({ reliableCommandsAtLeast: 1 }),
  }),
  Object.freeze({
    id: "bond_anchor",
    title: "Bond anchor",
    body: "The bond has deepened into something more than routine maintenance.",
    icon: "💗",
    tone: "rose",
    when: Object.freeze({ bondLevelAtLeast: 3 }),
  }),
  Object.freeze({
    id: "grown_together",
    title: "Grown together",
    body: "Adulthood arrived because your shared routine held together long enough to matter.",
    icon: "🌱",
    tone: "emerald",
    when: Object.freeze({ lifeStageAtLeast: "ADULT" }),
  }),
  Object.freeze({
    id: "golden_years_begin",
    title: "Golden years begin",
    body: "The story has entered its senior chapter, and the bond carries more weight than ever.",
    icon: "✨",
    tone: "amber",
    when: Object.freeze({ lifeStageAtLeast: "SENIOR" }),
  }),
]);

export function toTimestamp(value) {
  if (!value) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (value instanceof Date) return value.getTime();
  if (typeof value?.toMillis === "function") {
    const millis = Number(value.toMillis());
    return Number.isFinite(millis) ? millis : null;
  }
  const parsed = Date.parse(String(value));
  return Number.isFinite(parsed) ? parsed : null;
}

export function getProgressionDayKey(value = Date.now()) {
  const stamp = toTimestamp(value) ?? Date.now();
  try {
    const date = new Date(stamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return "1970-01-01";
  }
}

export function getProgressionBucketKey(value = Date.now(), bucketMs = 0) {
  const stamp = toTimestamp(value) ?? Date.now();
  const bucket = Math.max(0, Number(bucketMs) || 0);
  if (!bucket) return String(stamp);
  return String(Math.floor(stamp / bucket));
}

export function getPhaseRank(phase) {
  return Math.max(
    0,
    PROGRESSION_PHASES.indexOf(
      String(phase || "locked")
        .trim()
        .toLowerCase()
    )
  );
}

export function isPhaseAtLeast(phase, target) {
  return getPhaseRank(phase) >= getPhaseRank(target);
}

export function getStageRank(stage) {
  return Math.max(
    0,
    PROGRESSION_STAGE_ORDER.indexOf(
      String(stage || "PUPPY")
        .trim()
        .toUpperCase()
    )
  );
}

export function isLifeStageAtLeast(stage, target) {
  return getStageRank(stage) >= getStageRank(target);
}

function getXpThreshold(level, config) {
  const safeLevel = Math.max(1, clampInt(level, 1, config.maxLevel));
  const base = Number(config.baseXp || 24);
  const step = Number(config.stepXp || 14);
  const curve = Number(config.curve || 1.1);
  return Math.max(
    base,
    Math.round(
      base +
        (safeLevel - 1) * step * Math.pow(curve, Math.max(0, safeLevel - 2))
    )
  );
}

export function buildLevelState(
  domain = "owner",
  totalXp = 0,
  lastLeveledAt = null
) {
  const config =
    PROGRESSION_LEVEL_CONFIG[domain] || PROGRESSION_LEVEL_CONFIG.owner;
  let remainingXp = Math.max(0, clampInt(totalXp, 0));
  let level = 1;
  let nextThreshold = getXpThreshold(level, config);

  while (level < config.maxLevel && remainingXp >= nextThreshold) {
    remainingXp -= nextThreshold;
    level += 1;
    nextThreshold = getXpThreshold(level, config);
  }

  return {
    totalXp: Math.max(0, clampInt(totalXp, 0)),
    level,
    xpIntoLevel: level >= config.maxLevel ? 0 : remainingXp,
    xpForNextLevel: level >= config.maxLevel ? 0 : nextThreshold,
    progressPct:
      level >= config.maxLevel
        ? 100
        : clamp(
            Math.round((remainingXp / Math.max(1, nextThreshold)) * 100),
            0,
            100
          ),
    lastLeveledAt: toTimestamp(lastLeveledAt),
  };
}

export function getCommandTrainingPhase({
  unlocked = false,
  masteryPct = 0,
} = {}) {
  const mastery = clamp(Math.round(Number(masteryPct || 0)), 0, 100);
  if (!unlocked) return "locked";
  if (mastery >= TRAINING_TRACK_CONFIG.obedience.masteredPct) return "mastered";
  if (mastery >= TRAINING_TRACK_CONFIG.obedience.reliablePct) return "reliable";
  if (mastery > 0) return "learning";
  return "introduced";
}

export function getPottyTrainingPhase({
  successCount = 0,
  goal = 1,
  completedAt = null,
} = {}) {
  const totalGoal = Math.max(1, clampInt(goal, 1, 999));
  const successes = clampInt(successCount, 0, totalGoal);
  const pct = clamp(Math.round((successes / totalGoal) * 100), 0, 100);
  if (completedAt || pct >= TRAINING_TRACK_CONFIG.potty.masteredPct)
    return "mastered";
  if (pct >= TRAINING_TRACK_CONFIG.potty.reliablePct) return "reliable";
  if (successes > 0) return "learning";
  return "introduced";
}

export function getTrainingRewardsForEvent(event) {
  const config = PROGRESSION_REWARD_CONFIG[event?.type] || null;
  if (!config) return { ownerXp: 0, bondXp: 0, careCategory: null };
  if (event?.type !== PROGRESSION_EVENT_TYPES.TRAINING_SESSION) {
    return {
      ownerXp: clampInt(config.ownerXp, 0),
      bondXp: clampInt(config.bondXp, 0),
      careCategory: config.careCategory || null,
    };
  }

  const outcome = String(event?.payload?.outcome || "default")
    .trim()
    .toLowerCase();
  return {
    ownerXp: clampInt(
      config.ownerXpByOutcome?.[outcome] ??
        config.ownerXpByOutcome?.default ??
        0,
      0
    ),
    bondXp: clampInt(
      config.bondXpByOutcome?.[outcome] ?? config.bondXpByOutcome?.default ?? 0,
      0
    ),
    careCategory: config.careCategory || null,
  };
}

export function isConditionSatisfied(condition = {}, state = {}) {
  const nextCondition =
    condition && typeof condition === "object" ? condition : {};
  const eventCounts = state?.eventLog?.countsByType || {};
  const ownerLevel = clampInt(state?.owner?.level, 1);
  const bondLevel = clampInt(state?.bond?.level, 1);
  const careStreak = clampInt(state?.streaks?.care?.current, 0);
  const pottyStreak = clampInt(state?.streaks?.potty?.current, 0);
  const lifeStage = String(state?.lifeStage?.current || "PUPPY")
    .trim()
    .toUpperCase();
  const tracks = state?.training?.tracks || {};
  const reliableCommands = clampInt(state?.training?.reliableCommandCount, 0);
  const masteredCommands = clampInt(state?.training?.masteredCommandCount, 0);

  if (
    nextCondition.eventCountAtLeast &&
    typeof nextCondition.eventCountAtLeast === "object"
  ) {
    const eventType = String(
      nextCondition.eventCountAtLeast.eventType || ""
    ).trim();
    const minCount = clampInt(nextCondition.eventCountAtLeast.count, 1);
    if (clampInt(eventCounts[eventType], 0) < minCount) return false;
  }

  if (Number.isFinite(Number(nextCondition.ownerLevelAtLeast))) {
    if (ownerLevel < clampInt(nextCondition.ownerLevelAtLeast, 1)) return false;
  }

  if (Number.isFinite(Number(nextCondition.bondLevelAtLeast))) {
    if (bondLevel < clampInt(nextCondition.bondLevelAtLeast, 1)) return false;
  }

  if (Number.isFinite(Number(nextCondition.careStreakAtLeast))) {
    if (careStreak < clampInt(nextCondition.careStreakAtLeast, 1)) return false;
  }

  if (Number.isFinite(Number(nextCondition.pottyStreakAtLeast))) {
    if (pottyStreak < clampInt(nextCondition.pottyStreakAtLeast, 1))
      return false;
  }

  if (typeof nextCondition.lifeStageAtLeast === "string") {
    if (!isLifeStageAtLeast(lifeStage, nextCondition.lifeStageAtLeast))
      return false;
  }

  if (
    nextCondition.trackPhaseAtLeast &&
    typeof nextCondition.trackPhaseAtLeast === "object"
  ) {
    const trackId = String(
      nextCondition.trackPhaseAtLeast.trackId || ""
    ).trim();
    const targetPhase = String(
      nextCondition.trackPhaseAtLeast.phase || "locked"
    )
      .trim()
      .toLowerCase();
    if (!trackId) return false;
    if (!isPhaseAtLeast(tracks?.[trackId]?.phase, targetPhase)) return false;
  }

  if (Number.isFinite(Number(nextCondition.reliableCommandsAtLeast))) {
    if (reliableCommands < clampInt(nextCondition.reliableCommandsAtLeast, 1))
      return false;
  }

  if (Number.isFinite(Number(nextCondition.masteredCommandsAtLeast))) {
    if (masteredCommands < clampInt(nextCondition.masteredCommandsAtLeast, 1))
      return false;
  }

  return true;
}

export const selectProgressionRoot = (state) => state?.progression || null;

export const selectProgressionSnapshot = createSelector(
  [selectProgressionRoot],
  (progression) => progression || null
);
