// src/redux/dogSlice.js
import { createSlice } from "@reduxjs/toolkit";

/** Helpers */
const clamp = (v, min = 0, max = 100) => Math.max(min, Math.min(max, v));

const initialState = {
  name: null,

  // Movement / pose
  pos: { x: 0, y: 0 },
  direction: "down",     // "up" | "down" | "left" | "right"
  moving: false,

  // Needs (0..100; higher is better except hunger where 0 = full)
  happiness: 60,
  energy: 80,
  cleanliness: 80,
  hunger: 20,            // 0 = full, 100 = very hungry

  // Progression
  xp: 0,
  level: 1,

  // Economy
  coins: 0,

  // Cosmetics
  accessories: {
    owned: [],           // ["collar-red", ...]
    equipped: null       // one equipped id or null
  }
};

/** Simple level curve: 100 XP per level */
function applyXP(state, amount = 0) {
  state.xp = Math.max(0, state.xp + Number(amount || 0));
  while (state.xp >= 100) {
    state.xp -= 100;
    state.level += 1;
  }
}

const dogSlice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    // Identity
    setName(state, { payload }) {
      const name = typeof payload === "string" ? payload : payload?.name;
      state.name = (name || "").trim() || null;
    },

    // Positioning / movement
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

    // Needs
    setHappiness(state, { payload }) {
      state.happiness = clamp(Number(payload));
    },
    changeHappiness(state, { payload }) {
      state.happiness = clamp(state.happiness + Number(payload || 0));
    },

    setEnergy(state, { payload }) {
      state.energy = clamp(Number(payload));
    },
    setCleanliness(state, { payload }) {
      state.cleanliness = clamp(Number(payload));
    },
    setHunger(state, { payload }) {
      state.hunger = clamp(Number(payload));
    },

    /** Game loop “tick” – advance needs by dt seconds (or arbitrary unit) */
    tickNeeds(state, { payload }) {
      const dt = Math.max(0, Number(payload?.dt ?? 1));
      // Tunables: feel free to tweak
      state.energy       = clamp(state.energy - 0.5 * dt);
      state.cleanliness  = clamp(state.cleanliness - 0.2 * dt);
      state.hunger       = clamp(state.hunger + 0.6 * dt);    // higher = hungrier
      // Happiness trends a bit with satiation and cleanliness
      const happyDelta = ( (100 - state.hunger) * 0.003 + state.cleanliness * 0.002 ) - 0.15;
      state.happiness = clamp(state.happiness + happyDelta * dt);
    },

    // XP / Level
    addXP(state, { payload }) {
      applyXP(state, Number(payload || 0));
    },

    // Economy
    earnCoins(state, { payload }) {
      state.coins = Math.max(0, state.coins + Math.max(0, Number(payload || 0)));
    },
    spendCoins(state, { payload }) {
      const amt = Math.max(0, Number(payload || 0));
      if (state.coins >= amt) state.coins -= amt;
    },

    // Accessories
    unlockAccessory(state, { payload }) {
      const id = String(payload || "").trim();
      if (!id) return;
      if (!state.accessories.owned.includes(id)) state.accessories.owned.push(id);
    },
    equipAccessory(state, { payload }) {
      const id = payload == null ? null : String(payload || "").trim();
      if (id === null) { state.accessories.equipped = null; return; }
      if (state.accessories.owned.includes(id)) state.accessories.equipped = id;
    },
  },
});

export const {
  setName,
  setPosition,
  setDirection,
  setMoving,
  setHappiness,
  changeHappiness,
  setEnergy,
  setCleanliness,
  setHunger,
  tickNeeds,
  addXP,
  earnCoins,
  spendCoins,
  unlockAccessory,
  equipAccessory,
} = dogSlice.actions;

export default dogSlice.reducer;

/* -------------------- Selectors -------------------- */
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
