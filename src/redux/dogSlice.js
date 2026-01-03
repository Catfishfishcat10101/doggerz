// src/redux/dogSlice.js
// @ts-nocheck

import { createSelector, createSlice } from '@reduxjs/toolkit';
import { calculateDogAge } from '@/utils/lifecycle.js';
import {
  CLEANLINESS_THRESHOLDS,
  CLEANLINESS_TIER_EFFECTS,
} from '@/constants/game.js';

export const DOG_STORAGE_KEY = 'doggerz:dogState';

// Bump when the persisted dog save shape changes.
// Migration should remain best-effort and never throw.
export const DOG_SAVE_SCHEMA_VERSION = 3;

// Dog polls (lightweight random prompts) — currently disabled by default.
// The logic remains for future reintroduction of a UI surface.
const DOG_POLL_CONFIG = {
  intervalMs: 0,
  timeoutMs: 60_000,
  prompts: [],
};

const clamp = (n, lo = 0, hi = 100) =>
  Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : lo));

const STAT_LO = 0;
const STAT_HI = 100;

// Game feel safety:
// - Capped idle catch-up decay prevents "sudden death spirals" after long inactivity.
// - Floors prevent core stats from being hard-zeroed *purely* due to idle decay.
// - Hunger cap keeps "AFK = instant starvation" from feeling unfair.
const MAX_CATCHUP_HOURS = 18;
const IDLE_DECAY_FLOOR = 5;
const IDLE_HUNGER_CAP = 95;

// Anti-spam cooldown to avoid "max everything in 5 minutes" exploits.
// We still allow actions (no hard blocks), but rewards diminish if repeated too quickly.
const ACTION_COOLDOWN_MS = 6500;

// UI safety: accidental double-taps shouldn't count as multiple actions.
// This is intentionally short and separate from ACTION_COOLDOWN_MS.
const ACTION_TAP_GUARD_MS = 350;

function safeNumber(n, fallback = 0) {
  const x = Number(n);
  return Number.isFinite(x) ? x : fallback;
}

function clampStat(n) {
  return clamp(safeNumber(n, 0), STAT_LO, STAT_HI);
}

function cooldownScale(lastAt, now, minMs = ACTION_COOLDOWN_MS) {
  const last = safeNumber(lastAt, 0);
  const t = safeNumber(now, nowMs());
  const dt = Math.max(0, t - last);
  if (!last) return 1;
  if (dt >= minMs) return 1;
  // Smooth-ish curve: at dt=0 => 0.25x, ramps to 1x by minMs.
  const a = clamp(dt / minMs, 0, 1);
  return 0.25 + 0.75 * a;
}

function shouldIgnoreRapidRepeat(state, key, now, minMs = ACTION_TAP_GUARD_MS) {
  if (!state.meta || typeof state.meta !== 'object') {
    state.meta = {
      lastTickAt: null,
      lastSessionStartAt: null,
      actionLastAt: {},
    };
  }
  if (!state.meta.actionLastAt || typeof state.meta.actionLastAt !== 'object') {
    state.meta.actionLastAt = {};
  }

  // Streak (older saves)
  if (!state.streak || typeof state.streak !== 'object') {
    state.streak = { ...initialStreak };
  }
  state.streak.currentStreakDays = Math.max(
    0,
    Math.floor(safeNumber(state.streak.currentStreakDays, 0))
  );
  state.streak.bestStreakDays = Math.max(
    0,
    Math.floor(safeNumber(state.streak.bestStreakDays, 0))
  );
  state.streak.lastActiveDate = state.streak.lastActiveDate || null;
  state.streak.graceUsed = Boolean(state.streak.graceUsed);

  const last = safeNumber(state.meta.actionLastAt[key], 0);
  const t = safeNumber(now, Date.now());
  const dt = Math.max(0, t - last);
  if (last && dt < minMs) return true;

  state.meta.actionLastAt[key] = t;
  return false;
}

const DECAY_PER_HOUR = {
  hunger: 8,
  happiness: 6,
  energy: 5,
  cleanliness: 3,
};
const DECAY_SPEED = 0.65;

const MOOD_SAMPLE_MINUTES = 60;
// Level progression tuning.
// We intentionally use a scaling curve (not a flat step) so early levels are snappy
// but mid/high levels slow down.
const LEVEL_XP_BASE = 90;
const LEVEL_XP_GROWTH = 1.28;
const SKILL_LEVEL_STEP = 50;

const nowMs = () => Date.now();

const getDaysBetween = (fromMs, toMs) => {
  if (!fromMs) return Infinity;
  return (toMs - fromMs) / (1000 * 60 * 60 * 24);
};

const initialTemperament = {
  primary: 'SPICY',
  secondary: 'SWEET',
  traits: [
    { id: 'clingy', label: 'Clingy', intensity: 70 },
    { id: 'toyObsessed', label: 'Toy-Obsessed', intensity: 60 },
    { id: 'foodMotivated', label: 'Food-Motivated', intensity: 55 },
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
  lastPottyAt: null,
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
  graceUsed: false,
};

const initialBond = {
  value: 18,
  lastUpdatedAt: null,
};

const initialMemorial = {
  active: false,
  startedAt: null,
  completedAt: null,
};

const initialCosmetics = {
  unlockedIds: [],
  equipped: {
    collar: null,
    tag: null,
    backdrop: null,
  },
};

const STREAK_REWARDS = [
  { threshold: 3, id: 'collar_leaf', slot: 'collar', label: 'Leaf Collar' },
  { threshold: 7, id: 'tag_star', slot: 'tag', label: 'Star Tag' },
  { threshold: 14, id: 'collar_neon', slot: 'collar', label: 'Neon Collar' },
  {
    threshold: 30,
    id: 'backdrop_sunset',
    slot: 'backdrop',
    label: 'Sunset Backdrop',
  },
];

function normalizeTemperamentTraits(traits) {
  // Accept:
  // - Array of { id, label, intensity }
  // - Object keyed by trait id
  // - Anything else -> default traits
  const defaults = (initialTemperament.traits || []).map((t) => ({ ...t }));

  if (Array.isArray(traits)) {
    const byId = new Map();
    for (const t of traits) {
      if (!t || typeof t !== 'object') continue;
      const id = String(t.id || '').trim();
      if (!id) continue;
      byId.set(id, {
        id,
        label: t.label || defaults.find((d) => d.id === id)?.label || id,
        intensity: clamp(t.intensity ?? 0, 0, 100),
      });
    }

    return defaults.map((d) => ({ ...d, ...(byId.get(d.id) || {}) }));
  }

  if (traits && typeof traits === 'object') {
    // Common legacy shape: { clingy: { intensity: 70 }, ... }
    // Also accept values that already include `id`.
    const values = Object.values(traits);
    const looksLikeTraitArray =
      values.length > 0 &&
      values.every((v) => v && typeof v === 'object' && 'id' in v);

    if (looksLikeTraitArray) {
      return normalizeTemperamentTraits(values);
    }

    return defaults.map((d) => {
      const maybe = traits[d.id];
      if (!maybe || typeof maybe !== 'object') return { ...d };
      return {
        ...d,
        label: maybe.label || d.label,
        intensity: clamp(maybe.intensity ?? d.intensity ?? 0, 0, 100),
      };
    });
  }

  return defaults;
}

const POTTY_TRAINING_GOAL = 8;
const DEFAULT_LIFE_STAGE = { stage: 'PUPPY', label: 'Puppy', days: 0 };

// Per-life-stage stat decay multipliers.
// Used by applyDecay() via getStageMultiplier().
const LIFECYCLE_STAGE_MODIFIERS = {
  PUPPY: {
    hunger: 1.1,
    happiness: 1.05,
    energy: 1.0,
    cleanliness: 1.1,
  },
  ADULT: {
    hunger: 1.0,
    happiness: 1.0,
    energy: 1.0,
    cleanliness: 1.0,
  },
  SENIOR: {
    hunger: 1.0,
    happiness: 1.05,
    energy: 1.1,
    cleanliness: 1.0,
  },
};
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
  name: 'Pup',
  level: 1,
  xp: 0,
  coins: 0,
  adoptedAt: null,
  lifeStage: { stage: 'PUPPY', label: 'Puppy', days: 0 },
  potty: {
    training: 0, // 0–100: how potty-trained
    lastSuccessAt: null,
    lastAccidentAt: null,
    totalSuccesses: 0,
    totalAccidents: 0,
  },
  // 0–100: "need to go" bladder gauge (separate from training progress)
  pottyLevel: 0,
  stats: {
    hunger: 50,
    happiness: 60,
    energy: 60,
    cleanliness: 60,
  },
  cleanlinessTier: 'FRESH',
  poopCount: 0,

  isAsleep: false,
  debug: false,
  lastUpdatedAt: null,

  // Used by EnhancedDogSprite / animations
  lastAction: null,

  // Lightweight telemetry for UX + debug view.
  progress: {
    lastXpGain: null, // { at, amount, reason, levelAt }
    lastLevelUp: null, // { at, fromLevel, toLevel, reason, xpGain }
    lastUnlock: null, // { at, id, slot, label, threshold }
  },
  meta: {
    lastTickAt: null,
    lastSessionStartAt: null,
    actionLastAt: {},
    schemaVersion: DOG_SAVE_SCHEMA_VERSION,
    lastMigratedAt: null,
    savedAt: null,

    // ISO dates of days where the player performed any meaningful care action.
    // Used to gate temperament reveal on actual gameplay over real days.
    careDays: [],

    // Onboarding progress is persisted as part of the dog save so refresh/close
    // never feels scary. UI-level "dismiss forever" still lives in localStorage.
    onboarding: {
      version: 2,
      steps: {
        named: false,
        // Temperament is no longer chosen up-front; it develops over time.
        temperamentPicked: true,
        fed: false,
        played: false,
      },
      rewardedAt: null,
      completedAt: null,
    },
  },

  temperament: initialTemperament,
  memory: initialMemory,
  career: initialCareer,
  skills: initialSkills,
  mood: initialMood,
  journal: initialJournal,
  streak: initialStreak,
  bond: initialBond,
  memorial: initialMemorial,
  cosmetics: initialCosmetics,
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
    type: entry.type || 'INFO',
    moodTag: entry.moodTag || null,
    summary: entry.summary || '',
    body: entry.body || '',
  });

  if (state.journal.entries.length > 200) {
    state.journal.entries.length = 200;
  }
}

function updateBond(state, delta = 0, now = nowMs()) {
  if (!state.bond || typeof state.bond !== 'object') {
    state.bond = { ...initialBond };
  }
  const next = clamp(
    safeNumber(state.bond.value, 0) + safeNumber(delta, 0),
    0,
    100
  );
  state.bond.value = next;
  state.bond.lastUpdatedAt = now;
}

function ensureJournalState(state) {
  if (!state.journal || typeof state.journal !== 'object') {
    state.journal = { ...initialJournal };
  }
  if (!Array.isArray(state.journal.entries)) {
    state.journal.entries = [];
  }
  // Internal journal bookkeeping (not displayed).
  if (!state.journal._auto || typeof state.journal._auto !== 'object') {
    state.journal._auto = { lastAtByKey: {} };
  }
  if (
    !state.journal._auto.lastAtByKey ||
    typeof state.journal._auto.lastAtByKey !== 'object'
  ) {
    state.journal._auto.lastAtByKey = {};
  }
  return state.journal;
}

function hashToUint(str) {
  // Small deterministic hash (fast, stable across sessions).
  let h = 2166136261;
  const s = String(str || '');
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickDeterministic(list, seed) {
  if (!Array.isArray(list) || list.length === 0) return null;
  const idx = hashToUint(seed) % list.length;
  return list[idx];
}

function deriveMoodTagFromStats(state) {
  const { hunger, happiness, energy, cleanliness } = state.stats || {};
  if (safeNumber(happiness, 0) > 75 && safeNumber(hunger, 0) < 60)
    return 'HAPPY';
  if (safeNumber(hunger, 0) > 75) return 'HUNGRY';
  if (safeNumber(energy, 100) < 30) return 'SLEEPY';
  if (safeNumber(cleanliness, 100) < 30) return 'DIRTY';
  return 'NEUTRAL';
}

function shouldAutoJournal(state, key, now, opts = {}) {
  const { minMs = 90_000, chance = 0.65 } = opts;
  ensureJournalState(state);

  const t = safeNumber(now, nowMs());
  const last = safeNumber(state.journal._auto.lastAtByKey[key], 0);
  if (last && t - last < minMs) return false;

  // Deterministic pseudo-random gate, to avoid filling the journal too quickly.
  const seed = `${key}:${t}:${state.name}:${state.level}:${
    state.lifeStage?.stage || ''
  }`;
  const roll = (hashToUint(seed) % 1000) / 1000;
  if (roll > clamp(chance, 0, 1)) return false;

  state.journal._auto.lastAtByKey[key] = t;
  return true;
}

function careJournalEntry(state, now, key, context = {}) {
  const name = String(state.name || 'Pup');
  const stage = String(state.lifeStage?.label || state.lifeStage?.stage || '');
  const bucket = String(context.timeBucket || getLocalTimeBucket(now));
  const moodTag = context.moodTag || deriveMoodTagFromStats(state);

  const templates = {
    feed: [
      { s: 'Bowl: demolished.', b: `${name} ate like a champion.` },
      { s: 'Snack audit completed.', b: `${name} approved the menu. Loudly.` },
      {
        s: 'Mission: feed the dog. Success.',
        b: `Full tummy, happier pup (${stage}).`,
      },
      {
        s: 'Dinner bell vibes.',
        b: `A very ${bucket} meal, expertly inhaled.`,
      },
      {
        s: 'Treat negotiations concluded.',
        b: `Terms accepted. Payment received.`,
      },
      { s: 'Fuel acquired.', b: `${name} is now running on premium kibble.` },
    ],
    play: [
      { s: 'Zoomies achieved.', b: `We played hard. Tail: activated.` },
      { s: 'Toy time was a hit.', b: `${name} did a tiny victory lap.` },
      { s: 'Play session logged.', b: `Happiness up. Dignity… questionable.` },
      { s: 'Squeak! Squeak! Squeak!', b: `A very productive game.` },
      {
        s: 'Best day ever (so far).',
        b: `We made time to play. ${name} noticed.`,
      },
      { s: 'Energy spent wisely.', b: `Now ${name} is pleasantly tired.` },
    ],
    rest: [
      { s: 'Nap protocol initiated.', b: `${name} is recharging.` },
      { s: 'Power nap time.', b: `Soft snores detected. (${bucket})` },
      { s: 'Resting those paws.', b: `A little downtime goes a long way.` },
      { s: 'Cozy mode: ON.', b: `${name} found the best spot and claimed it.` },
      { s: 'Sleepy pup, happy home.', b: `Quiet moments count too.` },
    ],
    bathe: [
      { s: 'Bubble time happened.', b: `${name} is now suspiciously clean.` },
      { s: 'Freshly washed pup.', b: `Clean fur, big attitude.` },
      {
        s: 'Bath complete.',
        b: `We survived. ${name} will forgive me… eventually.`,
      },
      { s: 'Spa day achieved.', b: `A very ${bucket} rinse-and-reset.` },
      {
        s: 'Squeaky-clean status.',
        b: `${stage} coat restored to maximum fluff.`,
      },
    ],
    potty: [
      { s: 'Potty break successful.', b: `${name} did the responsible thing.` },
      { s: 'Nature called.', b: `Handled like a pro.` },
      { s: 'Outside time = success.', b: `${name} is very proud. So am I.` },
      {
        s: 'Bathroom business: complete.',
        b: `No accidents today, thank you very much.`,
      },
    ],
    scoop: [
      { s: 'Cleanup crew reporting in.', b: `Backyard status: improved.` },
      { s: 'Scoop secured.', b: `We don’t talk about it. We just scoop.` },
      { s: 'Poop? Gone.', b: `Cleanliness restored. Order returns.` },
    ],
    pet: [
      {
        s: 'Received premium ear scritches.',
        b: `${name} leaned in for seconds.`,
      },
      {
        s: 'We had a quiet cuddle moment.',
        b: `Tiny tail wags. Big feelings.`,
      },
      { s: 'Petting session: successful.', b: `${name} is now 12% calmer.` },
      {
        s: 'Affection delivered.',
        b: `The pup has been emotionally refueled.`,
      },
    ],
  };

  const pool = templates[key] || null;
  const chosen = pickDeterministic(
    pool || [],
    `${key}:${now}:${name}:${state.xp}`
  );
  if (!chosen) return null;

  const summary =
    typeof chosen === 'string'
      ? chosen
      : String(chosen.s || chosen.summary || '').trim();
  const body =
    typeof chosen === 'string'
      ? ''
      : String(chosen.b || chosen.body || '').trim();

  return {
    type: 'CARE',
    moodTag,
    summary,
    body,
    timestamp: now,
  };
}

function formatCommandLabel(commandId) {
  const id = String(commandId || '').trim();
  if (!id) return 'command';
  const map = {
    sit: 'Sit',
    stay: 'Stay',
    rollOver: 'Roll over',
    speak: 'Speak',
  };
  if (map[id]) return map[id];

  // Fallback: split camelCase -> words
  return id
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase());
}

function trainingJournalEntry(state, now, commandId, context = {}) {
  const name = String(state.name || 'Pup');
  const cmd = formatCommandLabel(commandId);
  const bucket = String(context.timeBucket || getLocalTimeBucket(now));

  const templates = [
    {
      s: `Practiced: ${cmd}.`,
      b: `We ran drills for "${cmd}". Treats may have been involved.`,
    },
    { s: `${cmd} practice logged.`, b: `${name} focused hard. I’m proud.` },
    {
      s: `Training time: ${cmd}.`,
      b: `A very ${bucket} session. Lots of "good dog!" energy.`,
    },
    { s: `Obedience: +1 brain cell.`, b: `Worked on ${cmd}. Progress: real.` },
    {
      s: `Command replay: ${cmd}.`,
      b: `We kept it short and sweet. Consistency wins.`,
    },
  ];

  const chosen = pickDeterministic(
    templates,
    `train:${commandId}:${now}:${state.level}:${state.xp}`
  );

  return {
    type: 'TRAINING',
    moodTag: 'FOCUSED',
    summary: chosen?.s || `Practiced: ${cmd}.`,
    body: chosen?.b || `We worked on "${cmd}" today.`,
    timestamp: now,
  };
}

function levelUpJournalEntry({
  state,
  now,
  fromLevel,
  toLevel,
  reason,
  xpGain,
}) {
  const name = String(state.name || 'Pup');
  const r = String(reason || '').toUpperCase();
  const templates = [
    {
      s: `Level up! Now level ${toLevel}.`,
      b: `${name} feels stronger. (Reason: ${r || 'XP'})`,
    },
    {
      s: `New level unlocked: ${toLevel}.`,
      b: `We gained ${xpGain || 0} XP. ${name} is thriving.`,
    },
    {
      s: `Glow-up achieved: level ${toLevel}.`,
      b: `From ${fromLevel} → ${toLevel}. Good work, hooman.`,
    },
    {
      s: `Ding! Level ${toLevel}.`,
      b: `${name} did a tiny victory wiggle. Totally scientific.`,
    },
  ];

  const chosen = pickDeterministic(
    templates,
    `levelup:${toLevel}:${now}:${state.xp}:${state.coins}`
  );

  return {
    type: 'LEVEL_UP',
    moodTag: 'PROUD',
    summary: chosen?.s || `Level up! Now level ${toLevel}.`,
    body: chosen?.b || `Nice work, hooman. I’m now level ${toLevel}!`,
    timestamp: now,
  };
}

function unlockJournalEntry(state, now, reward) {
  const label = String(reward?.label || 'Reward');
  const threshold = Number(reward?.threshold || 0);

  const templates = [
    {
      s: `Unlocked: ${label}`,
      b: `Streak reward for ${threshold} day(s) active.`,
    },
    {
      s: `${label} unlocked!`,
      b: `Consistency pays. (Streak: ${threshold} day(s))`,
    },
    {
      s: `Reward received: ${label}`,
      b: `Your streak hit ${threshold}. The pup approves.`,
    },
  ];

  const chosen = pickDeterministic(
    templates,
    `unlock:${reward?.id || label}:${threshold}:${now}`
  );

  return {
    type: 'UNLOCK',
    moodTag: 'HAPPY',
    summary: chosen?.s || `Unlocked: ${label}`,
    body: chosen?.b || `Streak reward for ${threshold} day(s) active.`,
    timestamp: now,
  };
}

function neglectJournalEntry(state, now, strikes = 0) {
  const name = String(state.name || 'Pup');
  const n = Math.max(0, Math.floor(Number(strikes) || 0));

  const letters = [
    {
      s: 'Dear hooman… I missed you.',
      b:
        'Dear hooman,\n\nI wasn’t sure if you were chasing squirrels or just busy, ' +
        'but I got pretty lonely while you were gone. Next time, can we play a little sooner?\n\n– your pup',
    },
    {
      s: 'I waited by the door.',
      b:
        `Dear hooman,\n\nI listened for your footsteps and did a small circle every time. ` +
        `When you come back, can we do one (1) cuddle?\n\n– ${name}`,
    },
    {
      s: 'Report: zero pets for too long.',
      b:
        `Dear hooman,\n\nThis is an official complaint. I require pets. ` +
        `Preferably on schedule.\n\n– ${name}`,
    },
  ];

  const chosen = pickDeterministic(letters, `neglect:${n}:${now}:${state.xp}`);
  return {
    type: 'NEGLECT',
    moodTag: 'LONELY',
    summary: chosen?.s || 'Dear hooman… I missed you.',
    body: chosen?.b || '',
    timestamp: now,
  };
}

const isValidStat = (key) =>
  ['hunger', 'happiness', 'energy', 'cleanliness'].includes(key);

function applyDecay(state, now = nowMs()) {
  if (!state.lastUpdatedAt) {
    state.lastUpdatedAt = now;
    return { diffHoursRaw: 0, diffHoursApplied: 0 };
  }

  const diffHoursRaw = Math.max(
    0,
    (now - state.lastUpdatedAt) / (1000 * 60 * 60)
  );
  const diffHours = Math.min(diffHoursRaw, MAX_CATCHUP_HOURS);
  if (diffHours <= 0) return { diffHoursRaw, diffHoursApplied: 0 };

  const hungerMultiplier = safeNumber(
    state.career.perks?.hungerDecayMultiplier,
    1.0
  );

  Object.entries(state.stats).forEach(([key, value]) => {
    if (!isValidStat(key)) return;

    const rate = safeNumber(DECAY_PER_HOUR[key], 0);
    const stageMultiplier = safeNumber(getStageMultiplier(state, key), 1);
    const current = clampStat(value);
    let delta = rate * DECAY_SPEED * diffHours * stageMultiplier;
    if (!Number.isFinite(delta)) delta = 0;

    if (key === 'hunger') {
      delta *= hungerMultiplier;
      // Avoid "AFK = instant starvation" by capping hunger catch-up.
      const cap = diffHoursRaw >= 2 ? IDLE_HUNGER_CAP : STAT_HI;
      state.stats[key] = clamp(current + delta, STAT_LO, cap);
    } else {
      // Idle decay should not hard-zero essential stats.
      state.stats[key] = clamp(current - delta, IDLE_DECAY_FLOOR, STAT_HI);
    }
  });

  if (diffHours >= 24) {
    state.memory.neglectStrikes = Math.min(
      (state.memory.neglectStrikes || 0) + 1,
      999
    );
    updateBond(state, -6, now);
    pushJournalEntry(
      state,
      neglectJournalEntry(state, now, state.memory.neglectStrikes)
    );
  }

  state.lastUpdatedAt = now;
  return { diffHoursRaw, diffHoursApplied: diffHours };
}

function maybeSampleMood(state, now = nowMs(), reason = 'TICK') {
  const last = state.mood.lastSampleAt;
  if (last && now - last < MOOD_SAMPLE_MINUTES * 60 * 1000) return;

  const { hunger, happiness, energy, cleanliness } = state.stats;

  let tag = 'NEUTRAL';
  if (happiness > 75 && hunger < 60) tag = 'HAPPY';
  else if (hunger > 75) tag = 'HUNGRY';
  else if (energy < 30) tag = 'SLEEPY';
  else if (cleanliness < 30) tag = 'DIRTY';

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

function xpRequiredForNextLevel(level) {
  const lvl = Math.max(1, Math.floor(Number(level) || 1));
  // Example: level 1->2 ~ 90, 5->6 ~ 260, 10->11 ~ 470
  return Math.max(
    60,
    Math.round(LEVEL_XP_BASE * Math.pow(lvl, LEVEL_XP_GROWTH))
  );
}

// Public helper: keep UI in sync with the same curve used by applyXp().
export function getXpRequiredForNextLevel(level) {
  return xpRequiredForNextLevel(level);
}

function xpIntoLevelFromTotal(totalXp, level) {
  const xpTotal = Math.max(0, Math.round(safeNumber(totalXp, 0)));
  const lvl = Math.max(1, Math.floor(safeNumber(level, 1)));
  let used = 0;
  for (let l = 1; l < lvl; l += 1) {
    used += xpRequiredForNextLevel(l);
    if (used > xpTotal) break;
  }
  return Math.max(0, xpTotal - Math.min(used, xpTotal));
}

// Memoized selector: returns a stable reference unless level/xp actually change.
export const selectDogXpProgress = createSelector(
  [(state) => state?.dog?.level, (state) => state?.dog?.xp],
  (levelRaw, xpRaw) => {
    const level = Math.max(1, Math.floor(safeNumber(levelRaw, 1)));
    const xpTotal = Math.max(0, Math.round(safeNumber(xpRaw, 0)));
    const needed = xpRequiredForNextLevel(level);
    const current = xpIntoLevelFromTotal(xpTotal, level);
    const ready = current >= needed;
    const pct = needed > 0 ? clamp(current / needed, 0, 1) : 0;

    return {
      level,
      xpTotal,
      current,
      needed,
      pct,
      ready,
    };
  }
);

function applyXp(state, amount = 10, meta = {}) {
  const now = meta?.now ?? nowMs();
  const reason = String(meta?.reason || 'XP').toUpperCase();
  const delta = Math.max(0, Math.round(Number(amount) || 0));
  if (!delta) return;

  state.xp = Math.max(0, Math.round(Number(state.xp) || 0) + delta);

  if (!state.progress || typeof state.progress !== 'object') {
    state.progress = { lastXpGain: null, lastLevelUp: null };
  }
  state.progress.lastXpGain = {
    at: now,
    amount: delta,
    reason,
    levelAt: Math.max(1, Math.floor(Number(state.level) || 1)),
  };

  // Convert total XP to levels using a scaling threshold.
  // Important: never decrease a user's existing level.
  let targetLevel = 1;
  let remaining = state.xp;
  let safety = 0;

  while (remaining >= xpRequiredForNextLevel(targetLevel) && safety < 300) {
    remaining -= xpRequiredForNextLevel(targetLevel);
    targetLevel += 1;
    safety += 1;
  }

  const currentLevel = Math.max(1, Math.floor(Number(state.level) || 1));

  // Prevent sudden multi-level jumps from a single action.
  const cappedTarget = Math.min(targetLevel, currentLevel + 1);
  const level = Math.max(currentLevel, cappedTarget);

  if (level > state.level) {
    const fromLevel = Math.max(1, Math.floor(Number(state.level) || 1));
    state.level = level;
    state.progress.lastLevelUp = {
      at: now,
      fromLevel,
      toLevel: state.level,
      reason,
      xpGain: delta,
    };
    pushJournalEntry(
      state,
      levelUpJournalEntry({
        state,
        now,
        fromLevel,
        toLevel: state.level,
        reason,
        xpGain: delta,
      })
    );
  }
}

function sanitizeDogState(state) {
  // Core scalars
  state.level = Math.max(1, Math.floor(safeNumber(state.level, 1)));
  state.xp = Math.max(0, Math.round(safeNumber(state.xp, 0)));
  state.coins = Math.max(0, Math.round(safeNumber(state.coins, 0)));
  state.poopCount = Math.max(0, Math.floor(safeNumber(state.poopCount, 0)));
  state.pottyLevel = clamp(safeNumber(state.pottyLevel, 0), 0, 100);

  // Stats
  if (!state.stats || typeof state.stats !== 'object') {
    state.stats = { ...initialState.stats };
  }
  state.stats.hunger = clampStat(state.stats.hunger);
  state.stats.happiness = clampStat(state.stats.happiness);
  state.stats.energy = clampStat(state.stats.energy);
  state.stats.cleanliness = clampStat(state.stats.cleanliness);

  // Nested skill nodes can NaN if older saves had strings
  const ob = state.skills?.obedience;
  if (ob && typeof ob === 'object') {
    Object.values(ob).forEach((node) => {
      if (!node || typeof node !== 'object') return;
      node.level = Math.max(0, Math.floor(safeNumber(node.level, 0)));
      node.xp = Math.max(0, Math.round(safeNumber(node.xp, 0)));
    });
  }

  if (!state.progress || typeof state.progress !== 'object') {
    state.progress = { lastXpGain: null, lastLevelUp: null, lastUnlock: null };
  }
  if (!state.meta || typeof state.meta !== 'object') {
    state.meta = {
      lastTickAt: null,
      lastSessionStartAt: null,
      actionLastAt: {},
      schemaVersion: DOG_SAVE_SCHEMA_VERSION,
      lastMigratedAt: null,
      savedAt: null,
    };
  }
  if (!state.meta.actionLastAt || typeof state.meta.actionLastAt !== 'object') {
    state.meta.actionLastAt = {};
  }

  // Persisted schema fields
  if (!Number.isFinite(Number(state.meta.schemaVersion))) {
    state.meta.schemaVersion = DOG_SAVE_SCHEMA_VERSION;
  }
  state.meta.schemaVersion = DOG_SAVE_SCHEMA_VERSION;

  // Persisted onboarding progress (best-effort for older saves)
  if (!state.meta.onboarding || typeof state.meta.onboarding !== 'object') {
    state.meta.onboarding = { ...initialState.meta.onboarding };
  }
  if (state.meta.onboarding.version !== 2) {
    state.meta.onboarding.version = 2;
  }
  if (
    !state.meta.onboarding.steps ||
    typeof state.meta.onboarding.steps !== 'object'
  ) {
    state.meta.onboarding.steps = { ...initialState.meta.onboarding.steps };
  }
  state.meta.onboarding.steps = {
    ...initialState.meta.onboarding.steps,
    ...state.meta.onboarding.steps,
  };
  state.meta.onboarding.rewardedAt = state.meta.onboarding.rewardedAt ?? null;
  state.meta.onboarding.completedAt = state.meta.onboarding.completedAt ?? null;

  if (!state.bond || typeof state.bond !== 'object') {
    state.bond = { ...initialBond };
  }
  state.bond.value = clamp(safeNumber(state.bond.value, 0), 0, 100);
  state.bond.lastUpdatedAt = state.bond.lastUpdatedAt ?? null;

  if (!state.memorial || typeof state.memorial !== 'object') {
    state.memorial = { ...initialMemorial };
  }
  state.memorial.active = Boolean(state.memorial.active);
  state.memorial.startedAt = state.memorial.startedAt ?? null;
  state.memorial.completedAt = state.memorial.completedAt ?? null;

  // Keep tier in sync with current constants.
  state.cleanlinessTier = normalizeCleanlinessTier(state.cleanlinessTier);

  // Cosmetics (older saves)
  if (!state.cosmetics || typeof state.cosmetics !== 'object') {
    state.cosmetics = { ...initialCosmetics };
  }
  if (!Array.isArray(state.cosmetics.unlockedIds)) {
    state.cosmetics.unlockedIds = [];
  }
  if (
    !state.cosmetics.equipped ||
    typeof state.cosmetics.equipped !== 'object'
  ) {
    state.cosmetics.equipped = { ...initialCosmetics.equipped };
  }
  state.cosmetics.equipped = {
    ...initialCosmetics.equipped,
    ...state.cosmetics.equipped,
  };
}

function maybeUnlockStreakRewards(state, now = nowMs()) {
  if (!state?.streak) return;
  if (!state.cosmetics || typeof state.cosmetics !== 'object') {
    state.cosmetics = { ...initialCosmetics };
  }
  if (!Array.isArray(state.cosmetics.unlockedIds))
    state.cosmetics.unlockedIds = [];

  const streakDays = Math.max(
    0,
    Math.floor(safeNumber(state.streak.currentStreakDays, 0))
  );
  if (!streakDays) return;

  for (const r of STREAK_REWARDS) {
    if (!r || typeof r !== 'object') continue;
    if (streakDays < r.threshold) continue;
    if (state.cosmetics.unlockedIds.includes(r.id)) continue;

    state.cosmetics.unlockedIds.push(r.id);
    // Auto-equip if the slot is empty.
    const slot = r.slot;
    if (slot && state.cosmetics.equipped && !state.cosmetics.equipped[slot]) {
      state.cosmetics.equipped[slot] = r.id;
    }

    state.progress.lastUnlock = {
      at: now,
      id: r.id,
      slot: r.slot,
      label: r.label,
      threshold: r.threshold,
    };

    // Small coin bonus for streak milestones.
    state.coins = Math.max(0, Math.round(safeNumber(state.coins, 0)) + 25);

    pushJournalEntry(state, unlockJournalEntry(state, now, r));
  }
}

function applySkillXp(skillBranch, skillId, skillState, amount = 5) {
  if (!skillState[skillBranch] || !skillState[skillBranch][skillId]) return;

  const node = skillState[skillBranch][skillId];
  const inc = Math.max(0, Math.round(safeNumber(amount, 0)));
  node.xp = Math.max(0, Math.round(safeNumber(node.xp, 0)) + inc);

  const targetLevel = Math.floor(node.xp / SKILL_LEVEL_STEP);
  if (targetLevel > node.level) {
    node.level = Math.max(0, Math.floor(safeNumber(targetLevel, 0)));
  }
}

function updateStreak(streakState, isoDate) {
  const { currentStreakDays, bestStreakDays, lastActiveDate } = streakState;

  if (!isoDate) return;

  if (!lastActiveDate) {
    streakState.currentStreakDays = 1;
    streakState.bestStreakDays = Math.max(bestStreakDays, 1);
    streakState.lastActiveDate = isoDate;
    streakState.graceUsed = false;
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
  } else if (diffDays === 2 && !streakState.graceUsed) {
    // Forgiving miss: allow one "grace day" per streak.
    streakState.currentStreakDays = currentStreakDays + 1;
    streakState.graceUsed = true;
  } else {
    streakState.currentStreakDays = 1;
    streakState.graceUsed = false;
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
  const careDays = Array.isArray(state.meta?.careDays)
    ? state.meta.careDays
    : [];
  const uniqueCareDays = new Set(careDays.filter(Boolean)).size;
  if (days >= 3 && uniqueCareDays >= 3) state.temperament.revealReady = true;
}

function recordCareDay(state, now = nowMs()) {
  if (!state.meta || typeof state.meta !== 'object') {
    state.meta = { ...initialState.meta };
  }
  if (!Array.isArray(state.meta.careDays)) state.meta.careDays = [];
  const iso = getIsoDate(now);
  if (!iso) return;
  if (state.meta.careDays[0] === iso) return;
  if (state.meta.careDays.includes(iso)) return;
  state.meta.careDays.unshift(iso);
  if (state.meta.careDays.length > 21) state.meta.careDays.length = 21;
}

function evaluateTemperament(state, now = nowMs()) {
  if (!state.temperament || typeof state.temperament !== 'object') {
    state.temperament = {
      ...initialTemperament,
      adoptedAt: state.adoptedAt || now,
    };
  }

  const t = state.temperament;
  t.traits = normalizeTemperamentTraits(t.traits);

  const lastEval = t.lastEvaluatedAt || t.adoptedAt || 0;
  const days = getDaysBetween(lastEval, now);
  if (days < 1) return;

  const findTrait = (id) => t.traits.find((x) => x.id === id);

  const clingy = findTrait('clingy');
  const toyObsessed = findTrait('toyObsessed');
  const foodMotivated = findTrait('foodMotivated');

  if (!clingy || !toyObsessed || !foodMotivated) {
    console.warn('[Doggerz] Missing temperament traits, skipping evaluation');
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
  const happyMoodCount = recentMoods.filter((m) => m.tag === 'HAPPY').length;
  const hungryMoodCount = recentMoods.filter((m) => m.tag === 'HUNGRY').length;
  const moodSentiment = {
    happy: happyMoodCount,
    hungry: hungryMoodCount,
  };

  const recentJournal = (state.journal?.entries || []).slice(0, 20);
  const _trainingEntries = recentJournal.filter(
    (e) => e.type === 'TRAINING'
  ).length;
  const neglectEntries = recentJournal.filter(
    (e) => e.type === 'NEGLECT'
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
    clingy: 'SWEET',
    toyObsessed: 'SPICY',
    foodMotivated: 'CHILL',
  };

  t.primary = traitToLabel[top.id] || t.primary || 'SPICY';
  t.secondary = traitToLabel[second.id] || t.secondary || 'SWEET';

  t.lastEvaluatedAt = now;
}

function resolveCleanlinessTierFromValue(value = 0) {
  const v = clamp(Number(value), 0, 100);
  if (v >= CLEANLINESS_THRESHOLDS.FRESH) return 'FRESH';
  if (v >= CLEANLINESS_THRESHOLDS.DIRTY) return 'DIRTY';
  if (v >= CLEANLINESS_THRESHOLDS.FLEAS) return 'FLEAS';
  return 'MANGE';
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
  const previousTier = state.cleanlinessTier || 'FRESH';

  if (nextTier !== previousTier) {
    state.cleanlinessTier = nextTier;
    const tierEffect = CLEANLINESS_TIER_EFFECTS[nextTier];
    if (tierEffect?.journalSummary) {
      pushJournalEntry(state, {
        type: 'CARE',
        moodTag: 'DIRTY',
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
  const tier = tierOverride || state.cleanlinessTier || 'FRESH';
  const effects = CLEANLINESS_TIER_EFFECTS[tier];
  if (!effects) return;

  // Scale penalties by elapsed time so tick interval changes don't break tuning.
  const elapsedHours = clamp(
    safeNumber(state?.__elapsedHoursForPenalties, 0),
    0,
    MAX_CATCHUP_HOURS
  );
  if (!elapsedHours) return;

  // Safety cap: penalties should feel like nudges, not a multi-hour punishment spike.
  const effectiveHours = Math.min(elapsedHours, 2.5);

  if (effects.happinessTickPenalty) {
    state.stats.happiness = clamp(
      state.stats.happiness - effects.happinessTickPenalty * effectiveHours,
      STAT_LO,
      STAT_HI
    );
  }

  if (effects.energyTickPenalty) {
    state.stats.energy = clamp(
      state.stats.energy - effects.energyTickPenalty * effectiveHours,
      STAT_LO,
      STAT_HI
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

function getLocalTimeBucket(ms) {
  try {
    const h = new Date(ms).getHours();
    if (h >= 21 || h < 6) return 'night';
    if (h < 12) return 'morning';
    if (h < 18) return 'afternoon';
    return 'evening';
  } catch {
    return 'local';
  }
}

function recordPuppyPottySuccess(state, now = nowMs()) {
  const training = ensureTrainingState(state);
  const potty = training.potty;
  if (!potty || potty.completedAt) return;
  const stage = state.lifeStage?.stage || DEFAULT_LIFE_STAGE.stage;
  if (stage !== 'PUPPY') return;

  potty.successCount = Math.min(potty.successCount + 1, potty.goal);

  if (potty.successCount >= potty.goal) {
    potty.completedAt = now;
    state.stats.happiness = clamp(state.stats.happiness + 5, 0, 100);
    const templates = [
      {
        s: 'Potty training complete',
        b: 'Your puppy now knows how to signal when nature calls. Accidents will slow way down!',
      },
      {
        s: 'Potty training: mastered',
        b: 'Your pup is getting really good at going outside. Nice consistency!',
      },
      {
        s: 'A proud potty moment',
        b: 'Fewer accidents ahead. Your pup learned the routine!',
      },
    ];
    const chosen = pickDeterministic(
      templates,
      `potty:complete:${now}:${state.name}:${state.xp}`
    );
    pushJournalEntry(state, {
      type: 'TRAINING',
      moodTag: 'PROUD',
      summary: chosen?.s || 'Potty training complete',
      body:
        chosen?.b ||
        'Your puppy now knows how to signal when nature calls. Accidents will slow way down!',
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
  if (stage === 'PUPPY') return;
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

  const templates = [
    {
      s: 'Adult training complete',
      b: `Obedience session logged. Training streak: ${adult.streak}.`,
    },
    {
      s: 'Training streak maintained',
      b: `Nice routine. Current training streak: ${adult.streak}.`,
    },
    {
      s: 'Obedience session done',
      b: `A focused session. Streak: ${adult.streak}.`,
    },
  ];
  const chosen = pickDeterministic(
    templates,
    `adultTraining:complete:${iso}:${adult.streak}:${state.xp}`
  );

  pushJournalEntry(state, {
    type: 'TRAINING',
    moodTag: 'FOCUSED',
    summary: chosen?.s || 'Adult training complete',
    body:
      chosen?.b ||
      `Today's obedience session is logged. Training streak: ${adult.streak}.`,
    timestamp: now,
  });
}

function applyAdultTrainingMissPenalty(state, now = nowMs()) {
  const training = ensureTrainingState(state);
  const stage = state.lifeStage?.stage || DEFAULT_LIFE_STAGE.stage;
  if (stage === 'PUPPY') return;

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

  const templates = [
    {
      s: 'Needs adult training',
      b: 'Too many days without a training session. Schedule time to practice commands!',
    },
    {
      s: 'Training routine slipped',
      b: 'Let’s get back to daily practice. A short session helps a lot.',
    },
    {
      s: 'Reminder: practice time',
      b: 'A little obedience session today would really help.',
    },
  ];
  const chosen = pickDeterministic(
    templates,
    `adultTraining:miss:${iso}:${adult.misses}:${state.xp}`
  );
  pushJournalEntry(state, {
    type: 'TRAINING',
    moodTag: 'RESTLESS',
    summary: chosen?.s || 'Needs adult training',
    body:
      chosen?.b ||
      'Too many days without a training session. Schedule time to practice commands!',
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
    if (typeof state.stats?.[stat] !== 'number') return;
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
    applyXp(state, 4, { now, reason: 'POLL' });
    maybeSampleMood(state, now, 'POLL_ACCEPT');
    pushJournalEntry(state, {
      type: 'POLL',
      moodTag: 'HAPPY',
      summary: 'You handled a dog poll',
      body: `You said yes to: ${active.prompt}`,
      timestamp: now,
    });
  } else {
    const penalty = reason === 'TIMEOUT' ? 6 : 4;
    state.stats.happiness = clamp(state.stats.happiness - penalty, 0, 100);
    maybeSampleMood(
      state,
      now,
      reason === 'TIMEOUT' ? 'POLL_TIMEOUT' : 'POLL_DECLINE'
    );
    pushJournalEntry(state, {
      type: 'POLL',
      moodTag: 'SASSY',
      summary: 'Ignored pup feedback',
      body:
        reason === 'TIMEOUT'
          ? 'The pup asked for help and eventually gave up.'
          : 'You said no this time. They took note!',
      timestamp: now,
    });
  }

  pollState.history.unshift({
    id: active.id,
    prompt: active.prompt,
    accepted,
    reason: reason || (accepted ? 'ACCEPT' : 'DECLINE'),
    resolvedAt: now,
  });
  if (pollState.history.length > 20) {
    pollState.history.length = 20;
  }

  pollState.active = null;
  pollState.lastResolvedAt = now;
  finalizeDerivedState(state, now);
  sanitizeDogState(state);
}

function getIncomingSchemaVersion(payload) {
  const v = payload?.meta?.schemaVersion;
  const n = Number(v);
  return Number.isFinite(n) ? n : 1;
}

function normalizeCleanlinessTier(tier) {
  const t = String(tier || '').toUpperCase();
  if (t && CLEANLINESS_TIER_EFFECTS && t in CLEANLINESS_TIER_EFFECTS) return t;
  return 'FRESH';
}

/* ---------------------- slice ---------------------- */

const dogSlice = createSlice({
  name: 'dog',
  initialState,
  reducers: {
    hydrateDog(state, { payload }) {
      if (!payload || typeof payload !== 'object') return;

      const incomingSchemaVersion = getIncomingSchemaVersion(payload);

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
      merged.temperament.traits = normalizeTemperamentTraits(
        merged.temperament.traits
      );

      merged.memory = {
        ...initialMemory,
        ...(payload.memory || state.memory || {}),
      };

      merged.bond = {
        ...initialBond,
        ...(payload.bond || state.bond || {}),
      };

      merged.memorial = {
        ...initialMemorial,
        ...(payload.memorial || state.memorial || {}),
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

      merged.cosmetics = {
        ...initialCosmetics,
        ...(payload.cosmetics || state.cosmetics || {}),
      };
      if (!Array.isArray(merged.cosmetics.unlockedIds))
        merged.cosmetics.unlockedIds = [];
      merged.cosmetics.equipped = {
        ...initialCosmetics.equipped,
        ...(merged.cosmetics.equipped || {}),
      };

      // Keep lastAction if present, otherwise reset
      merged.lastAction =
        payload.lastAction ?? state.lastAction ?? initialState.lastAction;

      ensureTrainingState(merged);
      ensurePollState(merged);

      merged.cleanlinessTier =
        payload.cleanlinessTier || state.cleanlinessTier || 'FRESH';

      // Ensure expected new fields exist even for older saves.
      merged.pottyLevel = safeNumber(
        payload.pottyLevel,
        safeNumber(state.pottyLevel, 0)
      );
      merged.progress =
        payload.progress || state.progress || initialState.progress;
      merged.meta = {
        ...initialState.meta,
        ...(state.meta || {}),
        ...(payload.meta || {}),
      };

      // Normalize care-day tracking.
      if (!Array.isArray(merged.meta.careDays)) merged.meta.careDays = [];

      // Temperament is no longer picked up-front; don't block onboarding on legacy false.
      if (
        !merged.meta.onboarding ||
        typeof merged.meta.onboarding !== 'object'
      ) {
        merged.meta.onboarding = { ...initialState.meta.onboarding };
      }
      if (
        !merged.meta.onboarding.steps ||
        typeof merged.meta.onboarding.steps !== 'object'
      ) {
        merged.meta.onboarding.steps = {
          ...initialState.meta.onboarding.steps,
        };
      }
      merged.meta.onboarding.steps.temperamentPicked = true;

      // Keep schema version current after hydrate/migrate.
      if (incomingSchemaVersion !== DOG_SAVE_SCHEMA_VERSION) {
        merged.meta.lastMigratedAt = nowMs();
      }
      merged.meta.schemaVersion = DOG_SAVE_SCHEMA_VERSION;

      merged.cleanlinessTier = normalizeCleanlinessTier(
        payload.cleanlinessTier || state.cleanlinessTier || 'FRESH'
      );

      finalizeDerivedState(merged, nowMs());
      sanitizeDogState(merged);
      return merged;
    },
    equipCosmetic(state, { payload }) {
      const slot = String(payload?.slot || '').trim();
      const id = String(payload?.id || '').trim();
      if (!slot) return;
      if (!state.cosmetics || typeof state.cosmetics !== 'object') {
        state.cosmetics = { ...initialCosmetics };
      }
      if (!Array.isArray(state.cosmetics.unlockedIds))
        state.cosmetics.unlockedIds = [];
      if (
        !state.cosmetics.equipped ||
        typeof state.cosmetics.equipped !== 'object'
      ) {
        state.cosmetics.equipped = { ...initialCosmetics.equipped };
      }
      if (!(slot in state.cosmetics.equipped)) return;
      if (!id) {
        state.cosmetics.equipped[slot] = null;
        return;
      }
      if (!state.cosmetics.unlockedIds.includes(id)) return;
      state.cosmetics.equipped[slot] = id;
    },

    purchaseCosmetic(state, { payload }) {
      const now = payload?.now ?? nowMs();
      const id = String(payload?.id || '').trim();
      if (!id) return;

      const entry = STREAK_REWARDS.find((r) => r && r.id === id) || null;
      if (!entry) return;

      if (!state.cosmetics || typeof state.cosmetics !== 'object') {
        state.cosmetics = { ...initialCosmetics };
      }
      if (!Array.isArray(state.cosmetics.unlockedIds)) {
        state.cosmetics.unlockedIds = [];
      }
      if (
        !state.cosmetics.equipped ||
        typeof state.cosmetics.equipped !== 'object'
      ) {
        state.cosmetics.equipped = { ...initialCosmetics.equipped };
      }

      // Already owned -> no charge.
      if (state.cosmetics.unlockedIds.includes(id)) return;

      const fallbackPrice = Math.max(
        0,
        Math.round(Number(entry.threshold || 0) * 25)
      );
      const price = Math.max(
        0,
        Math.round(
          Number.isFinite(Number(payload?.price))
            ? Number(payload.price)
            : fallbackPrice
        )
      );

      const coins = Math.max(0, Math.round(safeNumber(state.coins, 0)));
      if (price > coins) return;

      state.coins = Math.max(0, coins - price);
      state.cosmetics.unlockedIds.push(id);

      // Auto-equip if the slot is empty.
      const slot = String(entry.slot || '').trim();
      if (
        slot &&
        slot in state.cosmetics.equipped &&
        !state.cosmetics.equipped[slot]
      ) {
        state.cosmetics.equipped[slot] = id;
      }

      pushJournalEntry(state, {
        type: 'PURCHASE',
        moodTag: 'HAPPY',
        summary: `Purchased: ${entry.label}`,
        body: `You bought ${entry.label} for ${price} coins.`,
        timestamp: now,
      });

      finalizeDerivedState(state, now);
      sanitizeDogState(state);
    },

    setDogName(state, { payload }) {
      state.name = payload || 'Pup';
    },

    setOnboardingStep(state, { payload }) {
      const step = String(payload?.step || '').trim();
      if (!step) return;
      const now = payload?.now ?? nowMs();

      if (!state.meta || typeof state.meta !== 'object')
        state.meta = { ...initialState.meta };
      if (!state.meta.onboarding || typeof state.meta.onboarding !== 'object') {
        state.meta.onboarding = { ...initialState.meta.onboarding };
      }
      if (
        !state.meta.onboarding.steps ||
        typeof state.meta.onboarding.steps !== 'object'
      ) {
        state.meta.onboarding.steps = { ...initialState.meta.onboarding.steps };
      }

      if (step in state.meta.onboarding.steps) {
        state.meta.onboarding.steps[step] = payload?.value !== false;
      }

      const s = state.meta.onboarding.steps;
      const done = Boolean(s.named && s.fed && s.played);
      if (done && !state.meta.onboarding.completedAt) {
        state.meta.onboarding.completedAt = now;
      }
    },

    grantOnboardingReward(state, { payload }) {
      const now = payload?.now ?? nowMs();
      if (
        !state.meta?.onboarding ||
        typeof state.meta.onboarding !== 'object'
      ) {
        state.meta = {
          ...(state.meta || {}),
          onboarding: { ...initialState.meta.onboarding },
        };
      }
      if (state.meta.onboarding.rewardedAt) return;

      // Starter reward: coins + XP. Keep it modest but satisfying.
      state.coins = Math.max(0, Math.round(safeNumber(state.coins, 0)) + 50);
      applyXp(state, 18, { now, reason: 'ONBOARDING' });
      state.meta.onboarding.rewardedAt = now;

      pushJournalEntry(state, {
        type: 'REWARD',
        moodTag: 'HAPPY',
        summary: 'Starter reward unlocked',
        body: 'Nice! You completed the first steps. Enjoy a small starter bonus.',
        timestamp: now,
      });

      finalizeDerivedState(state, now);
      sanitizeDogState(state);
    },

    setTemperamentPreset(state, { payload }) {
      const now = payload?.now ?? nowMs();
      const presetId = String(payload?.presetId || '').trim();
      const preset =
        payload?.preset && typeof payload.preset === 'object'
          ? payload.preset
          : null;

      if (!state.temperament || typeof state.temperament !== 'object') {
        state.temperament = {
          ...initialTemperament,
          adoptedAt: state.adoptedAt || now,
        };
      }

      if (preset) {
        state.temperament.primary = String(
          preset.primary || state.temperament.primary || 'SWEET'
        ).toUpperCase();
        state.temperament.secondary = String(
          preset.secondary || state.temperament.secondary || 'SPICY'
        ).toUpperCase();
        if (Array.isArray(preset.traits)) {
          state.temperament.traits = normalizeTemperamentTraits(preset.traits);
        }
      }

      state.temperament.revealedAt = now;
      state.temperament.revealReady = false;
      state.temperament.pickedByUser = true;
      state.temperament.presetId =
        presetId || state.temperament.presetId || null;
      state.temperament.lastEvaluatedAt = now;

      finalizeDerivedState(state, now);
      sanitizeDogState(state);
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
      if (perks && typeof perks === 'object') {
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
      if (shouldIgnoreRapidRepeat(state, 'feed', now)) return;
      applyDecay(state, now);

      // Interactions wake the dog.
      state.isAsleep = false;

      // Feeding should feel impactful (not a clicker): one feed -> fully fed.
      // Internally, `hunger` is a "hunger level" where 0 = full and 100 = starving.
      const hungerBefore = clampStat(state.stats.hunger);
      const need = clamp(hungerBefore / 100, 0, 1);
      const cooldown = cooldownScale(state.memory.lastFedAt, now);

      const careerMultiplier = safeNumber(
        state.career.perks?.happinessGainMultiplier,
        1.0
      );

      state.stats.hunger = 0;
      state.stats.happiness = clamp(
        state.stats.happiness +
          6 * careerMultiplier * (0.35 + 0.65 * need) * cooldown,
        0,
        100
      );

      state.memory.lastFedAt = now;
      state.memory.lastSeenAt = now;

      state.lastAction = 'feed';

      updateBond(state, 2, now);
      applyXp(state, Math.round(6 * (0.25 + 0.75 * need) * cooldown), {
        now,
        reason: 'FEED',
      });
      maybeSampleMood(state, now, 'FEED');

      if (
        shouldAutoJournal(state, 'care:feed', now, {
          minMs: 120_000,
          chance: 0.8,
        })
      ) {
        const entry = careJournalEntry(state, now, 'feed', {
          timeBucket: payload?.timeBucket || payload?.timeOfDay,
        });
        if (entry) pushJournalEntry(state, entry);
      }

      const date = getIsoDate(now);
      updateStreak(state.streak, date);
      maybeUnlockStreakRewards(state, now);
      recordCareDay(state, now);
      updateTemperamentReveal(state, now);
      finalizeDerivedState(state, now);
      sanitizeDogState(state);
    },

    play(state, { payload }) {
      const now = payload?.now ?? nowMs();
      if (shouldIgnoreRapidRepeat(state, 'play', now)) return;
      applyDecay(state, now);

      // Interactions wake the dog.
      state.isAsleep = false;

      const happinessBefore = clampStat(state.stats.happiness);
      const energyBefore = clampStat(state.stats.energy);
      const need = clamp((100 - happinessBefore) / 100, 0, 1);
      const energyFactor = clamp(energyBefore / 40, 0.2, 1);
      const cooldown = cooldownScale(state.memory.lastPlayedAt, now);

      const zoomiesMultiplier = payload?.timeOfDay === 'MORNING' ? 2 : 1;
      const careerMultiplier = safeNumber(
        state.career.perks?.happinessGainMultiplier,
        1.0
      );

      const baseHappiness = safeNumber(payload?.happinessGain, 15);
      const gain =
        baseHappiness *
        zoomiesMultiplier *
        careerMultiplier *
        (0.25 + 0.75 * need) *
        energyFactor *
        cooldown;

      state.stats.happiness = clamp(state.stats.happiness + gain, 0, 100);
      state.stats.energy = clamp(
        state.stats.energy - 10 * (0.7 + 0.3 * (1 - need)),
        0,
        100
      );

      // If they're wiped, they conk out on their own.
      if (state.stats.energy <= 15) state.isAsleep = true;

      state.memory.lastPlayedAt = now;
      state.memory.lastSeenAt = now;

      state.lastAction = 'play';

      updateBond(state, 3, now);
      applyXp(
        state,
        Math.round(8 * (0.25 + 0.75 * need) * energyFactor * cooldown),
        { now, reason: 'PLAY' }
      );
      maybeSampleMood(state, now, 'PLAY');

      if (
        shouldAutoJournal(state, 'care:play', now, {
          minMs: 120_000,
          chance: 0.75,
        })
      ) {
        const entry = careJournalEntry(state, now, 'play', {
          timeBucket: payload?.timeBucket || payload?.timeOfDay,
        });
        if (entry) pushJournalEntry(state, entry);
      }

      const date = getIsoDate(now);
      updateStreak(state.streak, date);
      maybeUnlockStreakRewards(state, now);
      recordCareDay(state, now);
      updateTemperamentReveal(state, now);
      finalizeDerivedState(state, now);
      sanitizeDogState(state);
    },

    pet(state, { payload }) {
      const now = payload?.now ?? nowMs();
      if (shouldIgnoreRapidRepeat(state, 'pet', now)) return;
      applyDecay(state, now);

      // Petting is a gentle interaction; don't forcibly wake a sleeping pup.
      state.stats.happiness = clamp(state.stats.happiness + 4, 0, 100);
      state.memory.lastSeenAt = now;
      state.lastAction = 'pet';

      updateBond(state, 4, now);
      applyXp(state, 2, { now, reason: 'PET' });
      maybeSampleMood(state, now, 'PET');

      if (
        shouldAutoJournal(state, 'care:pet', now, {
          minMs: 180_000,
          chance: 0.35,
        })
      ) {
        const entry = careJournalEntry(state, now, 'pet', {
          moodTag: 'HAPPY',
          timeBucket: payload?.timeBucket || payload?.timeOfDay,
        });
        if (entry) pushJournalEntry(state, entry);
      }

      finalizeDerivedState(state, now);
      sanitizeDogState(state);
    },

    praise(state, { payload }) {
      const now = payload?.now ?? nowMs();
      if (shouldIgnoreRapidRepeat(state, 'praise', now)) return;
      applyDecay(state, now);

      state.stats.happiness = clamp(state.stats.happiness + 3, 0, 100);
      state.memory.lastSeenAt = now;
      state.lastAction = 'praise';

      updateBond(state, 1, now);
      applyXp(state, 2, { now, reason: 'PRAISE' });
      maybeSampleMood(state, now, 'PRAISE');

      if (
        shouldAutoJournal(state, 'care:praise', now, {
          minMs: 180_000,
          chance: 0.35,
        })
      ) {
        pushJournalEntry(state, {
          type: 'CARE',
          moodTag: 'PROUD',
          summary: 'Good dog moment.',
          body: `${
            state.name || 'Pup'
          } looked extremely pleased with themself.`,
          timestamp: now,
        });
      }

      finalizeDerivedState(state, now);
      sanitizeDogState(state);
    },

    rest(state, { payload }) {
      const now = payload?.now ?? nowMs();
      if (shouldIgnoreRapidRepeat(state, 'rest', now)) return;
      applyDecay(state, now);

      const energyBefore = clampStat(state.stats.energy);
      const need = clamp((100 - energyBefore) / 100, 0, 1);
      const cooldown = cooldownScale(state.memory.lastSeenAt, now, 5000);

      state.isAsleep = true;
      state.stats.energy = clamp(
        state.stats.energy + 20 * (0.35 + 0.65 * need) * cooldown,
        0,
        100
      );
      state.stats.happiness = clamp(
        state.stats.happiness + 3 * (0.25 + 0.75 * need) * cooldown,
        0,
        100
      );

      state.memory.lastSeenAt = now;

      state.lastAction = 'rest';

      updateBond(state, 1, now);
      applyXp(state, Math.round(3 * (0.35 + 0.65 * need) * cooldown), {
        now,
        reason: 'REST',
      });
      maybeSampleMood(state, now, 'REST');

      if (
        shouldAutoJournal(state, 'care:rest', now, {
          minMs: 150_000,
          chance: 0.7,
        })
      ) {
        const entry = careJournalEntry(state, now, 'rest', {
          timeBucket: payload?.timeBucket || payload?.timeOfDay,
        });
        if (entry) pushJournalEntry(state, entry);
      }
      updateTemperamentReveal(state, now);
      finalizeDerivedState(state, now);
      sanitizeDogState(state);
    },

    wakeUp(state) {
      state.isAsleep = false;
      state.lastAction = 'wake';
    },

    bathe(state, { payload }) {
      const now = payload?.now ?? nowMs();
      if (shouldIgnoreRapidRepeat(state, 'bathe', now)) return;
      applyDecay(state, now);

      state.isAsleep = false;

      const cleanlinessBefore = clampStat(state.stats.cleanliness);
      const need = clamp((100 - cleanlinessBefore) / 100, 0, 1);
      const cooldown = cooldownScale(state.memory.lastBathedAt, now);

      state.stats.cleanliness = clamp(
        state.stats.cleanliness + 30 * (0.25 + 0.75 * need) * cooldown,
        0,
        100
      );
      // If already clean, baths are less "fun" (discourages spamming).
      state.stats.happiness = clamp(
        state.stats.happiness - 5 * (0.35 + 0.65 * (1 - need)),
        0,
        100
      );

      state.memory.lastBathedAt = now;
      state.memory.lastSeenAt = now;

      state.lastAction = 'bathe';

      updateBond(state, 1, now);
      applyXp(state, Math.round(4 * (0.25 + 0.75 * need) * cooldown), {
        now,
        reason: 'BATHE',
      });
      maybeSampleMood(state, now, 'BATHE');

      if (
        shouldAutoJournal(state, 'care:bathe', now, {
          minMs: 240_000,
          chance: 0.65,
        })
      ) {
        const entry = careJournalEntry(state, now, 'bathe', {
          timeBucket: payload?.timeBucket || payload?.timeOfDay,
        });
        if (entry) pushJournalEntry(state, entry);
      }
      const date = getIsoDate(now);
      updateStreak(state.streak, date);
      maybeUnlockStreakRewards(state, now);
      recordCareDay(state, now);
      updateTemperamentReveal(state, now);
      finalizeDerivedState(state, now);
      sanitizeDogState(state);
    },

    increasePottyLevel(state, { payload }) {
      const effects = getCleanlinessEffect(state);
      const multiplier = effects.pottyGainMultiplier || 1;
      const trainingMultiplier = getPottyTrainingMultiplier(state);
      const inc = (payload?.amount ?? 10) * multiplier * trainingMultiplier;
      state.pottyLevel = clamp(state.pottyLevel + inc, 0, 100);
      sanitizeDogState(state);
    },

    goPotty(state, { payload }) {
      const now = payload?.now ?? nowMs();
      if (shouldIgnoreRapidRepeat(state, 'potty', now)) return;
      state.isAsleep = false;
      state.pottyLevel = 0;
      state.poopCount += 1;
      state.stats.happiness = clamp(state.stats.happiness + 3, 0, 100);
      state.memory.lastPottyAt = now;
      state.memory.lastSeenAt = now;

      state.lastAction = 'potty';

      updateBond(state, 1, now);
      applyXp(state, 2, { now, reason: 'POTTY' });
      maybeSampleMood(state, now, 'POTTY');

      if (
        shouldAutoJournal(state, 'care:potty', now, {
          minMs: 180_000,
          chance: 0.7,
        })
      ) {
        const entry = careJournalEntry(state, now, 'potty', {
          timeBucket: payload?.timeBucket || payload?.timeOfDay,
        });
        if (entry) pushJournalEntry(state, entry);
      }
      recordPuppyPottySuccess(state, now);
      const date = getIsoDate(now);
      updateStreak(state.streak, date);
      maybeUnlockStreakRewards(state, now);
      recordCareDay(state, now);
      updateTemperamentReveal(state, now);
      finalizeDerivedState(state, now);
      sanitizeDogState(state);
    },

    scoopPoop(state, { payload }) {
      const now = payload?.now ?? nowMs();
      if (shouldIgnoreRapidRepeat(state, 'scoop', now)) return;
      if (state.poopCount > 0) {
        state.poopCount -= 1;
        state.stats.cleanliness = clamp(state.stats.cleanliness + 10, 0, 100);
        state.stats.happiness = clamp(state.stats.happiness + 2, 0, 100);
        applyXp(state, 2, { now, reason: 'SCOOP' });
        maybeSampleMood(state, now, 'SCOOP');

        if (
          shouldAutoJournal(state, 'care:scoop', now, {
            minMs: 240_000,
            chance: 0.7,
          })
        ) {
          const entry = careJournalEntry(state, now, 'scoop', {
            timeBucket: payload?.timeBucket || payload?.timeOfDay,
          });
          if (entry) pushJournalEntry(state, entry);
        }
      }
      state.memory.lastSeenAt = now;

      state.lastAction = 'scoop';

      finalizeDerivedState(state, now);
      sanitizeDogState(state);
    },

    /* ------------- time / login ------------- */

    tickDog(state, { payload }) {
      const now = payload?.now ?? nowMs();
      // Capture elapsed hours before applyDecay mutates lastUpdatedAt.
      const prevUpdatedAt = state.lastUpdatedAt;
      const elapsedHours = prevUpdatedAt
        ? clamp((now - prevUpdatedAt) / (1000 * 60 * 60), 0, MAX_CATCHUP_HOURS)
        : 0;
      applyDecay(state, now);

      if (!state.meta || typeof state.meta !== 'object') {
        state.meta = {
          lastTickAt: null,
          lastSessionStartAt: null,
          actionLastAt: {},
        };
      }
      state.meta.lastTickAt = now;

      // Optional per-tick environmental effects (kept small + predictable).
      // NOTE: This must live in reducers (not in components) to keep Redux state safe.
      const weather = String(payload?.weather || '').toLowerCase();
      const weatherHours = Math.min(elapsedHours, 2.5);
      if (weather === 'rain') {
        state.stats.cleanliness = clamp(
          state.stats.cleanliness - 1.0 * weatherHours,
          0,
          100
        );
      } else if (weather === 'snow') {
        state.stats.energy = clamp(
          state.stats.energy - 1.4 * weatherHours,
          0,
          100
        );
      }

      // Automatic sleep:
      // - Fall asleep when energy is very low.
      // - Regain some energy while asleep.
      // - Wake naturally once recovered.
      const energyNow = clampStat(state.stats.energy);

      // Time-of-day schedule: nights are sleepier (but don't interrupt active play).
      const bucket = String(
        payload?.timeBucket || getLocalTimeBucket(now)
      ).toLowerCase();
      const isNightBucket = bucket === 'night' || bucket === 'evening';

      const mem =
        state?.memory && typeof state.memory === 'object' ? state.memory : {};
      const lastActiveAt = Math.max(
        0,
        Number(mem.lastFedAt || 0),
        Number(mem.lastPlayedAt || 0),
        Number(mem.lastTrainedAt || 0),
        Number(mem.lastBathedAt || 0),
        Number(mem.lastPottyAt || 0),
        Number(mem.lastSeenAt || 0)
      );
      const inactiveMs = lastActiveAt
        ? Math.max(0, now - lastActiveAt)
        : Number.POSITIVE_INFINITY;

      // Hard threshold: always fall asleep if extremely low energy.
      if (!state.isAsleep && energyNow <= 15) {
        state.isAsleep = true;
      }

      // Soft threshold at night: if the player hasn't interacted recently, allow a nap sooner.
      if (
        !state.isAsleep &&
        isNightBucket &&
        inactiveMs >= 5 * 60 * 1000 &&
        energyNow <= 32
      ) {
        state.isAsleep = true;
      }

      if (state.isAsleep) {
        const sleepHours = Math.min(elapsedHours, 10);
        if (sleepHours > 0) {
          // Target: roughly 1 hour from empty -> full.
          // Note: applyDecay() runs first and reduces energy.
          // Current adult/puppy energy decay ~= DECAY_PER_HOUR.energy * DECAY_SPEED * stageMultiplier
          //                         ~= 5 * 0.65 * 1.0 = 3.25 per hour.
          // With restore=105: net ~= 105 - 3.25 = 101.75 per hour => ~1 hour from 0->100.
          const ENERGY_RESTORE_PER_HOUR = 105;
          state.stats.energy = clamp(
            state.stats.energy + ENERGY_RESTORE_PER_HOUR * sleepHours,
            0,
            100
          );
          state.stats.happiness = clamp(
            state.stats.happiness + 1.2 * sleepHours,
            0,
            100
          );
        }

        // Wake naturally once fully recharged.
        if (state.stats.energy >= 100) state.isAsleep = false;
      }

      const tier = finalizeDerivedState(state, now);

      // Provide elapsed time to applyCleanlinessPenalties without changing its signature.
      state.__elapsedHoursForPenalties = elapsedHours;
      applyCleanlinessPenalties(state, tier);
      delete state.__elapsedHoursForPenalties;

      maybeSampleMood(state, now, 'TICK');
      updateTemperamentReveal(state, now);
      evaluateTemperament(state, now);
      sanitizeDogState(state);
    },

    registerSessionStart(state, { payload }) {
      const now = payload?.now ?? nowMs();
      const prevUpdatedAt = state.lastUpdatedAt;
      const elapsedHours = prevUpdatedAt
        ? clamp((now - prevUpdatedAt) / (1000 * 60 * 60), 0, MAX_CATCHUP_HOURS)
        : 0;

      applyDecay(state, now);
      const tier = finalizeDerivedState(state, now);

      if (!state.meta || typeof state.meta !== 'object') {
        state.meta = {
          lastTickAt: null,
          lastSessionStartAt: null,
          actionLastAt: {},
        };
      }
      state.meta.lastSessionStartAt = now;

      state.__elapsedHoursForPenalties = elapsedHours;
      applyCleanlinessPenalties(state, tier);
      delete state.__elapsedHoursForPenalties;

      maybeSampleMood(state, now, 'SESSION_START');
      state.memory.lastSeenAt = now;

      state.lastAction = 'session_start';

      const date = getIsoDate(now);
      updateStreak(state.streak, date);
      recordCareDay(state, now);

      // Gentle night schedule on session start (so it feels consistent on refresh).
      const bucket = String(
        payload?.timeBucket || getLocalTimeBucket(now)
      ).toLowerCase();
      const isNightBucket = bucket === 'night' || bucket === 'evening';
      const energyNow = clampStat(state.stats.energy);
      if (!state.isAsleep && isNightBucket && energyNow <= 32) {
        state.isAsleep = true;
      }

      updateTemperamentReveal(state, now);
      evaluateTemperament(state, now);
      applyAdultTrainingMissPenalty(state, now);
      sanitizeDogState(state);
    },

    tickDogPolls(state, { payload }) {
      const now = payload?.now ?? nowMs();
      const pollState = ensurePollState(state);
      if (pollState.active) {
        if (pollState.active.expiresAt && now >= pollState.active.expiresAt) {
          resolveActivePoll(state, {
            accepted: false,
            reason: 'TIMEOUT',
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
      const reason = payload?.reason || (accepted ? 'ACCEPT' : 'DECLINE');
      resolveActivePoll(state, { accepted, reason, now });
      sanitizeDogState(state);
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
      if (shouldIgnoreRapidRepeat(state, `train:${commandId}`, now)) return;
      applyDecay(state, now);

      state.isAsleep = false;

      const cooldown = cooldownScale(
        state.memory.lastTrainedAt,
        now,
        ACTION_COOLDOWN_MS + 2500
      );

      const trainingMultiplier = safeNumber(
        state.career.perks?.trainingXpMultiplier,
        1.0
      );
      const adjustedXp = Math.round(
        safeNumber(xp, 6) * trainingMultiplier * cooldown
      );

      applySkillXp('obedience', commandId, state.skills, adjustedXp);
      state.memory.lastTrainedAt = now;
      state.memory.lastSeenAt = now;

      state.lastAction = 'train';

      state.stats.happiness = clamp(state.stats.happiness + 8, 0, 100);
      state.stats.energy = clamp(state.stats.energy - 5, 0, 100);

      if (state.stats.energy <= 15) state.isAsleep = true;

      updateBond(state, 2, now);
      applyXp(state, Math.round(10 * cooldown), { now, reason: 'TRAINING' });
      completeAdultTrainingSession(state, now);
      maybeSampleMood(state, now, 'TRAINING');

      pushJournalEntry(
        state,
        trainingJournalEntry(state, now, commandId, {
          timeBucket: payload?.timeBucket || payload?.timeOfDay,
        })
      );

      const date = getIsoDate(now);
      updateStreak(state.streak, date);
      maybeUnlockStreakRewards(state, now);
      recordCareDay(state, now);
      updateTemperamentReveal(state, now);
      finalizeDerivedState(state, now);
      sanitizeDogState(state);
    },

    addJournalEntry(state, { payload }) {
      pushJournalEntry(state, payload || {});
    },

    startRainbowBridge(state, { payload }) {
      const now = payload?.now ?? nowMs();
      if (!state.memorial || typeof state.memorial !== 'object') {
        state.memorial = { ...initialMemorial };
      }
      if (state.memorial.completedAt) return;
      state.memorial.active = true;
      state.memorial.startedAt = state.memorial.startedAt || now;
      state.memorial.completedAt = null;
    },

    completeRainbowBridge(state, { payload }) {
      const now = payload?.now ?? nowMs();
      if (!state.memorial || typeof state.memorial !== 'object') {
        state.memorial = { ...initialMemorial };
      }
      state.memorial.active = false;
      state.memorial.completedAt = now;
      pushJournalEntry(state, {
        type: 'MEMORY',
        moodTag: 'LOVE',
        summary: 'A quiet goodbye on the Rainbow Bridge.',
        body:
          'We shared a soft, final moment together. The bond we built will always stay with me.',
        timestamp: now,
      });
    },

    /* ------------- dev/debug helpers ------------- */

    debugSetEnergy(state, { payload }) {
      const now = payload?.now ?? nowMs();
      const next = Number(payload?.energy ?? payload);
      if (!Number.isFinite(next)) return;

      state.stats.energy = clamp(next, 0, 100);
      state.memory.lastSeenAt = now;
      state.lastAction = 'debug_energy';

      finalizeDerivedState(state, now);
      sanitizeDogState(state);
    },

    debugSetAsleep(state, { payload }) {
      const now = payload?.now ?? nowMs();
      const next = Boolean(payload?.isAsleep ?? payload);
      state.isAsleep = next;
      state.memory.lastSeenAt = now;
      state.lastAction = next ? 'debug_sleep' : 'debug_wake';

      finalizeDerivedState(state, now);
      sanitizeDogState(state);
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
export const selectDogCosmetics = (state) => state.dog.cosmetics;
export const selectDogBond = (state) => state.dog.bond;
export const selectDogMemorial = (state) => state.dog.memorial;
export const selectDogLastUnlock = (state) =>
  state.dog.progress?.lastUnlock || null;

export const selectCosmeticCatalog = () => STREAK_REWARDS;

// Memoized selector: avoids creating new {streakDays,next} objects each render.
export const selectNextStreakReward = createSelector(
  [
    (state) => state?.dog?.streak?.currentStreakDays,
    (state) => state?.dog?.cosmetics?.unlockedIds,
  ],
  (streakDaysRaw, unlockedIdsRaw) => {
    const streakDays = Math.max(0, Math.floor(safeNumber(streakDaysRaw, 0)));
    const unlocked = new Set(
      Array.isArray(unlockedIdsRaw) ? unlockedIdsRaw : []
    );

    const upcoming = STREAK_REWARDS.filter((r) => r && typeof r === 'object')
      .filter((r) => !unlocked.has(r.id))
      .sort((a, b) => a.threshold - b.threshold);
    const next =
      upcoming.find((r) => r.threshold > streakDays) || upcoming[0] || null;

    return {
      streakDays,
      next,
    };
  }
);

/* ----------------------- actions ----------------------- */

export const {
  hydrateDog,
  setDogName,
  setOnboardingStep,
  grantOnboardingReward,
  setTemperamentPreset,
  setAdoptedAt,
  setCareerLifestyle,
  markTemperamentRevealed,
  updateFavoriteToy,
  equipCosmetic,
  purchaseCosmetic,
  feed,
  play,
  pet,
  praise,
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
  startRainbowBridge,
  completeRainbowBridge,
  debugSetEnergy,
  debugSetAsleep,
  toggleDebug,
  resetDogState,
} = dogSlice.actions;

export default dogSlice.reducer;
