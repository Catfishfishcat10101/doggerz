// src/redux/dogSlice.js
import { createSlice } from "@reduxjs/toolkit";
export const DOG_STORAGE_KEY = "doggerz:dogState";

const clamp = (n, lo = 0, hi = 100) =>
  Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : 0));
const DECAY_PER_HOUR = {
  hunger: 8,
  happiness: 6,
  energy: 5,
  cleanliness: 3,
};

const MOOD_SAMPLE_MINUTES = 60;
const LEVEL_XP_STEP = 100;
const SKILL_LEVEL_STEP = 50;
const nowMs = () => Date.now();
const getDaysBetween = (fromMs, toMs) => {
  if (!fromMs) return Infinity;
  return (toMs - fromMs) / (1000 * 60 * 60 * 24);
};

const initialTemperament = {
  primary: "SPICY", // e.g. SPICY / SWEET / CHILL / CHAOS
  secondary: "SWEET",
  traits: [
    { id: "clingy", label: "Clingy", intensity: 70 },
    { id: "toyObsessed", label: "Toy-Obsessed", intensity: 60 },
    { id: "foodMotivated", label: "Food-Motivated", intensity: 55 },
  ],
};

const initialMemory = {
  favoriteToyId: null,
  lastFedAt: null,
  lastPlayedAt: null,
  lastBathedAt: null,
  lastTrainedAt: null,
  lastSeenAt: null, // last time user opened game screen
  neglectStrikes: 0, // increments for long absences
};

/**
 * Career / Lifestyle
 */
const initialCareer = {
  lifestyle: null, // "ADVENTURE" | "SERVICE" | "CHAOS" | "FIREHOUSE" | null
  chosenAt: null,
  perks: {
    hungerDecayMultiplier: 1.0,
    happinessGainMultiplier: 1.0,
    trainingXpMultiplier: 1.0,
  },
};

/**
 * Skill tree: start with obedience
 */
const initialSkills = {
  obedience: {
    sit: { level: 0, xp: 0 },
    stay: { level: 0, xp: 0 },
    rollOver: { level: 0, xp: 0 },
    speak: { level: 0, xp: 0 },
  },
  // future: agility, affection, mischief
};

/**
 * Mood timeline
 */
const initialMood = {
  lastSampleAt: null,
  history: [], // newest first: [{ timestamp, tag, happiness, hunger, energy, cleanliness }]
};

/**
 * Dog journal
 */
const initialJournal = {
  entries: [], // newest first: { id, timestamp, type, moodTag, summary, body }
};

/**
 * Streak
 */
const initialStreak = {
  currentStreakDays: 0,
  bestStreakDays: 0,
  lastActiveDate: null, // "YYYY-MM-DD"
};

/**
 * Core dog state
 */
const initialState = {
  name: "Pup",
  level: 1,
  xp: 0,
  coins: 0,
  stats: {
    hunger: 50,
    happiness: 60,
    energy: 60,
    cleanliness: 60,
  },
  poopCount: 0,
  pottyLevel: 0,
  isAsleep: false,
  debug: false,
  lastUpdatedAt: null, // ms timestamp for decay
  temperament: initialTemperament,
  memory: initialMemory,
  career: initialCareer,
  skills: initialSkills,
  mood: initialMood,
  journal: initialJournal,
  streak: initialStreak,
};

/* ---------- helpers that mutate the draft state safely ---------- */

function applyDecay(state, now = nowMs()) {
  if (!state.lastUpdatedAt) {
    state.lastUpdatedAt = now;
    return;
  }

  const diffHours = Math.max(0, (now - state.lastUpdatedAt) / (1000 * 60 * 60));
  if (diffHours <= 0) return;

  const mult = state.career.perks?.hungerDecayMultiplier || 1.0;

  // Apply stat decay
  Object.entries(state.stats).forEach(([key, value]) => {
    const rate = DECAY_PER_HOUR[key] || 0;
    let delta = rate * diffHours;

    // simple career perk application
    if (key === "hunger") delta *= mult;

    state.stats[key] = clamp(value - delta, 0, 100);
  });

  // Neglect check: if gone >= 24h, increment strike and journal
  const hours = diffHours;
  if (hours >= 24) {
    state.memory.neglectStrikes += 1;
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

  // Cap history size
  if (state.mood.history.length > 100) {
    state.mood.history.length = 100;
  }

  state.mood.lastSampleAt = now;
}

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

  // Cap journal
  if (state.journal.entries.length > 200) {
    state.journal.entries.length = 200;
  }
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

/**
 * Streak update: pass a YYYY-MM-DD string
 */
function updateStreak(streakState, isoDate) {
  const { currentStreakDays, bestStreakDays, lastActiveDate } = streakState;
  if (!lastActiveDate) {
    streakState.currentStreakDays = 1;
    streakState.bestStreakDays = Math.max(bestStreakDays, 1);
    streakState.lastActiveDate = isoDate;
    return;
  }

  if (lastActiveDate === isoDate) {
    // already counted today
    return;
  }

  const prev = new Date(lastActiveDate);
  const curr = new Date(isoDate);
  const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    // continues streak
    streakState.currentStreakDays = currentStreakDays + 1;
  } else {
    // reset
    streakState.currentStreakDays = 1;
  }

  streakState.bestStreakDays = Math.max(
    streakState.bestStreakDays,
    streakState.currentStreakDays
  );
  streakState.lastActiveDate = isoDate;
}

/**
 * Temperament reveal flagging
 */
function updateTemperamentReveal(state, now = nowMs()) {
  const adoptedAt = state.temperament.adoptedAt;
  if (!adoptedAt) return;
  if (state.temperament.revealedAt) return;

  const days = getDaysBetween(adoptedAt, now);
  if (days >= 3) {
    state.temperament.revealReady = true;
  }
}

/**
 * Evaluate temperament daily and nudge trait intensities based on:
 * - Current stats (hunger, happiness, energy, cleanliness)
 * - Recent activity patterns (play, feed, training frequency)
 * - Skill levels (obedience training shows discipline/bonding)
 * - Mood history sentiment (happy/sleepy/hungry patterns)
 * - Journal insights (training entries, neglect strikes)
 * - Neglect & absence patterns (clinginess boost)
 */
function evaluateTemperament(state, now = nowMs()) {
  const t = state.temperament;

  // Only evaluate at most once per day
  const lastEval = t.lastEvaluatedAt || t.adoptedAt || 0;
  const days = getDaysBetween(lastEval, now);
  if (days < 1) return; // wait until at least one day passed

  // helpers to find trait by id
  const findTrait = (id) => t.traits.find((x) => x.id === id);

  const clingy = findTrait("clingy");
  const toyObsessed = findTrait("toyObsessed");
  const foodMotivated = findTrait("foodMotivated");

  // Defensive: ensure traits exist
  if (!clingy || !toyObsessed || !foodMotivated) return;

  // === SIGNALS FROM STATE ===
  const hunger = state.stats.hunger; // 0-100 (higher = hungrier)
  const happiness = state.stats.happiness; // higher = happier
  const energy = state.stats.energy;
  const cleanliness = state.stats.cleanliness;
  const neglect = state.memory.neglectStrikes || 0;

  // === RECENT ACTIVITY (look back 7 days) ===
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const playedRecently =
    state.memory.lastPlayedAt && now - state.memory.lastPlayedAt < sevenDaysMs;
  const fedRecently =
    state.memory.lastFedAt &&
    now - state.memory.lastFedAt < 12 * 60 * 60 * 1000;
  const trainedRecently =
    state.memory.lastTrainedAt &&
    now - state.memory.lastTrainedAt < 3 * 24 * 60 * 60 * 1000;

  // === SKILL LEVEL SIGNALS (obedience = bonding/discipline) ===
  const obedienceSkills = state.skills?.obedience || {};
  const avgObedienceLevel = (() => {
    const vals = Object.values(obedienceSkills).map((s) => s.level || 0);
    return vals.length > 0
      ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
      : 0;
  })();

  // === MOOD HISTORY SENTIMENT (last 10 recent moods) ===
  const recentMoods = (state.mood?.history || []).slice(0, 10);
  const happyMoodCount = recentMoods.filter((m) => m.tag === "HAPPY").length;
  const sleepyMoodCount = recentMoods.filter((m) => m.tag === "SLEEPY").length;
  const hungryMoodCount = recentMoods.filter((m) => m.tag === "HUNGRY").length;
  const moodSentiment = {
    happy: happyMoodCount,
    sleepy: sleepyMoodCount,
    hungry: hungryMoodCount,
  };

  // === JOURNAL INSIGHTS (look for training & neglect patterns) ===
  const recentJournal = (state.journal?.entries || []).slice(0, 20);
  const trainingEntries = recentJournal.filter(
    (e) => e.type === "TRAINING"
  ).length;
  const neglectEntries = recentJournal.filter(
    (e) => e.type === "NEGLECT"
  ).length;

  // === COMPUTE SOFT TARGETS FOR TRAITS ===

  // CLINGY: increases with neglect, unhappiness, absence, lack of training
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

  // TOY_OBSESSED: increases with play frequency, happiness, good energy, and obedience
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

  // FOOD_MOTIVATED: increases with hunger levels, feed frequency, and happy mood from food
  const targetFood = clamp(
    Math.round(
      foodMotivated.intensity * 0.65 +
        (hunger - 50) * 0.25 +
        (fedRecently ? 10 : 0) +
        moodSentiment.hungry * 2 +
        (avgObedienceLevel > 0 ? -3 : 0) // obedience training reduces pure food focus
    ),
    0,
    100
  );

  // === APPLY GENTLE SMOOTHING TOWARD TARGETS ===
  // Weight current heavily (0.65) so changes are gradual, not jarring
  clingy.intensity = Math.round(clingy.intensity * 0.65 + targetClingy * 0.35);
  toyObsessed.intensity = Math.round(
    toyObsessed.intensity * 0.65 + targetToy * 0.35
  );
  foodMotivated.intensity = Math.round(
    foodMotivated.intensity * 0.65 + targetFood * 0.35
  );

  // === COMPUTE PRIMARY/SECONDARY TEMPERAMENT ===
  const sorted = [...t.traits].sort((a, b) => b.intensity - a.intensity);
  const top = sorted[0];
  const second = sorted[1] || top;

  // Map trait -> temperament label
  const traitToLabel = {
    clingy: "SWEET",
    toyObsessed: "SPICY",
    foodMotivated: "CHILL",
  };

  t.primary = traitToLabel[top.id] || t.primary || "SPICY";
  t.secondary = traitToLabel[second.id] || t.secondary || "SWEET";

  t.lastEvaluatedAt = now;
}

/* ---------------------- slice definition ---------------------- */

const dogSlice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    hydrateDog(state, { payload }) {
      if (!payload || typeof payload !== "object") return;
      // Shallow merge with safety – you can make this smarter later.
      return {
        ...state,
        ...payload,
        stats: { ...state.stats, ...(payload.stats || {}) },
      };
    },

    setDogName(state, { payload }) {
      state.name = payload || "Pup";
    },

    setAdoptedAt(state, { payload }) {
      state.temperament.adoptedAt = payload ?? nowMs();
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

    /* ------------- main care actions (buttons) ------------- */

    feed(state, { payload }) {
      const now = payload?.now ?? nowMs();
      applyDecay(state, now); // apply catch-up decay first

      const amount = payload?.amount ?? 20;
      state.stats.hunger = clamp(state.stats.hunger - amount, 0, 100);
      state.stats.happiness = clamp(state.stats.happiness + 5, 0, 100);

      state.memory.lastFedAt = now;
      state.memory.lastSeenAt = now;

      applyXp(state, 5);
      maybeSampleMood(state, now, "FEED");

      const date = new Date(now).toISOString().slice(0, 10);
      updateStreak(state.streak, date);
      updateTemperamentReveal(state, now);
    },

    play(state, { payload }) {
      const now = payload?.now ?? nowMs();
      applyDecay(state, now);

      const zoomiesMultiplier = payload?.timeOfDay === "MORNING" ? 2 : 1;

      const baseHappiness = payload?.happinessGain ?? 15;
      const gain = baseHappiness * zoomiesMultiplier;
      state.stats.happiness = clamp(state.stats.happiness + gain, 0, 100);
      state.stats.energy = clamp(state.stats.energy - 10, 0, 100);

      state.memory.lastPlayedAt = now;
      state.memory.lastSeenAt = now;

      applyXp(state, 8);
      maybeSampleMood(state, now, "PLAY");

      const date = new Date(now).toISOString().slice(0, 10);
      updateStreak(state.streak, date);
      updateTemperamentReveal(state, now);
    },

    rest(state, { payload }) {
      const now = payload?.now ?? nowMs();
      applyDecay(state, now);

      state.isAsleep = true;
      state.stats.energy = clamp(state.stats.energy + 20, 0, 100);
      state.stats.happiness = clamp(state.stats.happiness + 3, 0, 100);

      state.memory.lastSeenAt = now;

      applyXp(state, 3);
      maybeSampleMood(state, now, "REST");
      updateTemperamentReveal(state, now);
    },

    wakeUp(state) {
      state.isAsleep = false;
    },

    bathe(state, { payload }) {
      const now = payload?.now ?? nowMs();
      applyDecay(state, now);

      state.stats.cleanliness = clamp(state.stats.cleanliness + 30, 0, 100);
      state.stats.happiness = clamp(state.stats.happiness - 5, 0, 100);

      state.memory.lastBathedAt = now;
      state.memory.lastSeenAt = now;

      applyXp(state, 4);
      maybeSampleMood(state, now, "BATHE");
      updateTemperamentReveal(state, now);
    },

    increasePottyLevel(state, { payload }) {
      const inc = payload?.amount ?? 10;
      state.pottyLevel = clamp(state.pottyLevel + inc, 0, 100);
    },

    goPotty(state, { payload }) {
      const now = payload?.now ?? nowMs();
      state.pottyLevel = 0;
      state.poopCount += 1;
      state.stats.happiness = clamp(state.stats.happiness + 3, 0, 100);
      state.memory.lastSeenAt = now;
      applyXp(state, 2);
      maybeSampleMood(state, now, "POTTY");
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
    },

    /* ------------- core time tick / login sync ------------- */

    tickDog(state, { payload }) {
      const now = payload?.now ?? nowMs();
      applyDecay(state, now);
      maybeSampleMood(state, now, "TICK");
      updateTemperamentReveal(state, now);
      evaluateTemperament(state, now);
    },

    registerSessionStart(state, { payload }) {
      const now = payload?.now ?? nowMs();
      applyDecay(state, now);
      maybeSampleMood(state, now, "SESSION_START");
      state.memory.lastSeenAt = now;

      const date = new Date(now).toISOString().slice(0, 10);
      updateStreak(state.streak, date);
      updateTemperamentReveal(state, now);
      evaluateTemperament(state, now);
    },

    /* ------------------ obedience / skills ------------------ */

    trainObedience(state, { payload }) {
      const {
        commandId, // "sit" | "stay" | "rollOver" | "speak"
        success = true,
        xp = 6,
        now: payloadNow,
      } = payload || {};

      if (!commandId || !success) return;

      const now = payloadNow ?? nowMs();
      applyDecay(state, now);

      applySkillXp("obedience", commandId, state.skills, xp);
      state.memory.lastTrainedAt = now;
      state.memory.lastSeenAt = now;

      // obedience training is low-energy, high-bonding
      state.stats.happiness = clamp(state.stats.happiness + 8, 0, 100);
      state.stats.energy = clamp(state.stats.energy - 5, 0, 100);

      applyXp(state, 10);
      maybeSampleMood(state, now, "TRAINING");

      pushJournalEntry(state, {
        type: "TRAINING",
        moodTag: "HAPPY",
        summary: `Practiced ${commandId}.`,
        body: `We worked on "${commandId}" today. I think I'm getting the hang of it!`,
        timestamp: now,
      });

      const date = new Date(now).toISOString().slice(0, 10);
      updateStreak(state.streak, date);
      updateTemperamentReveal(state, now);
    },

    /* ---------------- manual journal hook ---------------- */

    addJournalEntry(state, { payload }) {
      pushJournalEntry(state, payload || {});
    },

    /* ---------------- debug / dev ---------------- */

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
  trainObedience,
  addJournalEntry,
  toggleDebug,
  resetDogState,
} = dogSlice.actions;

export default dogSlice.reducer;
