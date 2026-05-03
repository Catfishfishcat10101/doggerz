// src/redux/dogSlice.js
export const selectDogMoodlets = (state) => state.dog.moodlets;
export const selectDogEmotionCue = (state) => state.dog.emotionCue;
export const selectDogGrowthMilestone = (state) =>
  state.dog?.milestones?.pending || null;
export const selectDogAnimation = (state) =>
  state?.dog?.animation || DEFAULT_ANIMATION_STATE;

import { createSelector, createSlice } from "@reduxjs/toolkit";
import {
  calculateDogAge,
  getDogAgeProgress,
  getLifeStageLabel,
  getLifeStageProgressLabel,
} from "@/utils/lifecycle.js";
import {
  getLifeStageTransitionCopy,
  getLifeStageUi,
} from "@/features/dog/lifecycleContent.js";
import {
  getDailyIdentityFlavor,
  getIdentityFavoriteFoodLabel,
  getIdentityNapSpotLabel,
} from "@/features/dog/identityFlavorContent.js";
import { deepMergeDefined } from "@/utils/deepMerge.js";
import { xpRequiredForLevel } from "@/features/dog/ExperienceAndLeveling.js";
import {
  CLEANLINESS_TIER_EFFECTS,
  getCleanlinessLabel,
  getCleanlinessSeverity,
  getCleanlinessUi,
} from "@/features/dog/cleanlinessEffects.js";
import { LIFE_STAGES } from "@/features/dog/dogLifeStages.js";
import {
  MASTER_TRICKS,
  OBEDIENCE_COMMANDS,
  commandRequirementsMet,
  getObedienceActiveLearningLimit,
  getObedienceCommand,
} from "@/features/training/obedienceCommands.js";
import {
  CORE_PET_STAT_DECAY_PER_HOUR,
  applyPetStatDecay,
  normalizePetStats,
} from "@/features/dog/PetStatsManager.js";
import {
  getElapsedHoursAfterGrace,
  getOfflineProgressHours,
  HUNGER_FULLNESS_BUFFER_HOURS,
  RUNAWAY_LOCKOUT_HOURS,
} from "@/features/dog/OfflineProgressCalculator.js";
import {
  getObedienceSkillMasteryPct,
  resolveJrtTrainingReaction,
} from "@/features/training/jrtTrainingController.js";
import { computeTrainingSuccessChance } from "@/utils/trainingMath.js";
import {
  computeSkillTreePoints,
  computeSkillTreeModifiers,
  getSkillTreeBranchIdForPerk,
  getSkillTreeUnlockCheck,
  getSkillTreePerk,
} from "@/features/training/skillTree.js";
import {
  advanceDogFsm,
  applyFsmAction,
  ensureDogFsmState,
  isDogFsmLocked,
  DOG_FSM_DEFAULT,
  transitionDogFsm,
} from "@/features/dog/StateMachineController.js";
import {
  applyPersonalityDrift,
  buildDreamFromState,
  calculateFeedStats,
  calculatePlayStats,
} from "@/features/dog/dogEngine.js";
import { derivePersonalityProfile } from "@/features/dog/personalityProfile.js";

export const DOG_STORAGE_KEY = "doggerz:dogState";
export const DOG_GUEST_STORAGE_KEY = `${DOG_STORAGE_KEY}:guest`;

export function getDogStorageKey(userId) {
  const raw = String(userId || "").trim();
  return raw ? `${DOG_STORAGE_KEY}:${raw}` : DOG_GUEST_STORAGE_KEY;
}
export const DOG_SAVE_SCHEMA_VERSION = 1;

const clamp = (n, lo = 0, hi = 100) =>
  Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : 0));

const clamp01 = (n) => Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));
const randomBetween = (lo, hi) =>
  Number(lo) + Math.random() * (Number(hi) - Number(lo));
const normalizeActionKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_");

const resolveActionOverride = (payload, fallback) => {
  const override = normalizeActionKey(payload?.action);
  return override || fallback;
};

const DEFAULT_ANIMATION_STATE = Object.freeze({
  mood: "ok", // string mood for animation routing
  desiredAction: "idle", // looping action
  overrideAction: null, // one-shot action
  overrideUntilDone: false,
  facing: "right",
});

const MOOD_TO_DESIRED_ACTION = Object.freeze({
  sleepy: "sleep",
  hungry: "eat",
  thirsty: "drink",
  potty: "walk",
  dirty: "scratch",
  itchy: "scratch",
  excited: "walk",
  restless: "walk",
  bored: "walk",
  lonely: "paw",
  sad: "idle",
  uneasy: "idle",
  sore: "idle",
  sick: "idle",
  stressed: "idle",
  fragile: "idle",
  happy: "idle",
  content: "idle",
  calm: "idle",
  ok: "idle",
});

const deriveDesiredActionFromMood = (mood) =>
  MOOD_TO_DESIRED_ACTION[normalizeActionKey(mood)] || "idle";
const DECAY_PER_HOUR = CORE_PET_STAT_DECAY_PER_HOUR;
const DECAY_SPEED = 0.35;
const MAX_DECAY_HOURS = 72;
const SEVERE_NEGLECT_CLEANLINESS_THRESHOLD = 8;
const SEVERE_NEGLECT_HUNGER_THRESHOLD = 92;
const SEVERE_NEGLECT_GRACE_HOURS = 2;
const OFFLINE_SEVERE_NEGLECT_HEALTH_DECAY_PER_HOUR = 1.2;
const STARVATION_HEALTH_GRACE_HOURS = 24;
const OFFLINE_STARVATION_HEALTH_DECAY_PER_HOUR = 2;
const MS_PER_HOUR = 60 * 60 * 1000;

const SLEEP_RECOVERY_PER_HOUR = 45;
const SLEEP_NEEDS_MULTIPLIER = 0.7;
const AUTO_SLEEP_THRESHOLD = 0;
const AUTO_WAKE_THRESHOLD = 76;
const POTTY_FILL_PER_HOUR = 7;
const MAX_ACCIDENTS_PER_DECAY = 1;
const MOOD_SAMPLE_MINUTES = 60;
const SENIOR_STAGE_START_DAY = 150;
const SENIOR_STIFFNESS_WINDOW_DAYS = 40;
const DENTAL_HARD_FOOD_REJECT_AT = 35;
const CHEWING_URGE_DESTRUCTIVE_THRESHOLD = 88;
const CHEWING_INCIDENT_COOLDOWN_MS = 6 * 60 * 60 * 1000;
const DOG_LIFECYCLE_STATUS = Object.freeze({
  NONE: "NONE",
  ACTIVE: "ACTIVE",
  RESCUED: "RESCUED",
  FAREWELL: "FAREWELL",
});
const DANGER_TIER = Object.freeze({
  SAFE: "SAFE",
  ELEVATED: "ELEVATED",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
});
const DANGER_RUNAWAY_LETTER_THRESHOLD = 72;
const DANGER_RESCUE_THRESHOLD = 92;
const DANGER_RUNAWAY_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const FINAL_STRETCH_NEGLECT_IMMUNITY_AGE_DAYS = 175;
const FINAL_STRETCH_NEGLECT_IMMUNITY_HEALTH_FLOOR = 1;
const LONG_LIFE_FAREWELL_AGE_DAYS = 180;
const TEMPERAMENT_ARCHETYPE = Object.freeze({
  ATHLETE: "ATHLETE",
  INDEPENDENT: "INDEPENDENT",
  SHADOW: "SHADOW",
  MISCHIEVOUS: "MISCHIEVOUS",
});
const ARCHETYPE_REVEAL_WINDOW_HOURS = 72;
const POTTY_GATE_INSTANT_UNLOCK_IDS = Object.freeze(["sit", "speak"]);
export const LEVEL_XP_BASE_THRESHOLD = 140;
export const LEVEL_XP_STEP = 35;
const SKILL_LEVEL_STEP = 50;
const LEGACY_VACATION_MULTIPLIER = 0.35;
const SESSION_SURPRISE_COOLDOWN_MS = 3 * 60 * 60 * 1000;
const SESSION_SURPRISE_CHANCE = 0.42;
const SHARE_REWARD_COOLDOWN_MS = 12 * 60 * 60 * 1000;
const SESSION_SURPRISE_TYPES = Object.freeze({
  DIG_HOLE: "DIG_HOLE",
  STOLEN_BUTTON: "STOLEN_BUTTON",
});
const STOLENABLE_ACTION_KEYS = Object.freeze([
  "play",
  "pet",
  "bath",
  "potty",
  "train",
  "store",
]);
const YARD_ENVIRONMENT = "yard";
const DEFAULT_VACATION_STATE = Object.freeze({
  enabled: false,
  multiplier: 0,
  startedAt: null,
  skippedMs: 0,
});
const DEFAULT_DOG_IDENTITY = Object.freeze({
  profileId: null,
  visualIdentity: "jr_canonical_v1",
  breed: "jack_russell",
  name: "Fireball",
  createdAt: null,
});
const DEFAULT_DAILY_IDENTITY_FLAVOR = Object.freeze({
  dayKey: null,
  title: null,
  body: null,
  tone: "calm",
  generatedAt: null,
});
const FAVORITE_PREFERENCE_THRESHOLDS = Object.freeze({
  toy: 3,
  food: 3,
  nap: 2,
});

const DOG_RULE_PIPELINE_STAGES = Object.freeze([
  "computeDegradation",
  "applyEnvironmentModifiers",
  "applyCompounding",
  "evaluateThresholds",
  "runLegacyEvents",
]);

const nowMs = () => Date.now();
const UNIX_SECONDS_MAX = 10_000_000_000;

function normalizeTimestampMs(raw) {
  if (raw === undefined || raw === null) return null;
  if (raw instanceof Date) return raw.getTime();
  if (typeof raw?.toMillis === "function") {
    const ms = Number(raw.toMillis());
    return Number.isFinite(ms) ? ms : null;
  }
  if (typeof raw === "object" && Number.isFinite(Number(raw?.seconds))) {
    return Math.max(0, Math.floor(Number(raw.seconds) * 1000));
  }
  if (typeof raw === "string") {
    const numeric = Number(raw);
    if (!Number.isNaN(numeric)) return normalizeTimestampMs(numeric);
    const parsed = Date.parse(raw);
    return Number.isNaN(parsed) ? null : parsed;
  }
  if (typeof raw === "number" && Number.isFinite(raw)) {
    if (Math.abs(raw) < UNIX_SECONDS_MAX) {
      return Math.floor(raw * 1000);
    }
    return raw;
  }
  return null;
}

function parseAdoptedAt(raw) {
  return normalizeTimestampMs(raw);
}

function sanitizeDogName(value, fallback = "Pup") {
  const trimmed = String(value || "")
    .trim()
    .replace(/\s+/g, " ");
  return trimmed || fallback;
}

function deriveDogIdentityId(adoptedAt) {
  const parsed = parseAdoptedAt(adoptedAt);
  if (parsed) return `dog-${parsed}`;
  return null;
}

function ensureDogIdentityState(state, { adoptedAtFallback = null } = {}) {
  if (!state || typeof state !== "object") return null;
  if (!state.identity || typeof state.identity !== "object") {
    state.identity = { ...DEFAULT_DOG_IDENTITY };
  }

  const identity = state.identity;
  const adoptedAt = parseAdoptedAt(state.adoptedAt ?? adoptedAtFallback);

  if (!identity.profileId && adoptedAt) {
    identity.profileId = deriveDogIdentityId(adoptedAt);
  }
  if (!identity.visualIdentity) {
    identity.visualIdentity = DEFAULT_DOG_IDENTITY.visualIdentity;
  }
  if (!identity.breed) {
    identity.breed = DEFAULT_DOG_IDENTITY.breed;
  }

  const resolvedName = sanitizeDogName(state.name, identity.name || "Pup");
  identity.name = sanitizeDogName(identity.name, resolvedName);
  state.name = resolvedName;

  if (!Number.isFinite(Number(identity.createdAt))) {
    identity.createdAt =
      adoptedAt || parseAdoptedAt(state.lastUpdatedAt) || nowMs();
  }

  return identity;
}

function ensureIdentityContentState(state) {
  if (!state || typeof state !== "object") return null;
  if (!state.identityContent || typeof state.identityContent !== "object") {
    state.identityContent = createInitialIdentityContentState();
  }

  const identityContent = state.identityContent;
  if (
    !identityContent.dailyFlavor ||
    typeof identityContent.dailyFlavor !== "object"
  ) {
    identityContent.dailyFlavor = { ...DEFAULT_DAILY_IDENTITY_FLAVOR };
  } else {
    identityContent.dailyFlavor = {
      dayKey: identityContent.dailyFlavor.dayKey || null,
      title: identityContent.dailyFlavor.title || null,
      body: identityContent.dailyFlavor.body || null,
      tone: identityContent.dailyFlavor.tone || "calm",
      generatedAt: Number.isFinite(
        Number(identityContent.dailyFlavor.generatedAt)
      )
        ? Number(identityContent.dailyFlavor.generatedAt)
        : null,
    };
  }

  if (
    !identityContent.preferences ||
    typeof identityContent.preferences !== "object"
  ) {
    identityContent.preferences = {
      ...createInitialIdentityContentState().preferences,
    };
  }
  identityContent.preferences.favoriteToyId = identityContent.preferences
    .favoriteToyId
    ? String(identityContent.preferences.favoriteToyId)
    : state.memory?.favoriteToyId
      ? String(state.memory.favoriteToyId)
      : null;
  identityContent.preferences.favoriteFoodType = identityContent.preferences
    .favoriteFoodType
    ? String(identityContent.preferences.favoriteFoodType)
    : null;
  identityContent.preferences.favoriteNapSpotId = identityContent.preferences
    .favoriteNapSpotId
    ? String(identityContent.preferences.favoriteNapSpotId)
    : null;
  identityContent.preferences.discoveredAtByKey =
    identityContent.preferences.discoveredAtByKey &&
    typeof identityContent.preferences.discoveredAtByKey === "object"
      ? identityContent.preferences.discoveredAtByKey
      : {};
  identityContent.preferences.countsByKey =
    identityContent.preferences.countsByKey &&
    typeof identityContent.preferences.countsByKey === "object"
      ? identityContent.preferences.countsByKey
      : {};
  identityContent.preferences.countsByKey.toy =
    identityContent.preferences.countsByKey.toy &&
    typeof identityContent.preferences.countsByKey.toy === "object"
      ? identityContent.preferences.countsByKey.toy
      : {};
  identityContent.preferences.countsByKey.food =
    identityContent.preferences.countsByKey.food &&
    typeof identityContent.preferences.countsByKey.food === "object"
      ? identityContent.preferences.countsByKey.food
      : {};
  identityContent.preferences.countsByKey.nap =
    identityContent.preferences.countsByKey.nap &&
    typeof identityContent.preferences.countsByKey.nap === "object"
      ? identityContent.preferences.countsByKey.nap
      : {};

  if (
    !identityContent.milestoneCards ||
    typeof identityContent.milestoneCards !== "object"
  ) {
    identityContent.milestoneCards = {
      ...createInitialIdentityContentState().milestoneCards,
    };
  }
  identityContent.milestoneCards.lastShownId = identityContent.milestoneCards
    .lastShownId
    ? String(identityContent.milestoneCards.lastShownId)
    : null;
  identityContent.milestoneCards.queue = Array.isArray(
    identityContent.milestoneCards.queue
  )
    ? identityContent.milestoneCards.queue
    : [];
  identityContent.milestoneCards.seenIds = Array.isArray(
    identityContent.milestoneCards.seenIds
  )
    ? identityContent.milestoneCards.seenIds.map((id) => String(id || ""))
    : [];

  if (
    !identityContent.preferences.favoriteToyId &&
    state.memory?.favoriteToyId
  ) {
    identityContent.preferences.favoriteToyId = String(
      state.memory.favoriteToyId
    );
  }

  return identityContent;
}

function normalizePreferenceKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_");
}

function incrementPreferenceSignal(state, bucket, rawValue) {
  const key = normalizePreferenceKey(rawValue);
  if (!key) return 0;
  const identityContent = ensureIdentityContentState(state);
  const counts =
    identityContent?.preferences?.countsByKey?.[bucket] &&
    typeof identityContent.preferences.countsByKey[bucket] === "object"
      ? identityContent.preferences.countsByKey[bucket]
      : null;
  if (!counts) return 0;
  counts[key] = Math.max(0, Math.floor(Number(counts[key] || 0))) + 1;
  return counts[key];
}

function getPreferenceSignalCount(state, bucket, rawValue) {
  const key = normalizePreferenceKey(rawValue);
  if (!key) return 0;
  const counts =
    ensureIdentityContentState(state)?.preferences?.countsByKey?.[bucket];
  return Math.max(0, Math.floor(Number(counts?.[key] || 0)));
}

function notePreferenceDiscovery(state, { key, summary, body, now = nowMs() }) {
  const identityContent = ensureIdentityContentState(state);
  if (!identityContent) return false;
  const discoveredAtByKey = identityContent.preferences.discoveredAtByKey;
  const discoveryKey = String(key || "").trim();
  if (!discoveryKey || discoveredAtByKey[discoveryKey]) return false;

  discoveredAtByKey[discoveryKey] = now;
  pushStructuredMemory(state, {
    type: "identity_preference",
    category: "MEMORY",
    moodTag: "PROUD",
    summary,
    body,
    timestamp: now,
    happiness: 2,
  });
  if (!discoveredAtByKey.first_favorite_item) {
    discoveredAtByKey.first_favorite_item = now;
  }
  return true;
}

function updateFavoriteToyPreference(state, toyId, now = nowMs()) {
  const key = normalizePreferenceKey(toyId);
  if (!key) return false;

  const nextCount = incrementPreferenceSignal(state, "toy", key);
  const identityContent = ensureIdentityContentState(state);
  const currentFavorite = normalizePreferenceKey(
    identityContent?.preferences?.favoriteToyId || state?.memory?.favoriteToyId
  );
  const currentFavoriteCount = getPreferenceSignalCount(
    state,
    "toy",
    currentFavorite
  );
  const shouldAdoptFavorite =
    (!currentFavorite && nextCount >= FAVORITE_PREFERENCE_THRESHOLDS.toy) ||
    (currentFavorite &&
      key !== currentFavorite &&
      nextCount >= Math.max(5, currentFavoriteCount + 3));

  if (!shouldAdoptFavorite && currentFavorite !== key) return false;

  identityContent.preferences.favoriteToyId = key;
  state.memory.favoriteToyId = key;

  const toyLabel = getCatalogItemById(key)?.label || key;
  notePreferenceDiscovery(state, {
    key: `favorite_toy:${key}`,
    now,
    summary: `Favorite toy discovered: ${toyLabel}.`,
    body: `Your pup keeps gravitating back to ${toyLabel}. This is starting to look like a real favorite.`,
  });
  return true;
}

function updateFavoriteFoodPreference(state, foodType, now = nowMs()) {
  const key = normalizePreferenceKey(foodType);
  if (!key) return false;

  const nextCount = incrementPreferenceSignal(state, "food", key);
  const identityContent = ensureIdentityContentState(state);
  const currentFavorite = normalizePreferenceKey(
    identityContent?.preferences?.favoriteFoodType
  );
  const currentFavoriteCount = getPreferenceSignalCount(
    state,
    "food",
    currentFavorite
  );
  const shouldAdoptFavorite =
    (!currentFavorite && nextCount >= FAVORITE_PREFERENCE_THRESHOLDS.food) ||
    (currentFavorite &&
      key !== currentFavorite &&
      nextCount >= Math.max(4, currentFavoriteCount + 2));

  if (!shouldAdoptFavorite && currentFavorite !== key) return false;

  identityContent.preferences.favoriteFoodType = key;
  const foodLabel = getIdentityFavoriteFoodLabel(key) || key;
  notePreferenceDiscovery(state, {
    key: `favorite_food:${key}`,
    now,
    summary: `Favorite food discovered: ${foodLabel}.`,
    body: `Your pup has started reacting especially well to ${foodLabel}. That preference feels consistent now.`,
  });
  return true;
}

function updateFavoriteNapSpotPreference(state, napSpotId, now = nowMs()) {
  const key = normalizePreferenceKey(napSpotId);
  if (!key) return false;

  const nextCount = incrementPreferenceSignal(state, "nap", key);
  const identityContent = ensureIdentityContentState(state);
  const currentFavorite = normalizePreferenceKey(
    identityContent?.preferences?.favoriteNapSpotId
  );
  const currentFavoriteCount = getPreferenceSignalCount(
    state,
    "nap",
    currentFavorite
  );
  const shouldAdoptFavorite =
    (!currentFavorite && nextCount >= FAVORITE_PREFERENCE_THRESHOLDS.nap) ||
    (currentFavorite &&
      key !== currentFavorite &&
      nextCount >= Math.max(4, currentFavoriteCount + 2));

  if (!shouldAdoptFavorite && currentFavorite !== key) return false;

  identityContent.preferences.favoriteNapSpotId = key;
  const napSpotLabel = getIdentityNapSpotLabel(key) || "favorite nap spot";
  notePreferenceDiscovery(state, {
    key: `favorite_nap:${key}`,
    now,
    summary: `Favorite nap spot discovered: ${napSpotLabel}.`,
    body: `Your pup keeps settling in the same place to rest. ${napSpotLabel} looks like the preferred nap spot.`,
  });
  return true;
}

function refreshDailyIdentityFlavor(state, now = nowMs()) {
  const identityContent = ensureIdentityContentState(state);
  const adoptedAt = parseAdoptedAt(state?.adoptedAt);
  if (!identityContent || !adoptedAt) {
    return identityContent?.dailyFlavor || { ...DEFAULT_DAILY_IDENTITY_FLAVOR };
  }

  const dayKey = getIsoDate(now);
  if (
    identityContent.dailyFlavor?.dayKey === dayKey &&
    identityContent.dailyFlavor?.title &&
    identityContent.dailyFlavor?.body
  ) {
    return identityContent.dailyFlavor;
  }

  const favoriteToyId =
    identityContent.preferences?.favoriteToyId ||
    state?.memory?.favoriteToyId ||
    null;
  const favoriteToyLabel = favoriteToyId
    ? getCatalogItemById(favoriteToyId)?.label || null
    : null;
  const favoriteFoodLabel = getIdentityFavoriteFoodLabel(
    identityContent.preferences?.favoriteFoodType
  );
  const favoriteNapSpotLabel = getIdentityNapSpotLabel(
    identityContent.preferences?.favoriteNapSpotId
  );
  const nextFlavor = getDailyIdentityFlavor({
    stage: state?.lifeStage?.stage || "PUPPY",
    profileId: state?.identity?.profileId || null,
    moodLabel: state?.emotionCue || null,
    primaryTemperament: state?.temperament?.primary || null,
    personalityProfile:
      state?.personalityProfile && typeof state.personalityProfile === "object"
        ? state.personalityProfile
        : null,
    favoriteToyLabel,
    favoriteFoodLabel,
    favoriteNapSpotLabel,
    dayKey,
  });

  identityContent.dailyFlavor = {
    dayKey,
    title: nextFlavor?.title || DEFAULT_DAILY_IDENTITY_FLAVOR.title,
    body: nextFlavor?.body || DEFAULT_DAILY_IDENTITY_FLAVOR.body,
    tone: nextFlavor?.tone || "calm",
    generatedAt: now,
  };

  return identityContent.dailyFlavor;
}

function normalizeStatsState(state) {
  if (!state.stats || typeof state.stats !== "object") {
    state.stats = { ...DEFAULT_STATS };
    state.stats.health = clampHealthForState(state, state.stats.health);
    return state.stats;
  }
  state.stats = normalizePetStats(state.stats, DEFAULT_STATS);
  state.stats.health = clampHealthForState(state, state.stats.health);
  return state.stats;
}

function getMinimumHealthForState(state) {
  const status = String(state?.lifecycleStatus || "").toUpperCase();
  const activeStatus = status
    ? status === DOG_LIFECYCLE_STATUS.ACTIVE
    : Boolean(state?.adoptedAt);
  return activeStatus && state?.adoptedAt ? 0 : 0;
}

function clampHealthForState(state, value) {
  return clamp(Number(value || 0), getMinimumHealthForState(state), 100);
}

function ensureAnimationState(state) {
  if (!state.animation || typeof state.animation !== "object") {
    state.animation = { ...DEFAULT_ANIMATION_STATE };
    return state.animation;
  }

  const mood = normalizeActionKey(state.animation.mood || "ok") || "ok";
  const desiredAction =
    normalizeActionKey(state.animation.desiredAction) ||
    deriveDesiredActionFromMood(mood);
  const overrideAction = normalizeActionKey(state.animation.overrideAction);
  const facing = state.animation.facing === "left" ? "left" : "right";
  const overrideUntilDone = Boolean(state.animation.overrideUntilDone);

  state.animation = {
    mood,
    desiredAction,
    overrideAction: overrideAction || null,
    overrideUntilDone,
    facing,
  };

  return state.animation;
}

function ensureTemperamentState(state) {
  if (!state.temperament || typeof state.temperament !== "object") {
    state.temperament = { ...initialTemperament };
  }

  Object.keys(initialTemperament).forEach((key) => {
    if (!(key in state.temperament)) {
      state.temperament[key] = initialTemperament[key];
    }
  });

  if (!Array.isArray(state.temperament.traits)) {
    state.temperament.traits = [...initialTemperament.traits];
  }

  const metrics =
    state.temperament.metrics && typeof state.temperament.metrics === "object"
      ? state.temperament.metrics
      : {};

  state.temperament.metrics = {
    totalTaps: Math.max(0, Math.round(Number(metrics.totalTaps || 0))),
    neglectMinutes: Math.max(
      0,
      Math.round(Number(metrics.neglectMinutes || 0))
    ),
    playSessions: Math.max(0, Math.round(Number(metrics.playSessions || 0))),
  };

  const archetype = String(state.temperament.archetype || "")
    .trim()
    .toUpperCase();
  state.temperament.archetype = Object.values(TEMPERAMENT_ARCHETYPE).includes(
    archetype
  )
    ? archetype
    : null;
  if (typeof state.temperament.archetypeDeterminedAt !== "number") {
    state.temperament.archetypeDeterminedAt = null;
  }

  return state.temperament;
}

function isArchetypeTrackingWindowOpen(state, now = nowMs()) {
  const temperament = ensureTemperamentState(state);
  const adoptedAt = Number(temperament.adoptedAt || state.adoptedAt || 0);
  if (!adoptedAt) return false;
  if (temperament.archetypeDeterminedAt || temperament.archetype) return false;
  return now - adoptedAt < ARCHETYPE_REVEAL_WINDOW_HOURS * 60 * 60 * 1000;
}

function trackTemperamentMetric(state, key, amount = 1, now = nowMs()) {
  if (!isArchetypeTrackingWindowOpen(state, now)) return;
  const temperament = ensureTemperamentState(state);
  const delta = Math.max(0, Number(amount || 0));
  if (!delta) return;
  temperament.metrics[key] = Math.max(
    0,
    Math.round(Number(temperament.metrics[key] || 0) + delta)
  );
}

function determineTemperamentArchetype(state, now = nowMs()) {
  const temperament = ensureTemperamentState(state);
  if (temperament.archetype) return temperament.archetype;

  const { totalTaps, neglectMinutes, playSessions } = temperament.metrics;
  let archetype = TEMPERAMENT_ARCHETYPE.MISCHIEVOUS;

  if (playSessions >= 10 && totalTaps >= 24) {
    archetype = TEMPERAMENT_ARCHETYPE.ATHLETE;
  } else if (neglectMinutes >= 180) {
    archetype = TEMPERAMENT_ARCHETYPE.INDEPENDENT;
  } else if (totalTaps >= 36 && neglectMinutes < 90) {
    archetype = TEMPERAMENT_ARCHETYPE.SHADOW;
  }

  temperament.archetype = archetype;
  temperament.archetypeDeterminedAt = now;
  return archetype;
}

function unlockObedienceCommand(state, commandId, now = nowMs(), opts = {}) {
  const id = String(commandId || "").trim();
  if (!id) return false;

  const unlocks = ensureObedienceUnlockState(state);
  const command = getObedienceCommand(id);
  if (!command) return false;

  if (!unlocks.unlockedIds.includes(id)) {
    unlocks.unlockedIds.push(id);
  }
  unlocks.unlockedAtById[id] = now;
  unlocks.lastUnlockedId = id;
  unlocks.lastUnlockedAt = now;
  if (unlocks.unlockableAtById[id]) {
    delete unlocks.unlockableAtById[id];
  }

  if (opts.log !== false) {
    pushJournalEntry(state, {
      type: "TRAINING",
      moodTag: "PROUD",
      summary: `Unlocked ${command.label}.`,
      body:
        opts.body || `New command ready: "${command.label}". Time to practice!`,
      timestamp: now,
    });
  }

  return true;
}

function ensureYardState(state) {
  if (!state.yard || typeof state.yard !== "object") {
    state.yard = {
      environment: YARD_ENVIRONMENT,
      holes: [],
      foodBowl: null,
      chewBoneAvailable: false,
    };
    return state.yard;
  }

  state.yard.environment = YARD_ENVIRONMENT;

  if (!Array.isArray(state.yard.holes)) {
    state.yard.holes = [];
  }

  if (!("foodBowl" in state.yard)) {
    state.yard.foodBowl = null;
  }
  if (typeof state.yard.chewBoneAvailable !== "boolean") {
    state.yard.chewBoneAvailable = false;
  }

  return state.yard;
}

function ensureInventoryState(state) {
  if (!state.inventory || typeof state.inventory !== "object") {
    state.inventory = { ...initialInventory };
    return state.inventory;
  }
  const premium = Number(state.inventory.premiumKibble);
  state.inventory.premiumKibble = Number.isFinite(premium)
    ? Math.max(0, Math.floor(premium))
    : 0;
  const activeToyId = String(state.inventory.activeToyId || "").trim();
  state.inventory.activeToyId = activeToyId || "toy_tennis_ball_basic";
  const chewUntil = Number(state.inventory.chewProtectionUntil);
  state.inventory.chewProtectionUntil = Number.isFinite(chewUntil)
    ? chewUntil
    : null;
  state.inventory.autoBallLauncherOwned = Boolean(
    state.inventory.autoBallLauncherOwned
  );
  state.inventory.robotMouseOwned = Boolean(state.inventory.robotMouseOwned);
  const foundTreasures =
    state.inventory.foundTreasures &&
    typeof state.inventory.foundTreasures === "object"
      ? state.inventory.foundTreasures
      : {};
  state.inventory.foundTreasures = { ...DEFAULT_TREASURE_COUNTS };
  Object.keys(DEFAULT_TREASURE_COUNTS).forEach((id) => {
    const count = Number(foundTreasures[id]);
    state.inventory.foundTreasures[id] = Number.isFinite(count)
      ? Math.max(0, Math.floor(count))
      : 0;
  });
  return state.inventory;
}

function applyFeedEffect(state, payload = {}, opts = {}) {
  const now = payload?.now ?? nowMs();
  normalizeStatsState(state);
  ensureMemoryState(state);
  ensureInventoryState(state);
  const skipDecay = opts?.skipDecay === true;
  if (!skipDecay) {
    applyDecay(state, now);
  }
  wakeForInteraction(state);
  const healthSilo = ensureHealthSiloState(state);
  const rawFoodType = normalizeActionKey(
    payload?.foodType || payload?.food || "regular_kibble"
  );
  const foodType =
    rawFoodType === "kibble" || rawFoodType === "regular"
      ? "regular_kibble"
      : rawFoodType;
  const isHumanFood =
    foodType === "human_food" ||
    foodType === "humanfood" ||
    foodType === "junk_food" ||
    foodType === "junk" ||
    foodType === "junkfood";
  const isPremiumKibble =
    foodType === "premium_kibble" || foodType === "premium";
  const inventory = ensureInventoryState(state);
  const hasPremiumKibble = Number(inventory.premiumKibble || 0) > 0;
  const usePremiumKibble = isPremiumKibble && hasPremiumKibble;
  const premiumCooldownMs = 24 * 60 * 60 * 1000;
  const foodTexture = normalizeActionKey(
    payload?.foodTexture || payload?.texture || (isHumanFood ? "soft" : "hard")
  );

  const hardFoodRequested = !isHumanFood && foodTexture === "hard";

  if (isPremiumKibble) {
    if (!hasPremiumKibble) {
      state.memory.lastSeenAt = now;
      state.lastAction = "feed_premium_empty";
      maybeSampleMood(state, now, "FEED_PREMIUM_EMPTY");
      finalizeDerivedState(state, now);
      return;
    }
    const lastFedAt = Number(state.memory?.lastFedAt || 0);
    const lastFedType = String(state.memory?.lastFedFoodType || "");
    if (
      lastFedAt &&
      lastFedType === "premium_kibble" &&
      now - lastFedAt < premiumCooldownMs
    ) {
      state.memory.lastSeenAt = now;
      state.lastAction = "feed_premium_cooldown";
      maybeSampleMood(state, now, "FEED_PREMIUM_COOLDOWN");
      finalizeDerivedState(state, now);
      return;
    }
  }

  if (
    hardFoodRequested &&
    healthSilo.dentalHealth <= DENTAL_HARD_FOOD_REJECT_AT
  ) {
    const rejectChance = clamp01(
      0.15 +
        ((DENTAL_HARD_FOOD_REJECT_AT - healthSilo.dentalHealth) /
          DENTAL_HARD_FOOD_REJECT_AT) *
          0.75
    );
    if (Math.random() <= rejectChance) {
      state.stats.happiness = clamp(state.stats.happiness - 1, 0, 100);
      state.memory.lastSeenAt = now;
      state.lastAction = "feed_rejected_hard";
      maybeSampleMood(state, now, "FEED_REJECTED");
      finalizeDerivedState(state, now);
      return;
    }
  }

  const careerMultiplier = state.career.perks?.happinessGainMultiplier || 1.0;
  const perks = getPersonalityPerks(state);
  const dentalMultiplier =
    healthSilo.dentalHealth <= 25
      ? 0.5
      : healthSilo.dentalHealth <= 45
        ? 0.72
        : healthSilo.dentalHealth <= 65
          ? 0.88
          : 1;
  const effectiveFoodType =
    foodType === "premium_kibble" && !usePremiumKibble
      ? "regular_kibble"
      : foodType;
  const isRegularKibbleFeed = effectiveFoodType === "regular_kibble";
  if (isRegularKibbleFeed && Math.random() <= 0.1) {
    state.stats.happiness = clamp(state.stats.happiness - 1, 0, 100);
    state.memory.lastSeenAt = now;
    state.lastAction = resolveActionOverride(payload, "sniff_kibble_reject");
    applyFsmAction(state, "feed", now);
    maybeSampleMood(state, now, "FEED_SNIFF_REJECT");
    finalizeDerivedState(state, now);
    return;
  }
  const baseAmount =
    payload?.amount ?? (effectiveFoodType === "regular_kibble" ? 50 : 100);
  const adjustedAmount = Number(baseAmount) * dentalMultiplier;
  const hungerBefore = Number(state.stats.hunger || 0);
  const nextStats = calculateFeedStats({
    stats: state.stats,
    amount: adjustedAmount,
    careerHappinessMultiplier: careerMultiplier,
    feedHappinessBonus: perks.feedHappinessBonus,
  });
  state.stats.hunger = nextStats.hunger;
  state.stats.happiness = nextStats.happiness;
  if (isRegularKibbleFeed && hungerBefore >= 50) {
    // Regular kibble is a half-fill meal: dog will be hungry again around 12h.
    state.stats.hunger = 50;
  }
  if (usePremiumKibble) {
    // Premium kibble is a full-fill meal: tuned for roughly once per 24h.
    state.stats.hunger = 0;
  }

  // Overfeeding trends positive; long hunger trends are handled in decay.
  const fedWhileLowNeed = hungerBefore < 35 ? 1.6 : hungerBefore < 55 ? 1 : 0.5;
  healthSilo.weightStatus = clamp(
    healthSilo.weightStatus + fedWhileLowNeed * (isHumanFood ? 1.35 : 0.85),
    -50,
    50
  );

  let junkBingeTriggered = false;
  if (isHumanFood) {
    const dayKey = getIsoDate(now);
    if (state.memory.junkFoodDayKey !== dayKey) {
      state.memory.junkFoodDayKey = dayKey;
      state.memory.junkFoodCountToday = 0;
    }
    state.memory.junkFoodCountToday = Math.max(
      0,
      Number(state.memory.junkFoodCountToday || 0)
    );
    state.memory.junkFoodCountToday += 1;

    // Gentle per-junk penalty: allows occasional spoiling without harsh punishment.
    state.stats.happiness = clamp(state.stats.happiness + 5, 0, 100);
    state.stats.health = clampHealthForState(state, state.stats.health - 1);

    if (
      state.memory.junkFoodCountToday >= 3 &&
      state.memory.junkFoodBingeDayKey !== dayKey
    ) {
      state.memory.junkFoodBingeDayKey = dayKey;
      state.stats.health = clampHealthForState(state, state.stats.health - 3);
      junkBingeTriggered = true;
    }
  } else if (usePremiumKibble) {
    // Premium kibble gives a larger health recovery bump.
    if (Number(state.stats.health || 0) < 100) {
      state.stats.health = clampHealthForState(
        state,
        Number(state.stats.health || 0) + 5
      );
    }
    state.stats.energy = 100;
    inventory.premiumKibble = Math.max(
      0,
      Number(inventory.premiumKibble || 0) - 1
    );
  } else if (effectiveFoodType === "regular_kibble") {
    if (Number(state.stats.health || 0) < 100) {
      state.stats.health = clampHealthForState(
        state,
        Number(state.stats.health || 0) + 2
      );
    }
  }

  state.memory.lastFedAt = now;
  state.memory.lastFedFoodType = effectiveFoodType;
  state.memory.lastSeenAt = now;
  updateFavoriteFoodPreference(state, effectiveFoodType, now);
  state.lastAction = resolveActionOverride(payload, "feed");
  applyFsmAction(state, "feed", now);

  if (junkBingeTriggered) {
    state.lastAction = "lethargic_lay";
    applyFsmAction(state, "rest", now, { reason: "junk_binge" });
    pushJournalEntry(state, {
      type: "HEALTH",
      moodTag: "RESTLESS",
      summary: "Junk food binge crash",
      body: "Three junk feeds in one day triggered a lethargic crash. Health dropped and your pup needs recovery care.",
      timestamp: now,
    });
  }

  const sweetBondMultiplier = hasTemperamentTag(state, "SWEET") ? 1.25 : 1;
  const hungerRelief = getNeedDelta(hungerBefore, state.stats.hunger);
  const careTimingMultiplier =
    hungerBefore >= 70 ? 1.35 : hungerBefore >= 45 ? 1 : 0.45;
  applyBondGain(state, 0.7 * sweetBondMultiplier * careTimingMultiplier, now);
  gainPottyNeed(state, 25);

  applyPersonalityShift(state, {
    now,
    source: "FEED",
    deltas: { affectionate: 2, social: 1 },
  });

  applyXp(state, 5);
  const guiltyTriggered = maybeTriggerGuiltyPaws(state, now, "feed");
  if (!guiltyTriggered) {
    maybeSampleMood(state, now, isHumanFood ? "FEED_JUNK" : "FEED");
  }

  pushStructuredMemory(state, {
    type: "ate_food",
    category: "CARE",
    moodTag: isHumanFood ? "SPOILED" : usePremiumKibble ? "PROUD" : "CONTENT",
    summary: usePremiumKibble
      ? "Ate a premium meal."
      : isHumanFood
        ? "Snagged a tasty human-food treat."
        : "Ate a bowl of kibble.",
    body: usePremiumKibble
      ? "A full premium meal left your pup satisfied and recharged."
      : isHumanFood
        ? "A special treat made the moment exciting, even if it was a little indulgent."
        : "A solid meal helped settle the hunger meter.",
    timestamp: now,
    happiness: isHumanFood ? 5 : usePremiumKibble ? 4 : 2,
    hunger: Number(state.stats.hunger || 0),
  });

  markDailyCareCategory(state, "feed", now);
  setCareResponse(state, {
    key: "feed",
    label: usePremiumKibble
      ? "Premium meal"
      : isHumanFood
        ? "Treat choice"
        : "Meal",
    message: usePremiumKibble
      ? "They settled after a full meal and looked visibly satisfied."
      : isHumanFood
        ? "They loved it, but too much human food will cost health."
        : hungerRelief >= 30
          ? "The bowl mattered. Hunger dropped and their body language softened."
          : "They ate a little, but they were not very hungry yet.",
    tone: isHumanFood ? "amber" : usePremiumKibble ? "emerald" : "amber",
    icon: "food",
    now,
  });

  const date = getIsoDate(now);
  updateStreak(state.streak, date);
  updateTemperamentReveal(state, now);
  finalizeDerivedState(state, now);
}

function maybeConsumeFoodBowl(state, now, opts = {}) {
  const yard = ensureYardState(state);
  const bowl = yard.foodBowl;
  if (!bowl) return false;

  const readyAt = Number(bowl.readyAt || bowl.placedAt || 0);
  if (readyAt && now < readyAt) return false;

  if (state.isAsleep) return false;
  if (isDogFsmLocked(state, now)) return false;

  const hunger = Number(state.stats?.hunger ?? 0);
  const threshold = Number(opts?.hungerThreshold ?? 50);
  if (hunger < threshold) return false;

  applyFeedEffect(
    state,
    { now, action: String(opts?.action || "feed") },
    { skipDecay: true }
  );
  yard.foodBowl = null;
  return true;
}
function getTemperamentTags(state) {
  const t = state?.temperament || {};
  const primary = String(t.primary || "")
    .trim()
    .toUpperCase();
  const secondary = String(t.secondary || "")
    .trim()
    .toUpperCase();
  const tags = new Set();
  if (primary) tags.add(primary);
  if (secondary) tags.add(secondary);
  return tags;
}
function hasTemperamentTag(state, tag) {
  const target = String(tag || "")
    .trim()
    .toUpperCase();
  if (!target) return false;
  if (getTemperamentTags(state).has(target)) return true;
  return (
    String(state?.temperament?.archetype || "")
      .trim()
      .toUpperCase() === target
  );
}
function getTemperamentTraitIntensity(state, traitId) {
  const key = String(traitId || "").trim();
  if (!key) return 0;
  const list = Array.isArray(state?.temperament?.traits)
    ? state.temperament.traits
    : [];
  const found = list.find((t) => t && String(t.id || "") === key);
  return clamp(Number(found?.intensity || 0), 0, 100);
}
function computeMoodlets(state) {
  const stats = state.stats || {};
  const hunger = Number(stats.hunger || 0);
  const thirst = Number(stats.thirst || 0);
  const happiness = Number(stats.happiness || 0);
  const energy = Number(stats.energy || 0);
  const cleanliness = Number(stats.cleanliness || 0);
  const health = Number(stats.health || 0);
  const affection = Number(stats.affection || 0);
  const mentalStimulation = Number(stats.mentalStimulation || 0);
  const neglectStrikes = Number(state.memory?.neglectStrikes || 0);
  const parasiteLoad = Number(state?.healthSilo?.parasiteLoad || 0);
  const jointStiffness = Number(state?.healthSilo?.jointStiffness || 0);
  const pottyLevel = Number(state.pottyLevel || 0);
  const moodlets = [];

  const add = (type, intensity, source) => {
    moodlets.push({
      type,
      intensity,
      source: source || null,
    });
  };

  if (hunger >= 65) {
    add("hungry", hunger >= 90 ? 3 : hunger >= 80 ? 2 : 1, "Hunger");
  }
  if (thirst >= 65) {
    add("thirsty", thirst >= 90 ? 3 : thirst >= 80 ? 2 : 1, "Thirst");
  }
  if (pottyLevel >= 75) {
    add(
      "potty",
      pottyLevel >= 95 ? 3 : pottyLevel >= 88 ? 2 : 1,
      "Needs a bathroom break"
    );
  }
  if (energy <= 35) {
    add("tired", energy <= 15 ? 3 : energy <= 25 ? 2 : 1, "Low energy");
  }
  if (cleanliness <= 40) {
    add(
      "dirty",
      cleanliness <= 15 ? 3 : cleanliness <= 25 ? 2 : 1,
      "Messed up fur"
    );
  }
  if (health <= 35) {
    add("sick", health <= 15 ? 3 : health <= 25 ? 2 : 1, "Needs care");
  }
  if (affection <= 40) {
    add(
      "lonely",
      affection <= 15 ? 3 : affection <= 25 ? 2 : 1,
      "Needs cuddles"
    );
  }
  if (mentalStimulation <= 40) {
    add(
      "bored",
      mentalStimulation <= 15 ? 3 : mentalStimulation <= 25 ? 2 : 1,
      "Needs a job to do"
    );
  }
  if (happiness >= 75) {
    add("happy", happiness >= 90 ? 2 : 1, "Good vibes");
  }
  if (neglectStrikes > 0) {
    const strikes = Math.min(3, Math.max(1, neglectStrikes));
    add("lonely", strikes, "Time apart");
  }
  if (state.lastAction === "trainFailed") {
    add("stubborn", 1, "Training");
  }
  if (jointStiffness >= 70) {
    add("sore", jointStiffness >= 85 ? 2 : 1, "Joints");
  }
  if (Number(state?.healthSilo?.dentalHealth || 100) <= 35) {
    add("dental_pain", 1, "Teeth");
  }
  if (state.cleanlinessTier === "FLEAS" || parasiteLoad >= 70) {
    add("itchy", 2, "Fleas");
  }
  if (state.cleanlinessTier === "MANGE" || parasiteLoad >= 90) {
    add("itchy", 3, "Mange");
  }
  if (
    happiness <= 35 &&
    [
      hunger >= 70,
      thirst >= 70,
      pottyLevel >= 75,
      affection <= 35,
      mentalStimulation <= 35,
    ].filter(Boolean).length >= 2
  ) {
    add("uneasy", happiness <= 20 ? 3 : 2, "Overloaded needs");
  }

  return moodlets;
}

function deriveEmotionCue(state) {
  const stats = state.stats || {};
  const hunger = Number(stats.hunger || 0);
  const thirst = Number(stats.thirst || 0);
  const happiness = Number(stats.happiness || 0);
  const energy = Number(stats.energy || 0);
  const cleanliness = Number(stats.cleanliness || 0);
  const health = Number(stats.health || 0);
  const affection = Number(stats.affection || 0);
  const mentalStimulation = Number(stats.mentalStimulation || 0);
  const pottyLevel = Number(state.pottyLevel || 0);
<<<<<<< HEAD
=======
  const pottyPhase = String(state?.potty?.sequence?.phase || "").toLowerCase();
>>>>>>> 10f88903 (chore: remove committed backup folders)
  const neglectStrikes = Number(state.memory?.neglectStrikes || 0);
  const parasiteLoad = Number(state?.healthSilo?.parasiteLoad || 0);
  const jointStiffness = Number(state?.healthSilo?.jointStiffness || 0);
  const overloadedNeedCount = [
    hunger >= 75,
    thirst >= 75,
    pottyLevel >= 80,
    energy <= 30,
    cleanliness <= 30,
    affection <= 30,
    mentalStimulation <= 30,
  ].filter(Boolean).length;

  if (state.lastAction === "trainFailed") return "stubborn";
  if (health <= 18) return "sick";
  if (jointStiffness >= 85) return "sore";
  if (energy <= 12) return "sleepy";
<<<<<<< HEAD
  if (pottyLevel >= 92) return "potty";
=======
  if (
    pottyPhase === POTTY_SEQUENCE.CUED ||
    pottyPhase === POTTY_SEQUENCE.ANXIOUS_SNIFFING ||
    pottyLevel >= 92
  )
    return "potty";
>>>>>>> 10f88903 (chore: remove committed backup folders)
  if (thirst >= 88) return "thirsty";
  if (hunger >= 88) return "hungry";
  if (energy <= 20) return "sleepy";
  if (
    state.cleanlinessTier === "MANGE" ||
    state.cleanlinessTier === "FLEAS" ||
    parasiteLoad >= 75
  )
    return "itchy";
  if (cleanliness <= 18) return "dirty";
  if (affection <= 18 || (neglectStrikes >= 2 && happiness < 55))
    return "lonely";
  if (mentalStimulation <= 18) return "bored";
  if (overloadedNeedCount >= 3 && happiness < 45) return "uneasy";
  if (happiness >= 85) return "happy";
  if (happiness >= 68 && overloadedNeedCount <= 1) return "content";
  if (overloadedNeedCount >= 2) return "restless";
  return null;
}

function restoreAffectionAndTrust(state, amount = 0) {
  const delta = Math.max(0, Number(amount || 0));
  if (!delta) return;
  state.stats.affection = clamp(
    Number(state.stats.affection || 0) + delta,
    0,
    100
  );
}

function relieveNeglectWithCare(state, amount = 1) {
  const memory = ensureMemoryState(state);
  const current = Math.max(0, Math.floor(Number(memory.neglectStrikes || 0)));
  const delta = Math.max(0, Math.floor(Number(amount || 0)));
  if (!current || !delta) return false;
  memory.neglectStrikes = Math.max(0, current - delta);
  return memory.neglectStrikes !== current;
}
const getDaysBetween = (fromMs, toMs) => {
  if (!fromMs) return Infinity;
  return (toMs - fromMs) / (1000 * 60 * 60 * 24);
};
const POTTY_TRAINING_GOAL = 10;
const REAL_DAY_MS = 24 * 60 * 60 * 1000;
const RUNAWAY_LOCKOUT_MS = RUNAWAY_LOCKOUT_HOURS * 60 * 60 * 1000;
const POTTY_TRAINED_POTTY_GAIN_MULTIPLIER = 0.65;
const POTTY_SEQUENCE = Object.freeze({
  NONE: "none",
  RISING: "rising",
  SNIFFING: "sniffing",
  ANXIOUS_SNIFFING: "anxious_sniffing",
  CUED: "cued",
  MISSED: "missed",
  RELIEVED: "relieved",
});
const CLEANLINESS_THRESHOLDS = {
  FRESH: 70,
  DIRTY: 40,
  FLEAS: 20,
};
const LIFECYCLE_STAGE_MODIFIERS = {
  [LIFE_STAGES.PUPPY]: {
    hunger: 1.15,
    thirst: 1.1,
    happiness: 1.0,
    energy: 1.0,
    cleanliness: 1.1,
    health: 1.0,
  },
  [LIFE_STAGES.ADULT]: {
    hunger: 1.0,
    thirst: 1.0,
    happiness: 1.0,
    energy: 1.0,
    cleanliness: 1.0,
    health: 1.0,
  },
  [LIFE_STAGES.SENIOR]: {
    hunger: 0.9,
    thirst: 1.05,
    happiness: 0.9,
    energy: 1.1,
    cleanliness: 1.0,
    health: 1.1,
  },
};

const DEFAULT_LIFE_STAGE = {
  stage: LIFE_STAGES.PUPPY,
  label: "Puppy",
  days: 0,
};

const DEFAULT_STATS = Object.freeze({
  hunger: 50,
  thirst: 40,
  happiness: 60,
  energy: 60,
  cleanliness: 60,
  health: 80,
  affection: 60,
  mentalStimulation: 60,
});
const DOG_POLL_CONFIG = {
  intervalMs: 8 * 60 * 1000,
  timeoutMs: 60 * 1000,
  prompts: [
    {
      id: "water",
      prompt: "Can we swap my water for something fresh?",
      effects: { happiness: 4, cleanliness: 1, thirst: -25 },
    },
    {
      id: "toy",
      prompt: "Can we play with my favorite toy for a bit?",
      effects: { happiness: 8, energy: -6, mentalStimulation: 15 },
    },
    {
      id: "rest",
      prompt: "I’m kinda wiped… can we chill for a bit?",
      effects: { energy: 10, happiness: 2, affection: 5 },
    },
    {
      id: "cuddle",
      prompt: "Can I sit on your lap while you do that?",
      effects: { affection: 25, energy: 2 },
    },
    {
      id: "squirrel",
      prompt: "I saw a squirrel! Can I go patrol the yard?",
      effects: {
        energy: -15,
        mentalStimulation: 20,
        cleanliness: -10,
        happiness: 10,
      },
    },
    {
      id: "bored",
      prompt: "I learned a new trick in my head. Want to see?",
      effects: { mentalStimulation: 30, energy: -5 },
    },
    {
      id: "mud",
      prompt: "I found a REALLY good smell in the dirt. Can I roll in it?",
      effects: { happiness: 15, cleanliness: -40, affection: -5 },
    },
  ],
};
const initialTemperament = {
  primary: "SPICY",
  secondary: "SWEET",
  traits: [
    { id: "clingy", label: "Clingy", intensity: 70 },
    { id: "toyObsessed", label: "Toy-Obsessed", intensity: 60 },
    { id: "foodMotivated", label: "Food-Motivated", intensity: 55 },
  ],
  revealedAt: null,
  revealReady: false,
  adoptedAt: null,
  lastEvaluatedAt: null,
  archetype: null,
  archetypeDeterminedAt: null,
  metrics: {
    totalTaps: 0,
    neglectMinutes: 0,
    playSessions: 0,
  },
};
const initialPersonality = {
  traits: {
    adventurous: 0,
    social: 0,
    energetic: 0,
    playful: 0,
    affectionate: 0,
  },
  history: [],
  lastUpdatedAt: null,
};
const initialHealthSilo = {
  dentalHealth: 100, // 0-100
  jointStiffness: 0, // 0-100
  weightStatus: 0, // -50..+50
  coatCondition: 100, // 0-100
  parasiteLoad: 0, // 0-100, drives flea risk
};
const initialMemory = {
  favoriteToyId: null,
  lastFedAt: null,
  lastDrankAt: null,
  lastPlayedAt: null,
  lastAmbientWanderAt: null,
  lastBathedAt: null,
  lastTrainedAt: null,
  lastTrainedCommandId: null,
  lastSeenAt: null,
  neglectStrikes: 0,
  lastChewingIncidentAt: null,
  junkFoodDayKey: null,
  junkFoodCountToday: 0,
  junkFoodBingeDayKey: null,
  lastFedFoodType: null,
  lastZoomiesAt: null,
  lastDreamWoofAt: null,
  lastGuiltyPawsAt: null,
  lastTrainingReaction: null,
  lastMasteredCommandId: null,
  lastMasteredCommandAt: null,
  lastTreasureHuntAt: null,
  lastTreasureFoundAt: null,
  lastTreasureFoundId: null,
  runawayEndTimestamp: null,
  lastRunawayTriggeredAt: null,
  dailyCareLoop: {
    dayKey: null,
    categories: [],
    completedAt: null,
  },
  commandBuffer: [],
};

const TREASURE_REWARD_CATALOG = Object.freeze({
  rusty_key: {
    id: "rusty_key",
    name: "Rusty Key",
    icon: "🔑",
    coinBonus: 18,
  },
  old_bone: {
    id: "old_bone",
    name: "Fossilized Bone",
    icon: "🦴",
    coinBonus: 12,
  },
  tennis_ball: {
    id: "tennis_ball",
    name: "Muddy Tennis Ball",
    icon: "🎾",
    coinBonus: 8,
  },
});

const DEFAULT_TREASURE_COUNTS = Object.freeze(
  Object.keys(TREASURE_REWARD_CATALOG).reduce((acc, id) => {
    acc[id] = 0;
    return acc;
  }, {})
);

const initialInventory = {
  premiumKibble: 0,
  activeToyId: "toy_tennis_ball_basic",
  chewProtectionUntil: null,
  autoBallLauncherOwned: false,
  robotMouseOwned: false,
  foundTreasures: { ...DEFAULT_TREASURE_COUNTS },
};

const initialCareer = {
  lifestyle: null,
  chosenAt: null,
  perks: {
    hungerDecayMultiplier: 1.0,
    happinessGainMultiplier: 1.0,
    trainingXpMultiplier: 1.0,
  },
};

const initialSkills = {
  obedience: {
    sit: { level: 0, xp: 0 },
    sitPretty: { level: 0, xp: 0 },
    rollOver: { level: 0, xp: 0 },
    speak: { level: 0, xp: 0 },
    shake: { level: 0, xp: 0 },
    spin: { level: 0, xp: 0 },
    crawl: { level: 0, xp: 0 },
    playDead: { level: 0, xp: 0 },
    backflip: { level: 0, xp: 0 },
  },
};

const initialMood = {
  lastSampleAt: null,
  history: [],
};

const initialDreams = {
  active: null,
  journal: [],
  lastGeneratedAt: null,
};

const initialJournal = {
  entries: [],
};

const initialSimulationMemories = [];

const initialStreak = {
  currentStreakDays: 0,
  bestStreakDays: 0,
  lastActiveDate: null,
};

const initialSurprise = {
  active: null,
  lastSpawnedAt: null,
  lastResolvedAt: null,
};

const initialBond = {
  value: 0,
  updatedAt: null,
};

const initialMemorial = {
  active: false,
  startedAt: null,
  completedAt: null,
};

const initialDanger = {
  score: 0,
  tier: DANGER_TIER.SAFE,
  lastRunawayLetterAt: null,
  rescuedAt: null,
  rescueReason: null,
};

const initialLegacyJourney = {
  farewellLetterAt: null,
  rainbowBridgeReadyAt: null,
  ghostDogUnlocked: false,
  ghostPlayBowPending: false,
  ghostPlayBowAt: null,
  favoriteToyId: null,
  generationalWisdomPct: 0,
  spiritSyncRate: 0,
  ghostMimicAction: null,
  ghostMimicAt: null,
  ghostMimicMatch: false,
  ghostLastCheckedAction: null,
  lastFavoriteToyBonusAt: null,
  previousDogs: [],
};

const initialCosmetics = {
  unlockedIds: ["collar_plain_red", "toy_tennis_ball_basic"],
  equipped: {
    collar: "collar_plain_red",
    tag: null,
    backdrop: null,
  },
};

const initialSkillTree = {
  unlockedIds: [],
  lastUnlockedId: null,
  lastUnlockedAt: null,
  lastBranchId: null,
};

const initialIdentityContent = {
  dailyFlavor: { ...DEFAULT_DAILY_IDENTITY_FLAVOR },
  preferences: {
    favoriteToyId: null,
    favoriteFoodType: null,
    favoriteNapSpotId: null,
    discoveredAtByKey: {},
    countsByKey: {
      toy: {},
      food: {},
      nap: {},
    },
  },
  milestoneCards: {
    lastShownId: null,
    queue: [],
    seenIds: [],
  },
};

function createInitialIdentityContentState() {
  return {
    dailyFlavor: { ...DEFAULT_DAILY_IDENTITY_FLAVOR },
    preferences: {
      favoriteToyId: null,
      favoriteFoodType: null,
      favoriteNapSpotId: null,
      discoveredAtByKey: {},
      countsByKey: {
        toy: {},
        food: {},
        nap: {},
      },
    },
    milestoneCards: {
      lastShownId: null,
      queue: [],
      seenIds: [],
    },
  };
}

const initialMilestones = {
  pending: null,
  lastCelebratedStage: null,
  lastCelebratedAt: null,
};

const DEFAULT_COSMETIC_CATALOG = Object.freeze([
  {
    id: "toy_tennis_ball_basic",
    slot: "toy",
    category: "toys",
    threshold: 0,
    label: "Old Tennis Ball",
    price: 0,
    currency: "coins",
    starter: true,
  },
  {
    id: "toy_squeaky_squirrel",
    slot: "toy",
    category: "toys",
    threshold: 2,
    label: "Squeaky Squirrel",
    price: 50,
    currency: "coins",
  },
  {
    id: "toy_squeaky_catfish",
    slot: "toy",
    category: "toys",
    threshold: 3,
    label: "Squeaky Catfish",
    price: 50,
    currency: "coins",
  },
  {
    id: "toy_tug_rope",
    slot: "toy",
    category: "toys",
    threshold: 4,
    label: "Tug-o-War Rope",
    price: 150,
    currency: "coins",
  },
  {
    id: "toy_heavy_frisbee",
    slot: "toy",
    category: "toys",
    threshold: 6,
    label: "Heavy Duty Frisbee",
    price: 300,
    currency: "coins",
  },
  {
    id: "toy_indestructible_bone",
    slot: "consumable",
    category: "care",
    threshold: 0,
    label: "Indestructible Bone",
    price: 0,
    repeatable: true,
    iap: "$0.99",
  },
  {
    id: "toy_plush_squeaky_fox",
    slot: "toy",
    category: "toys",
    threshold: 0,
    label: "Plush Squeaky Fox",
    price: 0,
    iap: "$1.99",
  },
  {
    id: "toy_rc_robot_mouse",
    slot: "toy",
    category: "toys",
    threshold: 0,
    label: "RC Robot Mouse",
    price: 0,
    iap: "$2.99",
  },
  {
    id: "collar_plain_red",
    slot: "collar",
    category: "apparel",
    threshold: 0,
    label: "Plain Red Collar",
    price: 0,
    starter: true,
  },
  {
    id: "collar_leaf",
    slot: "collar",
    category: "apparel",
    threshold: 3,
    label: "Leaf Collar",
  },
  {
    id: "collar_neon",
    slot: "collar",
    category: "apparel",
    threshold: 7,
    label: "Neon Collar",
  },
  {
    id: "collar_midnight",
    slot: "collar",
    category: "apparel",
    threshold: 9,
    label: "Midnight Collar",
    price: 260,
    currency: "coins",
  },
  {
    id: "collar_sunflare",
    slot: "collar",
    category: "apparel",
    threshold: 12,
    label: "Sunflare Collar",
    price: 360,
    currency: "coins",
  },
  {
    id: "collar_mosswood",
    slot: "collar",
    category: "apparel",
    threshold: 8,
    label: "Mosswood Collar",
    price: 230,
    currency: "coins",
  },
  {
    id: "collar_winter_frost",
    slot: "collar",
    category: "apparel",
    threshold: 16,
    label: "Winter Frost Collar",
    price: 410,
    currency: "coins",
    seasonal: "winter",
  },
  {
    id: "beta_collar_2026",
    slot: "collar",
    category: "apparel",
    threshold: 0,
    label: "Beta Blue Collar",
    founderOnly: true,
  },
  {
    id: "tag_star",
    slot: "tag",
    category: "apparel",
    threshold: 10,
    label: "Star Tag",
  },
  {
    id: "tag_heart",
    slot: "tag",
    category: "apparel",
    threshold: 6,
    label: "Heart Tag",
    price: 140,
    currency: "coins",
  },
  {
    id: "tag_bolt",
    slot: "tag",
    category: "apparel",
    threshold: 11,
    label: "Bolt Tag",
    price: 220,
    currency: "coins",
  },
  {
    id: "tag_harvest_leaf",
    slot: "tag",
    category: "apparel",
    threshold: 13,
    label: "Harvest Leaf Tag",
    price: 260,
    currency: "coins",
    seasonal: "autumn",
  },
  {
    id: "backdrop_sunset",
    slot: "backdrop",
    category: "apparel",
    threshold: 14,
    label: "Sunset Backdrop",
  },
  {
    id: "backdrop_meadow_morning",
    slot: "backdrop",
    category: "apparel",
    threshold: 9,
    label: "Meadow Morning Theme",
    price: 260,
    currency: "coins",
  },
  {
    id: "backdrop_moonlit_garden",
    slot: "backdrop",
    category: "apparel",
    threshold: 17,
    label: "Moonlit Garden Theme",
    price: 440,
    currency: "coins",
    seasonal: "night",
  },
  {
    id: "care_oatmeal_shampoo",
    slot: "consumable",
    category: "care",
    threshold: 4,
    label: "Oatmeal Shampoo",
    price: 120,
  },
  {
    id: "care_dental_chew",
    slot: "consumable",
    category: "care",
    threshold: 6,
    label: "Dental Chew",
    price: 90,
  },
  {
    id: "care_premium_kibble_pack_small",
    slot: "consumable",
    category: "care",
    threshold: 0,
    label: "Premium Diet Pack x5",
    price: 0,
    iap: "$0.99",
  },
  {
    id: "care_premium_kibble_pack_large",
    slot: "consumable",
    category: "care",
    threshold: 0,
    label: "Premium Diet Pack x15",
    price: 0,
    iap: "$1.99",
  },
  {
    id: "yard_digging_sandbox",
    slot: "yard_upgrade",
    category: "yard",
    threshold: 12,
    label: "Digging Sandbox",
    price: 320,
  },
  {
    id: "yard_fancy_doghouse",
    slot: "yard_upgrade",
    category: "yard",
    threshold: 15,
    label: "Fancy Doghouse",
    price: 420,
  },
  {
    id: "yard_doghouse_cottage",
    slot: "yard_upgrade",
    category: "yard",
    threshold: 10,
    label: "Cottage Doghouse Style",
    price: 280,
    currency: "coins",
  },
  {
    id: "yard_doghouse_winter_lodge",
    slot: "yard_upgrade",
    category: "yard",
    threshold: 18,
    label: "Winter Lodge Doghouse",
    price: 520,
    currency: "coins",
    seasonal: "winter",
  },
]);

const TOY_PLAY_PROFILES = Object.freeze({
  toy_tennis_ball_basic: {
    baseHappiness: 5,
    boredomRelief: 10,
    extraEnergyCost: 0,
    bondBonus: 0,
  },
  toy_squeaky_squirrel: {
    baseHappiness: 10,
    boredomRelief: 20,
    extraEnergyCost: 0,
    bondBonus: 0,
    preyDriveBonus: 10,
  },
  toy_squeaky_catfish: {
    baseHappiness: 12,
    boredomRelief: 18,
    extraEnergyCost: 2,
    bondBonus: 1,
    preyDriveBonus: 4,
  },
  toy_tug_rope: {
    baseHappiness: 6,
    boredomRelief: 12,
    extraEnergyCost: 5,
    bondBonus: 2,
  },
  toy_heavy_frisbee: {
    baseHappiness: 8,
    boredomRelief: 30,
    extraEnergyCost: 20,
    bondBonus: 0,
  },
  toy_plush_squeaky_fox: {
    baseHappiness: 25,
    boredomRelief: 20,
    extraEnergyCost: 8,
    bondBonus: 2,
    overrideAction: "thrashing",
  },
  toy_rc_robot_mouse: {
    baseHappiness: 10,
    boredomRelief: 25,
    extraEnergyCost: 40,
    bondBonus: 10,
  },
});

function getCatalogItemById(id) {
  const target = String(id || "").trim();
  if (!target) return null;
  return (
    DEFAULT_COSMETIC_CATALOG.find(
      (it) => it && String(it.id || "").trim() === target
    ) || null
  );
}

function createInitialTrainingState() {
  return {
    potty: {
      successCount: 0,
      goal: POTTY_TRAINING_GOAL,
      completedAt: null,
    },
    adult: {
      lastCompletedDate: null,
      streak: 0,
      misses: 0,
      lastPenaltyDate: null,
    },
    obedience: {
      unlockedIds: [],
      unlockableAtById: {},
      unlockedAtById: {},
      lastUnlockedId: null,
      lastUnlockedAt: null,
    },
  };
}

/* ------------------- root initialState ------------------- */

const initialState = {
  name: "Fireball",
  level: 1,
  xp: 0,
  coins: 100,
  gems: 0,
  adoptedAt: null,
  lifeStage: { ...DEFAULT_LIFE_STAGE },

  // Potty gauge + counters
  pottyLevel: 0,
  potty: {
    training: 0, // 0–100: how potty-trained overall (meta)
    lastSuccessAt: null,
    lastAccidentAt: null,
    totalSuccesses: 0,
    totalAccidents: 0,
    ignoredCueCount: 0,
    sequence: {
      phase: POTTY_SEQUENCE.NONE,
      phaseStartedAt: null,
      cueIssuedAt: null,
      cueExpiresAt: null,
      lastMissedAt: null,
      playerRespondedAt: null,
    },
  },

  stats: { ...DEFAULT_STATS },
  moodlets: [],
  emotionCue: null,
  aiState: "idle",
  aiStateUntilAt: null,
  position: {
    x: 300,
    y: 250,
  },
  targetPosition: null,
  speed: 40,
  facing: "right",

  cleanlinessTier: "FRESH",
  poopCount: 0,

  isAsleep: false,
  debug: false,
  lastUpdatedAt: null,

  vacation: { ...DEFAULT_VACATION_STATE },

  // Used by UI renderers/selectors to derive simple animation hints
  lastAction: null,
  lastCareResponse: null,
  yard: {
    environment: YARD_ENVIRONMENT,
    holes: [],
    foodBowl: null,
    chewBoneAvailable: false,
  },
  animation: { ...DEFAULT_ANIMATION_STATE },
  fsm: { ...DOG_FSM_DEFAULT },

  temperament: initialTemperament,
  personality: initialPersonality,
  healthSilo: { ...initialHealthSilo },
  personalityProfile: null,
  memory: initialMemory,
  memories: initialSimulationMemories,
  inventory: { ...initialInventory },
  career: initialCareer,
  skills: initialSkills,
  mood: initialMood,
  dreams: initialDreams,
  journal: initialJournal,
  streak: initialStreak,
  surprise: initialSurprise,
  lastRewardClaimedAt: null,
  lastShareRewardAt: null,
  consecutiveDays: 0,
  claimedPreReg: false,
  claimedPreRegAt: null,
  masterTricks: MASTER_TRICKS.map((trick) => ({ ...trick })),
  training: createInitialTrainingState(),
  lifecycleStatus: DOG_LIFECYCLE_STATUS.NONE,
  danger: { ...initialDanger },
  legacyJourney: { ...initialLegacyJourney },
  identity: { ...DEFAULT_DOG_IDENTITY },
  identityContent: createInitialIdentityContentState(),

  // Relationship / collectibles (used by Store + Rainbow Bridge pages)
  bond: initialBond,
  memorial: initialMemorial,
  cosmetics: initialCosmetics,

  // Skill tree progression (training as a long-term path)
  skillTree: initialSkillTree,

  // Growth milestones (life stage celebrations)
  milestones: initialMilestones,

  polls: {
    active: null,
    lastPromptId: null,
    lastSpawnedAt: null,
    lastResolvedAt: null,
    history: [],
  },
};

/* ------------------- helpers ------------------- */

function pushJournalEntry(state, entry) {
  const journal = ensureJournalState(state);
  const ts = entry.timestamp ?? nowMs();
  const id = `${ts}-${journal.entries.length + 1}`;

  journal.entries.unshift({
    id,
    timestamp: ts,
    type: entry.type || "INFO",
    moodTag: entry.moodTag || null,
    summary: entry.summary || "",
    body: entry.body || "",
  });

  if (journal.entries.length > 200) {
    journal.entries.length = 200;
  }
}

function pushStructuredMemory(state, memory) {
  if (!Array.isArray(state.memories)) {
    state.memories = [];
  }

  state.memories.unshift({
    id: memory.id || `${Date.now()}-${state.memories.length + 1}`,
    type: memory.type || "memory",
    timestamp: Number(memory.timestamp || nowMs()),
    category: memory.category || "MEMORY",
    moodTag: memory.moodTag || null,
    emotion: memory.emotion ? String(memory.emotion) : null,
    sourceMemory: memory.sourceMemory ? String(memory.sourceMemory) : null,
    summary: memory.summary || "",
    body: memory.body || "",
    position:
      memory.position && typeof memory.position === "object"
        ? {
            x: Number(memory.position.x || 0),
            y: Number(memory.position.y || 0),
          }
        : null,
    happiness: Number.isFinite(Number(memory.happiness))
      ? Number(memory.happiness)
      : null,
    hunger: Number.isFinite(Number(memory.hunger))
      ? Number(memory.hunger)
      : null,
    energy: Number.isFinite(Number(memory.energy))
      ? Number(memory.energy)
      : null,
  });

  if (state.memories.length > 500) {
    state.memories.length = 500;
  }

  pushJournalEntry(state, {
    timestamp: memory.timestamp,
    type: memory.category || "MEMORY",
    moodTag: memory.moodTag || null,
    summary: memory.summary || "",
    body: memory.body || "",
  });
}

function setCareResponse(
  state,
  { key, label, message, tone = "emerald", icon = "*", now = nowMs() } = {}
) {
  const safeMessage = String(message || "").trim();
  const safeKey = String(key || "care")
    .trim()
    .toLowerCase();
  if (!safeMessage || !safeKey) return;

  state.lastCareResponse = {
    id: `${safeKey}:${now}`,
    key: safeKey,
    label: String(label || "Care").trim() || "Care",
    message: safeMessage,
    tone:
      String(tone || "emerald")
        .trim()
        .toLowerCase() || "emerald",
    icon: String(icon || "*").trim() || "*",
    createdAt: now,
  };
}

function getNeedDelta(before, after) {
  return Math.max(0, Math.round(Number(before || 0) - Number(after || 0)));
}

function ensureDailyCareLoop(memory) {
  if (!memory.dailyCareLoop || typeof memory.dailyCareLoop !== "object") {
    memory.dailyCareLoop = {
      dayKey: null,
      categories: [],
      completedAt: null,
    };
  }
  memory.dailyCareLoop.categories = Array.isArray(
    memory.dailyCareLoop.categories
  )
    ? memory.dailyCareLoop.categories.map((entry) => String(entry || ""))
    : [];
  memory.dailyCareLoop.dayKey = memory.dailyCareLoop.dayKey
    ? String(memory.dailyCareLoop.dayKey)
    : null;
  memory.dailyCareLoop.completedAt = Number.isFinite(
    Number(memory.dailyCareLoop.completedAt)
  )
    ? Number(memory.dailyCareLoop.completedAt)
    : null;
  return memory.dailyCareLoop;
}

function markDailyCareCategory(state, category, now = nowMs()) {
  const key = String(category || "")
    .trim()
    .toLowerCase();
  if (!key) return;

  const memory = ensureMemoryState(state);
  const loop = ensureDailyCareLoop(memory);
  const dayKey = getIsoDate(now);
  if (loop.dayKey !== dayKey) {
    loop.dayKey = dayKey;
    loop.categories = [];
    loop.completedAt = null;
  }

  if (!loop.categories.includes(key)) {
    loop.categories.push(key);
  }

  const coreDone =
    loop.categories.includes("feed") &&
    loop.categories.includes("water") &&
    loop.categories.includes("potty") &&
    loop.categories.includes("bond");

  if (!coreDone || loop.completedAt) return;

  loop.completedAt = now;
  pushStructuredMemory(state, {
    id: `daily_care_loop:${dayKey}`,
    type: "daily_care_loop",
    category: "MEMORY",
    moodTag: "SECURE",
    summary: "Daily care rhythm completed.",
    body: "Food, water, potty, and connection all happened in one day. That is the loop your dog learns to trust.",
    timestamp: now,
    happiness: Number(state.stats?.happiness || 0),
    energy: Number(state.stats?.energy || 0),
    hunger: Number(state.stats?.hunger || 0),
  });
}

function ensureLifecycleStatus(state) {
  const valid = new Set(Object.values(DOG_LIFECYCLE_STATUS));
  const current = String(state.lifecycleStatus || "").toUpperCase();

  if (!valid.has(current)) {
    state.lifecycleStatus = state.adoptedAt
      ? DOG_LIFECYCLE_STATUS.ACTIVE
      : DOG_LIFECYCLE_STATUS.NONE;
  }

  return state.lifecycleStatus;
}

function ensureJournalState(state) {
  if (!state.journal || typeof state.journal !== "object") {
    state.journal = { entries: [...initialJournal.entries] };
    return state.journal;
  }
  if (Array.isArray(state.journal)) {
    state.journal = { entries: [...state.journal] };
    return state.journal;
  }
  if (!Array.isArray(state.journal.entries)) {
    state.journal.entries = [];
  }
  return state.journal;
}

function reconcileImpossibleFarewellState(state, now = nowMs()) {
  const status = String(state?.lifecycleStatus || "").toUpperCase();
  if (status !== DOG_LIFECYCLE_STATUS.FAREWELL) return;

  const adoptedAt = parseAdoptedAt(state?.adoptedAt);
  if (!adoptedAt) return;

  const age = calculateDogAge(adoptedAt, now);
  if (!age || Number(age.ageInGameDays || 0) >= LONG_LIFE_FAREWELL_AGE_DAYS)
    return;

  const legacy = ensureLegacyJourneyState(state);
  state.lifecycleStatus = DOG_LIFECYCLE_STATUS.ACTIVE;
  legacy.farewellLetterAt = null;
  legacy.rainbowBridgeReadyAt = null;
  legacy.ghostDogUnlocked = false;
  legacy.ghostPlayBowPending = false;
  legacy.ghostPlayBowAt = null;
}

function ensureMemoryState(state) {
  if (!state.memory || typeof state.memory !== "object") {
    state.memory = { ...initialMemory };
    return state.memory;
  }

  Object.keys(initialMemory).forEach((key) => {
    if (!(key in state.memory)) {
      state.memory[key] = initialMemory[key];
    }
  });

  const runawayEndTimestamp = Number(state.memory.runawayEndTimestamp);
  state.memory.runawayEndTimestamp = Number.isFinite(runawayEndTimestamp)
    ? runawayEndTimestamp
    : null;

  const lastRunawayTriggeredAt = Number(state.memory.lastRunawayTriggeredAt);
  state.memory.lastRunawayTriggeredAt = Number.isFinite(lastRunawayTriggeredAt)
    ? lastRunawayTriggeredAt
    : null;

  state.memory.commandBuffer = Array.isArray(state.memory.commandBuffer)
    ? state.memory.commandBuffer
        .map((entry) => ({
          commandId: entry?.commandId ? String(entry.commandId).trim() : null,
          kind: entry?.kind ? String(entry.kind).trim().toLowerCase() : null,
          createdAt: Number.isFinite(Number(entry?.createdAt))
            ? Number(entry.createdAt)
            : null,
        }))
        .filter((entry) => entry.commandId && entry.kind && entry.createdAt)
        .slice(0, 8)
    : [];

  ensureDailyCareLoop(state.memory);

  return state.memory;
}

function getLifecycleWindowFlags(ageDays = 0) {
  const normalizedAgeDays = Math.max(0, Math.floor(Number(ageDays || 0)));
  const isFarewellReady = normalizedAgeDays >= LONG_LIFE_FAREWELL_AGE_DAYS;
  const isFinalStretchImmune =
    normalizedAgeDays >= FINAL_STRETCH_NEGLECT_IMMUNITY_AGE_DAYS &&
    normalizedAgeDays < LONG_LIFE_FAREWELL_AGE_DAYS;

  return {
    ageDays: normalizedAgeDays,
    isFinalStretchImmune,
    isFarewellReady,
    daysUntilFarewell: isFarewellReady
      ? 0
      : LONG_LIFE_FAREWELL_AGE_DAYS - normalizedAgeDays,
  };
}

function getDerivedDogAgeProgress(dogState, now = nowMs()) {
  const adoptedAt = parseAdoptedAt(dogState?.adoptedAt);
  if (!adoptedAt) return null;
  const adjustedNow = getVacationAdjustedNow(dogState || {}, now);
  return getDogAgeProgress(adoptedAt, adjustedNow);
}

function normalizeForcedTrainingReaction(reaction, commandId) {
  if (!reaction || typeof reaction !== "object") return null;

  const kind = String(reaction.kind || "")
    .trim()
    .toLowerCase();
  if (!["obey", "ignore", "reinterpret", "zoomies"].includes(kind)) {
    return null;
  }

  const normalizedCommandId = String(commandId || "").trim();
  if (!normalizedCommandId) return null;

  const performedActionId = reaction.performedActionId
    ? String(reaction.performedActionId).trim()
    : kind === "zoomies"
      ? "zoomies"
      : normalizedCommandId;
  const performedCommandId = reaction.performedCommandId
    ? String(reaction.performedCommandId).trim()
    : kind === "reinterpret"
      ? null
      : normalizedCommandId;
  const reasonId = reaction.reasonId
    ? String(reaction.reasonId).trim().toLowerCase()
    : kind === "zoomies"
      ? "zoomies"
      : kind === "ignore"
        ? "blank_stare"
        : kind === "reinterpret"
          ? "showoff"
          : "focused";

  return {
    kind,
    requestedCommandId: normalizedCommandId,
    performedActionId,
    performedCommandId,
    reasonId,
  };
}

function ensureDangerState(state) {
  if (!state.danger || typeof state.danger !== "object") {
    state.danger = { ...initialDanger };
    return state.danger;
  }
  state.danger.score = clamp(Number(state.danger.score || 0), 0, 100);
  const tier = String(state.danger.tier || "").toUpperCase();
  if (!Object.values(DANGER_TIER).includes(tier)) {
    state.danger.tier = DANGER_TIER.SAFE;
  }
  if (typeof state.danger.lastRunawayLetterAt !== "number") {
    state.danger.lastRunawayLetterAt = null;
  }
  if (typeof state.danger.rescuedAt !== "number") {
    state.danger.rescuedAt = null;
  }
  if (state.danger.rescueReason != null) {
    state.danger.rescueReason = String(state.danger.rescueReason);
  } else {
    state.danger.rescueReason = null;
  }
  return state.danger;
}

function ensureLegacyJourneyState(state) {
  if (!state.legacyJourney || typeof state.legacyJourney !== "object") {
    state.legacyJourney = { ...initialLegacyJourney };
    return state.legacyJourney;
  }
  if (typeof state.legacyJourney.farewellLetterAt !== "number") {
    state.legacyJourney.farewellLetterAt = null;
  }
  if (typeof state.legacyJourney.rainbowBridgeReadyAt !== "number") {
    state.legacyJourney.rainbowBridgeReadyAt = null;
  }
  state.legacyJourney.ghostDogUnlocked = Boolean(
    state.legacyJourney.ghostDogUnlocked
  );
  state.legacyJourney.ghostPlayBowPending = Boolean(
    state.legacyJourney.ghostPlayBowPending
  );
  if (typeof state.legacyJourney.ghostPlayBowAt !== "number") {
    state.legacyJourney.ghostPlayBowAt = null;
  }
  state.legacyJourney.favoriteToyId = state.legacyJourney.favoriteToyId
    ? String(state.legacyJourney.favoriteToyId)
    : null;
  state.legacyJourney.generationalWisdomPct = clamp(
    Number(state.legacyJourney.generationalWisdomPct || 0),
    0,
    100
  );
  state.legacyJourney.spiritSyncRate = clamp(
    Number(state.legacyJourney.spiritSyncRate || 0),
    0,
    100
  );
  state.legacyJourney.ghostMimicAction = state.legacyJourney.ghostMimicAction
    ? String(state.legacyJourney.ghostMimicAction)
    : null;
  if (typeof state.legacyJourney.ghostMimicAt !== "number") {
    state.legacyJourney.ghostMimicAt = null;
  }
  state.legacyJourney.ghostMimicMatch = Boolean(
    state.legacyJourney.ghostMimicMatch
  );
  state.legacyJourney.ghostLastCheckedAction = state.legacyJourney
    .ghostLastCheckedAction
    ? String(state.legacyJourney.ghostLastCheckedAction)
    : null;
  if (typeof state.legacyJourney.lastFavoriteToyBonusAt !== "number") {
    state.legacyJourney.lastFavoriteToyBonusAt = null;
  }
  if (!Array.isArray(state.legacyJourney.previousDogs)) {
    state.legacyJourney.previousDogs = [];
  }
  return state.legacyJourney;
}

function getDangerTier(score) {
  if (score >= 85) return DANGER_TIER.CRITICAL;
  if (score >= 60) return DANGER_TIER.HIGH;
  if (score >= 35) return DANGER_TIER.ELEVATED;
  return DANGER_TIER.SAFE;
}

function computeDangerScore(state) {
  const stats = state.stats || {};
  const hungerNeed = clamp(Number(stats.hunger || 0), 0, 100);
  const thirstNeed = clamp(Number(stats.thirst || 0), 0, 100);
  const energyNeed = 100 - clamp(Number(stats.energy || 0), 0, 100);
  const cleanlinessNeed = 100 - clamp(Number(stats.cleanliness || 0), 0, 100);
  const healthNeed = 100 - clamp(Number(stats.health || 0), 0, 100);
  const happinessNeed = 100 - clamp(Number(stats.happiness || 0), 0, 100);

  const pressure =
    (hungerNeed +
      thirstNeed +
      energyNeed +
      cleanlinessNeed +
      healthNeed +
      happinessNeed) /
    6;

  const neglect = clamp(Number(state.memory?.neglectStrikes || 0) * 9, 0, 32);
  const accidents = clamp(Number(state.potty?.totalAccidents || 0) * 2, 0, 20);
  const ignoredCues = clamp(
    Number(state?.potty?.ignoredCueCount || 0) * 4,
    0,
    20
  );
  const cleanlinessTier = String(state.cleanlinessTier || "").toUpperCase();
  const tierPenalty =
    cleanlinessTier === "MANGE" ? 16 : cleanlinessTier === "FLEAS" ? 8 : 0;
  const profile =
    state?.personalityProfile && typeof state.personalityProfile === "object"
      ? state.personalityProfile
      : null;
  const dynamicState = profile?.dynamicState || profile?.dynamicStates || {};
  const anxiety = clamp(Number(dynamicState?.anxiety || 0), 0, 100);
  const frustration = clamp(Number(dynamicState?.frustration || 0), 0, 100);
  const trustScore = clamp(
    Number(profile?.trust?.score || state?.bond?.value || 0),
    0,
    100
  );
  const welfarePenalty = clamp(
    Math.round(
      Math.max(0, anxiety - 72) * 0.08 +
        Math.max(0, frustration - 78) * 0.08 +
        Math.max(0, 38 - trustScore) * 0.22
    ),
    0,
    18
  );

  return clamp(
    Math.round(
      pressure * 0.56 +
        neglect +
        accidents +
        ignoredCues +
        tierPenalty +
        welfarePenalty
    )
  );
}

function pushDearHoomanRunawayLetter(state, now, score) {
  const danger = ensureDangerState(state);
  const last = Number(danger.lastRunawayLetterAt || 0);
  if (last && now - last < DANGER_RUNAWAY_COOLDOWN_MS) return;

  danger.lastRunawayLetterAt = now;
  pushJournalEntry(state, {
    type: "LETTER",
    moodTag: "RESTLESS",
    summary: "Dear hooman letter",
    body:
      "Dear hooman,\n\nI keep pacing and watching the gate. Things feel rough around here " +
      `(${score}% danger). I don’t want to run, but I need you to notice me.\n\nLove,\n${state.name || "your pup"}`,
    timestamp: now,
  });
}

function recordPreviousDog(state, outcome, now) {
  const legacy = ensureLegacyJourneyState(state);
  legacy.previousDogs.unshift({
    name: state.name || "Pup",
    outcome: String(outcome || "").toUpperCase() || "UNKNOWN",
    bond: Math.round(Number(state.bond?.value || 0)),
    favoriteToyId: state?.memory?.favoriteToyId
      ? String(state.memory.favoriteToyId)
      : null,
    ageDays: Math.round(Number(state.lifeStage?.days || 0)),
    recordedAt: now,
  });
  if (legacy.previousDogs.length > 20) {
    legacy.previousDogs.length = 20;
  }
}

function applyLegacyAdoptionBonuses(state, now) {
  const legacy = ensureLegacyJourneyState(state);
  const previous = Array.isArray(legacy.previousDogs)
    ? legacy.previousDogs[0]
    : null;
  if (!previous) return;

  const priorBond = clamp(Number(previous.bond || 0), 0, 100);
  const favoriteToyId = previous.favoriteToyId
    ? String(previous.favoriteToyId)
    : null;

  legacy.favoriteToyId = favoriteToyId;
  legacy.generationalWisdomPct = clamp(Math.round(priorBond * 0.2), 0, 30);
  legacy.spiritSyncRate = clamp(Math.round(15 + priorBond * 0.5), 0, 100);

  if (favoriteToyId && !state.memory.favoriteToyId) {
    state.memory.favoriteToyId = favoriteToyId;
  }

  const wisdomLevelBonus = Math.floor(legacy.generationalWisdomPct / 8);
  if (wisdomLevelBonus > 0 && state?.skills?.obedience) {
    ["sit", "stay", "come", "heel"].forEach((id) => {
      const current = state.skills.obedience[id];
      if (!current || typeof current !== "object") return;
      current.level = clamp(
        Number(current.level || 0) + wisdomLevelBonus,
        0,
        100
      );
    });
  }

  pushJournalEntry(state, {
    type: "LEGACY",
    moodTag: "PROUD",
    summary: "Legacy instincts inherited",
    body:
      `Generational wisdom +${legacy.generationalWisdomPct}% applied.` +
      (favoriteToyId ? ` Favorite toy remembered: ${favoriteToyId}.` : ""),
    timestamp: now,
  });
}

function syncSpiritMimicState(state, now) {
  const legacy = ensureLegacyJourneyState(state);
  if (
    !legacy.ghostDogUnlocked ||
    ensureLifecycleStatus(state) !== DOG_LIFECYCLE_STATUS.ACTIVE
  ) {
    legacy.ghostMimicMatch = false;
    legacy.ghostMimicAction = null;
    legacy.ghostLastCheckedAction = null;
    legacy.ghostMimicAt = null;
    return;
  }

  const action = normalizeActionKey(state.lastAction || "");
  if (!action || action === legacy.ghostLastCheckedAction) return;

  legacy.ghostLastCheckedAction = action;
  const rate = clamp(Number(legacy.spiritSyncRate || 0), 0, 100);
  const matched = Math.random() * 100 <= rate;
  legacy.ghostMimicMatch = matched;
  legacy.ghostMimicAt = now;
  legacy.ghostMimicAction = matched ? action : null;
}

function triggerAnimalRescueCenter(state, now, score) {
  if (ensureLifecycleStatus(state) !== DOG_LIFECYCLE_STATUS.ACTIVE) return;
  const danger = ensureDangerState(state);
  const health = Number(state?.stats?.health || 0);
  const criticalStarvation = health <= 0;
  const reason = criticalStarvation
    ? "Critical starvation and neglect triggered emergency protective intervention."
    : "Major mistreatment risk detected (critical neglect and unsafe conditions).";

  recordPreviousDog(state, "RESCUED", now);

  danger.rescuedAt = now;
  danger.rescueReason = reason;
  state.lifecycleStatus = DOG_LIFECYCLE_STATUS.RESCUED;
  state.adoptedAt = null;
  state.lastAction = "rescued";
  state.isAsleep = false;

  pushJournalEntry(state, {
    type: "RESCUE",
    moodTag: "URGENT",
    summary: "Animal Rescue Center intervened",
    body: criticalStarvation
      ? "Animal Rescue Center intervened after your pup's health collapsed from sustained neglect. Feed and check in daily to keep the next one safe."
      : "Animal Rescue Center has taken your dog into protective care. " +
        `Danger meter reached ${score}%. Improve care before your next adoption.`,
    timestamp: now,
  });
}

function triggerLongLifeFarewell(state, now) {
  if (ensureLifecycleStatus(state) !== DOG_LIFECYCLE_STATUS.ACTIVE) return;

  const legacy = ensureLegacyJourneyState(state);
  if (legacy.farewellLetterAt) return;

  recordPreviousDog(state, "LONG_LIFE", now);

  legacy.farewellLetterAt = now;
  legacy.rainbowBridgeReadyAt = now;
  legacy.ghostDogUnlocked = true;
  legacy.ghostPlayBowPending = true;

  state.lifecycleStatus = DOG_LIFECYCLE_STATUS.FAREWELL;
  state.adoptedAt = null;
  state.lastAction = "farewell";

  pushJournalEntry(state, {
    type: "LETTER",
    moodTag: "CALM",
    summary: "Farewell letter",
    body:
      "Dear hooman,\n\nWe made it through 180 real days together. Thank you for every walk, toy, nap, and silly little rescue from my own chaos. " +
      "When you're ready, I'll meet you at Rainbow Bridge.\n\nAlways your pup.",
    timestamp: now,
  });
}

function evaluateDangerAndLifecycleEvents(state, now) {
  const status = ensureLifecycleStatus(state);
  const danger = ensureDangerState(state);
  ensureLegacyJourneyState(state);
  if (status !== DOG_LIFECYCLE_STATUS.ACTIVE || !state.adoptedAt) {
    return;
  }

  const ageNow = getVacationAdjustedNow(state, now);
  const derivedAge = calculateDogAge(state.adoptedAt, ageNow);
  const ageDays = Number(
    Number.isFinite(Number(derivedAge?.ageInGameDays))
      ? derivedAge.ageInGameDays
      : state.lifeStage?.days || 0
  );
  // Protective ordering: farewell must always win before any starvation or
  // rescue path, even if stale derived state briefly says the dog is still 179.
  if (ageDays >= LONG_LIFE_FAREWELL_AGE_DAYS) {
    triggerLongLifeFarewell(state, now);
    return;
  }

  const finalStretchImmune =
    ageDays >= FINAL_STRETCH_NEGLECT_IMMUNITY_AGE_DAYS &&
    ageDays < LONG_LIFE_FAREWELL_AGE_DAYS;
  if (finalStretchImmune && Number(state?.stats?.health || 0) <= 0) {
    state.stats.health = Math.max(
      FINAL_STRETCH_NEGLECT_IMMUNITY_HEALTH_FLOOR,
      Number(state.stats.health || 0)
    );
  }

  const score = computeDangerScore(state);
  danger.score = score;
  danger.tier = getDangerTier(score);

  if (score >= DANGER_RUNAWAY_LETTER_THRESHOLD) {
    pushDearHoomanRunawayLetter(state, now, score);
  }

  const neglect = Number(state.memory?.neglectStrikes || 0);
  const criticalHealthFailure = Number(state?.stats?.health || 0) <= 0;
  const majorMistreatment =
    criticalHealthFailure || score >= DANGER_RESCUE_THRESHOLD || neglect >= 8;
  if (finalStretchImmune) {
    return;
  }
  if (majorMistreatment) {
    triggerAnimalRescueCenter(state, now, score);
    return;
  }
}

function ensureDreamState(state) {
  if (!state.dreams || typeof state.dreams !== "object") {
    state.dreams = { ...initialDreams };
  }
  if (!Array.isArray(state.dreams.journal)) {
    state.dreams.journal = [];
  }
  if (!("active" in state.dreams)) state.dreams.active = null;
  if (typeof state.dreams.lastGeneratedAt !== "number") {
    state.dreams.lastGeneratedAt = null;
  }
  return state.dreams;
}

function wakeForInteraction(state) {
  if (!state.isAsleep) return;
  state.isAsleep = false;
  const dreams = ensureDreamState(state);
  dreams.active = null;
}

function ensureSkillTreeState(state) {
  if (!state.skillTree || typeof state.skillTree !== "object") {
    state.skillTree = { ...initialSkillTree };
  }

  if (!Array.isArray(state.skillTree.unlockedIds)) {
    state.skillTree.unlockedIds = [];
  }
  state.skillTree.unlockedIds = state.skillTree.unlockedIds
    .map((x) => String(x))
    .filter(Boolean);

  state.skillTree.lastUnlockedId = state.skillTree.lastUnlockedId
    ? String(state.skillTree.lastUnlockedId)
    : null;

  if (typeof state.skillTree.lastUnlockedAt !== "number") {
    state.skillTree.lastUnlockedAt = null;
  }

  state.skillTree.lastBranchId = state.skillTree.lastBranchId
    ? String(state.skillTree.lastBranchId)
    : null;

  return state.skillTree;
}

function ensureMilestonesState(state) {
  if (!state.milestones || typeof state.milestones !== "object") {
    state.milestones = { ...initialMilestones };
    return state.milestones;
  }

  if (!("pending" in state.milestones)) {
    state.milestones.pending = null;
  }
  if (typeof state.milestones.lastCelebratedStage !== "string") {
    state.milestones.lastCelebratedStage = null;
  }
  if (typeof state.milestones.lastCelebratedAt !== "number") {
    state.milestones.lastCelebratedAt = null;
  }

  return state.milestones;
}

function getSkillTreePointsFromDogState(dogState) {
  const level = Math.max(1, Math.floor(Number(dogState?.level || 1)));
  const unlocked = Array.isArray(dogState?.skillTree?.unlockedIds)
    ? dogState.skillTree.unlockedIds
    : [];
  return computeSkillTreePoints(level, unlocked);
}

function getSkillTreeModifiersFromDogState(dogState) {
  const skillTree = ensureSkillTreeState(dogState);
  return computeSkillTreeModifiers(skillTree.unlockedIds);
}

function pushDream(state, dream) {
  const dreams = ensureDreamState(state);
  dreams.journal.unshift(dream);
  if (dreams.journal.length > 100) dreams.journal.length = 100;
}

function maybeGenerateDream(state, now = nowMs()) {
  const dreams = ensureDreamState(state);
  if (dreams.active) return;

  const last = dreams.lastGeneratedAt;
  // Prevent “spam dreams” if player taps Rest repeatedly.
  if (last && now - last < 2 * 60 * 60 * 1000) return;

  const dream = buildDreamFromState(state, now);
  dreams.active = dream;
  dreams.lastGeneratedAt = now;
  pushDream(state, dream);
  pushStructuredMemory(state, {
    type: "dreamed",
    category: "MEMORY",
    moodTag:
      String(dream?.kind || "").toLowerCase() === "nightmare"
        ? "UNEASY"
        : "DREAMY",
    summary:
      String(dream?.kind || "").toLowerCase() === "nightmare"
        ? "Had a rough dream."
        : "Started dreaming.",
    body:
      dream?.summary ||
      dream?.body ||
      "Sleep turned into another memory-filled dream.",
    timestamp: now,
    happiness: String(dream?.kind || "").toLowerCase() === "nightmare" ? -2 : 2,
  });
}

const isValidStat = (key) =>
  [
    "hunger",
    "thirst",
    "happiness",
    "energy",
    "cleanliness",
    "health",
    "affection",
    "mentalStimulation",
  ].includes(key);

const pos01 = (v) => Math.max(0, Math.min(1, v / 100));
const neg01 = (v) => Math.max(0, Math.min(1, -v / 100));

function ensurePersonalityState(state) {
  if (!state.personality || typeof state.personality !== "object") {
    state.personality = { ...initialPersonality };
  }
  if (
    !state.personality.traits ||
    typeof state.personality.traits !== "object"
  ) {
    state.personality.traits = { ...initialPersonality.traits };
  } else {
    state.personality.traits = {
      ...initialPersonality.traits,
      ...state.personality.traits,
    };
  }
  if (!Array.isArray(state.personality.history)) {
    state.personality.history = [];
  }
  if (typeof state.personality.lastUpdatedAt !== "number") {
    state.personality.lastUpdatedAt = null;
  }
  if ("animationHint" in state.personality) {
    delete state.personality.animationHint;
  }
  return state.personality;
}

function ensureHealthSiloState(state) {
  if (!state.healthSilo || typeof state.healthSilo !== "object") {
    state.healthSilo = { ...initialHealthSilo };
  } else {
    state.healthSilo = {
      ...initialHealthSilo,
      ...state.healthSilo,
    };
  }

  state.healthSilo.dentalHealth = clamp(
    Number(state.healthSilo.dentalHealth || 0),
    0,
    100
  );
  state.healthSilo.jointStiffness = clamp(
    Number(state.healthSilo.jointStiffness || 0),
    0,
    100
  );
  state.healthSilo.weightStatus = clamp(
    Number(state.healthSilo.weightStatus || 0),
    -50,
    50
  );
  state.healthSilo.coatCondition = clamp(
    Number(state.healthSilo.coatCondition || 0),
    0,
    100
  );
  state.healthSilo.parasiteLoad = clamp(
    Number(state.healthSilo.parasiteLoad || 0),
    0,
    100
  );
  return state.healthSilo;
}

function pushPersonalityHistory(state, entry) {
  const personality = ensurePersonalityState(state);
  personality.history.unshift(entry);
  if (personality.history.length > 120) {
    personality.history.length = 120;
  }
}

function applyPersonalityShift(state, opts) {
  const { now, source, deltas, note } = opts || {};
  const personality = ensurePersonalityState(state);
  const drift = applyPersonalityDrift({
    traits: personality.traits,
    deltas: deltas || {},
    traitKeys: Object.keys(initialPersonality.traits),
  });

  if (!drift.changed) return;

  const ts = typeof now === "number" ? now : nowMs();
  personality.traits = drift.nextTraits;
  personality.lastUpdatedAt = ts;

  pushPersonalityHistory(state, {
    id: `${ts}-${personality.history.length + 1}`,
    timestamp: ts,
    source: source || "SYSTEM",
    note: note || null,
    deltas: drift.appliedDeltas,
    snapshot: { ...drift.nextTraits },
  });
}

function getStageMultiplier(state, statKey) {
  const stageKey = state.lifeStage?.stage || DEFAULT_LIFE_STAGE.stage;
  const modifiers =
    LIFECYCLE_STAGE_MODIFIERS[stageKey] ||
    LIFECYCLE_STAGE_MODIFIERS[DEFAULT_LIFE_STAGE.stage] ||
    {};
  return modifiers[statKey] ?? 1;
}

function getStatDecayHoursSinceTimestamp({
  lastUpdatedAt,
  now,
  sourceTimestamp,
  graceHours = 0,
  decayMultiplier = 1,
}) {
  const startAt = Number(lastUpdatedAt);
  const endAt = Number(now);
  if (
    !Number.isFinite(startAt) ||
    !Number.isFinite(endAt) ||
    endAt <= startAt
  ) {
    return 0;
  }

  const sourceAt = Number(sourceTimestamp);
  const activeHoursRaw =
    Number.isFinite(sourceAt) && sourceAt > 0
      ? Math.max(
          0,
          getElapsedHoursAfterGrace(
            sourceAt,
            endAt,
            graceHours,
            MAX_DECAY_HOURS
          ) -
            getElapsedHoursAfterGrace(
              sourceAt,
              startAt,
              graceHours,
              MAX_DECAY_HOURS
            )
        )
      : Math.max(0, (endAt - startAt) / MS_PER_HOUR);
  return Math.min(MAX_DECAY_HOURS, activeHoursRaw) * decayMultiplier;
}

function softenOfflineDecayHours(hours) {
  const total = Math.max(0, Number(hours || 0));
  if (!total) return 0;

  const firstWindow = Math.min(total, 2);
  const workdayWindow = Math.min(Math.max(total - 2, 0), 6) * 0.58;
  const longAbsenceWindow = Math.max(total - 8, 0) * 0.82;

  return firstWindow + workdayWindow + longAbsenceWindow;
}

function createDecayRuleContext(state, now) {
  normalizeStatsState(state);
  ensurePersonalityState(state);
  ensureHealthSiloState(state);

  const lastUpdatedAt = Number(state.lastUpdatedAt);
  if (!Number.isFinite(lastUpdatedAt)) {
    state.lastUpdatedAt = now;
    return null;
  }

  const diffHoursRaw = Math.max(
    0,
    (now - state.lastUpdatedAt) / (1000 * 60 * 60)
  );
  const diffHours = Math.min(MAX_DECAY_HOURS, diffHoursRaw);
  if (diffHours <= 0) return null;

  const vacation = ensureVacationState(state);
  const decayMultiplier = vacation.enabled
    ? clamp(Number(vacation.multiplier) || 1, 0, 1)
    : 1;
  const skillMods = getSkillTreeModifiersFromDogState(state);
  const effectiveHours =
    softenOfflineDecayHours(diffHours * decayMultiplier) *
    Number(skillMods.offlineDecayMultiplier || 1);
  const hungerEffectiveHours = getStatDecayHoursSinceTimestamp({
    lastUpdatedAt,
    now,
    sourceTimestamp: state.memory?.lastFedAt,
    graceHours: HUNGER_FULLNESS_BUFFER_HOURS,
    decayMultiplier,
  });
  const effectiveHungerHours =
    softenOfflineDecayHours(hungerEffectiveHours) *
    Number(skillMods.offlineDecayMultiplier || 1);
  const starvationPenaltyHours = getStatDecayHoursSinceTimestamp({
    lastUpdatedAt,
    now,
    sourceTimestamp: state.memory?.lastFedAt,
    graceHours: STARVATION_HEALTH_GRACE_HOURS,
    decayMultiplier,
  });

  const careerHungerMultiplier =
    state.career.perks?.hungerDecayMultiplier || 1.0;
  const profile =
    state?.personalityProfile && typeof state.personalityProfile === "object"
      ? state.personalityProfile
      : derivePersonalityProfile(state);
  const instinctEngine =
    profile?.instinctEngine && typeof profile.instinctEngine === "object"
      ? profile.instinctEngine
      : {};
  const separationAnxiety = clamp(
    Number(instinctEngine.separationAnxiety || 0),
    0,
    100
  );
  const trainabilitySpeed = clamp(
    Number(instinctEngine.trainabilitySpeed || 1),
    0.6,
    2.2
  );
  const vocalizationThreshold = clamp(
    Number(instinctEngine.vocalizationThreshold || 50),
    0,
    100
  );
  const chewingUrge = clamp(Number(instinctEngine.chewingUrge || 0), 0, 100);

  const sleeping = Boolean(state.isAsleep);
  const idleish = (() => {
    const a = String(state.lastAction || "")
      .trim()
      .toLowerCase();
    return !a || a === "idle";
  })();

  return {
    state,
    now,
    diffHours,
    effectiveHours,
    startingStats: {
      hunger: clamp(Number(state.stats?.hunger || 0), 0, 100),
      cleanliness: clamp(Number(state.stats?.cleanliness || 0), 0, 100),
      health: clamp(Number(state.stats?.health || 0), 0, 100),
    },
    vacation,
    sleeping,
    idleish,
    multipliers: {
      hunger: careerHungerMultiplier * (skillMods.hungerDecayMultiplier || 1),
      thirst: skillMods.thirstDecayMultiplier || 1,
      happiness:
        (skillMods.happinessDecayMultiplier || 1) *
        (hasTemperamentTag(state, "SWEET") ? 0.85 : 1) *
        (1 + separationAnxiety * 0.008),
      cleanliness: skillMods.cleanlinessDecayMultiplier || 1,
      idleEnergy: skillMods.idleEnergyDecayMultiplier || 1,
      potty:
        (skillMods.pottyGainMultiplier || 1) *
        (skillMods.offlinePottyGainMultiplier || 1),
      severeNeglectHealth: skillMods.severeNeglectHealthDecayMultiplier || 1,
    },
    instinctEngine: {
      separationAnxiety,
      trainabilitySpeed,
      vocalizationThreshold,
      chewingUrge,
    },
    stageMultipliers: {},
    effectiveHoursByStat: {
      hunger: effectiveHungerHours,
      starvationHealth: starvationPenaltyHours,
    },
    decayByStat: {},
    energyRecoveryGain: 0,
  };
}

function computeDegradationStage(ctx) {
  Object.keys(ctx.state.stats).forEach((key) => {
    if (!isValidStat(key)) return;
    const stageMultiplier = getStageMultiplier(ctx.state, key);
    ctx.stageMultipliers[key] = stageMultiplier;
    const statHours = Number(
      ctx.effectiveHoursByStat[key] ?? ctx.effectiveHours
    );
    ctx.decayByStat[key] =
      (DECAY_PER_HOUR[key] || 0) * DECAY_SPEED * statHours * stageMultiplier;
  });
}

function applyEnvironmentModifiersStage(ctx) {
  if (!ctx.sleeping) return;
  if (Number.isFinite(ctx.decayByStat.hunger)) {
    ctx.decayByStat.hunger *= SLEEP_NEEDS_MULTIPLIER;
  }
  if (Number.isFinite(ctx.decayByStat.thirst)) {
    ctx.decayByStat.thirst *= SLEEP_NEEDS_MULTIPLIER;
  }
  ctx.energyRecoveryGain =
    SLEEP_RECOVERY_PER_HOUR *
    DECAY_SPEED *
    ctx.effectiveHours *
    Number(ctx.stageMultipliers.energy || 1);
}

function applyCompoundingStage(ctx) {
  if (Number.isFinite(ctx.decayByStat.hunger)) {
    ctx.decayByStat.hunger *= ctx.multipliers.hunger;
  }
  if (Number.isFinite(ctx.decayByStat.thirst)) {
    ctx.decayByStat.thirst *= ctx.multipliers.thirst;
  }
  if (Number.isFinite(ctx.decayByStat.happiness)) {
    ctx.decayByStat.happiness *= ctx.multipliers.happiness;
  }
  if (Number.isFinite(ctx.decayByStat.cleanliness)) {
    ctx.decayByStat.cleanliness *= ctx.multipliers.cleanliness;
  }
  if (!ctx.sleeping && ctx.idleish && Number.isFinite(ctx.decayByStat.energy)) {
    ctx.decayByStat.energy *= ctx.multipliers.idleEnergy;
  }

  const inventory = ensureInventoryState(ctx.state);
  const unlocked = new Set(
    Array.isArray(ctx.state?.cosmetics?.unlockedIds)
      ? ctx.state.cosmetics.unlockedIds
      : []
  );
  const hasPassiveToySupport =
    inventory.autoBallLauncherOwned ||
    inventory.robotMouseOwned ||
    unlocked.has("toy_rc_robot_mouse");
  if (hasPassiveToySupport) {
    if (Number.isFinite(ctx.decayByStat.happiness)) {
      ctx.decayByStat.happiness *= 0.55;
    }
    if (Number.isFinite(ctx.decayByStat.mentalStimulation)) {
      ctx.decayByStat.mentalStimulation *= 0.45;
    }
  }
}

function getSevereNeglectHours(ctx) {
  const totalHours = Math.max(0, Number(ctx?.effectiveHours || 0));
  if (!totalHours) return 0;

  const startCleanliness = clamp(
    Number(ctx?.startingStats?.cleanliness || 0),
    0,
    100
  );
  const startHunger = clamp(Number(ctx?.startingStats?.hunger || 0), 0, 100);

  const cleanlinessRatePerHour = Math.max(
    0,
    Number(ctx?.decayByStat?.cleanliness || 0) / totalHours
  );
  const hungerRatePerHour = Math.max(
    0,
    Number(ctx?.decayByStat?.hunger || 0) /
      Math.max(1e-9, Number(ctx?.effectiveHoursByStat?.hunger || totalHours))
  );

  const hoursUntilDirtyThreshold =
    startCleanliness <= SEVERE_NEGLECT_CLEANLINESS_THRESHOLD
      ? 0
      : cleanlinessRatePerHour > 0
        ? (startCleanliness - SEVERE_NEGLECT_CLEANLINESS_THRESHOLD) /
          cleanlinessRatePerHour
        : Number.POSITIVE_INFINITY;

  const hoursUntilHungerThreshold =
    startHunger >= SEVERE_NEGLECT_HUNGER_THRESHOLD
      ? 0
      : hungerRatePerHour > 0
        ? (SEVERE_NEGLECT_HUNGER_THRESHOLD - startHunger) / hungerRatePerHour
        : Number.POSITIVE_INFINITY;

  const severeNeglectStartHour = Math.min(
    hoursUntilDirtyThreshold,
    hoursUntilHungerThreshold
  );

  if (
    !Number.isFinite(severeNeglectStartHour) ||
    severeNeglectStartHour >= totalHours
  ) {
    return 0;
  }

  return Math.max(
    0,
    totalHours -
      Math.max(0, severeNeglectStartHour) -
      SEVERE_NEGLECT_GRACE_HOURS
  );
}

function evaluateThresholdsStage(ctx) {
  ctx.state.stats = applyPetStatDecay({
    stats: ctx.state.stats,
    decayByStat: ctx.decayByStat,
    sleeping: ctx.sleeping,
    energyRecoveryGain: ctx.energyRecoveryGain,
  });

  // Auto-sleep / auto-wake around very low energy.
  if (
    !ctx.sleeping &&
    Number(ctx.state.stats?.energy || 0) <= AUTO_SLEEP_THRESHOLD
  ) {
    ctx.state.isAsleep = true;
    ctx.state.lastAction = "sleep_auto";
  } else if (
    ctx.sleeping &&
    Number(ctx.state.stats?.energy || 0) >= AUTO_WAKE_THRESHOLD
  ) {
    ctx.state.isAsleep = false;
    ctx.state.lastAction = "wake";
    const dreams = ensureDreamState(ctx.state);
    dreams.active = null;
  }

  // Potty need rises over time; trigger accidents if it overflows.
  if (!ctx.vacation.enabled) {
    const effects = getCleanlinessEffect(ctx.state);
    const tierMultiplier = Number(effects?.pottyGainMultiplier || 1) || 1;
    const trainingMultiplier = getPottyTrainingMultiplier(ctx.state);
    const asleepMultiplier = ctx.state.isAsleep ? 0.75 : 1;
    const perHour =
      POTTY_FILL_PER_HOUR *
      tierMultiplier *
      trainingMultiplier *
      Number(ctx.multipliers.potty || 1);
    let pottyNeed =
      Number(ctx.state.pottyLevel || 0) +
      perHour * ctx.effectiveHours * asleepMultiplier;

    let accidents = 0;
    while (pottyNeed >= 100 && accidents < MAX_ACCIDENTS_PER_DECAY) {
      accidents += 1;
      pottyNeed -= 100;
      applyAccidentInternal(ctx.state, ctx.now);
    }

    ctx.state.pottyLevel = clamp(pottyNeed, 0, 100);
  }

  const severeNeglectHours = getSevereNeglectHours(ctx);
  if (severeNeglectHours > 0) {
    ctx.state.stats.health = clampHealthForState(
      ctx.state,
      Number(ctx.state.stats.health || 0) -
        severeNeglectHours *
          OFFLINE_SEVERE_NEGLECT_HEALTH_DECAY_PER_HOUR *
          Number(ctx.multipliers.severeNeglectHealth || 1)
    );
  }

  const starvationPenaltyHours = Math.max(
    0,
    Number(ctx?.effectiveHoursByStat?.starvationHealth || 0)
  );
  if (starvationPenaltyHours > 0) {
    ctx.state.stats.health = clampHealthForState(
      ctx.state,
      Number(ctx.state.stats.health || 0) -
        starvationPenaltyHours * OFFLINE_STARVATION_HEALTH_DECAY_PER_HOUR
    );
  }

  updateHealthAndIllnessSilo(ctx);
  maybeTriggerDestructiveChewing(ctx);
}

function getSeniorDays(state) {
  const stage = String(state?.lifeStage?.stage || "").toUpperCase();
  if (stage !== LIFE_STAGES.SENIOR) return 0;
  const ageDays = Number(state?.lifeStage?.days || 0);
  return Math.max(0, ageDays - SENIOR_STAGE_START_DAY);
}

function updateHealthAndIllnessSilo(ctx) {
  const silo = ensureHealthSiloState(ctx.state);
  const stats = ctx.state.stats || {};
  const tier = String(ctx.state.cleanlinessTier || "FRESH").toUpperCase();
  const hours = Math.max(0, Number(ctx.effectiveHours || 0));
  if (!hours) return;

  const cleanliness = clamp(Number(stats.cleanliness || 0), 0, 100);
  const dirtiness = 100 - cleanliness;
  const hungerNeed = clamp(Number(stats.hunger || 0), 0, 100);
  const seniorDays = getSeniorDays(ctx.state);

  // Dental wear slowly rises over time and faster in poor care conditions.
  const dentalLoss =
    hours *
    (0.04 +
      (tier === "MANGE" ? 0.06 : tier === "FLEAS" ? 0.04 : 0.01) +
      Math.max(0, hungerNeed - 65) / 900);
  silo.dentalHealth = clamp(silo.dentalHealth - dentalLoss, 0, 100);

  // Joint stiffness is mostly meaningful in the first 40 senior days.
  if (seniorDays > 0 && seniorDays <= SENIOR_STIFFNESS_WINDOW_DAYS) {
    const stiffnessGain =
      hours * (0.08 + Math.max(0, 55 - Number(stats.energy || 0)) / 600);
    silo.jointStiffness = clamp(silo.jointStiffness + stiffnessGain, 0, 100);
  } else if (seniorDays <= 0) {
    silo.jointStiffness = clamp(silo.jointStiffness - hours * 0.06, 0, 100);
  } else {
    silo.jointStiffness = clamp(silo.jointStiffness - hours * 0.02, 0, 100);
  }

  // Weight trends from persistent overfeeding/underfeeding pressure.
  if (hungerNeed >= 75) {
    silo.weightStatus = clamp(silo.weightStatus - hours * 0.22, -50, 50);
  } else if (hungerNeed <= 35) {
    silo.weightStatus = clamp(silo.weightStatus + hours * 0.18, -50, 50);
  } else {
    const settle = Math.sign(silo.weightStatus) * hours * 0.04;
    silo.weightStatus = clamp(silo.weightStatus - settle, -50, 50);
  }

  // Coat condition degrades under sustained dirt; can recover slowly when clean.
  const coatLoss =
    hours *
    (0.04 +
      dirtiness / 220 +
      (tier === "MANGE" ? 0.11 : tier === "FLEAS" ? 0.07 : 0));
  const coatRecovery = cleanliness >= 78 ? hours * 0.07 : 0;
  silo.coatCondition = clamp(
    silo.coatCondition - coatLoss + coatRecovery,
    0,
    100
  );

  // Parasite load builds from dirty coat + poor cleanliness and fades with care.
  let parasiteDelta = 0;
  if (silo.coatCondition <= 45) parasiteDelta += hours * 0.16;
  if (cleanliness <= 35) parasiteDelta += hours * 0.14;
  if (tier === "FLEAS") parasiteDelta += hours * 0.2;
  if (tier === "MANGE") parasiteDelta += hours * 0.28;
  if (cleanliness >= 80 && tier === "FRESH") parasiteDelta -= hours * 0.1;
  silo.parasiteLoad = clamp(silo.parasiteLoad + parasiteDelta, 0, 100);

  // Heavy under/over weight makes energy drain harsher.
  const absWeight = Math.abs(silo.weightStatus);
  if (absWeight >= 30) {
    ctx.state.stats.energy = clamp(
      Number(ctx.state.stats.energy || 0) - (absWeight - 29) * 0.2,
      0,
      100
    );
  }

  if (
    Number(silo.jointStiffness || 0) >= 80 &&
    !ctx.state.isAsleep &&
    /run|play|zoom/i.test(String(ctx.state.lastAction || ""))
  ) {
    ctx.state.lastAction = "limping";
  }
}

function hasChewOutlet(state) {
  const yard = ensureYardState(state);
  if (yard.chewBoneAvailable) return true;
  const toyId = String(state?.memory?.favoriteToyId || "")
    .trim()
    .toLowerCase();
  return (
    toyId.includes("bone") || toyId.includes("chew") || toyId.includes("kong")
  );
}

function resolveVocalizationIntensityLabel(threshold, signal) {
  return Number(signal || 0) >= Number(threshold || 50)
    ? "loud bark"
    : "soft yip";
}

function maybeTriggerDestructiveChewing(ctx) {
  const urge = clamp(Number(ctx?.instinctEngine?.chewingUrge || 0), 0, 100);
  if (urge < CHEWING_URGE_DESTRUCTIVE_THRESHOLD) return;
  if (ctx.vacation.enabled) return;
  const inventory = ensureInventoryState(ctx.state);
  const chewProtectionUntil = Number(inventory.chewProtectionUntil || 0);
  if (chewProtectionUntil && ctx.now < chewProtectionUntil) return;
  if (hasChewOutlet(ctx.state)) return;

  const lastAt = Number(ctx.state?.memory?.lastChewingIncidentAt || 0);
  if (lastAt && ctx.now - lastAt < CHEWING_INCIDENT_COOLDOWN_MS) return;

  ctx.state.memory.lastChewingIncidentAt = ctx.now;

  const intensity = clamp(
    Math.round((urge - CHEWING_URGE_DESTRUCTIVE_THRESHOLD) / 4) + 2,
    2,
    8
  );
  ctx.state.stats.cleanliness = clamp(
    Number(ctx.state.stats.cleanliness || 0) - intensity * 1.5,
    0,
    100
  );
  ctx.state.stats.happiness = clamp(
    Number(ctx.state.stats.happiness || 0) - intensity,
    0,
    100
  );
  ctx.state.stats.mentalStimulation = clamp(
    Number(ctx.state.stats.mentalStimulation || 0) + intensity,
    0,
    100
  );
  ctx.state.lastAction = "destructive_chewing";

  const vocalization = resolveVocalizationIntensityLabel(
    ctx?.instinctEngine?.vocalizationThreshold,
    urge
  );
  pushJournalEntry(ctx.state, {
    type: "INSTINCT",
    moodTag: "RESTLESS",
    summary: "Chewing urge spiked",
    body: `Without a chew bone available, your pup released stress with destructive chewing and a ${vocalization}.`,
    timestamp: ctx.now,
  });
}

function runLegacyEventsStage(ctx) {
  if (isArchetypeTrackingWindowOpen(ctx.state, ctx.now)) {
    const pressureCount = [
      Number(ctx.state.stats?.hunger || 0) >= 70,
      Number(ctx.state.stats?.thirst || 0) >= 70,
      Number(ctx.state.stats?.energy || 100) <= 30,
      Number(ctx.state.pottyLevel || 0) >= 70,
    ].filter(Boolean).length;
    if (pressureCount > 0) {
      trackTemperamentMetric(
        ctx.state,
        "neglectMinutes",
        Math.round(Number(ctx.diffHours || 0) * 60 * pressureCount),
        ctx.now
      );
    }
  }

  evaluateDangerAndLifecycleEvents(ctx.state, ctx.now);
  if (ensureLifecycleStatus(ctx.state) !== DOG_LIFECYCLE_STATUS.ACTIVE) return;

  // Vacation mode implies your pup is cared for; we skip neglect strikes/journal.
  if (!ctx.vacation.enabled && ctx.diffHours >= 24) {
    ctx.state.memory.neglectStrikes = Math.min(
      (ctx.state.memory.neglectStrikes || 0) + 1,
      999
    );
    // Bond no longer decays from passive neglect; only explicit actions raise it.

    // Neglect nudges personality toward cautious/independent/reserved.
    applyPersonalityShift(ctx.state, {
      now: ctx.now,
      source: "NEGLECT",
      note: "Stayed away a while",
      deltas: {
        adventurous: -2,
        social: -3,
        affectionate: -3,
        playful: -2,
        energetic: -1,
      },
    });

    pushJournalEntry(ctx.state, {
      type: "NEGLECT",
      moodTag: "LONELY",
      summary: "Dear hooman… I missed you.",
      body:
        "Dear hooman,\n\nI wasn’t sure if you were chasing squirrels or just busy, " +
        "but I got pretty lonely while you were gone. Next time, can we play a little sooner?\n\n– your pup",
      timestamp: ctx.now,
    });
  }
}

function applyDecay(state, now = nowMs()) {
  const status = ensureLifecycleStatus(state);
  if (status !== DOG_LIFECYCLE_STATUS.ACTIVE || !state.adoptedAt) {
    state.lastUpdatedAt = now;
    return;
  }

  syncLifecycleState(state, now);

  const ctx = createDecayRuleContext(state, now);
  if (!ctx) return;

  const stageHandlers = {
    computeDegradation: computeDegradationStage,
    applyEnvironmentModifiers: applyEnvironmentModifiersStage,
    applyCompounding: applyCompoundingStage,
    evaluateThresholds: evaluateThresholdsStage,
    runLegacyEvents: runLegacyEventsStage,
  };
  DOG_RULE_PIPELINE_STAGES.forEach((stageName) => {
    stageHandlers[stageName]?.(ctx);
  });

  state.lastUpdatedAt = now;
}

function getOfflineCatchUpHours(lastTickAt, now = nowMs()) {
  return getOfflineProgressHours(lastTickAt, now, MAX_DECAY_HOURS);
}

function applyOfflineCatchUp(state, now = nowMs()) {
  const hoursPassed = getOfflineCatchUpHours(state.lastUpdatedAt, now);
  if (!hoursPassed) {
    if (!Number.isFinite(Number(state.lastUpdatedAt))) {
      state.lastUpdatedAt = now;
    }
    normalizeStatsState(state);
    return 0;
  }

  applyDecay(state, now);
  normalizeStatsState(state);
  return hoursPassed;
}

function maybeSampleMood(state, now = nowMs(), reason = "TICK") {
  const last = state.mood.lastSampleAt;
  if (last && now - last < MOOD_SAMPLE_MINUTES * 60 * 1000) return;

  const { hunger, thirst, happiness, energy, cleanliness } = state.stats;

  let tag = "NEUTRAL";
  if (happiness > 75 && hunger < 60 && thirst < 60) tag = "HAPPY";
  else if (hunger > 75) tag = "HUNGRY";
  else if (thirst > 75) tag = "RESTLESS";
  else if (energy < 30) tag = "SLEEPY";
  else if (cleanliness < 30) tag = "DIRTY";

  state.mood.history.unshift({
    timestamp: now,
    tag,
    reason,
    hunger: Math.round(hunger),
    thirst: Math.round(thirst),
    happiness: Math.round(happiness),
    energy: Math.round(energy),
    cleanliness: Math.round(cleanliness),
  });

  if (state.mood.history.length > 100) {
    state.mood.history.length = 100;
  }

  state.mood.lastSampleAt = now;
}

function applyWorldTick(state, payload) {
  const now = payload?.now ?? nowMs();
  if (
    ensureLifecycleStatus(state) !== DOG_LIFECYCLE_STATUS.ACTIVE ||
    !state.adoptedAt
  ) {
    state.lastUpdatedAt = now;
    return;
  }
  applyOfflineCatchUp(state, now);
  advanceDogFsm(state, now, { allowAutonomy: true });
  const tier = finalizeDerivedState(state, now);
  applyCleanlinessPenalties(state, tier);

  const severeNeglect =
    Number(state.stats.cleanliness || 100) <= 15 ||
    Number(state.stats.hunger || 0) >= 85;
  if (severeNeglect && Number(state.memory?.neglectStrikes || 0) >= 3) {
    state.stats.health = clampHealthForState(
      state,
      Number(state.stats.health || 0) - 3
    );
  }

  maybeConsumeFoodBowl(state, now);

  if (
    !state.isAsleep &&
    (tier === "DIRTY" || tier === "FLEAS" || tier === "MANGE")
  ) {
    const last = String(state.lastAction || "").toLowerCase();
    const protectedActions = [
      "feed",
      "water",
      "play",
      "train",
      "bathe",
      "potty",
      "scoop",
      "pet",
    ];
    const canOverride = !protectedActions.some((a) => last.startsWith(a));
    const chance = tier === "MANGE" ? 0.35 : tier === "FLEAS" ? 0.25 : 0.12;
    if (canOverride && Math.random() < chance) {
      state.lastAction = "scratch";
    }
  }

  const didZoomies = maybeTriggerZoomiesBurst(state, now);
  if (!didZoomies) {
    maybeTriggerAiDreamCue(state, now);
  }

  maybeSampleMood(state, now, "TICK");
  updateTemperamentReveal(state, now);
  evaluateTemperament(state, now);
}

function getDogLevelFromXp(totalXp = 0) {
  const xp = Math.max(0, Math.floor(Number(totalXp) || 0));
  let level = 1;

  while (
    xp >=
    xpRequiredForLevel(level + 1, {
      baseThreshold: LEVEL_XP_BASE_THRESHOLD,
      thresholdStep: LEVEL_XP_STEP,
    })
  ) {
    level += 1;
  }

  return level;
}

function applyXp(state, amount = 10) {
  state.xp += amount;
  const targetLevel = getDogLevelFromXp(state.xp);
  if (targetLevel > state.level) {
    state.level = targetLevel;
    pushJournalEntry(state, {
      type: "LEVEL_UP",
      moodTag: "HAPPY",
      summary: `Level up! Now level ${state.level}.`,
      body: `Nice work, hooman. I’m now level ${state.level}! New tricks unlocked soon…`,
    });
  }
}

function applyXpDelta(state, amount = 0) {
  const delta = Number(amount) || 0;
  if (!delta) return;
  state.xp = Math.max(0, state.xp + delta);
  const targetLevel = getDogLevelFromXp(state.xp);
  state.level = targetLevel;
}

function applyBondGain(state, amount = 1, now = nowMs()) {
  const gain = Number(amount) || 0;
  if (gain <= 0) return;
  if (!state.bond || typeof state.bond !== "object") {
    state.bond = { ...initialBond };
  }
  state.bond.value = clamp((state.bond.value || 0) + gain, 0, 100);
  state.bond.updatedAt = now;
}

function _applyBondLoss(state, amount = 1, now = nowMs()) {
  const loss = Math.abs(Number(amount) || 0);
  if (loss <= 0) return;
  if (!state.bond || typeof state.bond !== "object") {
    state.bond = { ...initialBond };
  }
  state.bond.value = clamp((state.bond.value || 0) - loss, 0, 100);
  state.bond.updatedAt = now;
}

function applySkillXp(skillBranch, skillId, skillState, amount = 5) {
  if (!skillState || typeof skillState !== "object") return;
  const branchKey = String(skillBranch || "").trim();
  const idKey = String(skillId || "").trim();
  if (!branchKey || !idKey) return;

  if (!skillState[branchKey] || typeof skillState[branchKey] !== "object") {
    skillState[branchKey] = {};
  }

  if (
    !skillState[branchKey][idKey] ||
    typeof skillState[branchKey][idKey] !== "object"
  ) {
    skillState[branchKey][idKey] = { level: 0, xp: 0 };
  }

  const node = skillState[branchKey][idKey];
  if (typeof node.xp !== "number") node.xp = 0;
  if (typeof node.level !== "number") node.level = 0;
  const masteryBefore = getObedienceSkillMasteryPct(node);
  const levelBefore = Number(node.level || 0);

  node.xp += Number(amount) || 0;

  const targetLevel = Math.floor(node.xp / SKILL_LEVEL_STEP);
  if (targetLevel > node.level) node.level = targetLevel;

  const masteryAfter = getObedienceSkillMasteryPct(node);
  return {
    node,
    levelBefore,
    levelAfter: Number(node.level || 0),
    masteryBefore,
    masteryAfter,
    mastered: masteryBefore < 100 && masteryAfter >= 100,
  };
}

function setLastTrainingReaction(state, reaction, now) {
  const memory = ensureMemoryState(state);
  state.memory.lastTrainingReaction =
    reaction && typeof reaction === "object"
      ? {
          kind:
            String(reaction.kind || "")
              .trim()
              .toLowerCase() || "obey",
          requestedCommandId: reaction.requestedCommandId
            ? String(reaction.requestedCommandId).trim()
            : null,
          performedActionId: reaction.performedActionId
            ? String(reaction.performedActionId).trim()
            : null,
          performedCommandId: reaction.performedCommandId
            ? String(reaction.performedCommandId).trim()
            : null,
          reasonId: reaction.reasonId
            ? String(reaction.reasonId).trim().toLowerCase()
            : null,
          createdAt: typeof now === "number" ? now : nowMs(),
        }
      : null;

  const commandId = state.memory?.lastTrainingReaction?.requestedCommandId;
  const kind = state.memory?.lastTrainingReaction?.kind;
  const createdAt = state.memory?.lastTrainingReaction?.createdAt;
  if (commandId && kind && createdAt) {
    memory.commandBuffer.unshift({
      commandId,
      kind,
      createdAt,
    });
    if (memory.commandBuffer.length > 8) {
      memory.commandBuffer.length = 8;
    }
  }
}

function updateStreak(streakState, isoDate) {
  const { currentStreakDays, bestStreakDays, lastActiveDate } = streakState;

  if (!isoDate) return;

  if (!lastActiveDate) {
    streakState.currentStreakDays = 1;
    streakState.bestStreakDays = Math.max(bestStreakDays, 1);
    streakState.lastActiveDate = isoDate;
    return;
  }

  if (lastActiveDate === isoDate) {
    return;
  }

  const prev = new Date(lastActiveDate);
  const curr = new Date(isoDate);
  const diffMs = curr.getTime() - prev.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    streakState.currentStreakDays = currentStreakDays + 1;
  } else {
    streakState.currentStreakDays = 1;
  }

  streakState.bestStreakDays = Math.max(
    streakState.bestStreakDays,
    streakState.currentStreakDays
  );
  streakState.lastActiveDate = isoDate;
}

function updateTemperamentReveal(state, now = nowMs()) {
  const temperament = ensureTemperamentState(state);
  const adoptedAt = temperament.adoptedAt;
  if (!adoptedAt) return;
  if (temperament.revealedAt) return;

  const hoursSinceAdoption = Math.max(0, (now - adoptedAt) / MS_PER_HOUR);
  if (hoursSinceAdoption >= ARCHETYPE_REVEAL_WINDOW_HOURS) {
    determineTemperamentArchetype(state, now);
    temperament.revealReady = true;
  }
}

function evaluateTemperament(state, now = nowMs()) {
  const t = ensureTemperamentState(state);

  const lastEval = t.lastEvaluatedAt || t.adoptedAt || 0;
  const days = getDaysBetween(lastEval, now);
  if (days < 1) return;

  const findTrait = (id) => t.traits.find((x) => x.id === id);

  const clingy = findTrait("clingy");
  const toyObsessed = findTrait("toyObsessed");
  const foodMotivated = findTrait("foodMotivated");

  if (!clingy || !toyObsessed || !foodMotivated) {
    console.warn("[Doggerz] Missing temperament traits, skipping evaluation");
    return;
  }

  const hunger = state.stats.hunger;
  const happiness = state.stats.happiness;
  const neglect = state.memory.neglectStrikes || 0;

  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const playedRecently =
    state.memory.lastPlayedAt && now - state.memory.lastPlayedAt < sevenDaysMs;
  const fedRecently =
    state.memory.lastFedAt &&
    now - state.memory.lastFedAt < 12 * 60 * 60 * 1000;
  const trainedRecently =
    state.memory.lastTrainedAt &&
    now - state.memory.lastTrainedAt < 3 * 24 * 60 * 60 * 1000;

  const obedienceSkills = state.skills?.obedience || {};
  const avgObedienceLevel = (() => {
    const vals = Object.values(obedienceSkills).map((s) => s.level || 0);
    return vals.length > 0
      ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
      : 0;
  })();

  const recentMoods = (state.mood?.history || []).slice(0, 10);
  const happyMoodCount = recentMoods.filter((m) => m.tag === "HAPPY").length;
  const hungryMoodCount = recentMoods.filter((m) => m.tag === "HUNGRY").length;
  const moodSentiment = {
    happy: happyMoodCount,
    hungry: hungryMoodCount,
  };

  const recentJournal = (state.journal?.entries || []).slice(0, 20);
  const neglectEntries = recentJournal.filter(
    (e) => e.type === "NEGLECT"
  ).length;

  const targetClingy = clamp(
    Math.round(
      clingy.intensity * 0.65 +
        (100 - happiness) * 0.15 +
        neglect * 8 +
        neglectEntries * 5 +
        (trainedRecently ? -5 : 10)
    ),
    0,
    100
  );

  const targetToy = clamp(
    Math.round(
      toyObsessed.intensity * 0.65 +
        (happiness - 50) * 0.2 +
        (playedRecently ? 12 : 0) +
        moodSentiment.happy * 3 +
        avgObedienceLevel * 0.5
    ),
    0,
    100
  );

  const targetFood = clamp(
    Math.round(
      foodMotivated.intensity * 0.65 +
        (hunger - 50) * 0.25 +
        (fedRecently ? 10 : 0) +
        moodSentiment.hungry * 2 +
        (avgObedienceLevel > 0 ? -3 : 0)
    ),
    0,
    100
  );

  clingy.intensity = Math.round(clingy.intensity * 0.65 + targetClingy * 0.35);
  toyObsessed.intensity = Math.round(
    toyObsessed.intensity * 0.65 + targetToy * 0.35
  );
  foodMotivated.intensity = Math.round(
    foodMotivated.intensity * 0.65 + targetFood * 0.35
  );

  const sorted = [...t.traits].sort((a, b) => b.intensity - a.intensity);
  const top = sorted[0];
  const second = sorted[1] || top;

  const traitToLabel = {
    clingy: "SWEET",
    toyObsessed: "SPICY",
    foodMotivated: "CHILL",
  };

  t.primary = traitToLabel[top.id] || t.primary || "SPICY";
  t.secondary = traitToLabel[second.id] || t.secondary || "SWEET";

  t.lastEvaluatedAt = now;
}

function resolveCleanlinessTierFromValue(value = 0) {
  if (value >= CLEANLINESS_THRESHOLDS.FRESH) return "FRESH";
  if (value >= CLEANLINESS_THRESHOLDS.DIRTY) return "DIRTY";
  if (value >= CLEANLINESS_THRESHOLDS.FLEAS) return "FLEAS";
  return "MANGE";
}

function syncLifecycleState(state, now = nowMs()) {
  const previousStage = state.lifeStage?.stage || null;
  const adoptedAt = state.adoptedAt || state.temperament?.adoptedAt || now;
  const ageNow = getVacationAdjustedNow(state, now);
  const age = calculateDogAge(adoptedAt, ageNow);
  const nextStage = age.stageId || DEFAULT_LIFE_STAGE.stage;
  state.lifeStage = {
    stage: nextStage,
    label: age.stageLabel || DEFAULT_LIFE_STAGE.label,
    days: age.ageInGameDays,
  };

  const milestones = ensureMilestonesState(state);
  if (
    previousStage &&
    nextStage &&
    previousStage !== nextStage &&
    !milestones.pending &&
    milestones.lastCelebratedStage !== nextStage
  ) {
    const transitionCopy = getLifeStageTransitionCopy(nextStage, previousStage);
    milestones.pending = {
      fromStage: previousStage,
      toStage: nextStage,
      triggeredAt: now,
      ageDays: Number.isFinite(age.ageInGameDays) ? age.ageInGameDays : null,
    };

    pushJournalEntry(state, {
      type: "GROWTH",
      moodTag: "PROUD",
      summary: `Grew into a ${getLifeStageLabel(nextStage)}.`,
      body:
        transitionCopy?.journalBody ||
        "Look at me now—taller, faster, and ready for new adventures together.",
      timestamp: now,
    });
  }
  return state.lifeStage;
}

function syncCleanlinessTier(state, now = nowMs()) {
  const cleanliness = state.stats?.cleanliness ?? 0;
  const silo = ensureHealthSiloState(state);
  let nextTier = resolveCleanlinessTierFromValue(cleanliness);
  if (silo.parasiteLoad >= 90) {
    nextTier = "MANGE";
  } else if (silo.parasiteLoad >= 70 && nextTier !== "MANGE") {
    nextTier = "FLEAS";
  }
  const previousTier = state.cleanlinessTier || "FRESH";

  if (nextTier !== previousTier) {
    state.cleanlinessTier = nextTier;
    const tierEffect = CLEANLINESS_TIER_EFFECTS[nextTier];
    if (tierEffect?.journalSummary) {
      pushJournalEntry(state, {
        type: "CARE",
        moodTag: "DIRTY",
        summary: tierEffect.label || nextTier,
        body: tierEffect.journalSummary,
        timestamp: now,
      });
    }
  } else if (!state.cleanlinessTier) {
    state.cleanlinessTier = nextTier;
  }

  return state.cleanlinessTier;
}

function finalizeDerivedState(state, now = nowMs()) {
  normalizeStatsState(state);
  ensureHealthSiloState(state);
  ensureLifecycleStatus(state);
  ensureDangerState(state);
  ensureLegacyJourneyState(state);
  syncLifecycleState(state, now);
  const tier = syncCleanlinessTier(state, now);
  evaluateObedienceUnlocks(state, now);
  advanceDogFsm(state, now, { allowAutonomy: false });
  state.moodlets = computeMoodlets(state);
  syncPottySequenceState(state, now);
  state.emotionCue = deriveEmotionCue(state);
  state.personalityProfile = derivePersonalityProfile(state);

  // --- animation mood routing (string mood separate from mood history object) ---
  {
    const animation = ensureAnimationState(state);

    // Prefer emotionCue, else fall back to a stable "ok"
    const mood =
      typeof state.emotionCue === "string" && state.emotionCue.trim()
        ? state.emotionCue
        : "ok";

    animation.mood = normalizeActionKey(mood);

    // Don’t stomp the loop while a one-shot is playing
    if (!animation.overrideUntilDone) {
      animation.desiredAction = deriveDesiredActionFromMood(animation.mood);
    }
  }

  evaluateDangerAndLifecycleEvents(state, now);
  syncSpiritMimicState(state, now);

  return tier;
}

function ensureVacationState(state) {
  return ensureVacationStateInternal(state, true);
}

function normalizeVacationState(vacation) {
  if (!vacation || typeof vacation !== "object") {
    return { ...DEFAULT_VACATION_STATE };
  }

  const mult = Number(vacation.multiplier);
  const normalized = Number.isFinite(mult)
    ? clamp(mult, 0, 1)
    : DEFAULT_VACATION_STATE.multiplier;
  const skipped = Number(vacation.skippedMs);

  return {
    enabled: Boolean(vacation.enabled),
    multiplier:
      normalized === LEGACY_VACATION_MULTIPLIER
        ? DEFAULT_VACATION_STATE.multiplier
        : normalized,
    startedAt:
      typeof vacation.startedAt === "number" ? vacation.startedAt : null,
    skippedMs: Number.isFinite(skipped) ? Math.max(0, skipped) : 0,
  };
}

function ensureVacationStateInternal(state, mutate) {
  const normalized = normalizeVacationState(state?.vacation);
  if (mutate && state && state.vacation !== normalized) {
    state.vacation = normalized;
  }
  return normalized;
}

function getVacationAdjustedNow(state, now = nowMs()) {
  const v = ensureVacationStateInternal(state, false);
  const baseSkipped = Number(v.skippedMs) || 0;

  if (v.enabled && typeof v.startedAt !== "number") {
    return Math.max(0, now - baseSkipped);
  }

  if (!v.enabled || typeof v.startedAt !== "number") {
    return Math.max(0, now - baseSkipped);
  }

  const mult = clamp(Number(v.multiplier) || 1, 0, 1);
  const liveMs = Math.max(0, now - v.startedAt);
  const liveSkipped = liveMs * (1 - mult);
  return Math.max(0, now - baseSkipped - liveSkipped);
}

function getPersonalityPerks(state) {
  const personality = ensurePersonalityState(state);
  const t = personality.traits;

  // Map trait lean into small, safe multipliers.
  return {
    playHappinessBonus:
      1 +
      0.25 * pos01(t.playful) +
      0.12 * pos01(t.adventurous) +
      0.08 * pos01(t.social),
    playEnergyCostMultiplier: 1 - 0.2 * pos01(t.energetic),
    feedHappinessBonus:
      1 + 0.25 * pos01(t.affectionate) + 0.08 * pos01(t.social),
    restEnergyBonus: 1 + 0.25 * neg01(t.energetic),
    bathHappinessPenaltyMultiplier:
      1 - 0.2 * neg01(t.energetic) - 0.1 * pos01(t.affectionate),
    trainingHappinessBonus: 1 + 0.2 * neg01(t.playful),
  };
}

function applyCleanlinessPenalties(state, tierOverride) {
  if (ensureVacationState(state).enabled) return;
  const tier = tierOverride || state.cleanlinessTier || "FRESH";
  const effects = CLEANLINESS_TIER_EFFECTS[tier];
  if (!effects) return;

  if (effects.penalties?.happinessTickPenalty) {
    state.stats.happiness = clamp(
      state.stats.happiness - effects.penalties.happinessTickPenalty,
      0,
      100
    );
  }

  if (effects.penalties?.energyTickPenalty) {
    state.stats.energy = clamp(
      state.stats.energy - effects.penalties.energyTickPenalty,
      0,
      100
    );
  }
}

function getCleanlinessEffect(state) {
  return (
    CLEANLINESS_TIER_EFFECTS[state.cleanlinessTier] ||
    CLEANLINESS_TIER_EFFECTS.FRESH ||
    {}
  );
}

function getIsoDate(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

function ensureTrainingState(state) {
  if (!state.training) {
    state.training = createInitialTrainingState();
    return state.training;
  }
  const defaults = createInitialTrainingState();
  if (!state.training.potty) {
    state.training.potty = { ...defaults.potty };
  }
  if (!state.training.adult) {
    state.training.adult = { ...defaults.adult };
  }
  if (!state.training.obedience) {
    state.training.obedience = { ...defaults.obedience };
  }
  return state.training;
}

function ensureObedienceUnlockState(state) {
  const training = ensureTrainingState(state);
  if (!training.obedience || typeof training.obedience !== "object") {
    training.obedience = {
      unlockedIds: [],
      unlockableAtById: {},
      unlockedAtById: {},
      lastUnlockedId: null,
      lastUnlockedAt: null,
    };
  }

  const o = training.obedience;
  o.unlockedIds = Array.isArray(o.unlockedIds)
    ? o.unlockedIds.map((id) => String(id))
    : [];
  o.unlockableAtById =
    o.unlockableAtById && typeof o.unlockableAtById === "object"
      ? o.unlockableAtById
      : {};
  o.unlockedAtById =
    o.unlockedAtById && typeof o.unlockedAtById === "object"
      ? o.unlockedAtById
      : {};
  o.lastUnlockedId = o.lastUnlockedId ? String(o.lastUnlockedId) : null;
  if (typeof o.lastUnlockedAt !== "number") {
    o.lastUnlockedAt = null;
  }

  return o;
}

function getMasteredObedienceCommandIds(state) {
  const mastered = new Set();
  const skillState =
    state?.skills?.obedience && typeof state.skills.obedience === "object"
      ? state.skills.obedience
      : {};

  OBEDIENCE_COMMANDS.forEach((command) => {
    const id = String(command?.id || "");
    if (!id) return;
    if (getObedienceSkillMasteryPct(skillState[id]) >= 100) {
      mastered.add(id);
    }
  });

  return mastered;
}

function evaluateObedienceUnlocks(state, now = nowMs()) {
  const training = ensureTrainingState(state);
  const unlocks = ensureObedienceUnlockState(state);
  const pottyComplete = Boolean(training?.potty?.completedAt);
  if (!pottyComplete) return;

  const level = Math.max(1, Number(state.level || 1));
  const bond = clamp(Number(state.bond?.value || 0), 0, 100);
  const streak = Math.max(0, Number(state.streak?.currentStreakDays || 0));
  const stage = String(
    state?.lifeStage?.stage || DEFAULT_LIFE_STAGE.stage
  ).toUpperCase();
  const masteredIds = getMasteredObedienceCommandIds(state);
  const activeLearningLimit = getObedienceActiveLearningLimit({
    level,
    stage,
    pottyComplete,
    masteredCount: masteredIds.size,
  });

  const context = { level, bond, streak, pottyComplete };
  let reservedLearningSlots = unlocks.unlockedIds.filter(
    (id) => !masteredIds.has(id)
  ).length;

  Object.keys(unlocks.unlockableAtById).forEach((id) => {
    if (unlocks.unlockedIds.includes(id)) {
      delete unlocks.unlockableAtById[id];
      return;
    }
    if (masteredIds.has(id)) {
      delete unlocks.unlockableAtById[id];
      return;
    }
    const command = getObedienceCommand(id);
    if (!commandRequirementsMet(context, command)) {
      delete unlocks.unlockableAtById[id];
      return;
    }
    reservedLearningSlots += 1;
  });

  for (const command of OBEDIENCE_COMMANDS) {
    if (!command?.id) continue;
    const id = String(command.id);
    const isUnlocked = unlocks.unlockedIds.includes(id);
    const startedAt = Number(unlocks.unlockableAtById[id] || 0);
    if (isUnlocked) {
      if (startedAt) delete unlocks.unlockableAtById[id];
      continue;
    }

    const eligible = commandRequirementsMet(context, command);
    if (!eligible) {
      if (startedAt) {
        delete unlocks.unlockableAtById[id];
        reservedLearningSlots = Math.max(0, reservedLearningSlots - 1);
      }
      continue;
    }

    const delayMinutes = Number(command.unlockDelayMinutes || 0);
    const delayMs = Math.max(0, Math.round(delayMinutes * 60 * 1000));

    if (!startedAt && reservedLearningSlots >= activeLearningLimit) {
      continue;
    }

    if (!startedAt && delayMs <= 0) {
      unlocks.unlockedIds.push(id);
      unlocks.unlockedAtById[id] = now;
      unlocks.lastUnlockedId = id;
      unlocks.lastUnlockedAt = now;
      reservedLearningSlots += masteredIds.has(id) ? 0 : 1;

      pushJournalEntry(state, {
        type: "TRAINING",
        moodTag: "PROUD",
        summary: `Unlocked ${command.label}.`,
        body: `New command ready: "${command.label}". Time to practice!`,
        timestamp: now,
      });
      continue;
    }

    if (!startedAt) {
      unlocks.unlockableAtById[id] = now;
      reservedLearningSlots += 1;
      continue;
    }

    if (now - startedAt >= delayMs) {
      unlocks.unlockedIds.push(id);
      unlocks.unlockedAtById[id] = now;
      unlocks.lastUnlockedId = id;
      unlocks.lastUnlockedAt = now;
      delete unlocks.unlockableAtById[id];

      pushJournalEntry(state, {
        type: "TRAINING",
        moodTag: "PROUD",
        summary: `Unlocked ${command.label}.`,
        body: `New command ready: "${command.label}". Time to practice!`,
        timestamp: now,
      });
    }
  }
}

function recordPuppyPottySuccess(state, now = nowMs()) {
  const stage = String(
    state?.lifeStage?.stage || DEFAULT_LIFE_STAGE.stage
  ).toUpperCase();
  const isPuppy = stage === LIFE_STAGES.PUPPY;

  const training = ensureTrainingState(state);
  const potty = training.potty;
  if (!potty || potty.completedAt) return;

  potty.successCount = Math.min(potty.successCount + 1, potty.goal);

  if (potty.successCount >= potty.goal) {
    potty.completedAt = now;
    state.stats.happiness = clamp(state.stats.happiness + 5, 0, 100);
    POTTY_GATE_INSTANT_UNLOCK_IDS.forEach((id) => {
      unlockObedienceCommand(state, id, now, {
        body: `Potty training unlocked "${
          getObedienceCommand(id)?.label || id
        }" immediately.`,
      });
    });
    pushJournalEntry(state, {
      type: "TRAINING",
      moodTag: "PROUD",
      summary: isPuppy ? "Potty training complete" : "House training complete",
      body: isPuppy
        ? "Your puppy now knows how to signal when nature calls. Sit and Speak unlocked immediately."
        : "House training is finally locked in. Sit and Speak are ready immediately.",
      timestamp: now,
    });
  }
}

function getPottyTrainingMultiplier(state) {
  const training = ensureTrainingState(state);
  return training.potty?.completedAt ? POTTY_TRAINED_POTTY_GAIN_MULTIPLIER : 1;
}

function gainPottyNeed(state, amount = 10) {
  const base = Number(amount) || 0;
  if (!base) return;
  const effects = getCleanlinessEffect(state);
  const tierMultiplier = Number(effects?.pottyGainMultiplier || 1) || 1;
  const trainingMultiplier = getPottyTrainingMultiplier(state);
  const inc = base * tierMultiplier * trainingMultiplier;
  state.pottyLevel = clamp((state.pottyLevel || 0) + inc, 0, 100);
}

function ensurePottyMeta(state) {
  if (!state.potty || typeof state.potty !== "object") {
    state.potty = {
      training: 0,
      lastSuccessAt: null,
      lastAccidentAt: null,
      totalSuccesses: 0,
      totalAccidents: 0,
      ignoredCueCount: 0,
      sequence: {
        phase: POTTY_SEQUENCE.NONE,
        phaseStartedAt: null,
        cueIssuedAt: null,
        cueExpiresAt: null,
        lastMissedAt: null,
        playerRespondedAt: null,
      },
    };
  }
  if (typeof state.potty.totalSuccesses !== "number")
    state.potty.totalSuccesses = 0;
  if (typeof state.potty.totalAccidents !== "number")
    state.potty.totalAccidents = 0;
  if (typeof state.potty.ignoredCueCount !== "number")
    state.potty.ignoredCueCount = 0;
  if (!state.potty.sequence || typeof state.potty.sequence !== "object") {
    state.potty.sequence = {
      phase: POTTY_SEQUENCE.NONE,
      phaseStartedAt: null,
      cueIssuedAt: null,
      cueExpiresAt: null,
      lastMissedAt: null,
      playerRespondedAt: null,
    };
  }
  return state.potty;
}

function setPottySequencePhase(state, phase, now = nowMs(), extra = {}) {
  const potty = ensurePottyMeta(state);
  const previous = potty.sequence || {};
  const nextPhase = String(phase || POTTY_SEQUENCE.NONE).toLowerCase();
  potty.sequence = {
    ...previous,
    ...extra,
    phase: nextPhase,
    phaseStartedAt:
      String(previous.phase || POTTY_SEQUENCE.NONE).toLowerCase() === nextPhase
        ? previous.phaseStartedAt || now
        : now,
  };
}

function syncPottySequenceState(state, now = nowMs()) {
  const potty = ensurePottyMeta(state);
  const sequence = potty.sequence || {};
  const pottyLevel = clamp(Number(state.pottyLevel || 0), 0, 100);
  const currentPhase = String(
    sequence.phase || POTTY_SEQUENCE.NONE
  ).toLowerCase();

  if (currentPhase === POTTY_SEQUENCE.RELIEVED && pottyLevel <= 10) {
    setPottySequencePhase(state, POTTY_SEQUENCE.NONE, now, {
      cueIssuedAt: null,
      cueExpiresAt: null,
    });
    return;
  }

  if (currentPhase === POTTY_SEQUENCE.MISSED && pottyLevel <= 10) {
    setPottySequencePhase(state, POTTY_SEQUENCE.NONE, now, {
      cueIssuedAt: null,
      cueExpiresAt: null,
    });
    return;
  }

  if (currentPhase === POTTY_SEQUENCE.CUED) {
    const cueExpiresAt = Number(sequence.cueExpiresAt || 0);
    if (cueExpiresAt > 0 && now >= cueExpiresAt) {
      potty.ignoredCueCount = Math.min(
        Number(potty.ignoredCueCount || 0) + 1,
        999
      );
      setPottySequencePhase(state, POTTY_SEQUENCE.MISSED, now, {
        cueIssuedAt: sequence.cueIssuedAt || now,
        cueExpiresAt,
        lastMissedAt: now,
      });
    }
    return;
  }

  if (pottyLevel >= 90) {
    setPottySequencePhase(state, POTTY_SEQUENCE.CUED, now, {
      cueIssuedAt: Number(sequence.cueIssuedAt || now) || now,
      cueExpiresAt:
        Number(sequence.cueExpiresAt || 0) > now
          ? Number(sequence.cueExpiresAt)
          : now + 2 * 60 * 1000,
    });
    return;
  }

  if (pottyLevel >= 78) {
    setPottySequencePhase(state, POTTY_SEQUENCE.ANXIOUS_SNIFFING, now, {
      cueIssuedAt: null,
      cueExpiresAt: null,
    });
    return;
  }

  if (pottyLevel >= 58) {
    setPottySequencePhase(state, POTTY_SEQUENCE.SNIFFING, now, {
      cueIssuedAt: null,
      cueExpiresAt: null,
    });
    return;
  }

  if (pottyLevel >= 35) {
    setPottySequencePhase(state, POTTY_SEQUENCE.RISING, now, {
      cueIssuedAt: null,
      cueExpiresAt: null,
    });
    return;
  }

  setPottySequencePhase(state, POTTY_SEQUENCE.NONE, now, {
    cueIssuedAt: null,
    cueExpiresAt: null,
  });
}

function applyAccidentInternal(state, now = nowMs()) {
  const potty = ensurePottyMeta(state);
  potty.totalAccidents += 1;
  potty.lastAccidentAt = now;
  potty.ignoredCueCount = Math.min(Number(potty.ignoredCueCount || 0) + 1, 999);
  setPottySequencePhase(state, POTTY_SEQUENCE.MISSED, now, {
    cueIssuedAt: potty.sequence?.cueIssuedAt || now,
    cueExpiresAt: potty.sequence?.cueExpiresAt || now,
    lastMissedAt: now,
  });

  // Accidents leave a mess and hurt morale a bit.
  state.poopCount = Math.max(0, Number(state.poopCount || 0)) + 1;
  state.stats.cleanliness = clamp(
    Number(state.stats?.cleanliness || 0) - 12,
    0,
    100
  );
  state.stats.happiness = clamp(
    Number(state.stats?.happiness || 0) - 4,
    0,
    100
  );

  // Accidents usually wake the dog up.
  state.isAsleep = false;

  state.memory.lastSeenAt = now;
  state.lastAction = "accident";
  maybeSampleMood(state, now, "ACCIDENT");
}

function completeAdultTrainingSession(state, now = nowMs()) {
  const training = ensureTrainingState(state);
  const stage = state.lifeStage?.stage || DEFAULT_LIFE_STAGE.stage;
  if (stage === LIFE_STAGES.PUPPY) return;
  const adult = training.adult;
  const iso = getIsoDate(now);
  if (adult.lastCompletedDate === iso) return;

  if (adult.lastCompletedDate) {
    const lastDate = new Date(adult.lastCompletedDate);
    const currentDate = new Date(iso);
    const diffMs = currentDate.getTime() - lastDate.getTime();
    const diffDays = Math.round(diffMs / REAL_DAY_MS);
    adult.streak = diffDays === 1 ? adult.streak + 1 : 1;
  } else {
    adult.streak = 1;
  }

  adult.lastCompletedDate = iso;
  adult.misses = 0;
  adult.lastPenaltyDate = null;
  state.coins += 40;

  pushJournalEntry(state, {
    type: "TRAINING",
    moodTag: "FOCUSED",
    summary: "Adult training complete",
    body: `Today's obedience session is logged. Training streak: ${adult.streak}.`,
    timestamp: now,
  });
}

function applyAdultTrainingMissPenalty(state, now = nowMs()) {
  const training = ensureTrainingState(state);
  const stage = state.lifeStage?.stage || DEFAULT_LIFE_STAGE.stage;
  if (stage === LIFE_STAGES.PUPPY) return;

  const adult = training.adult;
  if (!adult.lastCompletedDate) return;

  const iso = getIsoDate(now);
  if (adult.lastPenaltyDate === iso) return;
  if (adult.lastCompletedDate === iso) return;

  const lastDate = new Date(adult.lastCompletedDate);
  const currentDate = new Date(iso);
  const diffMs = currentDate.getTime() - lastDate.getTime();
  const diffDays = Math.max(1, Math.round(diffMs / REAL_DAY_MS));

  adult.misses += diffDays;
  adult.streak = 0;
  adult.lastPenaltyDate = iso;
  state.stats.happiness = clamp(state.stats.happiness - diffDays * 3, 0, 100);

  pushJournalEntry(state, {
    type: "TRAINING",
    moodTag: "RESTLESS",
    summary: "Needs adult training",
    body: "Too many days without a training session. Schedule time to practice commands!",
    timestamp: now,
  });
}

function ensurePollState(state) {
  if (!state.polls) {
    state.polls = {
      active: null,
      lastPromptId: null,
      lastSpawnedAt: null,
      lastResolvedAt: null,
      history: [],
    };
  }
  if (!Array.isArray(state.polls.history)) {
    state.polls.history = [];
  }
  return state.polls;
}

function ensureSurpriseState(state) {
  if (!state.surprise || typeof state.surprise !== "object") {
    state.surprise = { ...initialSurprise };
    return state.surprise;
  }

  const surprise = state.surprise;
  if (typeof surprise.lastSpawnedAt !== "number") {
    surprise.lastSpawnedAt = null;
  }
  if (typeof surprise.lastResolvedAt !== "number") {
    surprise.lastResolvedAt = null;
  }
  if (!surprise.active || typeof surprise.active !== "object") {
    surprise.active = null;
    return surprise;
  }

  const active = surprise.active;
  const activeType = String(active.type || "").toUpperCase();
  if (!Object.values(SESSION_SURPRISE_TYPES).includes(activeType)) {
    surprise.active = null;
    return surprise;
  }
  active.type = activeType;
  active.id = String(active.id || "").trim() || null;
  active.title = String(active.title || "").trim() || null;
  active.message = String(active.message || "").trim() || null;
  if (typeof active.startedAt !== "number") {
    active.startedAt = nowMs();
  }
  if (activeType === SESSION_SURPRISE_TYPES.STOLEN_BUTTON) {
    const action = normalizeActionKey(active.stolenAction || "train");
    active.stolenAction = STOLENABLE_ACTION_KEYS.includes(action)
      ? action
      : "train";
  } else {
    active.stolenAction = null;
  }
  if (activeType === SESSION_SURPRISE_TYPES.DIG_HOLE) {
    active.holeId = String(active.holeId || "").trim() || null;
  } else {
    active.holeId = null;
  }

  return surprise;
}

function spawnDigHoleSurprise(state, now) {
  const surprise = ensureSurpriseState(state);
  const yard = ensureYardState(state);
  const holeId = `surprise-hole-${now}-${Math.random().toString(36).slice(2, 8)}`;
  const hole = {
    id: holeId,
    xPct: Math.round(randomBetween(18, 82)),
    yPct: Math.round(randomBetween(64, 82)),
    radius: Math.round(randomBetween(14, 28)),
    fillPct: Number(randomBetween(0.2, 0.55).toFixed(2)),
    spawnedAt: now,
  };
  yard.holes = [...(Array.isArray(yard.holes) ? yard.holes : []), hole].slice(
    -8
  );

  surprise.active = {
    id: `surprise-${now}-dig`,
    type: SESSION_SURPRISE_TYPES.DIG_HOLE,
    startedAt: now,
    title: "Yard Surprise",
    message: "Your pup started digging before you even tapped anything.",
    holeId,
    stolenAction: null,
  };
  surprise.lastSpawnedAt = now;

  state.stats.cleanliness = clamp(state.stats.cleanliness - 3, 0, 100);
  state.stats.energy = clamp(state.stats.energy - 2, 0, 100);
  state.stats.happiness = clamp(state.stats.happiness + 2, 0, 100);
  state.lastAction = "digging";
  applyFsmAction(state, "play", now);
  pushJournalEntry(state, {
    type: "SURPRISE",
    moodTag: "PLAYFUL",
    summary: "Caught digging at startup",
    body: "Your pup was already mid-dig when you opened the app.",
    timestamp: now,
  });
}

function spawnStolenButtonSurprise(state, now, options = {}) {
  const surprise = ensureSurpriseState(state);
  const stolenAction =
    STOLENABLE_ACTION_KEYS[
      Math.floor(Math.random() * STOLENABLE_ACTION_KEYS.length)
    ] || "train";
  const message =
    typeof options?.message === "string" && options.message.trim()
      ? options.message.trim()
      : "Your pup stole one control. Play fetch to win it back.";

  surprise.active = {
    id: `surprise-${now}-stolen`,
    type: SESSION_SURPRISE_TYPES.STOLEN_BUTTON,
    startedAt: now,
    title: "Button Heist",
    message,
    stolenAction,
    holeId: null,
  };
  surprise.lastSpawnedAt = now;

  state.stats.happiness = clamp(state.stats.happiness + 1, 0, 100);
  state.stats.mentalStimulation = clamp(
    Number(state.stats.mentalStimulation || 0) + 5,
    0,
    100
  );
  state.lastAction = "button_heist";
  applyFsmAction(state, "play", now);
  pushJournalEntry(state, {
    type: "SURPRISE",
    moodTag: "SASSY",
    summary: "Control stolen",
    body: "Your pup grabbed a control and ran. Fetch time.",
    timestamp: now,
  });
}

function maybeSpawnSessionSurprise(state, now = nowMs()) {
  const surprise = ensureSurpriseState(state);
  if (surprise.active) return surprise.active;
  const lastSpawnedAt = Number(surprise.lastSpawnedAt || 0);
  if (lastSpawnedAt && now - lastSpawnedAt < SESSION_SURPRISE_COOLDOWN_MS) {
    return null;
  }
  if (Math.random() > SESSION_SURPRISE_CHANCE) return null;

  spawnDigHoleSurprise(state, now);
  return surprise.active;
}

function spawnButtonHeistSurprise(state, now = nowMs(), options = {}) {
  const surprise = ensureSurpriseState(state);
  if (surprise.active) return null;

  const lastResolvedAt = Number(surprise.lastResolvedAt || 0);
  const minGapMs = Number(options?.minGapMs ?? 90_000);
  if (lastResolvedAt && now - lastResolvedAt < minGapMs) return null;

  const forcedAction = normalizeActionKey(options?.stolenAction || "");
  const forced = STOLENABLE_ACTION_KEYS.includes(forcedAction)
    ? forcedAction
    : null;

  const chosen =
    forced ||
    STOLENABLE_ACTION_KEYS[
      Math.floor(Math.random() * STOLENABLE_ACTION_KEYS.length)
    ] ||
    "train";

  spawnStolenButtonSurprise(state, now, options);
  if (surprise.active) {
    surprise.active.stolenAction = chosen;
    if (typeof options?.message === "string" && options.message.trim()) {
      surprise.active.message = options.message.trim();
    }
  }
  return surprise.active;
}

function maybeTriggerZoomiesBurst(state, now = nowMs()) {
  if (state.isAsleep) return false;
  const energy = Number(state.stats?.energy || 0);
  if (energy < 80) return false;

  const lastZoomiesAt = Number(state.memory?.lastZoomiesAt || 0);
  if (lastZoomiesAt && now - lastZoomiesAt < 45_000) return false;
  if (Math.random() > 0.15) return false;

  state.memory.lastZoomiesAt = now;
  state.stats.energy = clamp(state.stats.energy - 5, 0, 100);
  state.stats.happiness = clamp(state.stats.happiness + 3, 0, 100);
  state.lastAction = "zoomies";
  applyFsmAction(state, "play", now);
  maybeSampleMood(state, now, "ZOOMIES_BURST");
  return true;
}

function maybeTriggerAiDreamCue(state, now = nowMs()) {
  const energy = Number(state.stats?.energy || 0);
  const cue = String(state.emotionCue || "").toLowerCase();
  const isSleepyCue = cue === "sleepy" || cue === "tired";
  if (!isSleepyCue || energy > 0) return false;

  const lastDreamWoofAt = Number(state.memory?.lastDreamWoofAt || 0);
  if (lastDreamWoofAt && now - lastDreamWoofAt < 60_000) return false;
  if (Math.random() > 0.25) return false;

  state.memory.lastDreamWoofAt = now;
  state.isAsleep = true;
  state.lastAction = "dream_woof";
  applyFsmAction(state, "rest", now);
  maybeGenerateDream(state, now);
  maybeSampleMood(state, now, "AI_DREAM_WOOF");
  return true;
}

function maybeTriggerGuiltyPaws(state, now = nowMs(), source = "feed") {
  const key = normalizeActionKey(source);
  const chance = key === "potty" ? 0.12 : 0.18;
  const lastGuiltyPawsAt = Number(state.memory?.lastGuiltyPawsAt || 0);
  if (lastGuiltyPawsAt && now - lastGuiltyPawsAt < 8 * 60 * 1000) {
    return false;
  }
  if (Math.random() > chance) return false;

  state.memory.lastGuiltyPawsAt = now;
  state.stats.happiness = clamp(state.stats.happiness - 1, 0, 100);
  state.lastAction = "guilty_paws";
  maybeSampleMood(state, now, "GUILTY_PAWS");
  return true;
}

function pickNextPoll(previousId) {
  const prompts = DOG_POLL_CONFIG?.prompts || [];
  if (!prompts.length) return null;
  const pool = prompts.filter((p) => p.id !== previousId);
  const selection = pool.length ? pool : prompts;
  const index = Math.floor(Math.random() * selection.length);
  return selection[index] || null;
}

function applyPollEffects(state, effects = {}) {
  Object.entries(effects).forEach(([stat, delta]) => {
    if (typeof state.stats?.[stat] !== "number") return;
    state.stats[stat] = clamp(state.stats[stat] + delta, 0, 100);
  });
}

function spawnDogPollInternal(state, now = nowMs()) {
  const pollState = ensurePollState(state);
  if (pollState.active) return pollState.active;
  const next = pickNextPoll(pollState.lastPromptId);
  if (!next) return null;

  pollState.active = {
    id: next.id,
    prompt: next.prompt,
    effects: next.effects || {},
    startedAt: now,
    expiresAt: now + (DOG_POLL_CONFIG?.timeoutMs || 60000),
  };
  pollState.lastPromptId = next.id;
  pollState.lastSpawnedAt = now;
  return pollState.active;
}

function resolveActivePoll(state, { accepted, reason, now = nowMs() }) {
  const pollState = ensurePollState(state);
  const active = pollState.active;
  if (!active) return;

  if (accepted) {
    applyPollEffects(state, active.effects);
    applyXp(state, 4);
    maybeSampleMood(state, now, "POLL_ACCEPT");
    pushJournalEntry(state, {
      type: "POLL",
      moodTag: "HAPPY",
      summary: "You handled a dog poll",
      body: `You said yes to: ${active.prompt}`,
      timestamp: now,
    });
  } else {
    const penalty = reason === "TIMEOUT" ? 6 : 4;
    state.stats.happiness = clamp(state.stats.happiness - penalty, 0, 100);
    maybeSampleMood(
      state,
      now,
      reason === "TIMEOUT" ? "POLL_TIMEOUT" : "POLL_DECLINE"
    );
    pushJournalEntry(state, {
      type: "POLL",
      moodTag: "SASSY",
      summary: "Ignored pup feedback",
      body:
        reason === "TIMEOUT"
          ? "The pup asked for help and eventually gave up."
          : "You said no this time. They took note!",
      timestamp: now,
    });
  }

  pollState.history.unshift({
    id: active.id,
    prompt: active.prompt,
    accepted,
    reason: reason || (accepted ? "ACCEPT" : "DECLINE"),
    resolvedAt: now,
  });
  if (pollState.history.length > 20) {
    pollState.history.length = 20;
  }

  pollState.active = null;
  pollState.lastResolvedAt = now;
  finalizeDerivedState(state, now);
}

/* ---------------------- slice ---------------------- */

const dogSlice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    hydrateDog(state, { payload }) {
      if (!payload || typeof payload !== "object") return;
      const now = nowMs();

      const adoptedAt =
        parseAdoptedAt(payload.adoptedAt) ?? parseAdoptedAt(state.adoptedAt);

      const merged = deepMergeDefined(initialState, state, payload);
      merged.adoptedAt = adoptedAt;
      merged.lastAction =
        payload.lastAction ?? state.lastAction ?? initialState.lastAction;
      merged.cleanlinessTier = merged.cleanlinessTier || "FRESH";
      ensureDogIdentityState(merged, { adoptedAtFallback: adoptedAt });

      if (!merged.temperament || typeof merged.temperament !== "object") {
        merged.temperament = { ...initialTemperament };
      }
      ensureTemperamentState(merged);
      merged.temperament.adoptedAt = adoptedAt;

      const lastReward = Number(merged.lastRewardClaimedAt);
      merged.lastRewardClaimedAt = Number.isFinite(lastReward)
        ? lastReward
        : null;
      const streakDays = Number(merged.consecutiveDays ?? 0);
      merged.consecutiveDays = Number.isFinite(streakDays)
        ? Math.max(0, Math.floor(streakDays))
        : 0;
      merged.claimedPreReg = Boolean(merged.claimedPreReg);
      const preRegClaimedAt = Number(merged.claimedPreRegAt);
      merged.claimedPreRegAt = Number.isFinite(preRegClaimedAt)
        ? preRegClaimedAt
        : null;

      ensureTrainingState(merged);
      ensureJournalState(merged);
      ensureMemoryState(merged);
      ensurePollState(merged);
      ensureAnimationState(merged);
      ensureYardState(merged);
      ensurePersonalityState(merged);
      ensureHealthSiloState(merged);
      ensureInventoryState(merged);
      ensureDreamState(merged);
      ensureVacationState(merged);
      ensureDogFsmState(merged);
      ensureSkillTreeState(merged);
      ensureMilestonesState(merged);
      ensureIdentityContentState(merged);
      ensureLifecycleStatus(merged);
      ensureDangerState(merged);
      ensureLegacyJourneyState(merged);
      ensureSurpriseState(merged);

      const missingCareRuntimeState =
        adoptedAt &&
        !payload?.stats &&
        !payload?.memory &&
        !Number.isFinite(Number(payload?.lastUpdatedAt));
      if (missingCareRuntimeState) {
        merged.stats = { ...DEFAULT_STATS };
        merged.cleanlinessTier = "FRESH";
        merged.memory = {
          ...initialMemory,
          favoriteToyId: merged.memory?.favoriteToyId || null,
          lastSeenAt: now,
        };
      }

      const ageNow = getVacationAdjustedNow(merged, now);
      const age = calculateDogAge(adoptedAt, ageNow);
      merged.lifeStage = {
        stage: age?.stageId || DEFAULT_LIFE_STAGE.stage,
        label: age?.stageLabel || DEFAULT_LIFE_STAGE.label,
        days: Number.isFinite(Number(age?.ageInGameDays))
          ? Number(age.ageInGameDays)
          : 0,
      };
      reconcileImpossibleFarewellState(merged, now);

      if (!Number.isFinite(Number(merged.lastUpdatedAt))) {
        merged.lastUpdatedAt = now;
      }

      applyOfflineCatchUp(merged, now);
      normalizeStatsState(merged);
      finalizeDerivedState(merged, now);

      if (missingCareRuntimeState && adoptedAt) {
        const legacy = ensureLegacyJourneyState(merged);
        const danger = ensureDangerState(merged);
        merged.lifecycleStatus = DOG_LIFECYCLE_STATUS.ACTIVE;
        merged.adoptedAt = adoptedAt;
        merged.lastAction = null;
        legacy.farewellLetterAt = null;
        legacy.rainbowBridgeReadyAt = null;
        danger.rescuedAt = null;
        danger.rescueReason = null;
        syncLifecycleState(merged, now);
      }

      refreshDailyIdentityFlavor(merged, now);

      return merged;
    },

    setDogName(state, { payload }) {
      state.name = sanitizeDogName(payload, state.name || "Pup");
      ensureDogIdentityState(state);
    },

    setAdoptedAt(state, { payload }) {
      const adoptedAt = parseAdoptedAt(payload) ?? nowMs();
      const legacy = ensureLegacyJourneyState(state);
      const priorStatus = ensureLifecycleStatus(state);
      const resetForNewAdoption =
        priorStatus === DOG_LIFECYCLE_STATUS.RESCUED ||
        priorStatus === DOG_LIFECYCLE_STATUS.FAREWELL ||
        priorStatus === DOG_LIFECYCLE_STATUS.NONE;

      // Starting a fresh pup after rescue/farewell resets care-sensitive runtime fields.
      if (resetForNewAdoption) {
        const obedienceReset = Object.fromEntries(
          Object.keys(initialSkills.obedience || {}).map((id) => [
            id,
            { level: 0, xp: 0 },
          ])
        );
        state.stats = { ...DEFAULT_STATS };
        state.lifeStage = { ...DEFAULT_LIFE_STAGE };
        state.cleanlinessTier = "FRESH";
        state.poopCount = 0;
        state.pottyLevel = 0;
        state.potty = {
          training: 0,
          lastSuccessAt: null,
          lastAccidentAt: null,
          totalSuccesses: 0,
          totalAccidents: 0,
        };
        state.memory = { ...initialMemory };
        state.training = createInitialTrainingState();
        state.skills = { obedience: obedienceReset };
        state.mood = { ...initialMood };
        state.moodlets = [];
        state.emotionCue = null;
        state.isAsleep = false;
        state.lastAction = null;
        state.fsm = { ...DOG_FSM_DEFAULT };
        state.memorial = { ...initialMemorial };
        state.danger = { ...initialDanger };
        state.temperament = { ...initialTemperament };
        state.personality = { ...initialPersonality };
        state.healthSilo = { ...initialHealthSilo };
        state.surprise = { ...initialSurprise };
        state.identity = { ...DEFAULT_DOG_IDENTITY };
        state.identityContent = createInitialIdentityContentState();
      }

      state.lifecycleStatus = DOG_LIFECYCLE_STATUS.ACTIVE;
      ensureTemperamentState(state);
      state.temperament.adoptedAt = adoptedAt;
      state.adoptedAt = adoptedAt;
      state.lastUpdatedAt = adoptedAt;
      state.memory.lastFedAt = adoptedAt;
      state.memory.lastSeenAt = adoptedAt;
      ensureDogIdentityState(state, { adoptedAtFallback: adoptedAt });
      ensureIdentityContentState(state);
      applyLegacyAdoptionBonuses(state, adoptedAt);

      if (legacy.ghostPlayBowPending) {
        legacy.ghostPlayBowPending = false;
        legacy.ghostPlayBowAt = adoptedAt;
        pushJournalEntry(state, {
          type: "LEGACY",
          moodTag: "PROUD",
          summary: "Ghost dog play bow",
          body: "At the gate, your new pup and the ghost of your old friend shared a gentle play bow.",
          timestamp: adoptedAt,
        });
      }

      ensurePersonalityState(state);
      finalizeDerivedState(state, adoptedAt);
      refreshDailyIdentityFlavor(state, adoptedAt);
    },

    setCareerLifestyle(state, { payload }) {
      const { lifestyle, perks } = payload || {};
      state.career.lifestyle = lifestyle || null;
      state.career.chosenAt = nowMs();
      if (perks && typeof perks === "object") {
        state.career.perks = { ...state.career.perks, ...perks };
      }
    },

    acknowledgeGrowthMilestone(state) {
      const milestones = ensureMilestonesState(state);
      if (!milestones.pending) return;
      milestones.lastCelebratedStage = milestones.pending.toStage || null;
      milestones.lastCelebratedAt = nowMs();
      milestones.pending = null;
    },

    ackTemperamentReveal(state, { payload }) {
      const now = payload?.now ?? nowMs();
      if (state.temperament.revealedAt) {
        state.temperament.revealReady = false;
        return;
      }
      state.temperament.revealedAt = now;
      const bonusXp = Number(payload?.xp || 0);
      if (bonusXp > 0) {
        applyXp(state, bonusXp);
      }
      state.temperament.revealReady = false;
    },

    markTemperamentRevealed(state) {
      state.temperament.revealedAt = nowMs();
      state.temperament.revealReady = false;
    },

    unlockTrick(state, { payload }) {
      const now = payload?.now ?? nowMs();
      const trickId = payload?.trickId
        ? String(payload.trickId).trim()
        : String(payload || "").trim();
      if (!trickId) return;
      unlockObedienceCommand(state, trickId, now);
      finalizeDerivedState(state, now);
    },

    updateFavoriteToy(state, { payload }) {
      const favoriteToyId = payload ? String(payload) : null;
      state.memory.favoriteToyId = favoriteToyId;
      ensureIdentityContentState(state).preferences.favoriteToyId =
        favoriteToyId;
    },

    setActiveToy(state, { payload }) {
      const toyId = String(payload?.toyId || payload || "").trim();
      if (!toyId) return;
      const unlocked = new Set(
        Array.isArray(state?.cosmetics?.unlockedIds)
          ? state.cosmetics.unlockedIds
          : []
      );
      if (!unlocked.has(toyId)) return;
      const inventory = ensureInventoryState(state);
      inventory.activeToyId = toyId;
      state.lastAction = "equip_toy";
    },

    buyPremiumKibblePack(state, { payload }) {
      const amount = Math.max(0, Math.floor(Number(payload?.amount || 0)));
      if (!amount) return;
      const inventory = ensureInventoryState(state);
      inventory.premiumKibble = Math.max(
        0,
        Number(inventory.premiumKibble || 0)
      );
      inventory.premiumKibble += amount;
      state.lastAction = "purchase_premium_kibble";
      pushJournalEntry(state, {
        type: "CARE",
        moodTag: "PROUD",
        summary: "Premium kibble stocked",
        body: `Added ${amount} premium kibble bowls to your pantry.`,
        timestamp: nowMs(),
      });
    },

    /* ------------- care actions ------------- */

    feed(state, { payload }) {
      applyFeedEffect(state, payload);
    },

    quickFeed(state, { payload }) {
      const now = payload?.now ?? nowMs();
      normalizeStatsState(state);
      ensureMemoryState(state);
      applyDecay(state, now);
      wakeForInteraction(state);
      const hungerBefore = Number(state.stats.hunger || 0);

      state.stats.hunger = clamp(
        Math.max(0, Number(state.stats.hunger || 0) - 60),
        0,
        100
      );
      state.stats.energy = clamp(Number(state.stats.energy || 0) + 16, 0, 100);
      state.stats.happiness = clamp(
        Number(state.stats.happiness || 0) + (hungerBefore >= 50 ? 5 : 2),
        0,
        100
      );
      restoreAffectionAndTrust(state, 4);
      relieveNeglectWithCare(state, 1);

      state.memory.lastFedAt = now;
      state.memory.lastFedFoodType = "quick_feed";
      state.memory.lastSeenAt = now;
      updateFavoriteFoodPreference(state, "regular_kibble", now);
      state.lastAction = resolveActionOverride(payload, "feed_quick");
      applyFsmAction(state, "feed", now);

      applyBondGain(state, hungerBefore >= 50 ? 0.8 : 0.35, now);
      applyXp(state, hungerBefore >= 50 ? 4 : 2);
      maybeSampleMood(state, now, "FEED");
      pushStructuredMemory(state, {
        type: "ate_food",
        category: "CARE",
        moodTag: "ENERGIZED",
        summary: "Quick-fed and recharged.",
        body: "A fast meal topped your pup back up and restored a burst of energy.",
        timestamp: now,
        happiness: 3,
        hunger: Number(state.stats.hunger || 0),
        energy: Number(state.stats.energy || 0),
      });
      markDailyCareCategory(state, "feed", now);
      setCareResponse(state, {
        key: "quick-feed",
        label: "Quick feed",
        message:
          hungerBefore >= 50
            ? "Fast meal handled the real need without turning care into grinding."
            : "They took a few bites, but it was more check-in than meal.",
        tone: "amber",
        icon: "food",
        now,
      });
      updateTemperamentReveal(state, now);
      finalizeDerivedState(state, now);
    },

    dropFoodBowl(state, { payload }) {
      const now = payload?.now ?? nowMs();
      const yard = ensureYardState(state);
      const xNorm = clamp(Number(payload?.xNorm ?? 0.55), 0.05, 0.95);
      const yNorm = clamp(Number(payload?.yNorm ?? 0.75), 0.05, 0.95);
      const readyDelayMs = Number(payload?.readyDelayMs ?? 900);
      const placedAt = now;
      const readyAt = placedAt + Math.max(0, readyDelayMs);

      yard.foodBowl = {
        id: `${placedAt}-${Math.random().toString(36).slice(2, 8)}`,
        xNorm,
        yNorm,
        placedAt,
        readyAt,
      };
    },

    tryConsumeFoodBowl(state, { payload }) {
      const now = payload?.now ?? nowMs();
      const hungerThreshold = payload?.hungerThreshold ?? 50;
      maybeConsumeFoodBowl(state, now, {
        hungerThreshold,
        action: payload?.action || "feed",
      });
    },

    giveWater(state, { payload }) {
      const now = payload?.now ?? nowMs();
      applyDecay(state, now);
      wakeForInteraction(state);
      const thirstBefore = Number(state.stats.thirst || 0);

      const amount = payload?.amount ?? 100;
      state.stats.thirst = clamp(state.stats.thirst - amount, 0, 100);
<<<<<<< HEAD
      state.stats.happiness = clamp(state.stats.happiness + 2, 0, 100);
=======
      state.stats.happiness = clamp(
        state.stats.happiness + (thirstBefore >= 45 ? 3 : 1),
        0,
        100
      );
>>>>>>> 10f88903 (chore: remove committed backup folders)
      restoreAffectionAndTrust(state, 3);
      relieveNeglectWithCare(state, 1);

      state.memory.lastDrankAt = now;
      state.memory.lastSeenAt = now;
      state.lastAction = resolveActionOverride(payload, "water");
      applyFsmAction(state, "water", now);

      const sweetBondMultiplier = hasTemperamentTag(state, "SWEET") ? 1.25 : 1;
      applyBondGain(
        state,
        (thirstBefore >= 55 ? 0.75 : 0.3) * sweetBondMultiplier,
        now
      );
      gainPottyNeed(state, 18);

      applyXp(state, thirstBefore >= 45 ? 3 : 1);
      maybeSampleMood(state, now, "WATER");
      pushStructuredMemory(state, {
        type: "drank_water",
        category: "CARE",
        moodTag: thirstBefore >= 55 ? "RELIEVED" : "CONTENT",
        summary: "Fresh water offered.",
        body:
          thirstBefore >= 55
            ? "Fresh water clearly helped. Your pup drank and settled."
            : "They checked the bowl and took a small drink.",
        timestamp: now,
        happiness: thirstBefore >= 55 ? 2 : 1,
        energy: Number(state.stats.energy || 0),
      });
      markDailyCareCategory(state, "water", now);
      setCareResponse(state, {
        key: "water",
        label: "Water",
        message:
          thirstBefore >= 55
            ? "They drank like they needed it. Hydration helped mood and health."
            : "Water was available before it became a problem.",
        tone: "sky",
        icon: "water",
        now,
      });
      const date = getIsoDate(now);
      updateStreak(state.streak, date);
      updateTemperamentReveal(state, now);
      finalizeDerivedState(state, now);
    },

    play(state, { payload }) {
      const now = payload?.now ?? nowMs();
      applyDecay(state, now);
      wakeForInteraction(state);

      const inventory = ensureInventoryState(state);
      const unlocked = new Set(
        Array.isArray(state?.cosmetics?.unlockedIds)
          ? state.cosmetics.unlockedIds
          : []
      );
      let activeToyId = payload?.toyId
        ? String(payload.toyId).trim()
        : String(inventory.activeToyId || "").trim();
      if (!activeToyId || !unlocked.has(activeToyId)) {
        activeToyId = "toy_tennis_ball_basic";
      }
      inventory.activeToyId = activeToyId;
      updateFavoriteToyPreference(state, activeToyId, now);
      const toyProfile =
        TOY_PLAY_PROFILES[activeToyId] ||
        TOY_PLAY_PROFILES.toy_tennis_ball_basic;

      const zoomiesMultiplier = payload?.timeOfDay === "MORNING" ? 2 : 1;
      const careerMultiplier =
        state.career.perks?.happinessGainMultiplier || 1.0;
      const energyBefore = Number(state.stats.energy || 0);
      const hungerBefore = Number(state.stats.hunger || 0);
      const thirstBefore = Number(state.stats.thirst || 0);
      const isCareReady =
        energyBefore >= 25 && hungerBefore < 80 && thirstBefore < 82;
      if (!isCareReady) {
        state.stats.happiness = clamp(state.stats.happiness + 1, 0, 100);
        state.stats.energy = clamp(state.stats.energy - 2, 0, 100);
        state.memory.lastSeenAt = now;
        state.lastAction = "play_declined";
        applyFsmAction(state, energyBefore < 25 ? "rest" : "idle", now);
        maybeSampleMood(state, now, "PLAY_DECLINED");
        pushStructuredMemory(state, {
          type: "play_declined",
          category: "CARE",
          moodTag: energyBefore < 25 ? "SLEEPY" : "UNEASY",
          summary: "Play did not land.",
          body:
            energyBefore < 25
              ? "Your pup was too tired for a real play session and needed rest instead."
              : "Basic needs were too loud for play to feel fun yet.",
          timestamp: now,
          happiness: 1,
          energy: Number(state.stats.energy || 0),
        });
        setCareResponse(state, {
          key: "play",
          label: "Play",
          message:
            energyBefore < 25
              ? "They tried to engage, then faded. Rest matters before play."
              : "They could not fully play while hunger or thirst was pulling focus.",
          tone: "amber",
          icon: "play",
          now,
        });
        updateTemperamentReveal(state, now);
        finalizeDerivedState(state, now);
        return;
      }

      const perks = getPersonalityPerks(state);
      const toyObsessed = getTemperamentTraitIntensity(state, "toyObsessed");
      const nextStats = calculatePlayStats({
        stats: state.stats,
        baseHappiness: payload?.happinessGain ?? toyProfile.baseHappiness ?? 15,
        zoomiesMultiplier,
        careerHappinessMultiplier: careerMultiplier,
        playHappinessBonus: perks.playHappinessBonus,
        toyObsessedIntensity: toyObsessed,
        playEnergyCostMultiplier: perks.playEnergyCostMultiplier,
      });
      state.stats.happiness = nextStats.happiness;
      state.stats.energy = nextStats.energy;
      if (toyProfile.preyDriveBonus && toyObsessed >= 65) {
        state.stats.happiness = clamp(
          state.stats.happiness + toyProfile.preyDriveBonus,
          0,
          100
        );
      }
      if (toyProfile.boredomRelief) {
        state.stats.mentalStimulation = clamp(
          Number(state.stats.mentalStimulation || 0) + toyProfile.boredomRelief,
          0,
          100
        );
      }
      if (toyProfile.extraEnergyCost) {
        state.stats.energy = clamp(
          state.stats.energy - toyProfile.extraEnergyCost,
          0,
          100
        );
      }
      restoreAffectionAndTrust(state, 6);
      relieveNeglectWithCare(state, 1);

      state.memory.lastPlayedAt = now;
      state.memory.lastSeenAt = now;
      state.lastAction = resolveActionOverride(
        payload,
        toyProfile.overrideAction || "play"
      );
      trackTemperamentMetric(state, "playSessions", 1, now);
      applyFsmAction(state, "play", now);

      const legacy = ensureLegacyJourneyState(state);
      const sameLegacyToy =
        !!activeToyId &&
        !!legacy.favoriteToyId &&
        activeToyId.toLowerCase() ===
          String(legacy.favoriteToyId).toLowerCase();
      if (sameLegacyToy) {
        const lastBonusAt = Number(legacy.lastFavoriteToyBonusAt || 0);
        const canAward = !lastBonusAt || now - lastBonusAt >= 60 * 60 * 1000;
        if (canAward) {
          legacy.lastFavoriteToyBonusAt = now;
          state.stats.happiness = clamp(state.stats.happiness + 4, 0, 100);
          applyXp(state, 3);
          pushJournalEntry(state, {
            type: "LEGACY",
            moodTag: "PROUD",
            summary: "Favorite toy memory activated",
            body: "Playing with a remembered favorite toy sparked a legacy joy bonus.",
            timestamp: now,
          });
        }
      }

      const sweetBondMultiplier = hasTemperamentTag(state, "SWEET") ? 1.35 : 1;
      applyBondGain(
        state,
        (2 + Number(toyProfile.bondBonus || 0)) * sweetBondMultiplier,
        now
      );
      state.stats.thirst = nextStats.thirst;
      gainPottyNeed(state, 12);

      applyPersonalityShift(state, {
        now,
        source: "PLAY",
        deltas: {
          adventurous: 2,
          social: 2,
          energetic: 1,
          playful: 3,
          affectionate: 1,
        },
      });

      applyXp(state, 8);
      maybeSampleMood(state, now, "PLAY");
      pushStructuredMemory(state, {
        type: "played_with_toy",
        category: "CARE",
        moodTag: "PLAYFUL",
        summary: "Played with a toy.",
        body: `Your pup had a play session with ${String(
          toyProfile?.label || activeToyId || "a favorite toy"
        )
          .replace(/[_-]+/g, " ")
          .trim()}.`,
        timestamp: now,
        happiness: 6,
        energy: Number(state.stats.energy || 0),
      });

      markDailyCareCategory(state, "bond", now);
      setCareResponse(state, {
        key: "play",
        label: "Play",
        message:
          energyBefore >= 70
            ? "They met you with real play energy. Bond grew because the timing was right."
            : "A short play burst helped mood without overworking them.",
        tone: "emerald",
        icon: "play",
        now,
      });

      const date = getIsoDate(now);
      updateStreak(state.streak, date);
      updateTemperamentReveal(state, now);
      finalizeDerivedState(state, now);
    },

    petDog(state, { payload }) {
      const now = payload?.now ?? nowMs();
      applyDecay(state, now);
      wakeForInteraction(state);

      state.memory.lastSeenAt = now;
      const sweetBondMultiplier = hasTemperamentTag(state, "SWEET") ? 1.45 : 1;
      const energy = Number(state.stats?.energy || 0);
      const happiness = Number(state.stats?.happiness || 0);
      const isSpicy = hasTemperamentTag(state, "SPICY");
      const isAdoptOnboarding =
        String(payload?.source || "") === "adopt_onboarding";

      const dozeChance = energy <= 30 ? 0.3 : energy <= 55 ? 0.18 : 0.08;
      const zoomiesChance = happiness >= 75 ? 0.24 : 0.14;
      const sassChance = isSpicy ? 0.16 : 0.09;
      const roll = Math.random();
      trackTemperamentMetric(state, "totalTaps", 1, now);
      restoreAffectionAndTrust(state, 12);
      relieveNeglectWithCare(state, 1);

      let outcome = "PET_CUDDLE";
      let threshold = dozeChance;
      if (roll <= threshold) {
        outcome = "PET_DOZE";
      } else {
        threshold += zoomiesChance;
        if (roll <= threshold) {
          outcome = "PET_ZOOMIES";
        } else {
          threshold += sassChance;
          if (roll <= threshold) {
            outcome = "PET_SIDE_EYE";
          }
        }
      }

      if (outcome === "PET_DOZE") {
        state.stats.energy = clamp(state.stats.energy + 10, 0, 100);
        state.stats.happiness = clamp(state.stats.happiness + 2, 0, 100);
        applyBondGain(state, 0.85 * sweetBondMultiplier, now);
        state.lastAction = resolveActionOverride(payload, "pet_doze_off");
        applyFsmAction(state, "pet", now);
        applyPersonalityShift(state, {
          now,
          source: "PET",
          deltas: { affectionate: 2, energetic: -1 },
        });
        applyXp(state, 2);
      } else if (outcome === "PET_ZOOMIES") {
        state.stats.happiness = clamp(state.stats.happiness + 6, 0, 100);
        state.stats.energy = clamp(state.stats.energy - 4, 0, 100);
        state.stats.thirst = clamp(state.stats.thirst + 2, 0, 100);
        applyBondGain(state, 1.05 * sweetBondMultiplier, now);
        state.lastAction = resolveActionOverride(payload, "pet_zoomies");
        applyFsmAction(state, "play", now);
        applyPersonalityShift(state, {
          now,
          source: "PET",
          deltas: { affectionate: 1, social: 1, playful: 2, energetic: 1 },
        });
        applyXp(state, 4);
      } else if (outcome === "PET_SIDE_EYE") {
        state.stats.happiness = clamp(state.stats.happiness - 1, 0, 100);
        applyBondGain(state, 0.55 * sweetBondMultiplier, now);
        state.lastAction = resolveActionOverride(payload, "pet_side_eye");
        applyFsmAction(state, "pet", now);
        applyPersonalityShift(state, {
          now,
          source: "PET",
          deltas: { affectionate: 1, social: -1 },
        });
        applyXp(state, 1);
      } else {
        state.stats.happiness = clamp(state.stats.happiness + 4, 0, 100);
        applyBondGain(state, 1.65 * sweetBondMultiplier, now);
        state.lastAction = resolveActionOverride(payload, "pet_cuddle");
        applyFsmAction(state, "pet", now);
        applyPersonalityShift(state, {
          now,
          source: "PET",
          deltas: { affectionate: 3, social: 1 },
        });
        applyXp(state, 3);
      }

      pushStructuredMemory(state, {
        type: "petted",
        category: "CARE",
        moodTag:
          outcome === "PET_SIDE_EYE"
            ? "SASSY"
            : outcome === "PET_DOZE"
              ? "CALM"
              : "AFFECTIONATE",
        summary: isAdoptOnboarding
          ? "First hello in the yard."
          : outcome === "PET_ZOOMIES"
            ? "Petted into zoomies."
            : outcome === "PET_SIDE_EYE"
              ? "Got a little side-eye."
              : outcome === "PET_DOZE"
                ? "Petted into a dozy calm."
                : "Shared a good petting moment.",
        body: isAdoptOnboarding
          ? "Your first gentle touch helped your pup settle in."
          : outcome === "PET_ZOOMIES"
            ? "The attention turned into instant play energy and a burst of happy movement."
            : outcome === "PET_SIDE_EYE"
              ? "Your pup accepted the attention, but with a classic terrier opinion attached."
              : outcome === "PET_DOZE"
                ? "The petting was so relaxing that your pup started drifting off."
                : "A few good pets noticeably lifted your pup's mood.",
        timestamp: now,
        happiness:
          outcome === "PET_SIDE_EYE"
            ? -1
            : outcome === "PET_ZOOMIES"
              ? 4
              : outcome === "PET_DOZE"
                ? 2
                : 3,
        energy: Number(state.stats.energy || 0),
      });
      markDailyCareCategory(state, "bond", now);
      setCareResponse(state, {
        key: "pet",
        label: "Affection",
        message: isAdoptOnboarding
          ? "They leaned in. The first bond memory is saved."
          : outcome === "PET_SIDE_EYE"
            ? "They accepted it on their terms. Trust still moved, just quietly."
            : outcome === "PET_DOZE"
              ? "They relaxed into your touch and started to settle."
              : outcome === "PET_ZOOMIES"
                ? "The attention sparked happy movement instead of routine points."
                : "They leaned into the attention. This is where bond starts to feel real.",
        tone: outcome === "PET_SIDE_EYE" ? "amber" : "rose",
        icon: "bond",
        now,
      });

      maybeSampleMood(state, now, outcome);
      updateTemperamentReveal(state, now);
      finalizeDerivedState(state, now);
    },

    rest(state, { payload }) {
      const now = payload?.now ?? nowMs();
      applyDecay(state, now);

      const perks = getPersonalityPerks(state);
      const skillMods = getSkillTreeModifiersFromDogState(state);
      const restEnergyGainMultiplier = skillMods.restEnergyGainMultiplier || 1;

      // Avoid "energy spam" if the user taps Rest repeatedly while already asleep.
      if (state.isAsleep) {
        state.memory.lastSeenAt = now;
        state.lastAction = resolveActionOverride(payload, "rest");
        applyFsmAction(state, "rest", now);
        setCareResponse(state, {
          key: "rest",
          label: "Rest",
          message:
            "They are already asleep. You protected the quiet instead of poking for rewards.",
          tone: "sky",
          icon: "rest",
          now,
        });
        finalizeDerivedState(state, now);
        return;
      }

      state.isAsleep = true;
      state.stats.energy = clamp(
        state.stats.energy +
          20 * perks.restEnergyBonus * restEnergyGainMultiplier,
        0,
        100
      );
      state.stats.happiness = clamp(state.stats.happiness + 3, 0, 100);
      restoreAffectionAndTrust(state, 4);
      relieveNeglectWithCare(state, 1);

      state.memory.lastSeenAt = now;
      updateFavoriteNapSpotPreference(state, payload?.napSpotId || "yard", now);
      state.lastAction = resolveActionOverride(payload, "rest");
      applyFsmAction(state, "rest", now);

      const sweetBondMultiplier = hasTemperamentTag(state, "SWEET") ? 1.2 : 1;
      applyBondGain(state, 0.5 * sweetBondMultiplier, now);

      maybeGenerateDream(state, now);
      markDailyCareCategory(state, "rest", now);

      applyPersonalityShift(state, {
        now,
        source: "REST",
        deltas: {
          energetic: -2,
          adventurous: -1,
          playful: -1,
          affectionate: 1,
        },
      });

      applyXp(state, 3);
      maybeSampleMood(state, now, "REST");
      pushStructuredMemory(state, {
        type: "rested",
        category: "CARE",
        moodTag: "CALM",
        summary: "Settled down to rest.",
        body: "You let your pup recover instead of pushing another action.",
        timestamp: now,
        happiness: 2,
        energy: Number(state.stats.energy || 0),
      });
      setCareResponse(state, {
        key: "rest",
        label: "Rest",
        message:
          "They settled down. Recovery is part of care, not a skipped turn.",
        tone: "sky",
        icon: "rest",
        now,
      });
      updateTemperamentReveal(state, now);
      finalizeDerivedState(state, now);
    },

    wakeUp(state, { payload }) {
      const now = payload?.now ?? nowMs();
      applyDecay(state, now);

      state.isAsleep = false;
      state.lastAction = "wake";

      const dreams = ensureDreamState(state);
      dreams.active = null;

      // Typical "wake up" routine: they often need a bathroom break + water.
      gainPottyNeed(state, 20);
      state.stats.thirst = clamp(state.stats.thirst + 3, 0, 100);

      state.memory.lastSeenAt = now;
      maybeSampleMood(state, now, "WAKE");
      finalizeDerivedState(state, now);
    },

    triggerManualAction(state, { payload }) {
      const now = payload?.now ?? nowMs();
      const action = String(payload?.action || "").trim();
      if (!action) return;

      applyDecay(state, now);
      wakeForInteraction(state);

      const stats = payload?.stats || {};
      if (stats && typeof stats === "object") {
        if (typeof stats.energy === "number") {
          state.stats.energy = clamp(state.stats.energy + stats.energy, 0, 100);
        }
        if (typeof stats.hunger === "number") {
          state.stats.hunger = clamp(state.stats.hunger + stats.hunger, 0, 100);
        }
        if (typeof stats.thirst === "number") {
          state.stats.thirst = clamp(state.stats.thirst + stats.thirst, 0, 100);
        }
        if (typeof stats.happiness === "number") {
          state.stats.happiness = clamp(
            state.stats.happiness + stats.happiness,
            0,
            100
          );
        }
        if (typeof stats.cleanliness === "number") {
          state.stats.cleanliness = clamp(
            state.stats.cleanliness + stats.cleanliness,
            0,
            100
          );
        }
      }

      const bondDelta = Number(payload?.bondDelta ?? 0);
      if (bondDelta) {
        applyBondGain(state, bondDelta, now);
      }

      const commandId = payload?.commandId
        ? String(payload.commandId).trim()
        : "";
      if (commandId) {
        state.memory.lastTrainedCommandId = commandId;
        state.memory.lastTrainedAt = now;
      }

      if (action !== "sleep" && action !== "rest") {
        state.isAsleep = false;
      }

      state.memory.lastSeenAt = now;
      state.lastAction = action;
      applyFsmAction(state, action, now);
      finalizeDerivedState(state, now);
    },

    setMood(state, { payload }) {
      const animation = ensureAnimationState(state);
      const mood = normalizeActionKey(payload || "ok") || "ok";
      animation.mood = mood;
      if (!animation.overrideUntilDone) {
        animation.desiredAction = deriveDesiredActionFromMood(mood);
      }
    },

    setDesiredAction(state, { payload }) {
      const animation = ensureAnimationState(state);
      animation.desiredAction = normalizeActionKey(payload) || "idle";
    },

    triggerOneShot(state, { payload }) {
      const animation = ensureAnimationState(state);

      const action =
        typeof payload === "string" ? payload : payload?.action || "";

      const normalized = normalizeActionKey(action);

      if (!normalized) return;

      animation.overrideAction = normalized;
      animation.overrideUntilDone = true;
    },

    oneShotFinished(state) {
      const animation = ensureAnimationState(state);
      animation.overrideAction = null;
      animation.overrideUntilDone = false;

      // Immediately restore loop based on current mood
      animation.desiredAction = deriveDesiredActionFromMood(
        animation.mood || "ok"
      );
    },

    setFacing(state, { payload }) {
      const animation = ensureAnimationState(state);
      animation.facing = payload === "left" ? "left" : "right";
    },

    dismissActiveDream(state) {
      const dreams = ensureDreamState(state);
      dreams.active = null;
    },

    bathe(state, { payload }) {
      const now = payload?.now ?? nowMs();
      applyDecay(state, now);
      wakeForInteraction(state);

      const perks = getPersonalityPerks(state);
      const cleanlinessBefore = Number(state.stats.cleanliness || 0);

      state.stats.cleanliness = clamp(state.stats.cleanliness + 30, 0, 100);
      state.stats.health = clampHealthForState(
        state,
        Number(state.stats.health || 0) + 5
      );
      const bathNeeded = cleanlinessBefore <= 70;
      state.stats.happiness = clamp(
        state.stats.happiness +
          (bathNeeded
            ? -3 * Math.max(0.6, perks.bathHappinessPenaltyMultiplier)
            : -6 * Math.max(0.6, perks.bathHappinessPenaltyMultiplier)),
        0,
        100
      );
      restoreAffectionAndTrust(state, 2);
      relieveNeglectWithCare(state, 1);

      state.memory.lastBathedAt = now;
      state.memory.lastSeenAt = now;
      state.lastAction = "bathe";
      applyFsmAction(state, "bathe", now);

      const sweetBondMultiplier = hasTemperamentTag(state, "SWEET") ? 1.15 : 1;
      applyBondGain(state, 0.35 * sweetBondMultiplier, now);

      applyPersonalityShift(state, {
        now,
        source: "BATHE",
        deltas: { energetic: -1, adventurous: -1, affectionate: -1 },
      });

      applyXp(state, 4);
      maybeSampleMood(state, now, "BATHE");
      pushStructuredMemory(state, {
        type: "bathed",
        category: "CARE",
        moodTag: bathNeeded ? "RELIEVED" : "SASSY",
        summary: bathNeeded
          ? "Cleaned up after getting grimy."
          : "Bath was a bit unnecessary.",
        body: bathNeeded
          ? "The bath was not their favorite, but the cleanup clearly helped."
          : "They were already clean enough and had opinions about the extra bath.",
        timestamp: now,
        happiness: bathNeeded ? -1 : -3,
        energy: Number(state.stats.energy || 0),
      });
      markDailyCareCategory(state, "clean", now);
      setCareResponse(state, {
        key: "bath",
        label: "Bath",
        message: bathNeeded
          ? "Not glamorous, but the cleanup helped comfort and health."
          : "They were already clean, so this felt fussy instead of caring.",
        tone: bathNeeded ? "sky" : "amber",
        icon: "clean",
        now,
      });
      updateTemperamentReveal(state, now);
      finalizeDerivedState(state, now);
    },

    increasePottyLevel(state, { payload }) {
      gainPottyNeed(state, payload?.amount ?? 10);
    },

    goPotty(state, { payload }) {
      const now = payload?.now ?? nowMs();
      applyDecay(state, now);
      wakeForInteraction(state);
      syncPottySequenceState(state, now);
      const pottyMeta = ensurePottyMeta(state);
      const pottySequence = pottyMeta.sequence || {};
      const activeCue =
        String(pottySequence.phase || "").toLowerCase() === POTTY_SEQUENCE.CUED;
      const forceSuccess = payload?.forceSuccess === true;
      const pottyNeedBefore = Number(state.pottyLevel || 0);
      const tooSoon = pottyNeedBefore < 35 && !activeCue;
      const fakeoutChance = tooSoon ? 0.72 : activeCue ? 0.06 : 0.18;
      if (!forceSuccess && Math.random() <= fakeoutChance) {
        state.stats.energy = clamp(state.stats.energy - 1, 0, 100);
        state.stats.happiness = clamp(state.stats.happiness + 1, 0, 100);
        state.memory.lastSeenAt = now;
        state.lastAction = "potty_fakeout";
        applyFsmAction(state, "sit", now);
        maybeSampleMood(state, now, "POTTY_FAKEOUT");
        setCareResponse(state, {
          key: "potty",
          label: "Potty",
          message: tooSoon
            ? "They sniffed around, but did not need to go yet. Timing matters."
            : "They tried, got distracted, and need another calm cue soon.",
          tone: "amber",
          icon: "potty",
          now,
        });
        updateTemperamentReveal(state, now);
        finalizeDerivedState(state, now);
        return;
      }
      const training = ensureTrainingState(state).potty;
      state.pottyLevel = 0;
      state.poopCount += 1;
      state.stats.happiness = clamp(state.stats.happiness + 3, 0, 100);
      restoreAffectionAndTrust(state, 3);
      relieveNeglectWithCare(state, 1);
      state.memory.lastSeenAt = now;
      state.lastAction = "potty";
      applyFsmAction(state, "potty", now);

      const sweetBondMultiplier = hasTemperamentTag(state, "SWEET") ? 1.25 : 1;
      const cueResponseBonus = activeCue ? 0.45 : 0;
      applyBondGain(state, (0.8 + cueResponseBonus) * sweetBondMultiplier, now);

      applyXp(state, 2);
      const guiltyTriggered = maybeTriggerGuiltyPaws(state, now, "potty");
      if (!guiltyTriggered) {
        maybeSampleMood(state, now, "POTTY");
      }
      recordPuppyPottySuccess(state, now);
      if (training?.goal) {
        const pct = Math.round(
          (Number(training.successCount || 0) / Number(training.goal || 1)) *
            100
        );
        state.potty.training = clamp(pct, 0, 100);
      }
      pottyMeta.totalSuccesses += 1;
      pottyMeta.lastSuccessAt = now;
      if (activeCue) {
        pottyMeta.ignoredCueCount = Math.max(
          0,
          Number(pottyMeta.ignoredCueCount || 0) - 1
        );
        state.stats.happiness = clamp(state.stats.happiness + 2, 0, 100);
        state.stats.affection = clamp(state.stats.affection + 4, 0, 100);
      }
      setPottySequencePhase(state, POTTY_SEQUENCE.RELIEVED, now, {
        cueIssuedAt: activeCue ? pottySequence.cueIssuedAt || now : null,
        cueExpiresAt: null,
        playerRespondedAt: now,
      });
      pushStructuredMemory(state, {
        type: "potty_success",
        category: "CARE",
        moodTag: "RELIEVED",
        summary: "Successful potty trip.",
        body: "Your pup made it outside in time and looked pretty pleased afterward.",
        timestamp: now,
        happiness: 3,
        hunger: Number(state.stats.hunger || 0),
        energy: Number(state.stats.energy || 0),
      });
      markDailyCareCategory(state, "potty", now);
      setCareResponse(state, {
        key: "potty",
        label: "Potty",
        message: activeCue
          ? "They answered the cue. House training grew because the routine was clear."
          : "Clean potty win. That consistency is what unlocks real training later.",
        tone: "emerald",
        icon: "potty",
        now,
      });
      finalizeDerivedState(state, now);
    },

    recordAccident(state, { payload }) {
      const now = payload?.now ?? nowMs();
      state.pottyLevel = 0;
      applyAccidentInternal(state, now);
      pushStructuredMemory(state, {
        type: "accident",
        category: "NEGLECT",
        moodTag: "UNEASY",
        summary: "Had an indoor accident.",
        body: "Routine slipped and your pup had an accident indoors.",
        timestamp: now,
        happiness: -3,
        hunger: Number(state.stats.hunger || 0),
        energy: Number(state.stats.energy || 0),
      });
      setCareResponse(state, {
        key: "accident",
        label: "Accident",
        message:
          "No scolding. Reset the routine, clean up, and watch the potty cue sooner.",
        tone: "rose",
        icon: "potty",
        now,
      });
      finalizeDerivedState(state, now);
    },

    scoopPoop(state, { payload }) {
      const now = payload?.now ?? nowMs();
      applyDecay(state, now);
      wakeForInteraction(state);
      if (state.poopCount > 0) {
        state.poopCount -= 1;
        state.stats.cleanliness = clamp(state.stats.cleanliness + 10, 0, 100);
        state.stats.happiness = clamp(state.stats.happiness + 2, 0, 100);
        applyBondGain(state, 0.25, now);
        applyXp(state, 2);
        maybeSampleMood(state, now, "SCOOP");
        markDailyCareCategory(state, "clean", now);
        setCareResponse(state, {
          key: "scoop",
          label: "Cleanup",
          message:
            "The yard feels cared for. Clean space supports comfort and health.",
          tone: "emerald",
          icon: "clean",
          now,
        });
      } else {
        setCareResponse(state, {
          key: "scoop",
          label: "Cleanup",
          message:
            "Nothing needed cleanup right now. Good maintenance is quiet.",
          tone: "sky",
          icon: "clean",
          now,
        });
      }
      state.memory.lastSeenAt = now;
      state.lastAction = "scoop";
      applyFsmAction(state, "scoop", now);

      finalizeDerivedState(state, now);
    },

    addXp(state, { payload }) {
      const amount = Number(payload?.amount ?? 0);
      if (!amount) return;
      applyXp(state, amount);
    },

    removeXp(state, { payload }) {
      const amount = Number(payload?.amount ?? 0);
      if (!amount) return;
      applyXpDelta(state, -Math.abs(amount));
    },

    simulationTick(state, { payload }) {
      if (
        ensureLifecycleStatus(state) !== DOG_LIFECYCLE_STATUS.ACTIVE ||
        !state.adoptedAt
      ) {
        return;
      }

      const updates = payload && typeof payload === "object" ? payload : {};
      const nextStats =
        updates.stats && typeof updates.stats === "object" ? updates.stats : {};

      Object.entries(nextStats).forEach(([key, value]) => {
        if (!isValidStat(key)) return;
        state.stats[key] = clamp(Number(value), 0, 100);
      });

      const mood = String(updates.mood || "")
        .trim()
        .toLowerCase();
      if (mood) {
        state.emotionCue = mood;
        const animation = ensureAnimationState(state);
        animation.mood = normalizeActionKey(mood);
        if (!animation.overrideUntilDone) {
          animation.desiredAction = deriveDesiredActionFromMood(animation.mood);
        }
      }

      const action = normalizeActionKey(updates.action);
      if (action && !state.isAsleep) {
        state.lastAction = action;
        applyFsmAction(state, action, payload?.now ?? nowMs());
      }

      const aiState = String(updates.aiState || "")
        .trim()
        .toLowerCase();
      if (aiState) {
        state.aiState = aiState;
      }
      const aiStateUntilAt = Number(updates.aiStateUntilAt);
      if (Number.isFinite(aiStateUntilAt) && aiStateUntilAt > 0) {
        state.aiStateUntilAt = aiStateUntilAt;
      }
      const position =
        updates.position && typeof updates.position === "object"
          ? updates.position
          : null;
      if (position) {
        state.position = {
          x: clamp(Number(position.x), 0, 800),
          y: clamp(Number(position.y), 0, 500),
        };
      }
      if (Object.hasOwn(updates, "targetPosition")) {
        const targetPosition =
          updates.targetPosition && typeof updates.targetPosition === "object"
            ? updates.targetPosition
            : null;
        state.targetPosition = targetPosition
          ? {
              x: clamp(Number(targetPosition.x), 0, 800),
              y: clamp(Number(targetPosition.y), 0, 500),
              id: targetPosition.id ? String(targetPosition.id) : null,
              type: targetPosition.type ? String(targetPosition.type) : null,
              label: targetPosition.label ? String(targetPosition.label) : null,
              interaction: targetPosition.interaction
                ? String(targetPosition.interaction)
                : null,
              toyId: targetPosition.toyId ? String(targetPosition.toyId) : null,
              interactionRadius: clamp(
                Number(targetPosition.interactionRadius || 18),
                8,
                64
              ),
            }
          : null;
      }
      if (
        action === "walk" &&
        String(state.targetPosition?.type || "")
          .trim()
          .toLowerCase() === "brain_wander"
      ) {
        const memory = ensureMemoryState(state);
        memory.lastAmbientWanderAt = payload?.now ?? nowMs();
      }
      const speed = Number(updates.speed);
      if (Number.isFinite(speed) && speed > 0) {
        state.speed = clamp(speed, 8, 140);
      }
      const facing = String(updates.facing || "")
        .trim()
        .toLowerCase();
      if (facing === "left" || facing === "right") {
        state.facing = facing;
      }

      normalizeStatsState(state);
    },

    /* ------------- time / login ------------- */

    tickDog(state, { payload }) {
      applyWorldTick(state, payload);
    },

    registerSessionStart(state, { payload }) {
      const now = payload?.now ?? nowMs();
      if (
        ensureLifecycleStatus(state) !== DOG_LIFECYCLE_STATUS.ACTIVE ||
        !state.adoptedAt
      ) {
        state.lastUpdatedAt = now;
        return;
      }
      applyOfflineCatchUp(state, now);
      const tier = finalizeDerivedState(state, now);
      applyCleanlinessPenalties(state, tier);
      maybeSampleMood(state, now, "SESSION_START");
      state.memory.lastSeenAt = now;
      state.lastAction = "session_start";

      const date = new Date(now).toISOString().slice(0, 10);
      updateStreak(state.streak, date);
      updateTemperamentReveal(state, now);
      evaluateTemperament(state, now);
      applyAdultTrainingMissPenalty(state, now);
      maybeSpawnSessionSurprise(state, now);
      finalizeDerivedState(state, now);
      refreshDailyIdentityFlavor(state, now);
    },

    triggerButtonHeist(state, { payload }) {
      const now = payload?.now ?? nowMs();
      const silenceMs = Number(payload?.silenceMs || 0);
      if (silenceMs < 60_000) return;
      const spawned = spawnButtonHeistSurprise(state, now, {
        minGapMs: 60_000,
        stolenAction: payload?.stolenAction || "play",
        message: payload?.message || "",
      });
      if (!spawned) return;
      state.memory.lastSeenAt = now;
      finalizeDerivedState(state, now);
    },

    resolveSessionSurprise(state, { payload }) {
      const now = payload?.now ?? nowMs();
      const surprise = ensureSurpriseState(state);
      const active = surprise.active;
      if (!active) return;

      const method = normalizeActionKey(payload?.method || "manual");
      const resolvedType = String(active.type || "").toUpperCase();

      if (resolvedType === SESSION_SURPRISE_TYPES.DIG_HOLE) {
        const yard = ensureYardState(state);
        const holeId = String(active.holeId || "").trim();
        if (holeId) {
          yard.holes = (Array.isArray(yard.holes) ? yard.holes : []).filter(
            (hole) => String(hole?.id || "") !== holeId
          );
        }

        state.stats.cleanliness = clamp(state.stats.cleanliness + 2, 0, 100);
        state.stats.happiness = clamp(state.stats.happiness + 3, 0, 100);
        state.coins = Math.max(
          0,
          Math.round(Number(state.coins || 0) + (method === "fetch" ? 10 : 6))
        );
        applyBondGain(state, 0.8, now);
        applyXp(state, 4);
        state.lastAction =
          method === "fetch" ? "surprise_fetch_cleanup" : "surprise_cleanup";
        applyFsmAction(state, method === "fetch" ? "play" : "pet", now);
        pushJournalEntry(state, {
          type: "SURPRISE",
          moodTag: "PROUD",
          summary: "Resolved digging surprise",
          body: "You redirected the digging and turned it into a positive moment.",
          timestamp: now,
        });
      }

      if (resolvedType === SESSION_SURPRISE_TYPES.STOLEN_BUTTON) {
        const stolenAction = String(active.stolenAction || "action");
        state.stats.happiness = clamp(state.stats.happiness + 5, 0, 100);
        state.stats.energy = clamp(state.stats.energy - 3, 0, 100);
        state.stats.thirst = clamp(state.stats.thirst + 2, 0, 100);
        applyBondGain(state, 1.25, now);
        applyXp(state, 6);
        state.lastAction = "surprise_fetch_recover";
        applyFsmAction(state, "play", now);
        pushJournalEntry(state, {
          type: "SURPRISE",
          moodTag: "HAPPY",
          summary: "Recovered stolen control",
          body: `Fetch won. Your "${stolenAction}" control is back.`,
          timestamp: now,
        });
      }

      surprise.active = null;
      surprise.lastResolvedAt = now;
      state.memory.lastSeenAt = now;
      maybeSampleMood(state, now, "SURPRISE_RESOLVED");
      updateTemperamentReveal(state, now);
      finalizeDerivedState(state, now);
    },

    tickDogPolls(state, { payload }) {
      const now = payload?.now ?? nowMs();
      const pollState = ensurePollState(state);
      if (pollState.active) {
        if (pollState.active.expiresAt && now >= pollState.active.expiresAt) {
          resolveActivePoll(state, {
            accepted: false,
            reason: "TIMEOUT",
            now,
          });
        }
        return;
      }

      const interval = DOG_POLL_CONFIG?.intervalMs || 0;
      if (!interval) return;
      if (
        !pollState.lastSpawnedAt ||
        now - pollState.lastSpawnedAt >= interval
      ) {
        spawnDogPollInternal(state, now);
      }
    },

    respondToDogPoll(state, { payload }) {
      const now = payload?.now ?? nowMs();
      const accepted = !!payload?.accepted;
      const reason = payload?.reason || (accepted ? "ACCEPT" : "DECLINE");
      resolveActivePoll(state, { accepted, reason, now });
    },

    /* ------------- daily rewards ------------- */

    claimDailyReward(state, { payload }) {
      const now = typeof payload?.now === "number" ? payload.now : nowMs();
      const lastClaimAt = Number(state.lastRewardClaimedAt || 0);
      if (lastClaimAt > 0 && getIsoDate(lastClaimAt) === getIsoDate(now)) {
        return;
      }

      normalizeStatsState(state);
      const day = Number(payload?.day ?? state.consecutiveDays ?? 0);
      state.lastRewardClaimedAt = now;
      state.consecutiveDays = Number.isFinite(day)
        ? Math.max(0, Math.floor(day))
        : 0;

      const reward = payload?.reward || null;
      const rewardType = String(reward?.type || "")
        .trim()
        .toUpperCase();
      if (rewardType === "ENERGY") {
        state.stats.energy = clamp(
          Number(state.stats.energy || 0) + Number(reward.value || 0),
          0,
          100
        );
      }
      if (rewardType === "COINS") {
        state.coins = Math.max(
          0,
          Math.round(Number(state.coins || 0) + Number(reward.value || 0))
        );
      }
    },

    rewardSocialShare(state, { payload }) {
      const now = typeof payload?.now === "number" ? payload.now : nowMs();
      const lastSharedAt = Number(state.lastShareRewardAt || 0);
      if (lastSharedAt > 0 && now - lastSharedAt < SHARE_REWARD_COOLDOWN_MS) {
        return;
      }

      const energyBonus = Math.max(
        0,
        Math.round(Number(payload?.energy ?? 10) || 0)
      );
      const happinessBonus = Math.max(
        0,
        Math.round(Number(payload?.happiness ?? 3) || 0)
      );

      state.lastShareRewardAt = now;
      state.stats.energy = clamp(
        Number(state.stats.energy || 0) + energyBonus,
        0,
        100
      );
      state.stats.happiness = clamp(
        Number(state.stats.happiness || 0) + happinessBonus,
        0,
        100
      );

      pushJournalEntry(state, {
        type: "MEMORY",
        moodTag: "PROUD",
        summary: "Shared your pup with a friend.",
        body: `Your pup soaked up the attention and gained +${energyBonus} energy.`,
        timestamp: now,
      });
    },

    beginRunawayStrike(state, { payload }) {
      const now = typeof payload?.now === "number" ? payload.now : nowMs();
      ensureMemoryState(state);
      if (!state.adoptedAt) return;

      const existingEnd = Number(state.memory.runawayEndTimestamp || 0);
      if (existingEnd && existingEnd > now) return;

      const runawayEndTimestamp = Number(payload?.runawayEndTimestamp || 0);
      state.memory.runawayEndTimestamp =
        runawayEndTimestamp && runawayEndTimestamp > now
          ? runawayEndTimestamp
          : now + RUNAWAY_LOCKOUT_MS;
      state.memory.lastRunawayTriggeredAt = now;
      state.lastAction = "runaway_strike";

      pushJournalEntry(state, {
        type: "LETTER",
        moodTag: "SPICY",
        summary: "Dear hooman letter",
        body:
          "I waited. I sniffed every corner. You were gone too long, so I packed my bag. " +
          "I am taking 24 hours to cool off before I decide whether to come back.",
        timestamp: now,
      });

      finalizeDerivedState(state, now);
    },

    resolveRunawayStrike(state, { payload }) {
      const now = typeof payload?.now === "number" ? payload.now : nowMs();
      ensureMemoryState(state);
      const endAt = Number(state.memory.runawayEndTimestamp || 0);
      if (!endAt || now < endAt) return;

      state.memory.runawayEndTimestamp = null;
      state.lastAction = "runaway_returned";
      state.memory.lastSeenAt = now;

      pushJournalEntry(state, {
        type: "INFO",
        moodTag: "CURIOUS",
        summary: "Your pup came back",
        body: "After a full day of dramatic reflection, your pup padded back into the yard looking smug and ready to be adored again.",
        timestamp: now,
      });

      finalizeDerivedState(state, now);
    },

    grantPreRegGift(state, { payload }) {
      if (state.claimedPreReg) return;

      const now = typeof payload?.now === "number" ? payload.now : nowMs();
      const coins = Math.max(0, Math.round(Number(payload?.coins ?? 500)));

      state.coins = Math.max(0, Math.round(Number(state.coins || 0) + coins));
      state.claimedPreReg = true;
      state.claimedPreRegAt = now;

      pushJournalEntry(state, {
        type: "STORE",
        moodTag: "PROUD",
        summary: "Claimed pre-registration reward.",
        body: `Founder bonus unlocked: ${coins} coins.`,
        timestamp: now,
      });
    },

    /* ------------- skills ------------- */

    trainObedience(state, { payload }) {
      const training = ensureTrainingState(state);
      const pottyDone = !!training?.potty?.completedAt;
      if (!pottyDone) {
        state.lastAction = "trainBlocked";
        setCareResponse(state, {
          key: "train",
          label: "Training",
          message:
            "Tricks wait until potty training is mastered. Trust starts with house rhythm.",
          tone: "amber",
          icon: "train",
          now: nowMs(),
        });
        return;
      }
      const commandId = payload?.commandId
        ? String(payload.commandId).trim()
        : "";
      if (!commandId) return;

      const now = payload?.now ?? nowMs();
      const input = payload?.input || "button";
      const xp = Number(payload?.xp ?? 6);
      applyDecay(state, now);
      wakeForInteraction(state);
      evaluateObedienceUnlocks(state, now);

      const unlocks = ensureObedienceUnlockState(state);
      const command = getObedienceCommand(commandId);
      const isUnlocked = unlocks.unlockedIds.includes(commandId);

      if (!command || !isUnlocked) {
        state.memory.lastTrainedAt = now;
        state.memory.lastTrainedCommandId = commandId;
        state.memory.lastSeenAt = now;
        state.lastAction = "trainLocked";
        setCareResponse(state, {
          key: "train",
          label: "Training",
          message:
            "That cue is not ready yet. Keep the routine focused and short.",
          tone: "amber",
          icon: "train",
          now,
        });
        finalizeDerivedState(state, now);
        return;
      }

      const perks = getPersonalityPerks(state);
      const skillMods = getSkillTreeModifiersFromDogState(state);
      const isSpicy = hasTemperamentTag(state, "SPICY");
      const archetypeId = String(state?.temperament?.archetype || "")
        .trim()
        .toUpperCase();
      const energy = Number(state.stats?.energy || 0);
      const hunger = Number(state.stats?.hunger || 0);
      const thirst = Number(state.stats?.thirst || 0);
      const happiness = Number(state.stats?.happiness || 0);
      const bondValue = Number(state.bond?.value || 0);
      const foodMotivated = getTemperamentTraitIntensity(
        state,
        "foodMotivated"
      );
      const commandSkillNode = state.skills?.obedience?.[commandId] || null;
      const commandMasteryPct = getObedienceSkillMasteryPct(commandSkillNode);
      const fedRecently =
        state.memory?.lastFedAt &&
        now - state.memory.lastFedAt < 2 * 60 * 60 * 1000;

      const explicitSuccess =
        typeof payload?.success === "boolean" ? payload.success : null;
      const profile =
        state?.personalityProfile &&
        typeof state.personalityProfile === "object"
          ? state.personalityProfile
          : derivePersonalityProfile(state);
      const trainabilitySpeed = clamp(
        Number(profile?.instinctEngine?.trainabilitySpeed || 1),
        0.6,
        2.2
      );
      const lastTrainingKind = String(
        state.memory?.lastTrainingReaction?.kind || state.lastAction || ""
      )
        .trim()
        .toLowerCase();
      const successChanceRaw = computeTrainingSuccessChance({
        input,
        bond: bondValue,
        energy,
        hunger,
        thirst,
        happiness,
        isSpicy,
        foodMotivated,
        fedRecently,
        focus: profile?.dynamicStates?.confidence ?? 50,
        trust: profile?.trust?.score ?? bondValue,
        stress: profile?.dynamicStates?.frustration ?? 30,
        distraction: profile?.coreTemperament?.inquisitiveness ?? 25,
        archetypeId,
        trainingStreak: Number(state.training?.adult?.streak || 0),
        lastTrainingSuccess:
          lastTrainingKind !== "fail" &&
          lastTrainingKind !== "ignore" &&
          lastTrainingKind !== "zoomies" &&
          lastTrainingKind !== "trainfailed",
      });
      const successChance = clamp01(
        (successChanceRaw + (commandMasteryPct / 100) * 0.22) /
          trainabilitySpeed
      );

      const forcedTrainingReaction = normalizeForcedTrainingReaction(
        payload?.forcedReaction,
        commandId
      );
      const jrtReaction =
        forcedTrainingReaction ||
        resolveJrtTrainingReaction({
          commandId,
          unlockedIds: unlocks.unlockedIds,
          skillNode: commandSkillNode,
          stats: state.stats,
          bond: bondValue,
          profile,
          archetypeId,
          isSpicy,
          rng: Math.random,
        });
      const commandLabel = command?.label || commandId;

      if (jrtReaction.kind === "zoomies") {
        state.stats.energy = clamp(state.stats.energy - 7, 0, 100);
        state.stats.happiness = clamp(state.stats.happiness + 4, 0, 100);
        state.stats.thirst = clamp(state.stats.thirst + 4, 0, 100);
        state.memory.lastTrainedAt = now;
        state.memory.lastTrainedCommandId = commandId;
        state.memory.lastSeenAt = now;
        state.memory.lastZoomiesAt = now;
        state.lastAction = "train_zoomies";
        setLastTrainingReaction(state, jrtReaction, now);
        transitionDogFsm(state, "zoomies", now, {
          reason: "training_chaos",
          locked: true,
        });
        maybeSampleMood(state, now, "ZOOMIES_BURST");

        pushJournalEntry(state, {
          type: "TRAINING",
          moodTag: "WILD",
          summary: `Ignored ${commandLabel}. Chose zoomies.`,
          body: `You cued "${commandLabel}", but your pup detonated into zoomies instead.`,
          timestamp: now,
        });
        setCareResponse(state, {
          key: "train",
          label: "Training",
          message:
            "They chose movement over obedience. Needs and mood still matter during lessons.",
          tone: "amber",
          icon: "train",
          now,
        });

        updateTemperamentReveal(state, now);
        finalizeDerivedState(state, now);
        return;
      }

      if (jrtReaction.kind === "ignore") {
        state.stats.energy = clamp(state.stats.energy - 2, 0, 100);
        state.stats.happiness = clamp(state.stats.happiness - 1, 0, 100);
        state.memory.lastTrainedAt = now;
        state.memory.lastTrainedCommandId = commandId;
        state.memory.lastSeenAt = now;
        state.lastAction = "train_ignore";
        setLastTrainingReaction(state, jrtReaction, now);
        maybeSampleMood(state, now, "TRAINING_FAIL");

        const ignoreBodyByReason = {
          sniff: `You asked for "${commandLabel}". Your pup heard you, then followed a smell instead.`,
          scratch: `You asked for "${commandLabel}", but an itchy distraction won the argument.`,
          blank_stare: `You asked for "${commandLabel}". Your pup made eye contact, then committed to doing absolutely nothing.`,
          dig: `You asked for "${commandLabel}", and your mischievous terrier instantly chose digging instead.`,
          ghost_bark: `You asked for "${commandLabel}", and your pup barked at a ghost only they could see.`,
        };

        pushJournalEntry(state, {
          type: "TRAINING",
          moodTag: "SASSY",
          summary: `Blew off ${commandLabel}.`,
          body:
            ignoreBodyByReason[jrtReaction.reasonId] ||
            `You asked for "${commandLabel}", but your pup ignored the cue.`,
          timestamp: now,
        });
        setCareResponse(state, {
          key: "train",
          label: "Training",
          message:
            "They heard you, but trust and focus were not there yet. End on calm.",
          tone: "amber",
          icon: "train",
          now,
        });

        updateTemperamentReveal(state, now);
        finalizeDerivedState(state, now);
        return;
      }

      if (jrtReaction.kind === "reinterpret") {
        const sweetBondMultiplier = hasTemperamentTag(state, "SWEET") ? 1.2 : 1;
        state.stats.energy = clamp(state.stats.energy - 4, 0, 100);
        state.stats.happiness = clamp(
          state.stats.happiness + 5 * perks.trainingHappinessBonus,
          0,
          100
        );
        state.stats.thirst = clamp(state.stats.thirst + 3, 0, 100);
        state.memory.lastTrainedAt = now;
        state.memory.lastTrainedCommandId = commandId;
        state.memory.lastSeenAt = now;
        state.lastAction = "train_reinterpret";
        setLastTrainingReaction(state, jrtReaction, now);
        applyBondGain(state, 0.45 * sweetBondMultiplier, now);
        applyXp(state, 4);
        maybeSampleMood(state, now, "TRAINING");

        const performedCommand = getObedienceCommand(
          jrtReaction.performedCommandId
        );
        const performedLabel =
          performedCommand?.label ||
          jrtReaction.performedCommandId ||
          "a trick";

        pushJournalEntry(state, {
          type: "TRAINING",
          moodTag: "PROUD",
          summary: `Asked for ${commandLabel}. Got ${performedLabel}.`,
          body: `You cued "${commandLabel}", but your pup decided "${performedLabel}" was a better idea and showed off instead.`,
          timestamp: now,
        });
        setCareResponse(state, {
          key: "train",
          label: "Training",
          message:
            "They improvised, but stayed connected. That still builds shared language.",
          tone: "sky",
          icon: "train",
          now,
        });

        updateTemperamentReveal(state, now);
        finalizeDerivedState(state, now);
        return;
      }

      const roll = Math.random();
      const dozeChance = energy <= 30 ? 0.28 : energy <= 55 ? 0.16 : 0.08;
      const perfectChance = clamp01(successChance * 0.42);

      let trainingOutcome = "FAIL";
      if (explicitSuccess === true) {
        trainingOutcome = roll <= 0.38 ? "PERFECT" : "SUCCESS";
      } else if (explicitSuccess === false) {
        trainingOutcome = roll <= dozeChance ? "DOZE_OFF" : "FAIL";
      } else if (roll <= perfectChance) {
        trainingOutcome = "PERFECT";
      } else if (roll <= successChance) {
        trainingOutcome = "SUCCESS";
      } else if (roll <= successChance + dozeChance) {
        trainingOutcome = "DOZE_OFF";
      }

      if (trainingOutcome === "FAIL") {
        state.stats.energy = clamp(state.stats.energy - 4, 0, 100);
        state.stats.happiness = clamp(state.stats.happiness - 2, 0, 100);
        state.memory.lastTrainedAt = now;
        state.memory.lastTrainedCommandId = commandId;
        state.memory.lastSeenAt = now;
        state.lastAction = "trainFailed";
        setLastTrainingReaction(
          state,
          {
            kind: "fail",
            requestedCommandId: commandId,
            performedActionId: null,
            performedCommandId: null,
            reasonId: "failed",
          },
          now
        );
        maybeSampleMood(state, now, "TRAINING_FAIL");
        setCareResponse(state, {
          key: "train",
          label: "Training",
          message:
            "The cue missed. Keep sessions short so training feels like trust, not pressure.",
          tone: "amber",
          icon: "train",
          now,
        });
        updateTemperamentReveal(state, now);
        finalizeDerivedState(state, now);
        return;
      }

      if (trainingOutcome === "DOZE_OFF") {
        const sweetBondMultiplier = hasTemperamentTag(state, "SWEET") ? 1.2 : 1;

        state.stats.energy = clamp(state.stats.energy + 8, 0, 100);
        state.stats.happiness = clamp(state.stats.happiness + 1, 0, 100);
        state.stats.thirst = clamp(state.stats.thirst + 2, 0, 100);
        state.memory.lastTrainedAt = now;
        state.memory.lastTrainedCommandId = commandId;
        state.memory.lastSeenAt = now;
        state.lastAction = "train_doze_off";
        setLastTrainingReaction(
          state,
          {
            kind: "doze_off",
            requestedCommandId: commandId,
            performedActionId: "sleep",
            performedCommandId: null,
            reasonId: "doze_off",
          },
          now
        );
        applyFsmAction(state, "rest", now);
        applyBondGain(state, 0.55 * sweetBondMultiplier, now);
        applyXp(state, 2);
        maybeSampleMood(state, now, "TRAINING_DOZE_OFF");

        pushJournalEntry(state, {
          type: "TRAINING",
          moodTag: "CALM",
          summary: `Dozed off during ${commandLabel}`,
          body: `You started "${commandLabel}" practice, but your pup rolled over and fell asleep mid-session.`,
          timestamp: now,
        });
        setCareResponse(state, {
          key: "train",
          label: "Training",
          message: "They dozed off during practice. Rest was the real need.",
          tone: "sky",
          icon: "train",
          now,
        });

        updateTemperamentReveal(state, now);
        finalizeDerivedState(state, now);
        return;
      }

      const trainingMultiplier =
        state.career.perks?.trainingXpMultiplier || 1.0;
      const spicyXpMultiplier = isSpicy ? 1.1 : 1;
      const baseAdjustedXp = Math.round(
        xp *
          trainingMultiplier *
          (skillMods.trainingSkillXpMultiplier || 1) *
          spicyXpMultiplier *
          (1 / trainabilitySpeed)
      );
      const performanceXpMultiplier = trainingOutcome === "PERFECT" ? 1.65 : 1;
      const adjustedXp = Math.max(
        1,
        Math.round(baseAdjustedXp * performanceXpMultiplier)
      );

      const skillProgress = applySkillXp(
        "obedience",
        commandId,
        state.skills,
        adjustedXp
      );
      const masteryAfterTraining = Math.max(
        commandMasteryPct,
        Number(skillProgress?.masteryAfter || 0)
      );
      state.memory.lastTrainedAt = now;
      state.memory.lastTrainedCommandId = commandId;
      state.memory.lastSeenAt = now;
      state.lastAction =
        trainingOutcome === "PERFECT" ? "train_perfect" : "train";
      setLastTrainingReaction(
        state,
        {
          kind: "obey",
          requestedCommandId: commandId,
          performedActionId: commandId,
          performedCommandId: commandId,
          reasonId: trainingOutcome === "PERFECT" ? "perfect" : "success",
        },
        now
      );
      applyFsmAction(state, "train", now);

      const sweetBondMultiplier = hasTemperamentTag(state, "SWEET") ? 1.2 : 1;
      const masteryBondMultiplier = masteryAfterTraining >= 100 ? 1.12 : 1;
      const masteryEnergyMultiplier = masteryAfterTraining >= 71 ? 0.9 : 1;
      applyBondGain(
        state,
        (trainingOutcome === "PERFECT" ? 1.35 : 1.0) *
          sweetBondMultiplier *
          masteryBondMultiplier,
        now
      );
      state.stats.thirst = clamp(
        state.stats.thirst + (trainingOutcome === "PERFECT" ? 5 : 4),
        0,
        100
      );
      gainPottyNeed(state, 8);

      state.stats.happiness = clamp(
        state.stats.happiness +
          (trainingOutcome === "PERFECT" ? 12 : 8) *
            perks.trainingHappinessBonus,
        0,
        100
      );
      state.stats.energy = clamp(
        state.stats.energy -
          Math.max(
            1,
            Math.round(
              (trainingOutcome === "PERFECT" ? 7 : 5) * masteryEnergyMultiplier
            )
          ),
        0,
        100
      );

      applyPersonalityShift(state, {
        now,
        source: "TRAINING",
        deltas: { playful: -2, social: -1, adventurous: -1 },
      });

      applyXp(state, trainingOutcome === "PERFECT" ? 14 : 10);
      completeAdultTrainingSession(state, now);
      maybeSampleMood(
        state,
        now,
        trainingOutcome === "PERFECT" ? "TRAINING_PERFECT" : "TRAINING"
      );

      pushJournalEntry(state, {
        type: "TRAINING",
        moodTag: "HAPPY",
        summary:
          trainingOutcome === "PERFECT"
            ? `Nailed ${commandLabel}.`
            : `Practiced ${commandLabel}.`,
        body:
          trainingOutcome === "PERFECT"
            ? `Your pup executed "${commandLabel}" perfectly on cue. Big training win.`
            : `We worked on "${commandLabel}" today. I think I'm getting the hang of it!`,
        timestamp: now,
      });
      setCareResponse(state, {
        key: "train",
        label: "Training",
        message:
          trainingOutcome === "PERFECT"
            ? "Clear cue, good timing, strong trust. That is real progress."
            : "Good short session. Obedience grows from consistency, not tapping.",
        tone: trainingOutcome === "PERFECT" ? "emerald" : "sky",
        icon: "train",
        now,
      });

      if (skillProgress?.mastered) {
        state.memory.lastMasteredCommandId = commandId;
        state.memory.lastMasteredCommandAt = now;

        pushJournalEntry(state, {
          type: "TRAINING",
          moodTag: "PROUD",
          summary: `Mastered ${commandLabel}.`,
          body: `Your pup has fully mastered "${commandLabel}" and now treats it like second nature.`,
          timestamp: now,
        });
      }

      const date = getIsoDate(now);
      updateStreak(state.streak, date);
      updateTemperamentReveal(state, now);
      evaluateObedienceUnlocks(state, now);
      finalizeDerivedState(state, now);
    },

    /* ------------- skill tree ------------- */

    unlockSkillTreePerk(state, { payload }) {
      const perkId = String(payload?.perkId || "").trim();
      if (!perkId) return;

      const perk = getSkillTreePerk(perkId);
      if (!perk) return;

      const skillTree = ensureSkillTreeState(state);
      if (skillTree.unlockedIds.includes(perkId)) return;

      const points = getSkillTreePointsFromDogState(state);
      const unlockCheck = getSkillTreeUnlockCheck({
        perkId,
        unlockedIds: skillTree.unlockedIds,
        pointsAvailable: points.pointsAvailable,
        dogLevel: state.level,
      });
      if (!unlockCheck.ok) return;

      const now = typeof payload?.now === "number" ? payload.now : nowMs();

      skillTree.unlockedIds.push(perkId);
      skillTree.lastUnlockedId = perkId;
      skillTree.lastUnlockedAt = now;
      skillTree.lastBranchId =
        getSkillTreeBranchIdForPerk(perkId) || skillTree.lastBranchId || null;

      // Some perks unlock cosmetics that should be immediately available.
      // Keep this mapping here so it remains deterministic + saveable.
      const cosmeticUnlockByPerk = {
        // Companion branch
        "scrapbook-charm": { id: "tag_star", slot: "tag" },
        // Guardian branch
        "cozy-fort": { id: "collar_leaf", slot: "collar" },
        // Athlete branch
        "agility-path": { id: "collar_neon", slot: "collar" },
      };

      const cosmeticUnlock = cosmeticUnlockByPerk[perkId] || null;
      if (cosmeticUnlock?.id) {
        if (!state.cosmetics) state.cosmetics = { ...initialCosmetics };
        if (!Array.isArray(state.cosmetics.unlockedIds)) {
          state.cosmetics.unlockedIds = [];
        }
        if (!state.cosmetics.equipped) {
          state.cosmetics.equipped = { ...initialCosmetics.equipped };
        }

        const cosmeticId = String(cosmeticUnlock.id);
        const cosmeticSlot = String(cosmeticUnlock.slot || "").toLowerCase();

        if (!state.cosmetics.unlockedIds.includes(cosmeticId)) {
          state.cosmetics.unlockedIds.push(cosmeticId);
        }

        // Auto-equip if slot is empty (keeps UX snappy, but doesn't override player choice).
        if (
          cosmeticSlot &&
          Object.prototype.hasOwnProperty.call(
            state.cosmetics.equipped,
            cosmeticSlot
          ) &&
          !state.cosmetics.equipped[cosmeticSlot]
        ) {
          state.cosmetics.equipped[cosmeticSlot] = cosmeticId;
        }

        pushJournalEntry(state, {
          type: "SKILL_TREE",
          moodTag: "PROUD",
          summary: "Unlocked a cosmetic.",
          body: `New cosmetic unlocked: ${cosmeticId}.`,
          timestamp: now,
        });
      }

      pushJournalEntry(state, {
        type: "SKILL_TREE",
        moodTag: "PROUD",
        summary: `Unlocked perk: ${perk.name}.`,
        body: `${perk.effect || ""} (Cost: ${perk.cost || 1} SP)`,
        timestamp: now,
      });
    },

    respecSkillTree(state, { payload }) {
      const skillTree = ensureSkillTreeState(state);
      if (!skillTree.unlockedIds.length) return;
      const now = typeof payload?.now === "number" ? payload.now : nowMs();

      skillTree.unlockedIds = [];
      skillTree.lastUnlockedId = null;
      skillTree.lastBranchId = null;

      pushJournalEntry(state, {
        type: "SKILL_TREE",
        moodTag: "CALM",
        summary: "Reset skill tree.",
        body: "All perk points were refunded.",
        timestamp: now,
      });
    },

    respecSkillTreeBranch(state, { payload }) {
      const branchId = String(payload?.branchId || "").trim();
      if (!branchId) return;

      const skillTree = ensureSkillTreeState(state);
      if (!skillTree.unlockedIds.length) return;

      const remaining = skillTree.unlockedIds.filter(
        (id) => getSkillTreeBranchIdForPerk(id) !== branchId
      );
      if (remaining.length === skillTree.unlockedIds.length) return;

      skillTree.unlockedIds = remaining;
      if (skillTree.lastBranchId === branchId) {
        skillTree.lastBranchId = null;
      }
      if (
        skillTree.lastUnlockedId &&
        getSkillTreeBranchIdForPerk(skillTree.lastUnlockedId) === branchId
      ) {
        skillTree.lastUnlockedId =
          remaining.length > 0 ? remaining[remaining.length - 1] : null;
        if (!skillTree.lastUnlockedId) skillTree.lastUnlockedAt = null;
      }

      const now = typeof payload?.now === "number" ? payload.now : nowMs();
      pushJournalEntry(state, {
        type: "SKILL_TREE",
        moodTag: "CALM",
        summary: "Reset a skill branch.",
        body: `Perks in the ${branchId} branch were refunded.`,
        timestamp: now,
      });
    },

    addJournalEntry(state, { payload }) {
      pushJournalEntry(state, payload || {});
    },

    addMemories(state, { payload }) {
      const memories = Array.isArray(payload) ? payload : [];
      memories.forEach((memory) => {
        if (!memory || typeof memory !== "object") return;
        pushStructuredMemory(state, memory);
      });
    },

    addDream(state, { payload }) {
      const dream = payload && typeof payload === "object" ? payload : null;
      if (!dream) return;

      const dreams = ensureDreamState(state);
      dreams.lastGeneratedAt = Number(dream.timestamp || nowMs());
      pushDream(state, dream);

      pushStructuredMemory(state, {
        type: "dreamed",
        category: "MEMORY",
        moodTag:
          String(dream.kind || "").toLowerCase() === "nightmare"
            ? "UNEASY"
            : "DREAMY",
        emotion: dream.emotion || null,
        sourceMemory: dream.sourceMemory || null,
        summary: String(dream.title || "").trim() || "Started dreaming.",
        body:
          String(dream.summary || "").trim() ||
          String(dream.description || "").trim() ||
          "Sleep turned into another vivid dream.",
        timestamp: Number(dream.timestamp || nowMs()),
        happiness:
          String(dream.kind || "").toLowerCase() === "nightmare" ? -2 : 2,
      });
    },

    grantFounderReward(state, { payload }) {
      const now = typeof payload?.now === "number" ? payload.now : nowMs();

      if (!state.cosmetics) state.cosmetics = { ...initialCosmetics };
      if (!Array.isArray(state.cosmetics.unlockedIds)) {
        state.cosmetics.unlockedIds = [...initialCosmetics.unlockedIds];
      }
      if (!state.cosmetics.equipped) {
        state.cosmetics.equipped = { ...initialCosmetics.equipped };
      }

      if (state.cosmetics.unlockedIds.includes("beta_collar_2026")) return;

      state.cosmetics.unlockedIds.push("beta_collar_2026");

      const equippedCollar = String(
        state.cosmetics.equipped.collar || ""
      ).trim();
      if (!equippedCollar || equippedCollar === "collar_plain_red") {
        state.cosmetics.equipped.collar = "beta_collar_2026";
      }

      pushJournalEntry(state, {
        type: "REWARD",
        moodTag: "PROUD",
        summary: "Founder reward unlocked",
        body: "The exclusive Beta Blue Collar is now permanently unlocked.",
        timestamp: now,
      });
    },

    claimTreasureFind(state, { payload }) {
      const treasureId = normalizeActionKey(payload?.id);
      const treasure = TREASURE_REWARD_CATALOG[treasureId];
      if (!treasure) return;

      const now = typeof payload?.now === "number" ? payload.now : nowMs();
      applyDecay(state, now);
      wakeForInteraction(state);

      const inventory = ensureInventoryState(state);
      inventory.foundTreasures[treasureId] = Math.max(
        0,
        Math.floor(Number(inventory.foundTreasures[treasureId] || 0))
      );
      inventory.foundTreasures[treasureId] += 1;

      const coinBonus = Math.max(
        0,
        Math.round(Number(payload?.coinBonus ?? treasure.coinBonus) || 0)
      );
      if (coinBonus > 0) {
        state.coins = Math.max(
          0,
          Math.round(Number(state.coins || 0) + coinBonus)
        );
      }

      state.stats.happiness = clamp(Number(state.stats.happiness || 0) + 4);
      state.stats.mentalStimulation = clamp(
        Number(state.stats.mentalStimulation || 0) + 6
      );
      state.stats.energy = clamp(Number(state.stats.energy || 0) - 1);

      state.memory.lastTreasureHuntAt = now;
      state.memory.lastTreasureFoundAt = now;
      state.memory.lastTreasureFoundId = treasureId;
      state.memory.lastSeenAt = now;
      state.lastAction = resolveActionOverride(payload, "treasure_found");
      applyFsmAction(state, "play", now);
      applyBondGain(state, 0.9, now);
      applyXp(state, 5);

      pushJournalEntry(state, {
        type: "DISCOVERY",
        moodTag: "CURIOUS",
        summary: `Treasure found: ${treasure.name}`,
        body: `Your pup followed a scent trail and dug up ${treasure.icon} ${treasure.name}.`,
        timestamp: now,
      });

      maybeSampleMood(state, now, "TREASURE_FOUND");
      updateTemperamentReveal(state, now);
      finalizeDerivedState(state, now);
    },

    purchaseCosmetic(state, { payload }) {
      const id = String(payload?.id || "").trim();
      if (!id) return;

      const catalogItem = getCatalogItemById(id);
      const price = Math.max(
        0,
        Math.round(Number(payload?.price ?? catalogItem?.price) || 0)
      );
      const currency = String(
        payload?.currency || catalogItem?.currency || "coins"
      )
        .trim()
        .toLowerCase();
      const now = typeof payload?.now === "number" ? payload.now : nowMs();
      const repeatable = Boolean(catalogItem?.repeatable);

      if (!state.cosmetics) state.cosmetics = { ...initialCosmetics };
      if (!Array.isArray(state.cosmetics.unlockedIds))
        state.cosmetics.unlockedIds = [];
      if (!state.cosmetics.equipped)
        state.cosmetics.equipped = { ...initialCosmetics.equipped };
      ensureInventoryState(state);

      if (!repeatable && state.cosmetics.unlockedIds.includes(id)) return;
      if (currency === "gems") {
        state.gems = Math.max(0, Math.round(Number(state.gems || 0)));
        if (price > 0 && state.gems < price) return;
      } else {
        state.coins = Math.max(0, Math.round(Number(state.coins || 0)));
        if (price > 0 && state.coins < price) return;
      }

      if (currency === "gems") {
        state.gems = Math.max(0, Math.round((state.gems || 0) - price));
      } else {
        state.coins = Math.max(0, Math.round((state.coins || 0) - price));
      }
      if (!repeatable && !state.cosmetics.unlockedIds.includes(id)) {
        state.cosmetics.unlockedIds.push(id);
      }

      if (id === "toy_indestructible_bone") {
        state.inventory.chewProtectionUntil = now + 3 * 24 * 60 * 60 * 1000;
      }
      if (id === "yard_auto_ball_launcher" || id === "toy_rc_robot_mouse") {
        state.inventory.autoBallLauncherOwned = true;
        state.inventory.robotMouseOwned = true;
      }
      if (
        String(catalogItem?.slot || "").toLowerCase() === "toy" &&
        !state.inventory.activeToyId
      ) {
        state.inventory.activeToyId = id;
      }

      pushJournalEntry(state, {
        type: "STORE",
        moodTag: "HAPPY",
        summary: "Store purchase complete",
        body: `Purchased: ${id}${price ? ` for ${price} ${currency}` : ""}.`,
        timestamp: now,
      });
    },

    equipCosmetic(state, { payload }) {
      const slot = String(payload?.slot || "").toLowerCase();
      const id = payload?.id == null ? null : String(payload.id).trim();
      if (!slot) return;

      if (!state.cosmetics) state.cosmetics = { ...initialCosmetics };
      if (!state.cosmetics.equipped)
        state.cosmetics.equipped = { ...initialCosmetics.equipped };

      if (!["collar", "tag", "backdrop"].includes(slot)) return;
      state.cosmetics.equipped[slot] = id || null;
    },

    startRainbowBridge(state, { payload }) {
      const now = typeof payload?.now === "number" ? payload.now : nowMs();
      if (!state.memorial) state.memorial = { ...initialMemorial };
      state.memorial.active = true;
      state.memorial.startedAt = now;
      if (!state.memorial.completedAt) {
        pushJournalEntry(state, {
          type: "MEMORIAL",
          moodTag: "CALM",
          summary: "Visited Rainbow Bridge",
          body: "You began a quiet moment of remembrance.",
          timestamp: now,
        });
      }
    },

    completeRainbowBridge(state, { payload }) {
      const now = typeof payload?.now === "number" ? payload.now : nowMs();
      if (!state.memorial) state.memorial = { ...initialMemorial };
      state.memorial.active = false;
      state.memorial.completedAt = now;

      pushJournalEntry(state, {
        type: "MEMORIAL",
        moodTag: "CALM",
        summary: "Completed the memorial",
        body: "The memorial is complete. You can revisit this space anytime.",
        timestamp: now,
      });
    },

    setVacationMode(state, { payload }) {
      const now = nowMs();
      const v = ensureVacationState(state);
      const nextEnabled = Boolean(payload);

      if (nextEnabled === v.enabled) return;

      if (nextEnabled) {
        v.enabled = true;
        v.startedAt = now;
        state.lastUpdatedAt = now;
        state.lastAction = "vacation_on";

        pushJournalEntry(state, {
          type: "INFO",
          moodTag: "CALM",
          summary: "Vacation mode enabled",
          body: "Your pup is being cared for while you're away. Decay and aging are paused.",
          timestamp: now,
        });
      } else {
        const mult = clamp(Number(v.multiplier) || 1, 0, 1);
        if (typeof v.startedAt === "number") {
          const dt = Math.max(0, now - v.startedAt);
          v.skippedMs = Math.max(
            0,
            (Number(v.skippedMs) || 0) + dt * (1 - mult)
          );
        }

        v.enabled = false;
        v.startedAt = null;
        state.lastUpdatedAt = now;
        state.lastAction = "vacation_off";

        pushJournalEntry(state, {
          type: "INFO",
          moodTag: "HAPPY",
          summary: "Vacation mode disabled",
          body: "Welcome back! Your pup is excited to see you.",
          timestamp: now,
        });
      }

      finalizeDerivedState(state, now);
    },

    toggleDebug(state) {
      state.debug = !state.debug;
    },

    resetDogState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      (action) => action?.type === "engine/TICK",
      (state, action) => {
        applyWorldTick(state, action.payload);
      }
    );
  },
});

/* ---------------------- selectors ---------------------- */

export const selectDog = (state) => state.dog;
export const selectDogStats = (state) => state.dog.stats;
export const selectDogMood = (state) => state.dog.mood;
export const selectDogJournal = (state) => state.dog.journal;
export const selectDogMemories = (state) =>
  Array.isArray(state?.dog?.memories)
    ? state.dog.memories
    : initialSimulationMemories;
export const selectDogTemperament = (state) => state.dog.temperament;
export const selectDogPersonality = (state) => state.dog.personality;
export const selectDogHealthSilo = (state) => state.dog.healthSilo;
export const selectDogDreams = (state) => state.dog.dreams;
export const selectDogSkills = (state) => state.dog.skills;
export const selectDogStreak = (state) => state.dog.streak;
export const selectDogLifeStage = (state) => state.dog.lifeStage;
export const selectDogCleanlinessTier = (state) => state.dog.cleanlinessTier;
export const selectDogPolls = (state) => state.dog.polls;
export const selectDogTraining = (state) => state.dog.training;
export const selectDogSurprise = (state) => state.dog.surprise;

export const selectDogSkillTree = (state) => state.dog.skillTree;
export const selectDogSkillTreeUnlockedIds = (state) =>
  Array.isArray(state.dog?.skillTree?.unlockedIds)
    ? state.dog.skillTree.unlockedIds
    : [];
export const selectDogSkillTreePoints = (state) =>
  getSkillTreePointsFromDogState(state.dog);

export const selectDogBond = (state) => state.dog.bond;
export const selectDogMemorial = (state) => state.dog.memorial;
export const selectDogVacation = (state) => state.dog.vacation;
export const selectDogLifecycleStatus = (state) => state.dog.lifecycleStatus;
export const selectDogDanger = (state) => state.dog.danger;
export const selectDogLegacyJourney = (state) => state.dog.legacyJourney;
export const selectDogIdentityProfile = (state) =>
  state?.dog?.identity && typeof state.dog.identity === "object"
    ? state.dog.identity
    : DEFAULT_DOG_IDENTITY;
export const selectDogIdentityContent = (state) =>
  state?.dog?.identityContent && typeof state.dog.identityContent === "object"
    ? state.dog.identityContent
    : initialIdentityContent;
export const selectDogPreferences = createSelector(
  [selectDogIdentityContent, selectDog],
  (identityContent, dog) => ({
    favoriteToyId:
      identityContent?.preferences?.favoriteToyId ||
      dog?.memory?.favoriteToyId ||
      null,
    favoriteFoodType: identityContent?.preferences?.favoriteFoodType || null,
    favoriteNapSpotId: identityContent?.preferences?.favoriteNapSpotId || null,
    discoveredAtByKey:
      identityContent?.preferences?.discoveredAtByKey &&
      typeof identityContent.preferences.discoveredAtByKey === "object"
        ? identityContent.preferences.discoveredAtByKey
        : {},
  })
);
export const selectDogDailyFlavor = createSelector(
  [selectDogIdentityContent],
  (identityContent) => ({
    dayKey: identityContent?.dailyFlavor?.dayKey || null,
    title: identityContent?.dailyFlavor?.title || null,
    body: identityContent?.dailyFlavor?.body || null,
    tone: identityContent?.dailyFlavor?.tone || "calm",
    generatedAt: Number.isFinite(
      Number(identityContent?.dailyFlavor?.generatedAt)
    )
      ? Number(identityContent.dailyFlavor.generatedAt)
      : null,
  })
);
export const selectDogMilestoneCardQueue = createSelector(
  [selectDogIdentityContent],
  (identityContent) =>
    Array.isArray(identityContent?.milestoneCards?.queue)
      ? identityContent.milestoneCards.queue
      : []
);
export const selectDogPrimaryFavoriteSummary = createSelector(
  [selectDogPreferences],
  (preferences) => {
    const favoriteToyId = preferences?.favoriteToyId || null;
    const favoriteToyItem = favoriteToyId
      ? getCatalogItemById(favoriteToyId)
      : null;
    const favoriteFoodType = preferences?.favoriteFoodType || null;
    const favoriteNapSpotId = preferences?.favoriteNapSpotId || null;

    return {
      favoriteToyId,
      favoriteToyLabel: favoriteToyItem?.label || null,
      favoriteFoodType,
      favoriteFoodLabel: getIdentityFavoriteFoodLabel(favoriteFoodType),
      favoriteNapSpotId,
      favoriteNapSpotLabel: getIdentityNapSpotLabel(favoriteNapSpotId),
    };
  }
);

export const selectCosmeticCatalog = () => DEFAULT_COSMETIC_CATALOG;

export const selectDogMoodLabel = (state) => {
  const dog = state.dog;
  if (typeof dog?.mood === "string" && dog.mood.trim()) return dog.mood;
  if (typeof dog?.emotionCue === "string" && dog.emotionCue.trim())
    return dog.emotionCue;
  return "Content";
};

export const selectDogAgeInfo = createSelector([selectDog], (dog) => {
  const age = getDerivedDogAgeProgress(dog, Date.now());
  const fallbackStage = dog?.lifeStage?.stage || LIFE_STAGES.PUPPY;
  const fallbackDays = dog?.lifeStage?.days || 0;
  if (age) {
    const lifecycleWindow = getLifecycleWindowFlags(age.ageInGameDays);
    return {
      ...age,
      ...lifecycleWindow,
      ageBucketLabel: getLifeStageLabel(age.stageId),
      progressLabel: getLifeStageProgressLabel(age),
      ui: getLifeStageUi(age.stageId),
    };
  }
  const stageUi = getLifeStageUi(fallbackStage);
  const lifecycleWindow = getLifecycleWindowFlags(fallbackDays);
  return {
    days: fallbackDays,
    ageInGameDays: fallbackDays,
    stage: fallbackStage,
    stageId: fallbackStage,
    label: dog?.lifeStage?.label || getLifeStageLabel(fallbackStage),
    stageLabel: dog?.lifeStage?.label || getLifeStageLabel(fallbackStage),
    stageProgress: 0,
    stageProgressPct: 0,
    daysUntilNextStage: null,
    nextStage: null,
    ...lifecycleWindow,
    ageBucketLabel: getLifeStageLabel(fallbackStage),
    progressLabel: getLifeStageProgressLabel({ stageId: fallbackStage }),
    ui: stageUi,
  };
});

export const selectDogLifecycleWindow = createSelector(
  [selectDogAgeInfo],
  (ageInfo) => ({
    ageDays: Number(ageInfo?.ageDays ?? ageInfo?.ageInGameDays ?? 0),
    isFinalStretchImmune: Boolean(ageInfo?.isFinalStretchImmune),
    isFarewellReady: Boolean(ageInfo?.isFarewellReady),
    daysUntilFarewell: Number(ageInfo?.daysUntilFarewell ?? 0),
  })
);

export const selectDogCleanlinessMeta = createSelector(
  [selectDogCleanlinessTier],
  (cleanlinessTier) => {
    const tier = cleanlinessTier || "FRESH";
    return {
      tier,
      label: getCleanlinessLabel(tier),
      severity: getCleanlinessSeverity(tier),
      ui: getCleanlinessUi(tier),
      penalties:
        CLEANLINESS_TIER_EFFECTS[String(tier).toUpperCase()]?.penalties || null,
    };
  }
);

export const selectDogNeedsNormalized = createSelector(
  [selectDogStats, selectDogBond, (state) => state.dog?.pottyLevel || 0],
  (stats, bond, pottyLevel) => ({
    food: clamp01(1 - Number(stats.hunger || 0) / 100),
    water: clamp01(1 - Number(stats.thirst || 0) / 100),
    energy: clamp01(Number(stats.energy || 0) / 100),
    happiness: clamp01(Number(stats.happiness || 0) / 100),
    health: clamp01(Number(stats.health || 0) / 100),
    potty: clamp01(1 - Number(pottyLevel || 0) / 100),
    cleanliness: clamp01(Number(stats.cleanliness || 0) / 100),
    bond: clamp01(Number(bond?.value || 0) / 100),
  })
);

export const selectNextStreakReward = createSelector([selectDog], (dog) => {
  const streakDays = Math.max(
    0,
    Math.floor(Number(dog?.streak?.currentStreakDays) || 0)
  );
  const unlocked = new Set(
    Array.isArray(dog?.cosmetics?.unlockedIds) ? dog.cosmetics.unlockedIds : []
  );

  const next =
    DEFAULT_COSMETIC_CATALOG.filter((it) => it && it.id)
      .filter((it) => !unlocked.has(it.id))
      .filter((it) => (Number(it?.threshold) || 0) > 0)
      .sort((a, b) => (Number(a.threshold) || 0) - (Number(b.threshold) || 0))
      .find((it) => (Number(it.threshold) || 0) > streakDays) || null;

  return { streakDays, next };
});

/* ----------------------- actions / reducer ----------------------- */

export const {
  hydrateDog,
  setDogName,
  setAdoptedAt,
  setCareerLifestyle,
  acknowledgeGrowthMilestone,
  ackTemperamentReveal,
  markTemperamentRevealed,
  unlockTrick,
  updateFavoriteToy,
  setActiveToy,
  feed,
  quickFeed,
  giveWater,
  play,
  petDog,
  rest,
  wakeUp,
  triggerManualAction,
  setMood,
  setDesiredAction,
  triggerOneShot,
  oneShotFinished,
  setFacing,
  dropFoodBowl,
  tryConsumeFoodBowl,
  dismissActiveDream,
  bathe,
  increasePottyLevel,
  goPotty,
  recordAccident,
  scoopPoop,
  addXp,
  removeXp,
  simulationTick,
  tickDog,
  registerSessionStart,
  triggerButtonHeist,
  resolveSessionSurprise,
  tickDogPolls,
  respondToDogPoll,
  claimDailyReward,
  rewardSocialShare,
  beginRunawayStrike,
  grantPreRegGift,
  resolveRunawayStrike,
  trainObedience,
  unlockSkillTreePerk,
  respecSkillTree,
  respecSkillTreeBranch,
  addJournalEntry,
  addMemories,
  addDream,
  grantFounderReward,
  claimTreasureFind,
  purchaseCosmetic,
  buyPremiumKibblePack,
  equipCosmetic,
  startRainbowBridge,
  completeRainbowBridge,
  setVacationMode,
  toggleDebug,
  resetDogState,
} = dogSlice.actions;

export default dogSlice.reducer;
