/** ===========================
 * src/redux/dogSlice.js
 * =========================== */
 import { createSlice } from "@reduxjs/toolkit";
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const clamp01 = (v) => clamp(v, 0, 100);
const nowMs = () => Date.now();

function xpThresholdFor(level) {
  return Math.round(100 + Math.pow(level - 1, 1.25) * 40);
}

function applyDecay(state, dtSec) {
  const hr = dtSec / 3600;

  // Stage multipliers (puppy burns more, senior slows)
  const stageMul =
    state.stage === "puppy" ? 1.25 :
    state.stage === "senior" ? 0.60 : 0.85;

  // Base decay per hour
  const DECAY = { hunger: 3, energy: 2, cleanliness: 1, happiness: 2 };

  state.hunger      = clamp01(state.hunger      - DECAY.hunger * stageMul * hr);
  state.energy      = clamp01(state.energy      - DECAY.energy * stageMul * hr);
  state.cleanliness = clamp01(state.cleanliness - DECAY.cleanliness * hr);
  state.happiness   = clamp01(state.happiness   -DECAY.happiness * hr);

  // Happiness bleeds slowly + penalties for low hygiene/hunger
  const hapBase = DECAY.happiness * hr;
  const hungerPenalty = (90 - state.hunger) * 0.015 * hr;
  const dirtyPenalty  = (90 - state.cleanliness) * 0.012 * hr;
  state.happiness = clamp01(state.happiness - (hapBase + hungerPenalty + dirtyPenalty));

  // Bladder fill (0–100); goes faster if hydrated (future) or high hunger
  const bladderRatePerHr = 15; // fills in ~4–5h baseline
  state.bladder = clamp01(state.bladder + bladderRatePerHr * hr);
  if (!state.needToGo && state.bladder >= 95) {
    state.needToGo = true;
    state.needToGoSince = state.needToGoSince || nowMs();
  }

  // Passive drift up of training if high happiness & cleanliness (good environment)
  if (state.happiness > 90 && state.cleanliness > 90) {
    state.training = clamp01(state.training + 0.5 * hr); 
  }
}

function gainXP(state, amount) {
  state.xp = Math.max(0, state.xp + Math.round(amount));
  // Level-up loop in case of large awards
  while (state.xp >= state.xpToNext) {
    state.xp -= state.xpToNext;
    state.lvl += 1;
    state.xpToNext = xpThresholdFor(state.lvl);
    // small full-heal nudge on level-up
    state.happiness = clamp01(state.happiness + 2);
    state.energy    = clamp01(state.energy + 2);
  }
}

/** ===========================
 * Initial State
 * =========================== */
const initialState = {
  id: null,
  name: null,

  // World/render state
  pos: { x: 80, y: 260 },
  direction: "right",

  moving: true,

  // Audio
  mute: false,

  // Lifecycle
  stage: 'puppy',
  bornAt: nowMs(),

  // Core needs (0..100)
  hunger: 100,
  energy: 100,
  cleanliness: 100,
  happiness: 100,

  // Potty
  bladder: 50,          // 0..100
  needToGo: false,
  needToGoSince: 0,     // ms since flag set
  lastPoopAt: 0,
  accidents: 0,

  // Skills / training
  pottyTraining: 35,    // 0..100 — higher => fewer accidents
  training: 30,         // general obedience 0..100

  // Leveling
  lvl: 1,
  xp: 0,
  xpToNext: xpThresholdFor(1),

  // Events
  lastBarkAt: 0,
  lastPetAt: 0,

  // Tick clock
  lastNow: nowMs(),
};

/** ===========================
 * Slice
 * =========================== */
const dogSlice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    // --- identity/UX ---
    dogHydrated(state, { payload }) {
      const { lastNow, ...rest } = payload || {};
      Object.assign(state, rest);
      // Safety: recompute xpToNext if lvl differs
      state.xpToNext = xpThresholdFor(state.lvl || 1);
      if (!state.bornAt) state.bornAt = nowMs();
    },
    dogNamed(state, { payload }) {
      state.name = String(payload || "").slice(0, 24);
    },
    toggleMute(state, { payload }) {
      state.mute = typeof payload === "boolean" ? payload : !state.mute;
    },
    setStage(state, { payload }) {
      const v = String(payload || "adult");
      state.stage = v === "puppy" || v === "senior" ? v : "adult";
    },

    // --- render/motion ---
    setPosition(state, { payload }) {
      const { x, y } = payload || {};
      if (typeof x === "number") state.pos.x = clamp(x, 0, 9999);
      if (typeof y === "number") state.pos.y = clamp(y, 0, 9999);
    },
    setDirection(state, { payload }) {
      state.direction = payload === "left" ? "left" : "right";
    },
    setMoving(state, { payload }) {
      state.moving = !!payload;
    },

    // --- interactions ---
    feed(state, { payload = 18 }) {
      state.hunger = clamp01(state.hunger + payload);
      state.happiness = clamp01(state.happiness + 4);
      gainXP(state, 4);
    },
    rest(state, { payload = 20 }) {
      state.energy = clamp01(state.energy + payload);
      gainXP(state, 2);
    },
    pet(state, { payload = 6 }) {
      state.happiness = clamp01(state.happiness + payload);
      state.lastPetAt = nowMs();
      gainXP(state, 1);
    },
    bark(state) {
      state.lastBarkAt = nowMs();
    },
    train(state, { payload = 4 }) {
      // generic training session; scaled by happiness (engagement)
      const moodMul = 0.6 + (state.happiness / 100) * 0.6; // 0.6..1.2
      const delta = payload * moodMul;
      state.training = clamp01(state.training + delta);
      gainXP(state, Math.round(3 + delta / 2));
    },
    awardXP(state, { payload = 5 }) {
      gainXP(state, payload);
    },

    // --- potty system ---
    needToGoChanged(state, { payload }) {
      state.needToGo = !!payload;
      if (state.needToGo) state.needToGoSince = nowMs();
      else state.needToGoSince = 0;
    },

    takeOutside(state) {
      // Only meaningful if they actually need to go
      if (!state.needToGo) return;
      state.needToGo = false;
      state.needToGoSince = 0;
      state.bladder = 0;
      state.lastPoopAt = nowMs();

      // Potty training improves more if they held it longer
      const heldSec = state.lastPoopAt && state.needToGoSince
        ? Math.max(0, (state.lastPoopAt - state.needToGoSince) / 1000)
        : 0;

      const baseGain = 6;
      const bonus = clamp(heldSec / 60, 0, 6); // up to +6 for waiting ~6+ min
      const gain = baseGain + bonus;

      state.pottyTraining = clamp01(state.pottyTraining + gain);
      state.cleanliness = clamp01(state.cleanliness + 8);
      state.happiness   = clamp01(state.happiness + 6);

      gainXP(state, 10 + Math.round(gain / 2));
    },

    recordAccident(state) {
      state.accidents += 1;
      state.bladder = 0;
      state.needToGo = false;
      state.needToGoSince = 0;

      // Training setback scaled by current skill (harder to regress at high skill)
      const setback = clamp(8 - state.pottyTraining * 0.04, 2, 8); // 2..8
      state.pottyTraining = clamp01(state.pottyTraining - setback);

      state.cleanliness = clamp01(state.cleanliness - 15);
      state.happiness   = clamp01(state.happiness - 8);

      // Less XP than a success, but still some (experience!)
      gainXP(state, 3);
    },

    // --- time driver ---
    /** tickRealTime(now: number | {now:number}) — reducer computes dt internally and clamps runaway */
    tickRealTime(state, { payload }) {
      const input = typeof payload === "number" ? payload : payload?.now;
      const now = typeof input === "number" ? input : nowMs();
      const last = state.lastNow || now;
      let dtMs = now - last;
      dtMs = clamp(dtMs, 0, 30000); // cap 30s to avoid “sleep death”
      state.lastNow = now;
      if (dtMs > 0) applyDecay(state, dtMs / 1000);
    },
  },
});

/** ===========================
 * Exports
 * =========================== */
export const {
  dogHydrated, dogNamed, toggleMute, setStage,
  setPosition, setDirection, setMoving,
  feed, rest, pet, bark, train, awardXP,
  needToGoChanged, takeOutside, recordAccident,
  tickRealTime,
} = dogSlice.actions;

export default dogSlice.reducer;

/** ===========================
 * Selectors
 * =========================== */
export const selectDog   = (s) => s.dog;
export const selectStage = (s) => s.dog.stage;
export const selectMute  = (s) => s.dog.mute;

export const selectAgeMonths = (s) => {
  const ms = Math.max(0, nowMs() - (s.dog.bornAt || nowMs()));
  return Math.floor(ms / (1000 * 60 * 60 * 24 * 30.437)); // avg month length
};
export const selectAgeLabel = (s) => {
  const m = selectAgeMonths(s);
  if (m < 12) return `${m}m`;
  const years = Math.floor(m / 12);
  const remM  = m % 12;
  return remM ? `${years}y ${remM}m` : `${years}y`;
};
