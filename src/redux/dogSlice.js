// src/redux/dogSlice.js
import { createSlice } from "@reduxjs/toolkit";

const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, n));
const levelThreshold = (level) => 100 + (level - 1) * 50;

const initialState = {
  level: 1,
  xp: 0,
  coins: 0,
  happiness: 60,

  direction: "down", // 'up' | 'down' | 'left' | 'right'
  moving: false,
  pos: { x: 0, y: 0 },

  needs: { hunger: 50, energy: 50, hygiene: 50 },

  accessories: [],
  unlocks: [],
  backyardSkin: "default",
};

const slice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    // Economy
    earnCoins(state, action) {
      const amt = Number(action.payload) || 0;
      state.coins = Math.max(0, state.coins + amt);
    },
    spendCoins(state, action) {
      const amt = Number(action.payload) || 0;
      state.coins = Math.max(0, state.coins - amt);
    },

    // Progression
    addXP(state, action) {
      const amt = Number(action.payload) || 0;
      state.xp = Math.max(0, state.xp + amt);
      while (state.xp >= levelThreshold(state.level)) {
        state.xp -= levelThreshold(state.level);
        state.level += 1;
        state.happiness = clamp(state.happiness + 3);
      }
    },

    // Mood
    setHappiness(state, action) {
      state.happiness = clamp(Number(action.payload) || 0);
    },
    changeHappiness(state, action) {
      const delta = Number(action.payload) || 0;
      state.happiness = clamp(state.happiness + delta);
    },

    // Movement / World
    setDirection(state, action) {
      const dir = String(action.payload || "").toLowerCase();
      if (["up", "down", "left", "right"].includes(dir)) state.direction = dir;
    },
    setMoving(state, action) {
      state.moving = Boolean(action.payload);
    },
    setPosition(state, action) {
      const { x = state.pos.x, y = state.pos.y } = action.payload || {};
      state.pos = { x: Number(x) || 0, y: Number(y) || 0 };
    },

    // Needs tick
    tickNeeds(state, action) {
      const step = Number(action?.payload?.step) || 1;
      state.needs.hunger = clamp(state.needs.hunger - step);
      state.needs.energy  = clamp(state.needs.energy - step);
      state.needs.hygiene = clamp(state.needs.hygiene - step);

      const bad =
        (100 - state.needs.hunger) +
        (100 - state.needs.energy) +
        (100 - state.needs.hygiene);
      const moodDelta = -Math.ceil(bad / 300);
      state.happiness = clamp(state.happiness + moodDelta);
    },

    // Cosmetics / Unlocks
    equipAccessory(state, action) {
      const id = String(action.payload || "");
      if (id && !state.accessories.includes(id)) state.accessories.push(id);
    },
    unlockAccessory(state, action) {
      const id = String(action.payload || "");
      if (id && !state.unlocks.includes(id)) state.unlocks.push(id);
    },
    setBackyardSkin(state, action) {
      state.backyardSkin = String(action.payload || "default");
    },
  },
});

/* -------- Explicit action exports (fixes “No matching export” issues) -------- */
export const earnCoins        = slice.actions.earnCoins;
export const spendCoins       = slice.actions.spendCoins;
export const addXP            = slice.actions.addXP;
export const setHappiness     = slice.actions.setHappiness;
export const changeHappiness  = slice.actions.changeHappiness;
export const setDirection     = slice.actions.setDirection;
export const setMoving        = slice.actions.setMoving;
export const setPosition      = slice.actions.setPosition;
export const tickNeeds        = slice.actions.tickNeeds;
export const equipAccessory   = slice.actions.equipAccessory;
export const unlockAccessory  = slice.actions.unlockAccessory;
export const setBackyardSkin  = slice.actions.setBackyardSkin;

/* ------------------------------- Selectors ---------------------------------- */
export const selectDog         = (state) => state.dog;
export const selectDogLevel    = (state) => state.dog.level;
export const selectDogNeeds    = (state) => state.dog.needs;

export const selectCoins       = (state) => state.dog.coins;
export const selectXP          = (state) => state.dog.xp;
export const selectHappiness   = (state) => state.dog.happiness;

export const selectAccessories = (state) => state.dog.accessories;
export const selectUnlocks     = (state) => state.dog.unlocks;

export const selectDirection   = (state) => state.dog.direction;
export const selectMoving      = (state) => state.dog.moving;
export const selectPos         = (state) => state.dog.pos;

export const selectBackyardSkin = (state) => state.dog.backyardSkin;

/* -------------------------------- Reducer ----------------------------------- */
export default slice.reducer;