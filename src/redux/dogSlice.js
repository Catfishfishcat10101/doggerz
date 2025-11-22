// src/redux/dogSlice.js
// @ts-nocheck

import { createSlice } from "@reduxjs/toolkit";
import { calculateDogAge } from "@/utils/lifecycle.js";
import {
  LIFECYCLE_STAGE_MODIFIERS,
  CLEANLINESS_THRESHOLDS,
  CLEANLINESS_TIER_EFFECTS,
  DOG_POLL_CONFIG,
} from "@/constants/game.js";

export const DOG_STORAGE_KEY = "doggerz:dogState";

const clamp = (n, lo = 0, hi = 100) =>
  Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : 0));

const DECAY_PER_HOUR = {
  hunger: 8,
  happiness: 6,
  energy: 5,
  cleanliness: 3,
};
const DECAY_SPEED = 0.65;

const MOOD_SAMPLE_MINUTES = 60;
const LEVEL_XP_STEP = 100;
const SKILL_LEVEL_STEP = 50;

const nowMs = () => Date.now();

const getDaysBetween = (fromMs, toMs) => {
  if (!fromMs) return Infinity;
  return (toMs - fromMs) / (1000 * 60 * 60 * 24);
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

const initialMemory = {
  favoriteToyId: null,
  lastFedAt: null,
  lastPlayedAt: null,
  lastBathedAt: null,
  lastTrainedAt: null,
  lastSeenAt: null,
  neglectStrikes: 0,
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
    rollOver: { level: 0, xp: 0 },
    speak: { level: 0, xp: 0 },
  },
};

const initialMood = {
  lastSampleAt: null,
  history: [],
};

const initialJournal = {
  entries: [],
};

const initialStreak = {
  currentStreakDays: 0,
  bestStreakDays: 0,
  lastActiveDate: null,
};

const POTTY_TRAINING_GOAL = 8;
const DEFAULT_LIFE_STAGE = { stage: "PUPPY", label: "Puppy", days: 0 };
const CLEANLINESS_TIER_ORDER = ["FRESH", "DIRTY", "FLEAS", "MANGE"];
const REAL_DAY_MS = 24 * 60 * 60 * 1000;
const POTTY_TRAINED_POTTY_GAIN_MULTIPLIER = 0.65;

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
  };
}

const initialState = {
  name: "Pup",
  level: 1,
  xp: 0,
  coins: 0,
  adoptedAt: null,
  lifeStage: { stage: "PUPPY", label: "Puppy", days: 0 },
  potty: {
    training: 0,        // 0–100: how potty-trained
    lastSuccessAt: null,
    lastAccidentAt: null,
    totalSuccesses: 0,
    totalAccidents: 0,
  },
  stats: {
    hunger: 50,
    happiness: 60,
    energy: 60,
    cleanliness: 60,
  },
  cleanlinessTier: "FRESH",
  poopCount: 0,
  
  isAsleep: false,
  debug: false,
  lastUpdatedAt: null,

  // Used by EnhancedDogSprite / animations
  lastAction: null,

  temperament: initialTemperament,
  memory: initialMemory,
  career: initialCareer,
  skills: initialSkills,
  mood: initialMood,
  journal: initialJournal,
  streak: initialStreak,
  training: createInitialTrainingState(),
  polls: {
    active: null,
    lastPromptId: null,
    lastSpawnedAt: null,
    lastResolvedAt: null,
    history: [],
  },
};

/* ---------- helpers ---------- */

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

const isValidStat = (key) =>
  ["hunger", "happiness", "energy", "cleanliness"].includes(key);

function applyDecay(state, now = nowMs()) {
  if (!state.lastUpdatedAt) {
    state.lastUpdatedAt = now;
    return;
  }

  const diffHours = Math.max(0, (now - state.lastUpdatedAt) / (1000 * 60 * 60));
  if (diffHours <= 0) return;

  const hungerMultiplier = state.career.perks?.hungerDecayMultiplier || 1.0;

  Object.entries(state.stats).forEach(([key, value]) => {
    if (!isValidStat(key)) return;

    const rate = DECAY_PER_HOUR[key] || 0;
    const stageMultiplier = getStageMultiplier(state, key);
    let delta = rate * DECAY_SPEED * diffHours * stageMultiplier;

    if (key === "hunger") {
      delta *= hungerMultiplier;
      state.stats[key] = clamp(value + delta, 0, 100);
    } else {
      state.stats[key] = clamp(value - delta, 0, 100);
    }
  });

  if (diffHours >= 24) {
    state.memory.neglectStrikes = Math.min(
      (state.memory.neglectStrikes || 0) + 1,
      999
    );
    pushJournalEntry(state, {
      type: "NEGLECT",
      moodTag: "LONELY",
      summary: "Dear hooman… I missed you.",
      body:
        "Dear hooman,\n\nI wasn’t sure if you were chasing squirrels or just busy, " +
        "but I got pretty lonely while you were gone. Next time, can we play a little sooner?\n\n– your pup",
      timestamp: now,
    });
  }

  state.lastUpdatedAt = now;
}

function maybeSampleMood(state, now = nowMs(), reason = "TICK") {
  const last = state.mood.lastSampleAt;
  if (last && now - last < MOOD_SAMPLE_MINUTES * 60 * 1000) return;

  const { hunger, happiness, energy, cleanliness } = state.stats;

  let tag = "NEUTRAL";
  if (happiness > 75 && hunger < 60) tag = "HAPPY";
  else if (hunger > 75) tag = "HUNGRY";
  else if (energy < 30) tag = "SLEEPY";
  else if (cleanliness < 30) tag = "DIRTY";

  state.mood.history.unshift({
    timestamp: now,
    tag,
    reason,
    hunger: Math.round(hunger),
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

function applySkillXp(skillBranch, skillId, skillState, amount = 5) {
  if (!skillState[skillBranch] || !skillState[skillBranch][skillId]) return;

  const node = skillState[skillBranch][skillId];
  node.xp += amount;

  const targetLevel = Math.floor(node.xp / SKILL_LEVEL_STEP);
  if (targetLevel > node.level) {
    node.level = targetLevel;
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
  const diffMs = curr - prev;
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
  if (days >= 3) {
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
  const trainingEntries = recentJournal.filter(
    (e) => e.type === "TRAINING"
  ).length;
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
  const adoptedAt = state.adoptedAt || state.temperament?.adoptedAt || now;
  const age = calculateDogAge(adoptedAt);
  state.lifeStage = {
    stage: age.stage || DEFAULT_LIFE_STAGE.stage,
    label: age.label || DEFAULT_LIFE_STAGE.label,
    days: age.days,
  };
  return state.lifeStage;
}

function syncCleanlinessTier(state, now = nowMs()) {
  const cleanliness = state.stats?.cleanliness ?? 0;
  const nextTier = resolveCleanlinessTierFromValue(cleanliness);
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
  syncLifecycleState(state, now);
  return syncCleanlinessTier(state, now);
}

function applyCleanlinessPenalties(state, tierOverride) {
  const tier = tierOverride || state.cleanlinessTier || "FRESH";
  const effects = CLEANLINESS_TIER_EFFECTS[tier];
  if (!effects) return;

  if (effects.happinessTickPenalty) {
    state.stats.happiness = clamp(
      state.stats.happiness - effects.happinessTickPenalty,
      0,
      100
    );
  }

  if (effects.energyTickPenalty) {
    state.stats.energy = clamp(
      state.stats.energy - effects.energyTickPenalty,
      0,
      100
    );
  }
}

function getStageMultiplier(state, statKey) {
  const stageKey = state.lifeStage?.stage || DEFAULT_LIFE_STAGE.stage;
  const modifiers =
    LIFECYCLE_STAGE_MODIFIERS[stageKey] ||
    LIFECYCLE_STAGE_MODIFIERS[DEFAULT_LIFE_STAGE.stage] ||
    {};
  return modifiers[statKey] ?? 1;
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

function recordPuppyPottySuccess(state, now = nowMs()) {
  const training = ensureTrainingState(state);
  const potty = training.potty;
  if (!potty || potty.completedAt) return;
  const stage = state.lifeStage?.stage || DEFAULT_LIFE_STAGE.stage;
  if (stage !== "PUPPY") return;

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

function completeAdultTrainingSession(state, now = nowMs()) {
  const training = ensureTrainingState(state);
  const stage = state.lifeStage?.stage || DEFAULT_LIFE_STAGE.stage;
  if (stage === "PUPPY") return;
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
  if (stage === "PUPPY") return;

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
  return state.training;
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

      const adoptedAt = payload.adoptedAt || state.adoptedAt || nowMs();

      const merged = {
        ...state,
        ...payload,
        stats: {
          ...initialState.stats,
          ...state.stats,
          ...(payload.stats || {}),
        },
        adoptedAt,
      };

      merged.lifeStage = payload.lifeStage ||
        state.lifeStage || { ...DEFAULT_LIFE_STAGE };

      merged.training = {
        ...createInitialTrainingState(),
        ...(payload.training || state.training || {}),
      };

      merged.temperament = {
        ...initialTemperament,
        ...(payload.temperament || state.temperament || {}),
        adoptedAt,
      };

      merged.memory = {
        ...initialMemory,
        ...(payload.memory || state.memory || {}),
      };

      merged.career = {
        ...initialCareer,
        ...(payload.career || state.career || {}),
      };

      merged.skills = {
        obedience: {
          ...initialSkills.obedience,
          ...(payload.skills?.obedience || state.skills?.obedience || {}),
        },
      };

      merged.mood = {
        ...initialMood,
        ...(payload.mood || state.mood || {}),
      };

      merged.journal = {
        ...initialJournal,
        ...(payload.journal || state.journal || {}),
      };

      merged.streak = {
        ...initialStreak,
        ...(payload.streak || state.streak || {}),
      };

      // Keep lastAction if present, otherwise reset
      merged.lastAction =
        payload.lastAction ?? state.lastAction ?? initialState.lastAction;

      ensureTrainingState(merged);
      ensurePollState(merged);

      merged.cleanlinessTier =
        payload.cleanlinessTier || state.cleanlinessTier || "FRESH";

      finalizeDerivedState(merged, nowMs());
      return merged;
    },

    setDogName(state, { payload }) {
      state.name = payload || "Pup";
    },

    setAdoptedAt(state, { payload }) {
      const adoptedAt = payload ?? nowMs();
      state.temperament.adoptedAt = adoptedAt;
      state.adoptedAt = adoptedAt;
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

    markTemperamentRevealed(state) {
      state.temperament.revealedAt = nowMs();
      state.temperament.revealReady = false;
    },

    updateFavoriteToy(state, { payload }) {
      state.memory.favoriteToyId = payload || null;
    },

    /* ------------- care actions ------------- */

    feed(state, { payload }) {
      const now = payload?.now ?? nowMs();
      applyDecay(state, now);

      const amount = payload?.amount ?? 20;
      const careerMultiplier =
        state.career.perks?.happinessGainMultiplier || 1.0;

      state.stats.hunger = clamp(state.stats.hunger - amount, 0, 100);
      state.stats.happiness = clamp(
        state.stats.happiness + 5 * careerMultiplier,
        0,
        100
      );

      state.memory.lastFedAt = now;
      state.memory.lastSeenAt = now;

      state.lastAction = "feed";

      applyXp(state, 5);
      maybeSampleMood(state, now, "FEED");

      const date = getIsoDate(now);
      updateStreak(state.streak, date);
      updateTemperamentReveal(state, now);
      finalizeDerivedState(state, now);
    },

    play(state, { payload }) {
      const now = payload?.now ?? nowMs();
      applyDecay(state, now);

      const zoomiesMultiplier = payload?.timeOfDay === "MORNING" ? 2 : 1;
      const careerMultiplier =
        state.career.perks?.happinessGainMultiplier || 1.0;

      const baseHappiness = payload?.happinessGain ?? 15;
      const gain = baseHappiness * zoomiesMultiplier * careerMultiplier;

      state.stats.happiness = clamp(state.stats.happiness + gain, 0, 100);
      state.stats.energy = clamp(state.stats.energy - 10, 0, 100);

      state.memory.lastPlayedAt = now;
      state.memory.lastSeenAt = now;

      state.lastAction = "play";

      applyXp(state, 8);
      maybeSampleMood(state, now, "PLAY");

      const date = getIsoDate(now);
      updateStreak(state.streak, date);
      updateTemperamentReveal(state, now);
      finalizeDerivedState(state, now);
    },

    rest(state, { payload }) {
      const now = payload?.now ?? nowMs();
      applyDecay(state, now);

      state.isAsleep = true;
      state.stats.energy = clamp(state.stats.energy + 20, 0, 100);
      state.stats.happiness = clamp(state.stats.happiness + 3, 0, 100);

      state.memory.lastSeenAt = now;

      state.lastAction = "rest";

      applyXp(state, 3);
      maybeSampleMood(state, now, "REST");
      updateTemperamentReveal(state, now);
      finalizeDerivedState(state, now);
    },

    wakeUp(state) {
      state.isAsleep = false;
      state.lastAction = "wake";
    },

    bathe(state, { payload }) {
      const now = payload?.now ?? nowMs();
      applyDecay(state, now);

      state.stats.cleanliness = clamp(state.stats.cleanliness + 30, 0, 100);
      state.stats.happiness = clamp(state.stats.happiness - 5, 0, 100);

      state.memory.lastBathedAt = now;
      state.memory.lastSeenAt = now;

      state.lastAction = "bathe";

      applyXp(state, 4);
      maybeSampleMood(state, now, "BATHE");
      updateTemperamentReveal(state, now);
      finalizeDerivedState(state, now);
    },

    increasePottyLevel(state, { payload }) {
      const effects = getCleanlinessEffect(state);
      const multiplier = effects.pottyGainMultiplier || 1;
      const trainingMultiplier = getPottyTrainingMultiplier(state);
      const inc = (payload?.amount ?? 10) * multiplier * trainingMultiplier;
      state.pottyLevel = clamp(state.pottyLevel + inc, 0, 100);
    },

    goPotty(state, { payload }) {
      const now = payload?.now ?? nowMs();
      state.pottyLevel = 0;
      state.poopCount += 1;
      state.stats.happiness = clamp(state.stats.happiness + 3, 0, 100);
      state.memory.lastSeenAt = now;

      state.lastAction = "potty";

      applyXp(state, 2);
      maybeSampleMood(state, now, "POTTY");
      recordPuppyPottySuccess(state, now);
      finalizeDerivedState(state, now);
    },

    scoopPoop(state, { payload }) {
      const now = payload?.now ?? nowMs();
      if (state.poopCount > 0) {
        state.poopCount -= 1;
        state.stats.cleanliness = clamp(state.stats.cleanliness + 10, 0, 100);
        state.stats.happiness = clamp(state.stats.happiness + 2, 0, 100);
        applyXp(state, 2);
        maybeSampleMood(state, now, "SCOOP");
      }
      state.memory.lastSeenAt = now;

      state.lastAction = "scoop";

      finalizeDerivedState(state, now);
    },

    /* ------------- time / login ------------- */

    tickDog(state, { payload }) {
      const now = payload?.now ?? nowMs();
      applyDecay(state, now);
      const tier = finalizeDerivedState(state, now);
      applyCleanlinessPenalties(state, tier);
      maybeSampleMood(state, now, "TICK");
      updateTemperamentReveal(state, now);
      evaluateTemperament(state, now);
    },

    registerSessionStart(state, { payload }) {
      const now = payload?.now ?? nowMs();
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

    /* ------------- skills ------------- */

    trainObedience(state, { payload }) {
      const {
        commandId,
        success = true,
        xp = 6,
        now: payloadNow,
      } = payload || {};

      if (!commandId || !success) return;

      const now = payloadNow ?? nowMs();
      applyDecay(state, now);

      const trainingMultiplier =
        state.career.perks?.trainingXpMultiplier || 1.0;
      const adjustedXp = Math.round(xp * trainingMultiplier);

      applySkillXp("obedience", commandId, state.skills, adjustedXp);
      state.memory.lastTrainedAt = now;
      state.memory.lastSeenAt = now;

      state.lastAction = "train";

      state.stats.happiness = clamp(state.stats.happiness + 8, 0, 100);
      state.stats.energy = clamp(state.stats.energy - 5, 0, 100);

      applyXp(state, 10);
      completeAdultTrainingSession(state, now);
      maybeSampleMood(state, now, "TRAINING");

      pushJournalEntry(state, {
        type: "TRAINING",
        moodTag: "HAPPY",
        summary: `Practiced ${commandId}.`,
        body: `We worked on "${commandId}" today. I think I'm getting the hang of it!`,
        timestamp: now,
      });

      const date = getIsoDate(now);
      updateStreak(state.streak, date);
      updateTemperamentReveal(state, now);
      finalizeDerivedState(state, now);
    },

    addJournalEntry(state, { payload }) {
      pushJournalEntry(state, payload || {});
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
export const selectDogSkills = (state) => state.dog.skills;
export const selectDogStreak = (state) => state.dog.streak;
export const selectDogLifeStage = (state) => state.dog.lifeStage;
export const selectDogCleanlinessTier = (state) => state.dog.cleanlinessTier;
export const selectDogPolls = (state) => state.dog.polls;
export const selectDogTraining = (state) => state.dog.training;

/* ----------------------- actions ----------------------- */

export const {
  hydrateDog,
  setDogName,
  setAdoptedAt,
  setCareerLifestyle,
  markTemperamentRevealed,
  updateFavoriteToy,
  feed,
  play,
  rest,
  wakeUp,
  bathe,
  increasePottyLevel,
  goPotty,
  scoopPoop,
  tickDog,
  registerSessionStart,
  tickDogPolls,
  respondToDogPoll,
  trainObedience,
  addJournalEntry,
  toggleDebug,
  resetDogState,
} = dogSlice.actions;

export default dogSlice.reducer;
