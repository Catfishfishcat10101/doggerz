// src/redux/dogSlice.js
import { createSlice } from "@reduxjs/toolkit";

/* ---------- utils ---------- */
const clamp = (v, min = 0, max = 100) => Math.max(min, Math.min(max, v));

/* ---------- state ---------- */
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

  // Cosmetics / unlocks
  accessories: {
    owned: [],           // ["collar-red", ...]
    equipped: null       // one equipped id or null
  },

  // Unified unlock registry (extensible)
  unlocks: {
    accessories: [],     // mirror of accessories.owned (for compatibility)
    skins: [],           // yard/background skins the user has unlocked
  },

  // Current yard/background skin
  backyardSkin: "default", // "default" | "lawn" | "sunset" | etc.
};

/* ---------- helpers ---------- */
function applyXP(state, amount = 0) {
  state.xp = Math.max(0, state.xp + Number(amount || 0));
  while (state.xp >= 100) {
    state.xp -= 100;
    state.level += 1;
  }
}

/* ---------- slice ---------- */
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
    tickNeeds(state, { payload }) {
      const dt = Math.max(0, Number(payload?.dt ?? 1));
      state.energy       = clamp(state.energy - 0.5 * dt);
      state.cleanliness  = clamp(state.cleanliness - 0.2 * dt);
      state.hunger       = clamp(state.hunger + 0.6 * dt); // higher = hungrier
      const happyDelta = ((100 - state.hunger) * 0.003 + state.cleanliness * 0.002) - 0.15;
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

    // Accessories (unlocks + equip)
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

    // Skins / backgrounds
    unlockSkin(state, { payload }) {
      const id = String(payload || "").trim();
      if (!id) return;
      if (!state.unlocks.skins.includes(id)) state.unlocks.skins.push(id);
    },
    setBackyardSkin(state, { payload }) {
      const skin = String(payload || "").trim() || "default";
      state.backyardSkin = skin;
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
  unlockSkin,
  setBackyardSkin,
} = dogSlice.actions;

export default dogSlice.reducer;

/* ---------- selectors (incl. the ones your code imports) ---------- */
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

/** NEW: used by Accessories.jsx */
export const selectUnlocks       = (s) => s.dog?.unlocks ?? { accessories: [], skins: [] };

/** NEW: used by GameScreen.jsx */
export const selectBackyardSkin  = (s) => s.dog?.backyardSkin ?? "default";
