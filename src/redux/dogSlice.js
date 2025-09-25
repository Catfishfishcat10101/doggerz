// src/redux/dogSlice.js
import { createSlice } from "@reduxjs/toolkit";

/* ---------------------------- progression knobs ---------------------------- */
/**
 * Time & growth are “productized” so you can tune without refactors.
 * TIME_MULTIPLIER: 1 = real-time; 0.25 = 4x slower than real (default, LONG).
 */
const TIME_MULTIPLIER = Number(import.meta.env.VITE_DOG_TIME_MULTIPLIER ?? 0.25);
const MS_PER_DAY = 86_400_000; // 24h

// Stage thresholds measured in in-game days
const STAGES = {
  PUPPY_MAX: 90,            // ~3 months
  ADULT_MAX: 8 * 365,       // ~8 years
  // 8y+ => senior
};

// Needs/interaction economics
const TUNING = {
  HUNGER_DECAY_PER_HR: 2.2,     // higher -> hungrier faster
  ENERGY_DECAY_PER_HR: 2.8,
  CLEAN_DECAY_PER_HR: 1.0,
  HAPPINESS_PASSIVE_PER_HR: -0.4,

  FEED_HUNGER_GAIN: 35,         // lowers hunger meter (remember: 0 = full)
  REST_ENERGY_GAIN: 35,
  BATH_CLEAN_GAIN: 45,
  PET_HAPPY_GAIN: 8,

  TRAIN_ENERGY_COST: 10,
  TRAIN_SUCCESS_BASE: 0.6,      // success prob baseline (modded by happiness)
  BARK_COOLDOWN_MS: 900,
};

const clamp = (v, min = 0, max = 100) => Math.max(min, Math.min(max, v));
const lerp = (a, b, t) => a + (b - a) * t;

function computeStage(ageDays) {
  if (ageDays < STAGES.PUPPY_MAX) return "puppy";
  if (ageDays < STAGES.ADULT_MAX) return "adult";
  return "senior";
}

/* --------------------------------- state ---------------------------------- */
const initialState = {
  name: null,

  /* Movement / pose */
  pos: { x: 0, y: 0 },
  direction: "down", // "up" | "down" | "left" | "right"
  moving: false,

  /* Needs (0..100; higher is better except hunger where 0 = full) */
  happiness: 60,
  energy: 80,
  cleanliness: 80,
  hunger: 20, // 0 = full, 100 = very hungry

  /* Progression */
  xp: 0,
  level: 1,

  /* Lifecycle (new) */
  birthAt: Date.now(),          // real-world timestamp
  lastTickAt: Date.now(),       // for delta computation
  ageDays: 0,                   // derived by tickRealTime (in-game days)
  stage: "puppy",               // "puppy" | "adult" | "senior"

  /* Barking (new) */
  lastBarkAt: 0,
  barkCooldownMs: TUNING.BARK_COOLDOWN_MS,
  mute: false,                  // UI can wire this into Howler/HTMLAudio

  /* Skills (new): each skill has level & xp */
  skills: {
    sit:   { level: 0, xp: 0 },
    stay:  { level: 0, xp: 0 },
    fetch: { level: 0, xp: 0 },
    roll:  { level: 0, xp: 0 },
    speak: { level: 0, xp: 0 },
  },

  /* Economy */
  coins: 0,

  /* Cosmetics / unlocks */
  accessories: {
    owned: [],          // ["collar-red", ...]
    equipped: null,     // id or null
  },
  unlocks: {
    accessories: [],
    skins: [],
  },

  /* Current yard/background skin */
  backyardSkin: "default",
};

/* ------------------------------- helpers ---------------------------------- */
function applyXP(state, amount = 0) {
  state.xp = Math.max(0, state.xp + Number(amount || 0));
  while (state.xp >= 100) {
    state.xp -= 100;
    state.level += 1;
  }
}

function skillThreshold(level) {
  // 0→1:25, 1→2:50, 2→3:100, 3→4:160, ...
  return (level + 1) * 25 * (level + 1) * 0.8;
}

/* --------------------------------- slice ---------------------------------- */
const dogSlice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    /* --------- Identity --------- */
    setName(state, { payload }) {
      const name = typeof payload === "string" ? payload : payload?.name;
      state.name = (name || "").trim() || null;
    },

    /* --------- Positioning / movement --------- */
    setPosition(state, { payload }) {
      const { x = state.pos.x, y = state.pos.y } = payload || {};
      state.pos.x = Math.round(Number(x));
      state.pos.y = Math.round(Number(y));
    },
    setDirection(state, { payload }) {
      const dir = String(payload || "").toLowerCase();
      if (["up", "down", "left", "right"].includes(dir)) state.direction = dir;
    },
    setMoving(state, { payload }) {
      state.moving = Boolean(payload);
    },

    /* --------- Needs (legacy-compatible) --------- */
    setHappiness(state, { payload }) { state.happiness = clamp(Number(payload)); },
    changeHappiness(state, { payload }) { state.happiness = clamp(state.happiness + Number(payload || 0)); },
    setEnergy(state, { payload }) { state.energy = clamp(Number(payload)); },
    setCleanliness(state, { payload }) { state.cleanliness = clamp(Number(payload)); },
    setHunger(state, { payload }) { state.hunger = clamp(Number(payload)); },

    /**
     * Legacy needs tick (kept for backward compatibility). Consider using
     * `tickRealTime()` instead, which also handles age/stage.
     */
    tickNeeds(state, { payload }) {
      const dt = Math.max(0, Number(payload?.dt ?? 1)); // arbitrary units
      state.energy      = clamp(state.energy - 0.5 * dt);
      state.cleanliness = clamp(state.cleanliness - 0.2 * dt);
      state.hunger      = clamp(state.hunger + 0.6 * dt); // higher = hungrier
      const happyDelta = ((100 - state.hunger) * 0.003 + state.cleanliness * 0.002) - 0.15;
      state.happiness = clamp(state.happiness + happyDelta * dt);
    },

    /* --------- Real-time game loop (NEW) --------- */
    tickRealTime(state, { payload }) {
      const now = typeof payload === "number" ? payload : Date.now();
      let realDelta = now - state.lastTickAt;
      if (realDelta < 0) realDelta = 0;
      state.lastTickAt = now;

      // Convert to in-game days using the (slow) multiplier
      const ingameDaysDelta = (realDelta / MS_PER_DAY) * TIME_MULTIPLIER;
      state.ageDays += ingameDaysDelta;

      // Stage update
      state.stage = computeStage(state.ageDays);

      // Stage-weighted needs decay (seniors tire faster; puppies get hungrier)
      const hours = (realDelta / 3_600_000) * TIME_MULTIPLIER;
      const stageMod = state.stage === "puppy" ? 1.15 : state.stage === "senior" ? 1.25 : 1.0;

      state.hunger      = clamp(state.hunger + TUNING.HUNGER_DECAY_PER_HR * stageMod * hours);
      state.energy      = clamp(state.energy - TUNING.ENERGY_DECAY_PER_HR * stageMod * hours);
      state.cleanliness = clamp(state.cleanliness - TUNING.CLEAN_DECAY_PER_HR * hours);

      // Passive happiness drifts based on other needs
      const mood = lerp((100 - state.hunger), state.cleanliness, 0.35); // composite
      state.happiness = clamp(state.happiness + (mood / 200 + TUNING.HAPPINESS_PASSIVE_PER_HR) * hours);

      // Small passive XP drip (keeps long-term engagement moving)
      if (Math.random() < 0.04 * hours) applyXP(state, 1);
    },

    /* --------- Interactions --------- */
    feed(state, { payload }) {
      const amt = Number(payload ?? TUNING.FEED_HUNGER_GAIN);
      state.hunger = clamp(state.hunger - Math.abs(amt));
      state.happiness = clamp(state.happiness + 2);
    },
    rest(state, { payload }) {
      const amt = Number(payload ?? TUNING.REST_ENERGY_GAIN);
      state.energy = clamp(state.energy + Math.abs(amt));
    },
    bathe(state, { payload }) {
      const amt = Number(payload ?? TUNING.BATH_CLEAN_GAIN);
      state.cleanliness = clamp(state.cleanliness + Math.abs(amt));
      state.happiness = clamp(state.happiness + 1);
    },
    pet(state, { payload }) {
      const amt = Number(payload ?? TUNING.PET_HAPPY_GAIN);
      state.happiness = clamp(state.happiness + Math.abs(amt));
    },

    /* --------- Bark gating (NEW) --------- */
    bark(state, { payload }) {
      const now = typeof payload === "number" ? payload : Date.now();
      if (now - state.lastBarkAt < state.barkCooldownMs) return; // ignore spam
      state.lastBarkAt = now;
      state.happiness = clamp(state.happiness + 1);
      state.energy = clamp(state.energy - 1);
      // caller can watch pose/UI; slice keeps state minimal to avoid tight coupling
    },
    setMute(state, { payload }) { state.mute = Boolean(payload); },

    /* --------- Training (NEW) --------- */
    trainSkill(state, { payload }) {
      const key = typeof payload === "string" ? payload : payload?.key;
      if (!key || !state.skills[key]) return;

      if (state.energy < TUNING.TRAIN_ENERGY_COST) return; // too tired
      state.energy = clamp(state.energy - TUNING.TRAIN_ENERGY_COST);

      // Success probability modulated by happiness (happier learns better)
      const p = TUNING.TRAIN_SUCCESS_BASE + (state.happiness - 50) / 200;
      const success = Math.random() < clamp(p, 0.1, 0.95);

      // XP gain; scale by stage (puppies learn a hair faster, seniors slower)
      const stageMod = state.stage === "puppy" ? 1.15 : state.stage === "senior" ? 0.85 : 1.0;
      const gain = success ? Math.round(6 * stageMod) : Math.round(2 * stageMod);

      const node = state.skills[key];
      node.xp += gain;
      const threshold = skillThreshold(node.level);
      if (node.xp >= threshold) {
        node.xp -= threshold;
        node.level += 1;
        applyXP(state, 10);           // global level drip
        state.happiness = clamp(state.happiness + 4);
        state.coins = Math.max(0, state.coins + 5); // tiny reward
      }
    },

    /* --------- Global XP / Coins (existing) --------- */
    addXP(state, { payload }) { applyXP(state, Number(payload || 0)); },
    earnCoins(state, { payload }) {
      state.coins = Math.max(0, state.coins + Math.max(0, Number(payload || 0)));
    },
    spendCoins(state, { payload }) {
      const amt = Math.max(0, Number(payload || 0));
      if (state.coins >= amt) state.coins -= amt;
    },

    /* --------- Accessories / skins (existing) --------- */
    unlockAccessory(state, { payload }) {
      const id = String(payload || "").trim();
      if (!id) return;
      if (!state.accessories.owned.includes(id)) state.accessories.owned.push(id);
      if (!state.unlocks.accessories.includes(id)) state.unlocks.accessories.push(id);
    },
    equipAccessory(state, { payload }) {
      const id = payload == null ? null : String(payload || "").trim();
      if (id === null) { state.accessories.equipped = null; return; }
      if (state.accessories.owned.includes(id)) state.accessories.equipped = id;
    },
    unlockSkin(state, { payload }) {
      const id = String(payload || "").trim();
      if (!id) return;
      if (!state.unlocks.skins.includes(id)) state.unlocks.skins.push(id);
    },
    setBackyardSkin(state, { payload }) {
      const skin = String(payload || "").trim() || "default";
      state.backyardSkin = skin;
    },

    /* --------- Persistence helpers (optional) --------- */
    hydrateFromSave(state, { payload }) {
      // Shallow merge with guardrails; ignores unknown keys
      const allowed = new Set(Object.keys(initialState));
      for (const k of Object.keys(payload || {})) {
        if (allowed.has(k)) state[k] = payload[k];
      }
      // sanity
      state.stage = computeStage(state.ageDays ?? 0);
      state.lastTickAt = Date.now();
    },
    hardReset() { return { ...initialState, birthAt: Date.now(), lastTickAt: Date.now() }; },
  },
});

export const {
  // identity
  setName,
  // movement
  setPosition, setDirection, setMoving,
  // needs
  setHappiness, changeHappiness, setEnergy, setCleanliness, setHunger, tickNeeds,
  // realtime loop
  tickRealTime,
  // interactions
  feed, rest, bathe, pet,
  // bark + mute
  bark, setMute,
  // training
  trainSkill,
  // xp/coins
  addXP, earnCoins, spendCoins,
  // cosmetics/skins
  unlockAccessory, equipAccessory, unlockSkin, setBackyardSkin,
  // persistence
  hydrateFromSave, hardReset,
} = dogSlice.actions;

export default dogSlice.reducer;

/* ------------------------------- selectors -------------------------------- */
export const selectDog           = (s) => s.dog;
export const selectName          = (s) => s.dog?.name ?? "Your Pup";
export const selectPos           = (s) => s.dog?.pos ?? { x: 0, y: 0 };
export const selectDirection     = (s) => s.dog?.direction ?? "down";
export const selectMoving        = (s) => !!s.dog?.moving;

export const selectHappiness     = (s) => s.dog?.happiness ?? 50;
export const selectEnergy        = (s) => s.dog?.energy ?? 50;
export const selectCleanliness   = (s) => s.dog?.cleanliness ?? 50;
export const selectHunger        = (s) => s.dog?.hunger ?? 50;

export const selectXP            = (s) => s.dog?.xp ?? 0;
export const selectDogLevel      = (s) => s.dog?.level ?? 1;

export const selectCoins         = (s) => s.dog?.coins ?? 0;

export const selectAccessories   = (s) => s.dog?.accessories ?? { owned: [], equipped: null };
export const selectUnlocks       = (s) => s.dog?.unlocks ?? { accessories: [], skins: [] };
export const selectBackyardSkin  = (s) => s.dog?.backyardSkin ?? "default";

/* NEW selectors */
export const selectAgeDays       = (s) => s.dog?.ageDays ?? 0;
export const selectStage         = (s) => s.dog?.stage ?? "puppy";
export const selectSkills        = (s) => s.dog?.skills ?? {};
export const selectMute          = (s) => !!s.dog?.mute;
export const selectBarkReady     = (s) => {
  const d = s.dog;
  return !d || (Date.now() - (d.lastBarkAt ?? 0)) >= (d.barkCooldownMs ?? TUNING.BARK_COOLDOWN_MS);
};
