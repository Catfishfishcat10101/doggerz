// src/redux/dogSlice.js
// @ts-nocheck

import { createSlice } from "@reduxjs/toolkit";
import { calculateDogAge, LIFE_STAGES } from "@/utils/lifecycle.js";
import {
  TARGET_EXPECTED_YEARS,
  AGE_RISK_WINDOW_DAYS,
  MULTIPLIER,
  BASE_PROB_FACTOR,
} from "@/config/lifespan.js";
import {
  CLEANLINESS_THRESHOLDS,
  CLEANLINESS_TIER_EFFECTS,
  MOOD_HAPPY,
  MOOD_HUNGRY,
  MOOD_SLEEPY,
  MOOD_LONELY,
  MOOD_NEUTRAL,
} from "@/constants/game.js";
import DOG_POLL_CONFIG from "@/config/polls.js";
import { announce } from "@/utils/announcer.js";
import { SKILL_LEVEL_STEP } from "@/config/training.js";

// Default lifecycle modifiers by life stage. These tune decay/penalties per stat
// and are safe defaults if not defined elsewhere.
const LIFECYCLE_STAGE_MODIFIERS = {
  PUPPY: { hunger: 1.0, happiness: 1.0, energy: 1.0, cleanliness: 1.0 },
  ADULT: { hunger: 1.0, happiness: 1.0, energy: 1.0, cleanliness: 1.0 },
  SENIOR: { hunger: 1.0, happiness: 0.95, energy: 0.9, cleanliness: 1.0 },
};

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

// Disease definitions (name, base severity, stat effects per finalize tick)
const DISEASES = [
  {
    id: "GASTRITIS",
    label: "Gastritis",
    baseSeverity: 10,
    effects: { hunger: 5, happiness: -4, energy: -3 },
  },
  {
    id: "ITCH",
    label: "Skin Itch",
    baseSeverity: 8,
    effects: { cleanliness: -6, happiness: -5 },
  },
  {
    id: "INFECTION",
    label: "Infection",
    baseSeverity: 15,
    effects: { energy: -6, happiness: -6, cleanliness: -4 },
  },
];

const MOOD_SAMPLE_MINUTES = 60;
const LEVEL_XP_STEP = 100;

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

// How many real days after potty completion before non-potty training unlocks
const REAL_DAYS_TO_UNLOCK_TRAINING = 3; // adjust if you want longer

function daysSince(dateIso) {
  if (!dateIso) return 0;
  const then = new Date(dateIso).getTime();
  const now = Date.now();
  const diff = now - then;
  return diff / (1000 * 60 * 60 * 24);
}

// `DOG_POLL_CONFIG` is imported from `src/config/polls.js` which provides a
// safe default. Apps can replace that module or supply runtime config if
// they need to customize prompts/timeouts.

function createInitialTrainingState() {
  return {
    potty: {
      successCount: 0,
      goal: POTTY_TRAINING_GOAL,
      completedAt: null,
      // convenience derived fields (kept in sync by reducers)
      progress: 0, // 0-100
      complete: false,
    },
    // When non-potty (obedience/tricks) training becomes available
    nonPottyUnlockedAt: null,
    // whether we've shown the one-time unlock notification
    nonPottyUnlockNotified: false,
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
  health: 100,
  coins: 0,
  adoptedAt: null,
  deceasedAt: null,
  lifeStage: { stage: "PUPPY", label: "Puppy", days: 0 },
  potty: {
    training: 0, // 0–100: how potty-trained
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
    // Adjust decay when health is poor: lower health increases decay up to 1.5x
    const health = Number.isFinite(state.health) ? state.health : 100;
    const healthDecayMultiplier = 1 + ((100 - health) / 100) * 0.5;
    let delta =
      rate * DECAY_SPEED * diffHours * stageMultiplier * healthDecayMultiplier;

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
      moodTag: MOOD_LONELY,
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

  let tag = MOOD_NEUTRAL;
  if (happiness > 75 && hunger < 60) tag = MOOD_HAPPY;
  else if (hunger > 75) tag = MOOD_HUNGRY;
  else if (energy < 30) tag = MOOD_SLEEPY;
  else if (cleanliness < 30) tag = DIRTY;

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
      moodTag: MOOD_HAPPY,
      summary: `Level up! Now level ${state.level}.`,
      body: `Nice work, hooman. I’m now level ${state.level}! New tricks unlocked soon…`,
    });
    // Visible announcement for level-up (screen-reader + sighted toast)
    try {
      announce({
        message: `Level up! ${state.name} reached level ${state.level}.`,
        type: "success",
        actions: [{ id: "view-journal", label: "View Journal" }],
      });
    } catch (e) {
      // announcer is best-effort; swallow errors
    }
  }
}

function applySkillXp(skillBranch, skillId, skillState, amount = 5) {
  if (!skillState[skillBranch] || !skillState[skillBranch][skillId]) return;

  const node = skillState[skillBranch][skillId];
  node.xp += amount;

  const targetLevel = Math.floor(node.xp / SKILL_LEVEL_STEP);
  if (targetLevel > node.level) {
    node.level = targetLevel;
    // Announce skill level increases so players see a toast
    try {
      announce(`${skillId} leveled up to ${node.level}!`);
    } catch (e) {
      // noop - announcer is optional
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
  const health = Number.isFinite(state.health) ? state.health : 100;

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
  const happyMoodCount = recentMoods.filter((m) => m.tag === MOOD_HAPPY).length;
  const hungryMoodCount = recentMoods.filter(
    (m) => m.tag === MOOD_HUNGRY
  ).length;
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

  // Factor in health: sick pups lean more clingy and less playful
  try {
    const healthPenalty = Math.round((100 - health) * 0.1);
    // nudge targets
    const adjClingy = Math.min(100, targetClingy + healthPenalty);
    const adjToy = Math.max(0, targetToy - Math.round(healthPenalty * 0.5));
    const adjFood = Math.min(100, targetFood + Math.round(healthPenalty * 0.3));
    // replace targets
    // use adj values below when updating intensities
    clingy.intensity = Math.round(clingy.intensity * 0.65 + adjClingy * 0.35);
    toyObsessed.intensity = Math.round(
      toyObsessed.intensity * 0.65 + adjToy * 0.35
    );
    foodMotivated.intensity = Math.round(
      foodMotivated.intensity * 0.65 + adjFood * 0.35
    );
  } catch (e) {
    // fallback to previous assignments
    clingy.intensity = Math.round(
      clingy.intensity * 0.65 + targetClingy * 0.35
    );
    toyObsessed.intensity = Math.round(
      toyObsessed.intensity * 0.65 + targetToy * 0.35
    );
    foodMotivated.intensity = Math.round(
      foodMotivated.intensity * 0.65 + targetFood * 0.35
    );
  }

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
  const age = calculateDogAge(adoptedAt, now) || {};
  state.lifeStage = {
    stage: age.stageId || age.stage || DEFAULT_LIFE_STAGE.stage,
    label:
      age.stageLabel ||
      (age.stage && age.stage.label) ||
      DEFAULT_LIFE_STAGE.label,
    days: age.ageInGameDays ?? age.days ?? 0,
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
  // update cleanliness tier
  const tier = syncCleanlinessTier(state, now);
  // Update derived health as a function of care stats (higher hunger reduces health)
  try {
    const hunger = Number.isFinite(state.stats.hunger)
      ? state.stats.hunger
      : 50;
    const happiness = Number.isFinite(state.stats.happiness)
      ? state.stats.happiness
      : 50;
    const energy = Number.isFinite(state.stats.energy)
      ? state.stats.energy
      : 50;
    const cleanliness = Number.isFinite(state.stats.cleanliness)
      ? state.stats.cleanliness
      : 50;
    const healthVal = Math.round(
      (100 - hunger + happiness + energy + cleanliness) / 4
    );
    state.health = clamp(healthVal, 0, 100);
  } catch (err) {
    state.health = state.health || 100;
  }

  // Illness detection: if health dips below threshold and not already flagged
  try {
    if (
      !state.deceasedAt &&
      state.health < 30 &&
      !(state.illness && state.illness.detectedAt)
    ) {
      state.illness = {
        detectedAt: now,
        severity: Math.round(100 - state.health),
      };
      pushJournalEntry(state, {
        type: "ILLNESS",
        moodTag: "SICK",
        summary: "Your pup seems unwell",
        body: "Your pup is showing signs of poor health. Consider a vet visit to help them feel better.",
        timestamp: now,
      });
      try {
        announce({
          message: `${state.name} seems unwell and may need vet care.`,
          type: "warn",
        });
      } catch (e) {}
    }
  } catch (e) {
    // swallow
  }

  // Disease progression and possible spawning
  try {
    // If there is an active illness, apply its effects each finalize pass
    if (state.illness && !state.illness.resolvedAt) {
      const dis = state.illness;
      const severity = dis.severity || 10;
      // Reduce stats slowly based on severity
      Object.entries(dis.effects || {}).forEach(([stat, delta]) => {
        if (typeof state.stats?.[stat] === "number") {
          state.stats[stat] = clamp(
            state.stats[stat] + Math.round((delta * severity) / 100),
            0,
            100
          );
        }
      });
      // health erosion
      state.health = clamp(
        (state.health || 100) - Math.max(1, Math.round(severity / 15)),
        0,
        100
      );
    } else {
      // maybe spawn a disease if health is low or randomly
      if (!state.deceasedAt && !state.illness) {
        const health = Number.isFinite(state.health) ? state.health : 100;
        // base chance increases if health < 70
        const baseChance = health < 70 ? (70 - health) / 2000 : 0.0002; // small base
        const rand = Math.random();
        if (rand < baseChance) {
          const pick = DISEASES[Math.floor(Math.random() * DISEASES.length)];
          if (pick) {
            state.illness = {
              id: pick.id,
              label: pick.label,
              detectedAt: now,
              severity: pick.baseSeverity + Math.round((100 - health) / 5),
              effects: pick.effects,
            };
            pushJournalEntry(state, {
              type: "ILLNESS",
              moodTag: "SICK",
              summary: `${state.name} got sick: ${pick.label}`,
              body: `Your pup seems to have ${pick.label}. Consider a vet visit.`,
              timestamp: now,
            });
            try {
              announce({
                message: `${state.name} may be sick (${pick.label}).`,
                type: "warn",
              });
            } catch (e) {}
          }
        }
      }
    }
  } catch (e) {
    // swallow
  }

  // Check for natural end-of-life based on age + health
  try {
    const adoptedAt = state.adoptedAt || state.temperament?.adoptedAt;
    if (adoptedAt && !state.deceasedAt) {
      const ageInfo = calculateDogAge(adoptedAt, now) || {};
      const ageDays = ageInfo.ageInGameDays ?? ageInfo.days ?? 0;
      // Target expected lifespan (in dog years) — tunable via src/config/lifespan.js
      const expectedGameDays = TARGET_EXPECTED_YEARS * 365;
      const health = state.health || 100;

      // Compute how far past the expected lifespan we are and scale death probability
      const ageOver = Math.max(0, ageDays - expectedGameDays);
      const ageFactor = Math.min(1, ageOver / AGE_RISK_WINDOW_DAYS);

      // Health factor: 0 when healthy, up to 1 when near 0 health
      const healthFactor = Math.min(1, Math.max(0, (100 - health) / 100));

      // Base probability per finalize tick (very small). Scales with ageFactor and healthFactor.
      // Compute baseProb from expectedGameDays so average lifespan centers near target.
      const baseProb = 1 / (expectedGameDays * BASE_PROB_FACTOR);
      const prob =
        baseProb + baseProb * MULTIPLIER * ageFactor * (0.5 + healthFactor);

      // If health is critically low always kill, otherwise random roll
      if (health <= 1 || Math.random() < prob) {
        state.deceasedAt = now;
        pushJournalEntry(state, {
          type: "DEATH",
          moodTag: null,
          summary: `${state.name} passed away`,
          body: `With a wag and a tired sigh, ${
            state.name
          } crossed the Rainbow Bridge on ${new Date(now).toLocaleString()}.`,
          timestamp: now,
        });
        try {
          announce({
            message: `${state.name} has passed away and crossed the Rainbow Bridge.`,
            type: "error",
          });
        } catch (e) {
          // best-effort
        }
      }
    }
  } catch (err) {
    // swallow
  }

  return tier;
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
  // Update convenience progress/complete fields so UI can read directly
  if (typeof potty.goal === "number" && potty.goal > 0) {
    potty.progress = Math.round((potty.successCount / potty.goal) * 100);
  } else {
    potty.progress = 0;
  }

  if (potty.successCount >= potty.goal) {
    potty.completedAt = now;
    potty.complete = true;
    potty.progress = 100;
    state.stats.happiness = clamp(state.stats.happiness + 5, 0, 100);
    pushJournalEntry(state, {
      type: "TRAINING",
      moodTag: "PROUD",
      summary: "Potty training complete",
      body: "Your puppy now knows how to signal when nature calls. Accidents will slow way down!",
      timestamp: now,
    });
    // Announce potty training completion with a visible toast and action
    try {
      announce({
        message: "Potty training complete! Your puppy is potty trained.",
        type: "success",
        actions: [
          { id: "view-journal", label: "View Journal" },
          { id: "celebrate", label: "Yay!" },
        ],
      });
    } catch (e) {
      // best-effort
    }
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
  // Visible toast for adult training completion
  try {
    announce(`Adult training complete! +40 coins.`);
  } catch (e) {
    // noop
  }
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
      moodTag: MOOD_HAPPY,
      summary: "You handled a dog poll",
      body: `You said yes to: ${active.prompt}`,
      timestamp: now,
    });
    try {
      announce("You responded to the pup prompt.");
    } catch (err) {}
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
    try {
      if (reason === "TIMEOUT") announce("Pup prompt timed out.");
      else announce("You declined the pup prompt.");
    } catch (err) {}
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

    adoptDog(state, { payload }) {
      const nowIso = new Date().toISOString();
      state.id = payload?.id ?? state.id ?? null;
      state.name = payload?.name || state.name || "Pup";
      state.lifeStage = { ...DEFAULT_LIFE_STAGE };
      state.adoptedAt = nowIso;
      // Reset training to initial values
      state.training = createInitialTrainingState();
      // Reset top-level potty trackers as well
      state.potty = { ...initialState.potty };
      state.lastUpdatedAt = nowMs();
    },

    setCareerLifestyle(state, { payload }) {
      const { lifestyle, perks } = payload || {};
      state.career.lifestyle = lifestyle || null;
      state.career.chosenAt = nowMs();
      if (perks && typeof perks === "object") {
        state.career.perks = { ...state.career.perks, ...perks };
      }
    },

    trainPotty(state, { payload }) {
      const training = ensureTrainingState(state);
      const potty = training.potty;
      if (!potty || potty.complete || potty.completedAt) return;
      const amount = payload?.amount ?? 8;
      potty.progress = Math.min(100, (potty.progress || 0) + amount);
      if (potty.progress >= 100) {
        const now = nowMs();
        potty.completedAt = now;
        potty.complete = true;
        potty.progress = 100;
        // schedule non-potty training unlock
        if (!training.nonPottyUnlockedAt) {
          const unlockDate = new Date();
          unlockDate.setDate(
            unlockDate.getDate() + REAL_DAYS_TO_UNLOCK_TRAINING
          );
          training.nonPottyUnlockedAt = unlockDate.toISOString();
          training.nonPottyUnlockNotified = false;
        }
        pushJournalEntry(state, {
          type: "TRAINING",
          moodTag: "PROUD",
          summary: "Potty training complete",
          body: "Your puppy now knows how to signal when nature calls.",
          timestamp: nowMs(),
        });
      }
    },

    markTrainingUnlockNotified(state) {
      const training = ensureTrainingState(state);
      training.nonPottyUnlockNotified = true;
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

    applyWeatherEffects(state, { payload }) {
      // payload: { hungerDelta, happinessDelta, energyDelta, cleanlinessDelta }
      if (!payload || typeof payload !== "object") return;
      const {
        hungerDelta = 0,
        happinessDelta = 0,
        energyDelta = 0,
        cleanlinessDelta = 0,
      } = payload;
      if (typeof state.stats?.hunger === "number")
        state.stats.hunger = clamp(state.stats.hunger + hungerDelta);
      if (typeof state.stats?.happiness === "number")
        state.stats.happiness = clamp(state.stats.happiness + happinessDelta);
      if (typeof state.stats?.energy === "number")
        state.stats.energy = clamp(state.stats.energy + energyDelta);
      if (typeof state.stats?.cleanliness === "number")
        state.stats.cleanliness = clamp(
          state.stats.cleanliness + cleanlinessDelta
        );
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
        const active = spawnDogPollInternal(state, now);
        if (active && active.prompt) {
          try {
            announce(`Your pup needs attention: ${active.prompt}`);
          } catch (err) {
            // announcer is best-effort; don't break reducer
          }
        }
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
        moodTag: MOOD_HAPPY,
        summary: `Practiced ${commandId}.`,
        body: `We worked on "${commandId}" today. I think I'm getting the hang of it!`,
        timestamp: now,
      });

      const date = getIsoDate(now);
      updateStreak(state.streak, date);
      updateTemperamentReveal(state, now);
      finalizeDerivedState(state, now);
    },

    visitVet(state, { payload }) {
      const now = (payload && payload.now) || nowMs();
      // Simple vet visit: restore health and cleanliness, reduce illness
      state.stats.cleanliness = clamp(
        (state.stats.cleanliness || 50) + 25,
        0,
        100
      );
      state.health = clamp((state.health || 50) + 30, 0, 100);
      state.memory.lastVetVisitAt = now;
      // clear illness/disease state entirely on a vet visit
      if (state.illness) {
        state.illness = null;
      }

      pushJournalEntry(state, {
        type: "CARE",
        moodTag: null,
        summary: "Vet visit",
        body: "Your pup visited the vet and received care. They seem better now.",
        timestamp: now,
      });

      try {
        announce({
          message: "Vet visit complete — your pup feels better.",
          type: "success",
        });
      } catch (e) {}

      // Slight temperament calming effect after vet
      try {
        const t = state.temperament;
        if (t && Array.isArray(t.traits)) {
          t.traits = t.traits.map((tr) => ({
            ...tr,
            intensity: Math.max(0, Math.round(tr.intensity * 0.95)),
          }));
        }
      } catch (e) {}

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
    adoptFromMemorial(state, { payload }) {
      try {
        const now = Date.now();
        // payload may contain: name, journal, statsSnapshot, etc.
        const adoptedAt = now;
        // merge sensible defaults
        state.name = payload.name || state.name || "Pup";
        state.stats = { ...state.stats, ...(payload.statsSnapshot || {}) };
        state.journal = {
          entries: (payload.journal || []).concat(state.journal?.entries || []),
        };
        state.adoptedAt = adoptedAt;
        state.deceasedAt = null;
        state.lastUpdatedAt = now;
        state.memory = { ...state.memory, lastSeenAt: now };

        pushJournalEntry(state, {
          type: "ADOPT",
          moodTag: MOOD_HAPPY,
          summary: `Adopted ${state.name} from memory`,
          body: `You adopted ${state.name} from memory. Welcome back!`,
          timestamp: now,
        });

        try {
          announce({
            message: `${state.name} adopted from memory.`,
            type: "success",
          });
        } catch (e) {}
      } catch (err) {
        // best-effort
      }
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
  adoptDog,
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
  applyWeatherEffects,
  tickDog,
  registerSessionStart,
  tickDogPolls,
  respondToDogPoll,
  trainObedience,
  visitVet,
  addJournalEntry,
  toggleDebug,
  resetDogState,
  adoptFromMemorial,
  trainPotty,
  markTrainingUnlockNotified,
} = dogSlice.actions;

export default dogSlice.reducer;
