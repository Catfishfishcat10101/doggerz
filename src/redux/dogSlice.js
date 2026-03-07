// src/redux/dogSlice.js
export const selectDogMoodlets = (state) => state.dog.moodlets;
export const selectDogEmotionCue = (state) => state.dog.emotionCue;
export const selectDogGrowthMilestone = (state) =>
  state.dog?.milestones?.pending || null;
export const selectDogAnimation = (state) =>
  state?.dog?.animation || DEFAULT_ANIMATION_STATE;

import { createSlice } from "@reduxjs/toolkit";
import { calculateDogAge } from "@/utils/lifecycle.js";
import { deepMergeDefined } from "@/utils/deepMerge.js";
import {
  CLEANLINESS_TIER_EFFECTS,
  LIFE_STAGES,
  getCleanlinessLabel,
  getCleanlinessSeverity,
  getCleanlinessUi,
  getLifeStageLabel,
} from "@/features/game/game.js";
import {
  OBEDIENCE_COMMANDS,
  commandRequirementsMet,
  getObedienceCommand,
} from "@/logic/obedienceCommands.js";
import {
  getObedienceSkillMasteryPct,
  resolveJrtTrainingReaction,
} from "@/logic/jrtTrainingController.js";
import { computeTrainingSuccessChance } from "@/utils/trainingMath.js";
import {
  computeSkillTreePoints,
  computeSkillTreeModifiers,
  getSkillTreeBranchIdForPerk,
  getSkillTreeUnlockCheck,
  getSkillTreePerk,
} from "@/logic/skillTree.js";
import {
  advanceDogFsm,
  applyFsmAction,
  ensureDogFsmState,
  isDogFsmLocked,
  DOG_FSM_DEFAULT,
  transitionDogFsm,
} from "@/utils/dogFsm.js";
import {
  applyPersonalityDrift,
  buildDreamFromState,
  calculateFeedStats,
  calculatePlayStats,
} from "@/logic/dogEngine.js";
import { derivePersonalityProfile } from "@/logic/personalityProfile.js";

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
  dirty: "scratch",
  excited: "walk",
  sad: "idle",
  stressed: "idle",
  fragile: "idle",
  happy: "idle",
  ok: "idle",
});

const deriveDesiredActionFromMood = (mood) =>
  MOOD_TO_DESIRED_ACTION[normalizeActionKey(mood)] || "idle";
const DECAY_PER_HOUR = {
  hunger: 8,
  thirst: 7,
  happiness: 6,
  energy: 8,
  cleanliness: 3,
  health: 2,
  affection: 5,
  mentalStimulation: 4,
};
const DECAY_SPEED = 0.4;

const SLEEP_RECOVERY_PER_HOUR = 45;
const SLEEP_NEEDS_MULTIPLIER = 0.85;
const AUTO_SLEEP_THRESHOLD = 40;
const AUTO_WAKE_THRESHOLD = 80;
const POTTY_FILL_PER_HOUR = 10;
const MAX_ACCIDENTS_PER_DECAY = 3;
const MOOD_SAMPLE_MINUTES = 60;
const SENIOR_STAGE_START_DAY = 2556;
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
const LONG_LIFE_FAREWELL_AGE_DAYS = 5000;
export const LEVEL_XP_STEP = 100;
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
]);
const YARD_ENVIRONMENTS = Object.freeze({
  APARTMENT: "apartment",
  YARD: "yard",
});
const DEFAULT_VACATION_STATE = Object.freeze({
  enabled: false,
  multiplier: 0,
  startedAt: null,
  skippedMs: 0,
});

const DOG_RULE_PIPELINE_STAGES = Object.freeze([
  "computeDegradation",
  "applyEnvironmentModifiers",
  "applyCompounding",
  "evaluateThresholds",
  "runLegacyEvents",
]);

const nowMs = () => Date.now();
function parseAdoptedAt(raw) {
  if (raw === undefined || raw === null) return null;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (raw instanceof Date) return raw.getTime();
  if (typeof raw === "string") {
    const numeric = Number(raw);
    if (!Number.isNaN(numeric)) return numeric;
    const parsed = Date.parse(raw);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return null;
}

function normalizeStatsState(state) {
  if (!state.stats || typeof state.stats !== "object") {
    state.stats = { ...DEFAULT_STATS };
    return state.stats;
  }
  state.stats = {
    ...DEFAULT_STATS,
    ...state.stats,
  };
  Object.keys(DEFAULT_STATS).forEach((key) => {
    state.stats[key] = clamp(state.stats[key], 0, 100);
  });
  return state.stats;
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

function ensureYardState(state) {
  if (!state.yard || typeof state.yard !== "object") {
    state.yard = {
      environment: YARD_ENVIRONMENTS.APARTMENT,
      holes: [],
      foodBowl: null,
      chewBoneAvailable: false,
      lastTableTheftAt: null,
    };
    return state.yard;
  }

  const environment = String(
    state.yard.environment || YARD_ENVIRONMENTS.APARTMENT
  )
    .trim()
    .toLowerCase();
  state.yard.environment =
    environment === YARD_ENVIRONMENTS.YARD
      ? YARD_ENVIRONMENTS.YARD
      : YARD_ENVIRONMENTS.APARTMENT;

  if (!Array.isArray(state.yard.holes)) {
    state.yard.holes = [];
  }

  if (!("foodBowl" in state.yard)) {
    state.yard.foodBowl = null;
  }
  if (typeof state.yard.chewBoneAvailable !== "boolean") {
    state.yard.chewBoneAvailable = false;
  }
  const lastTableTheftAt = Number(state.yard.lastTableTheftAt);
  state.yard.lastTableTheftAt = Number.isFinite(lastTableTheftAt)
    ? lastTableTheftAt
    : null;

  return state.yard;
}

function getYardEnvironment(state) {
  return ensureYardState(state).environment || YARD_ENVIRONMENTS.APARTMENT;
}

function isApartmentEnvironment(state) {
  return getYardEnvironment(state) === YARD_ENVIRONMENTS.APARTMENT;
}

function isApartmentLowTableZone(xNorm, yNorm) {
  const x = clamp(Number(xNorm || 0), 0, 1);
  const y = clamp(Number(yNorm || 0), 0, 1);
  return x >= 0.56 && x <= 0.82 && y >= 0.42 && y <= 0.62;
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
    state.stats.health = clamp(state.stats.health - 1, 0, 100);

    if (
      state.memory.junkFoodCountToday >= 3 &&
      state.memory.junkFoodBingeDayKey !== dayKey
    ) {
      state.memory.junkFoodBingeDayKey = dayKey;
      state.stats.health = clamp(state.stats.health - 3, 0, 100);
      junkBingeTriggered = true;
    }
  } else if (usePremiumKibble) {
    // Premium kibble gives a larger health recovery bump.
    if (Number(state.stats.health || 0) < 100) {
      state.stats.health = clamp(Number(state.stats.health || 0) + 5, 0, 100);
    }
    state.stats.energy = 100;
    inventory.premiumKibble = Math.max(
      0,
      Number(inventory.premiumKibble || 0) - 1
    );
  } else if (effectiveFoodType === "regular_kibble") {
    if (Number(state.stats.health || 0) < 100) {
      state.stats.health = clamp(Number(state.stats.health || 0) + 2, 0, 100);
    }
  }

  state.memory.lastFedAt = now;
  state.memory.lastFedFoodType = effectiveFoodType;
  state.memory.lastSeenAt = now;
  state.lastAction = resolveActionOverride(payload, "feed");
  applyFsmAction(state, "feed", now);

  if (junkBingeTriggered) {
    state.lastAction = "lethargic_lay";
    state.isAsleep = true;
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
  applyBondGain(state, 0.7 * sweetBondMultiplier, now);
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

function maybeStealApartmentTableFood(state, now) {
  const yard = ensureYardState(state);
  const bowl = yard.foodBowl;
  if (!isApartmentEnvironment(state) || !bowl) return false;
  if (String(bowl.surface || "") !== "low_table") return false;

  const stealReadyAt = Number(
    bowl.stealReadyAt || bowl.readyAt || bowl.placedAt || 0
  );
  if (stealReadyAt && now < stealReadyAt) return false;

  const lastTableTheftAt = Number(yard.lastTableTheftAt || 0);
  if (lastTableTheftAt && now - lastTableTheftAt < 12_000) return false;

  const hunger = Number(state.stats?.hunger ?? 0);
  const spicyBoost = hasTemperamentTag(state, "SPICY") ? 10 : 0;
  const threshold = Math.max(18, 26 - spicyBoost);
  if (hunger < threshold) return false;

  const consumed = maybeConsumeFoodBowl(state, now, {
    hungerThreshold: threshold,
    action: "table_theft",
  });
  if (!consumed) return false;

  yard.lastTableTheftAt = now;
  state.stats.happiness = clamp(Number(state.stats.happiness || 0) + 2, 0, 100);
  state.stats.mentalStimulation = clamp(
    Number(state.stats.mentalStimulation || 0) + 4,
    0,
    100
  );
  state.lastAction = "table_theft";

  pushJournalEntry(state, {
    type: "SURPRISE",
    moodTag: "SASSY",
    summary: "Low-table snack stolen",
    body: "You left food on the apartment table and your pup swiped it the second you looked away.",
    timestamp: now,
  });

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
  return getTemperamentTags(state).has(target);
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
  const pottyLevel = Number(state.pottyLevel || 0);
  const moodlets = [];

  const add = (type, intensity, source) => {
    moodlets.push({
      type,
      intensity,
      source: source || null,
    });
  };

  if (hunger >= 70) {
    add("hungry", hunger >= 90 ? 3 : hunger >= 80 ? 2 : 1, "Hunger");
  }
  if (thirst >= 70) {
    add("thirsty", thirst >= 90 ? 3 : thirst >= 80 ? 2 : 1, "Thirst");
  }
  if (pottyLevel >= 80) {
    add(
      "potty",
      pottyLevel >= 95 ? 3 : pottyLevel >= 88 ? 2 : 1,
      "Needs a bathroom break"
    );
  }
  if (energy <= 30) {
    add("tired", energy <= 15 ? 3 : energy <= 25 ? 2 : 1, "Low energy");
  }
  if (cleanliness <= 35) {
    add(
      "dirty",
      cleanliness <= 15 ? 3 : cleanliness <= 25 ? 2 : 1,
      "Messed up fur"
    );
  }
  if (health <= 35) {
    add("sick", health <= 15 ? 3 : health <= 25 ? 2 : 1, "Needs care");
  }
  if (stats.affection <= 30) {
    add("lonely", stats.affection <= 15 ? 3 : 2, "Needs cuddles");
  }
  if (stats.mentalStimulation <= 30) {
    add("bored", stats.mentalStimulation <= 15 ? 3 : 2, "Needs a job to do");
  }
  if (happiness >= 75) {
    add("happy", happiness >= 90 ? 2 : 1, "Good vibes");
  }
  if ((state.memory?.neglectStrikes || 0) > 0) {
    const strikes = Math.min(3, Math.max(1, state.memory.neglectStrikes || 0));
    add("lonely", strikes, "Time apart");
  }
  if (state.lastAction === "trainFailed") {
    add("stubborn", 1, "Training");
  }
  if (Number(state?.healthSilo?.jointStiffness || 0) >= 70) {
    add(
      "sore",
      Number(state.healthSilo.jointStiffness) >= 85 ? 2 : 1,
      "Joints"
    );
  }
  if (Number(state?.healthSilo?.dentalHealth || 100) <= 35) {
    add("dental_pain", 1, "Teeth");
  }
  if (state.cleanlinessTier === "FLEAS") {
    add("itchy", 2, "Fleas");
  }
  if (state.cleanlinessTier === "MANGE") {
    add("itchy", 3, "Mange");
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

  if (state.lastAction === "trainFailed") return "stubborn";
  if (energy <= 20) return "sleepy";
  if (Number(state?.healthSilo?.jointStiffness || 0) >= 85) return "sore";
  if (health <= 20) return "sick";
  if (thirst >= 85) return "thirsty";
  if (hunger >= 85) return "hungry";
  if (cleanliness <= 20) return "dirty";
  if ((state.memory?.neglectStrikes || 0) > 0 && happiness < 40)
    return "lonely";
  if (happiness >= 85) return "happy";
  return null;
}
const getDaysBetween = (fromMs, toMs) => {
  if (!fromMs) return Infinity;
  return (toMs - fromMs) / (1000 * 60 * 60 * 24);
};
const POTTY_TRAINING_GOAL = 8;
const REAL_DAY_MS = 24 * 60 * 60 * 1000;
const POTTY_TRAINED_POTTY_GAIN_MULTIPLIER = 0.65;
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
    stay: { level: 0, xp: 0 },
    down: { level: 0, xp: 0 },
    come: { level: 0, xp: 0 },
    heel: { level: 0, xp: 0 },
    rollOver: { level: 0, xp: 0 },
    speak: { level: 0, xp: 0 },
    shake: { level: 0, xp: 0 },
    highFive: { level: 0, xp: 0 },
    wave: { level: 0, xp: 0 },
    spin: { level: 0, xp: 0 },
    jump: { level: 0, xp: 0 },
    bow: { level: 0, xp: 0 },
    playDead: { level: 0, xp: 0 },
    fetch: { level: 0, xp: 0 },
    dance: { level: 0, xp: 0 },
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
    id: "backdrop_sunset",
    slot: "backdrop",
    category: "apparel",
    threshold: 14,
    label: "Sunset Backdrop",
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
  name: "Pup",
  level: 1,
  xp: 0,
  coins: 0,
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
  },

  stats: { ...DEFAULT_STATS },
  moodlets: [],
  emotionCue: null,

  cleanlinessTier: "FRESH",
  poopCount: 0,

  isAsleep: false,
  debug: false,
  lastUpdatedAt: null,

  vacation: { ...DEFAULT_VACATION_STATE },

  // Used by UI renderers/selectors to derive simple animation hints
  lastAction: null,
  yard: {
    environment: YARD_ENVIRONMENTS.APARTMENT,
    holes: [],
    foodBowl: null,
    chewBoneAvailable: false,
    lastTableTheftAt: null,
  },
  animation: { ...DEFAULT_ANIMATION_STATE },
  fsm: { ...DOG_FSM_DEFAULT },

  temperament: initialTemperament,
  personality: initialPersonality,
  healthSilo: { ...initialHealthSilo },
  personalityProfile: null,
  memory: initialMemory,
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
  training: createInitialTrainingState(),
  lifecycleStatus: DOG_LIFECYCLE_STATUS.NONE,
  danger: { ...initialDanger },
  legacyJourney: { ...initialLegacyJourney },

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
  const ts = entry.timestamp ?? nowMs();
  const id = `${ts}-${state.journal.entries.length + 1}`;

  state.journal.entries.unshift({
    id,
    timestamp: ts,
    type: entry.type || "INFO",
    moodTag: entry.moodTag || null,
    summary: entry.summary || "",
    body: entry.body || "",
  });

  if (state.journal.entries.length > 200) {
    state.journal.entries.length = 200;
  }
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
  const cleanlinessTier = String(state.cleanlinessTier || "").toUpperCase();
  const tierPenalty =
    cleanlinessTier === "MANGE" ? 16 : cleanlinessTier === "FLEAS" ? 8 : 0;

  return clamp(Math.round(pressure * 0.62 + neglect + accidents + tierPenalty));
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
  const reason =
    "Major mistreatment risk detected (critical neglect and unsafe conditions).";

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
    body:
      "Animal Rescue Center has taken your dog into protective care. " +
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
      "Dear hooman,\n\nWe had a full, happy life. Thank you for every walk, toy, and nap together. " +
      "I’ll meet you at Rainbow Bridge.\n\nAlways your pup.",
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

  const score = computeDangerScore(state);
  danger.score = score;
  danger.tier = getDangerTier(score);

  if (score >= DANGER_RUNAWAY_LETTER_THRESHOLD) {
    pushDearHoomanRunawayLetter(state, now, score);
  }

  const neglect = Number(state.memory?.neglectStrikes || 0);
  const majorMistreatment = score >= DANGER_RESCUE_THRESHOLD || neglect >= 8;
  if (majorMistreatment) {
    triggerAnimalRescueCenter(state, now, score);
    return;
  }

  const isSenior =
    String(state.lifeStage?.stage || "").toUpperCase() === "SENIOR";
  const ageDays = Number(state.lifeStage?.days || 0);
  const bond = Number(state.bond?.value || 0);
  if (isSenior && ageDays >= LONG_LIFE_FAREWELL_AGE_DAYS && bond >= 60) {
    triggerLongLifeFarewell(state, now);
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

function createDecayRuleContext(state, now) {
  normalizeStatsState(state);
  ensurePersonalityState(state);
  ensureHealthSiloState(state);

  const lastUpdatedAt = Number(state.lastUpdatedAt);
  if (!Number.isFinite(lastUpdatedAt)) {
    state.lastUpdatedAt = now;
    return null;
  }

  const MAX_DECAY_HOURS = 72;
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
  const effectiveHours = diffHours * decayMultiplier;

  const careerHungerMultiplier =
    state.career.perks?.hungerDecayMultiplier || 1.0;
  const skillMods = getSkillTreeModifiersFromDogState(state);
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
    vacation,
    sleeping,
    idleish,
    multipliers: {
      hunger: careerHungerMultiplier * (skillMods.hungerDecayMultiplier || 1),
      happiness:
        (skillMods.happinessDecayMultiplier || 1) *
        (hasTemperamentTag(state, "SWEET") ? 0.85 : 1) *
        (1 + separationAnxiety * 0.008),
      cleanliness: skillMods.cleanlinessDecayMultiplier || 1,
      idleEnergy: skillMods.idleEnergyDecayMultiplier || 1,
    },
    instinctEngine: {
      separationAnxiety,
      trainabilitySpeed,
      vocalizationThreshold,
      chewingUrge,
    },
    stageMultipliers: {},
    decayByStat: {},
    energyRecoveryGain: 0,
  };
}

function computeDegradationStage(ctx) {
  Object.keys(ctx.state.stats).forEach((key) => {
    if (!isValidStat(key)) return;
    const stageMultiplier = getStageMultiplier(ctx.state, key);
    ctx.stageMultipliers[key] = stageMultiplier;
    ctx.decayByStat[key] =
      (DECAY_PER_HOUR[key] || 0) *
      DECAY_SPEED *
      ctx.effectiveHours *
      stageMultiplier;
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

function evaluateThresholdsStage(ctx) {
  Object.entries(ctx.state.stats).forEach(([key, value]) => {
    if (!isValidStat(key)) return;

    const delta = Number(ctx.decayByStat[key] || 0);
    if (key === "hunger" || key === "thirst") {
      ctx.state.stats[key] = clamp(Number(value || 0) + delta, 0, 100);
      return;
    }

    if (key === "energy" && ctx.sleeping) {
      ctx.state.stats.energy = clamp(
        Number(value || 0) + Number(ctx.energyRecoveryGain || 0),
        0,
        100
      );
      return;
    }

    ctx.state.stats[key] = clamp(Number(value || 0) - delta, 0, 100);
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
    const perHour = POTTY_FILL_PER_HOUR * tierMultiplier * trainingMultiplier;
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

function applyXp(state, amount = 10) {
  state.xp += amount;
  const targetLevel = 1 + Math.floor(state.xp / LEVEL_XP_STEP);
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
  const targetLevel = Math.max(1, 1 + Math.floor(state.xp / LEVEL_XP_STEP));
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
  const adoptedAt = state.temperament.adoptedAt;
  if (!adoptedAt) return;
  if (state.temperament.revealedAt) return;

  const days = getDaysBetween(adoptedAt, now);
  if (days >= 14) {
    state.temperament.revealReady = true;
  }
}

function evaluateTemperament(state, now = nowMs()) {
  const t = state.temperament;

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
  const nextStage = age.stage || DEFAULT_LIFE_STAGE.stage;
  state.lifeStage = {
    stage: nextStage,
    label: age.label || DEFAULT_LIFE_STAGE.label,
    days: age.days,
  };

  const milestones = ensureMilestonesState(state);
  if (
    previousStage &&
    nextStage &&
    previousStage !== nextStage &&
    !milestones.pending &&
    milestones.lastCelebratedStage !== nextStage
  ) {
    milestones.pending = {
      fromStage: previousStage,
      toStage: nextStage,
      triggeredAt: now,
      ageDays: Number.isFinite(age.days) ? age.days : null,
    };

    pushJournalEntry(state, {
      type: "GROWTH",
      moodTag: "PROUD",
      summary: `Grew into a ${getLifeStageLabel(nextStage)}.`,
      body: "Look at me now—taller, faster, and ready for new adventures together.",
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
  if (!state.vacation || typeof state.vacation !== "object") {
    state.vacation = { ...DEFAULT_VACATION_STATE };
    return state.vacation;
  }

  state.vacation.enabled = Boolean(state.vacation.enabled);

  const mult = Number(state.vacation.multiplier);
  const normalized = Number.isFinite(mult)
    ? clamp(mult, 0, 1)
    : DEFAULT_VACATION_STATE.multiplier;
  state.vacation.multiplier =
    normalized === LEGACY_VACATION_MULTIPLIER
      ? DEFAULT_VACATION_STATE.multiplier
      : normalized;

  if (typeof state.vacation.startedAt !== "number") {
    state.vacation.startedAt = null;
  }

  const skipped = Number(state.vacation.skippedMs);
  state.vacation.skippedMs = Number.isFinite(skipped)
    ? Math.max(0, skipped)
    : 0;

  return state.vacation;
}

function getVacationAdjustedNow(state, now = nowMs()) {
  const v = ensureVacationState(state);
  const baseSkipped = Number(v.skippedMs) || 0;

  if (v.enabled && typeof v.startedAt !== "number") {
    v.startedAt = now;
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

function evaluateObedienceUnlocks(state, now = nowMs()) {
  const training = ensureTrainingState(state);
  const unlocks = ensureObedienceUnlockState(state);
  const pottyComplete = Boolean(training?.potty?.completedAt);
  if (!pottyComplete) return;

  const level = Math.max(1, Number(state.level || 1));
  const bond = clamp(Number(state.bond?.value || 0), 0, 100);
  const streak = Math.max(0, Number(state.streak?.currentStreakDays || 0));

  const context = { level, bond, streak, pottyComplete };

  OBEDIENCE_COMMANDS.forEach((command) => {
    if (!command?.id) return;
    const id = String(command.id);
    if (unlocks.unlockedIds.includes(id)) return;

    const eligible = commandRequirementsMet(context, command);
    if (!eligible) {
      if (unlocks.unlockableAtById[id]) {
        delete unlocks.unlockableAtById[id];
      }
      return;
    }

    const delayMinutes = Number(command.unlockDelayMinutes || 0);
    const delayMs = Math.max(0, Math.round(delayMinutes * 60 * 1000));
    const startedAt = Number(unlocks.unlockableAtById[id] || 0);

    if (delayMs <= 0) {
      unlocks.unlockedIds.push(id);
      unlocks.unlockedAtById[id] = now;
      unlocks.lastUnlockedId = id;
      unlocks.lastUnlockedAt = now;
      if (unlocks.unlockableAtById[id]) delete unlocks.unlockableAtById[id];

      pushJournalEntry(state, {
        type: "TRAINING",
        moodTag: "PROUD",
        summary: `Unlocked ${command.label}.`,
        body: `New command ready: "${command.label}". Time to practice!`,
        timestamp: now,
      });
      return;
    }

    if (!startedAt) {
      unlocks.unlockableAtById[id] = now;
      return;
    }

    if (now - startedAt >= delayMs) {
      unlocks.unlockedIds.push(id);
      unlocks.unlockedAtById[id] = now;
      unlocks.lastUnlockedId = id;
      unlocks.lastUnlockedAt = now;
      if (unlocks.unlockableAtById[id]) delete unlocks.unlockableAtById[id];

      pushJournalEntry(state, {
        type: "TRAINING",
        moodTag: "PROUD",
        summary: `Unlocked ${command.label}.`,
        body: `New command ready: "${command.label}". Time to practice!`,
        timestamp: now,
      });
    }
  });
}

function recordPuppyPottySuccess(state, now = nowMs()) {
  const training = ensureTrainingState(state);
  const potty = training.potty;
  if (!potty || potty.completedAt) return;
  const stage = state.lifeStage?.stage || DEFAULT_LIFE_STAGE.stage;
  if (stage !== LIFE_STAGES.PUPPY) return;

  potty.successCount = Math.min(potty.successCount + 1, potty.goal);

  if (potty.successCount >= potty.goal) {
    potty.completedAt = now;
    state.stats.happiness = clamp(state.stats.happiness + 5, 0, 100);
    pushJournalEntry(state, {
      type: "TRAINING",
      moodTag: "PROUD",
      summary: "Potty training complete",
      body: "Your puppy now knows how to signal when nature calls. Accidents will slow way down!",
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
    };
  }
  if (typeof state.potty.totalSuccesses !== "number")
    state.potty.totalSuccesses = 0;
  if (typeof state.potty.totalAccidents !== "number")
    state.potty.totalAccidents = 0;
  return state.potty;
}

function applyAccidentInternal(state, now = nowMs()) {
  const potty = ensurePottyMeta(state);
  potty.totalAccidents += 1;
  potty.lastAccidentAt = now;

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

function spawnStolenButtonSurprise(state, now) {
  const surprise = ensureSurpriseState(state);
  const stolenAction =
    STOLENABLE_ACTION_KEYS[
      Math.floor(Math.random() * STOLENABLE_ACTION_KEYS.length)
    ] || "train";

  surprise.active = {
    id: `surprise-${now}-stolen`,
    type: SESSION_SURPRISE_TYPES.STOLEN_BUTTON,
    startedAt: now,
    title: "Button Heist",
    message: "Your pup stole one control. Play fetch to win it back.",
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

  spawnStolenButtonSurprise(state, now);
  if (surprise.active) {
    surprise.active.stolenAction = chosen;
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
  if (!isSleepyCue || energy > 5) return false;

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

      const adoptedAt =
        parseAdoptedAt(payload.adoptedAt) ||
        parseAdoptedAt(state.adoptedAt) ||
        nowMs();

      const merged = deepMergeDefined(initialState, state, payload);
      merged.adoptedAt = adoptedAt;
      merged.lastAction =
        payload.lastAction ?? state.lastAction ?? initialState.lastAction;
      merged.cleanlinessTier = merged.cleanlinessTier || "FRESH";

      if (!merged.temperament || typeof merged.temperament !== "object") {
        merged.temperament = { ...initialTemperament };
      }
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
      ensureLifecycleStatus(merged);
      ensureDangerState(merged);
      ensureLegacyJourneyState(merged);
      ensureSurpriseState(merged);

      finalizeDerivedState(merged, nowMs());
      return merged;
    },

    setDogName(state, { payload }) {
      state.name = payload || "Pup";
    },

    setAdoptedAt(state, { payload }) {
      const adoptedAt = parseAdoptedAt(payload) ?? nowMs();
      const legacy = ensureLegacyJourneyState(state);
      const priorStatus = ensureLifecycleStatus(state);

      // Starting a fresh pup after rescue/farewell resets care-sensitive runtime fields.
      if (
        priorStatus === DOG_LIFECYCLE_STATUS.RESCUED ||
        priorStatus === DOG_LIFECYCLE_STATUS.FAREWELL ||
        priorStatus === DOG_LIFECYCLE_STATUS.NONE
      ) {
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
      }

      state.lifecycleStatus = DOG_LIFECYCLE_STATUS.ACTIVE;
      state.temperament.adoptedAt = adoptedAt;
      state.adoptedAt = adoptedAt;
      state.lastUpdatedAt = adoptedAt;
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

    updateFavoriteToy(state, { payload }) {
      state.memory.favoriteToyId = payload || null;
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
      state.memory.favoriteToyId = toyId;
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
      applyDecay(state, now);
      wakeForInteraction(state);

      state.stats.hunger = clamp(
        Math.max(0, Number(state.stats.hunger || 0) - 60),
        0,
        100
      );
      state.stats.energy = 100;
      state.stats.happiness = clamp(
        Number(state.stats.happiness || 0) + 6,
        0,
        100
      );

      state.memory.lastFedAt = now;
      state.memory.lastFedFoodType = "quick_feed";
      state.memory.lastSeenAt = now;
      state.lastAction = resolveActionOverride(payload, "feed_quick");
      applyFsmAction(state, "feed", now);

      applyBondGain(state, 0.8, now);
      applyXp(state, 4);
      maybeSampleMood(state, now, "FEED");
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
      const lowTablePlacement =
        isApartmentEnvironment(state) && isApartmentLowTableZone(xNorm, yNorm);

      yard.foodBowl = {
        id: `${placedAt}-${Math.random().toString(36).slice(2, 8)}`,
        xNorm,
        yNorm,
        placedAt,
        readyAt,
        surface: lowTablePlacement ? "low_table" : "floor",
        stealReadyAt: lowTablePlacement ? readyAt + 2400 : null,
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

      const amount = payload?.amount ?? 100;
      state.stats.thirst = clamp(state.stats.thirst - amount, 0, 100);
      state.stats.happiness = clamp(state.stats.happiness + 2, 0, 100);

      state.memory.lastDrankAt = now;
      state.memory.lastSeenAt = now;
      state.lastAction = resolveActionOverride(payload, "water");
      applyFsmAction(state, "water", now);

      const sweetBondMultiplier = hasTemperamentTag(state, "SWEET") ? 1.25 : 1;
      applyBondGain(state, 0.6 * sweetBondMultiplier, now);
      gainPottyNeed(state, 18);

      applyXp(state, 3);
      maybeSampleMood(state, now, "WATER");
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
      const toyProfile =
        TOY_PLAY_PROFILES[activeToyId] ||
        TOY_PLAY_PROFILES.toy_tennis_ball_basic;

      const zoomiesMultiplier = payload?.timeOfDay === "MORNING" ? 2 : 1;
      const careerMultiplier =
        state.career.perks?.happinessGainMultiplier || 1.0;

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

      state.memory.lastPlayedAt = now;
      state.memory.lastSeenAt = now;
      state.lastAction = resolveActionOverride(
        payload,
        toyProfile.overrideAction || "play"
      );
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

      const dozeChance = energy <= 30 ? 0.3 : energy <= 55 ? 0.18 : 0.08;
      const zoomiesChance = happiness >= 75 ? 0.24 : 0.14;
      const sassChance = isSpicy ? 0.16 : 0.09;
      const roll = Math.random();

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
        state.isAsleep = true;
        state.stats.energy = clamp(state.stats.energy + 10, 0, 100);
        state.stats.happiness = clamp(state.stats.happiness + 2, 0, 100);
        applyBondGain(state, 0.85 * sweetBondMultiplier, now);
        state.lastAction = resolveActionOverride(payload, "pet_doze_off");
        applyFsmAction(state, "rest", now);
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

      state.memory.lastSeenAt = now;
      state.lastAction = resolveActionOverride(payload, "rest");
      applyFsmAction(state, "rest", now);

      const sweetBondMultiplier = hasTemperamentTag(state, "SWEET") ? 1.2 : 1;
      applyBondGain(state, 0.5 * sweetBondMultiplier, now);

      maybeGenerateDream(state, now);

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

      state.stats.cleanliness = clamp(state.stats.cleanliness + 30, 0, 100);
      state.stats.health = clamp(Number(state.stats.health || 0) + 5, 0, 100);
      state.stats.happiness = clamp(
        state.stats.happiness -
          5 * Math.max(0.6, perks.bathHappinessPenaltyMultiplier),
        0,
        100
      );

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
      if (Math.random() <= 0.18) {
        state.stats.energy = clamp(state.stats.energy - 1, 0, 100);
        state.stats.happiness = clamp(state.stats.happiness + 1, 0, 100);
        state.memory.lastSeenAt = now;
        state.lastAction = "potty_fakeout";
        applyFsmAction(state, "sit", now);
        maybeSampleMood(state, now, "POTTY_FAKEOUT");
        updateTemperamentReveal(state, now);
        finalizeDerivedState(state, now);
        return;
      }
      const training = ensureTrainingState(state).potty;
      state.pottyLevel = 0;
      state.poopCount += 1;
      state.stats.happiness = clamp(state.stats.happiness + 3, 0, 100);
      state.memory.lastSeenAt = now;
      state.lastAction = "potty";
      applyFsmAction(state, "potty", now);

      const sweetBondMultiplier = hasTemperamentTag(state, "SWEET") ? 1.25 : 1;
      applyBondGain(state, 0.8 * sweetBondMultiplier, now);

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
      const pottyMeta = ensurePottyMeta(state);
      pottyMeta.totalSuccesses += 1;
      pottyMeta.lastSuccessAt = now;
      finalizeDerivedState(state, now);
    },

    recordAccident(state, { payload }) {
      const now = payload?.now ?? nowMs();
      state.pottyLevel = 0;
      applyAccidentInternal(state, now);
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

    /* ------------- time / login ------------- */

    tickDog(state, { payload }) {
      const now = payload?.now ?? nowMs();
      if (
        ensureLifecycleStatus(state) !== DOG_LIFECYCLE_STATUS.ACTIVE ||
        !state.adoptedAt
      ) {
        state.lastUpdatedAt = now;
        return;
      }
      applyDecay(state, now);
      advanceDogFsm(state, now, { allowAutonomy: true });
      const tier = finalizeDerivedState(state, now);
      applyCleanlinessPenalties(state, tier);

      const severeNeglect =
        Number(state.stats.cleanliness || 100) <= 15 ||
        Number(state.stats.hunger || 0) >= 85;
      if (severeNeglect && Number(state.memory?.neglectStrikes || 0) >= 3) {
        state.stats.health = clamp(Number(state.stats.health || 0) - 3, 0, 100);
      }

      // Apartment hard mode: bowls left on the low table get stolen fast.
      const tableTheftTriggered = maybeStealApartmentTableFood(state, now);

      // Auto-consume any placed floor bowl once the dog is "close enough".
      if (!tableTheftTriggered) {
        maybeConsumeFoodBowl(state, now);
      }

      // Ambient behavior: dirty/itchy dogs will scratch sometimes.
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
      applyDecay(state, now);
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
    },

    triggerButtonHeist(state, { payload }) {
      const now = payload?.now ?? nowMs();
      const silenceMs = Number(payload?.silenceMs || 0);
      if (silenceMs < 60_000) return;
      const spawned = spawnButtonHeistSurprise(state, now, {
        minGapMs: 60_000,
        stolenAction: payload?.stolenAction || "play",
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
      const day = Number(payload?.day ?? state.consecutiveDays ?? 0);
      state.lastRewardClaimedAt = now;
      state.consecutiveDays = Number.isFinite(day)
        ? Math.max(0, Math.floor(day))
        : 0;

      const reward = payload?.reward || null;
      if (reward?.type === "ENERGY") {
        state.stats.energy = clamp(
          Number(state.stats.energy || 0) + Number(reward.value || 0),
          0,
          100
        );
      }
      if (reward?.type === "COINS") {
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
        finalizeDerivedState(state, now);
        return;
      }

      const perks = getPersonalityPerks(state);
      const skillMods = getSkillTreeModifiersFromDogState(state);
      const isSpicy = hasTemperamentTag(state, "SPICY");
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

      const jrtReaction = resolveJrtTrainingReaction({
        commandId,
        unlockedIds: unlocks.unlockedIds,
        skillNode: commandSkillNode,
        stats: state.stats,
        bond: bondValue,
        profile,
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
        updateTemperamentReveal(state, now);
        finalizeDerivedState(state, now);
        return;
      }

      if (trainingOutcome === "DOZE_OFF") {
        const sweetBondMultiplier = hasTemperamentTag(state, "SWEET") ? 1.2 : 1;

        state.isAsleep = true;
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
      applyBondGain(
        state,
        (trainingOutcome === "PERFECT" ? 1.35 : 1.0) * sweetBondMultiplier,
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
        state.stats.energy - (trainingOutcome === "PERFECT" ? 7 : 5),
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
});

/* ---------------------- selectors ---------------------- */

export const selectDog = (state) => state.dog;
export const selectDogStats = (state) => state.dog.stats;
export const selectDogMood = (state) => state.dog.mood;
export const selectDogJournal = (state) => state.dog.journal;
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

export const selectCosmeticCatalog = () => DEFAULT_COSMETIC_CATALOG;

export const selectDogMoodLabel = (state) => {
  const dog = state.dog;
  if (typeof dog?.mood === "string" && dog.mood.trim()) return dog.mood;
  if (typeof dog?.emotionCue === "string" && dog.emotionCue.trim())
    return dog.emotionCue;
  return "Content";
};

export const selectDogAgeInfo = (state) => {
  const adoptedAt = parseAdoptedAt(state.dog?.adoptedAt);
  const age = calculateDogAge(adoptedAt || 0);
  return (
    age || {
      days: state.dog?.lifeStage?.days || 0,
      stage: state.dog?.lifeStage?.stage || LIFE_STAGES.PUPPY,
      label:
        state.dog?.lifeStage?.label ||
        getLifeStageLabel(state.dog?.lifeStage?.stage),
    }
  );
};

export const selectDogCleanlinessMeta = (state) => {
  const tier = state.dog?.cleanlinessTier || "FRESH";
  return {
    tier,
    label: getCleanlinessLabel(tier),
    severity: getCleanlinessSeverity(tier),
    ui: getCleanlinessUi(tier),
    penalties:
      CLEANLINESS_TIER_EFFECTS[String(tier).toUpperCase()]?.penalties || null,
  };
};

export const selectDogNeedsNormalized = (state) => {
  const stats = state.dog?.stats || {};
  return {
    food: clamp01(1 - Number(stats.hunger || 0) / 100),
    water: clamp01(1 - Number(stats.thirst || 0) / 100),
    energy: clamp01(Number(stats.energy || 0) / 100),
    happiness: clamp01(Number(stats.happiness || 0) / 100),
    health: clamp01(Number(stats.health || 0) / 100),
    potty: clamp01(1 - Number(state.dog?.pottyLevel || 0) / 100),
    cleanliness: clamp01(Number(stats.cleanliness || 0) / 100),
    bond: clamp01(Number(state.dog?.bond?.value || 0) / 100),
  };
};

export const selectNextStreakReward = (state) => {
  const dog = state.dog;
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
};

/* ----------------------- actions / reducer ----------------------- */

export const {
  hydrateDog,
  setDogName,
  setAdoptedAt,
  setCareerLifestyle,
  acknowledgeGrowthMilestone,
  ackTemperamentReveal,
  markTemperamentRevealed,
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
  tickDog,
  registerSessionStart,
  triggerButtonHeist,
  resolveSessionSurprise,
  tickDogPolls,
  respondToDogPoll,
  claimDailyReward,
  rewardSocialShare,
  grantPreRegGift,
  trainObedience,
  unlockSkillTreePerk,
  respecSkillTree,
  respecSkillTreeBranch,
  addJournalEntry,
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
