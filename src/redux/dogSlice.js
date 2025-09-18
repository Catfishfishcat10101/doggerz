// src/redux/dogSlice.js
import { createSlice } from "@reduxjs/toolkit";

/**
 * Small helpers
 */
const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, n));
const levelThreshold = (level) => 100 + (level - 1) * 50; // simple curve

const initialState = {
  // core avatar state
  level: 1,
  xp: 0,

  // mood/economy
  coins: 0,
  happiness: 60,

  // movement & world
  direction: "down", // "up" | "down" | "left" | "right"
  moving: false,
  pos: { x: 0, y: 0 },

  // needs model (can be expanded later)
  needs: {
    hunger: 50,
    energy: 50,
    hygiene: 50,
  },

  // collection systems
  accessories: [], // e.g., ["red-collar", "cowboy-hat"]
  unlocks: [],     // e.g., ["shop", "toys"]
  backyardSkin: "default", // map/scene skin key
};

const dogSlice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    /** Economy */
    earnCoins(state, action) {
      const amount = Number(action.payload) || 0;
      state.coins = Math.max(0, state.coins + amount);
    },
    spendCoins(state, action) {
      const amount = Number(action.payload) || 0;
      state.coins = Math.max(0, state.coins - amount);
    },

    /** Progression */
    addXP(state, action) {
      const amount = Number(action.payload) || 0;
      state.xp = Math.max(0, state.xp + amount);

      // auto level-up loop if thresholds are crossed
      while (state.xp >= levelThreshold(state.level)) {
        state.xp -= levelThreshold(state.level);
        state.level += 1;
        // small happiness bump on level
        state.happiness = clamp(state.happiness + 3);
      }
    },

    /** Mood */
    setHappiness(state, action) {
      state.happiness = clamp(Number(action.payload) || 0);
    },
    changeHappiness(state, action) {
      const delta = Number(action.payload) || 0;
      state.happiness = clamp(state.happiness + delta);
    },

    /** World / movement */
    setDirection(state, action) {
      const dir = String(action.payload || "").toLowerCase();
      if (["up", "down", "left", "right"].includes(dir)) {
        state.direction = dir;
      }
    },
    setMoving(state, action) {
      state.moving = Boolean(action.payload);
    },
    setPosition(state, action) {
      const { x = state.pos.x, y = state.pos.y } = action.payload || {};
      state.pos = { x: Number(x) || 0, y: Number(y) || 0 };
    },

    /** Needs tick (called by a game loop / timer) */
    tickNeeds(state, action) {
      const step = Number(action?.payload?.step) || 1;
      state.needs.hunger = clamp(state.needs.hunger - step);
      state.needs.energy = clamp(state.needs.energy - step);
      state.needs.hygiene = clamp(state.needs.hygiene - step);

      // tie happiness lightly to needs
      const bad =
        (100 - state.needs.hunger) +
        (100 - state.needs.energy) +
        (100 - state.needs.hygiene);
      const moodDelta = -Math.ceil(bad / 300); // -1 when needs get low
      state.happiness = clamp(state.happiness + moodDelta);
    },

    /** Cosmetics / meta */
    equipAccessory(state, action) {
      const id = String(action.payload);
      if (!id) return;
      if (!state.accessories.includes(id)) {
        state.accessories.push(id);
      }
    },
    unlockAccessory(state, action) {
      const id = String(action.payload);
      if (!id) return;
      if (!state.unlocks.includes(id)) {
        state.unlocks.push(id);
      }
    },
    selectBackyardSkin(state, action) {
      const key = String(action.payload || "default");
      state.backyardSkin = key;
    },
  },
});

/** Actions */
export const {
  earnCoins,
  spendCoins,
  addXP,
  setHappiness,
  changeHappiness,
  setDirection,
  setMoving,
  setPosition,
  tickNeeds,
  equipAccessory,
  unlockAccessory,
  selectBackyardSkin,
} = dogSlice.actions;

/** Selectors (named to match your imports) */
export const selectDog = (state) => state.dog;
export const selectDogLevel = (state) => state.dog.level;
export const selectDogNeeds = (state) => state.dog.needs;

export const selectCoins = (state) => state.dog.coins;
export const selectXP = (state) => state.dog.xp;
export const selectHappiness = (state) => state.dog.happiness;

export const selectAccessories = (state) => state.dog.accessories;
export const selectUnlocks = (state) => state.dog.unlocks;

export const selectDirection = (state) => state.dog.direction;
export const selectMoving = (state) => state.dog.moving;
export const selectPos = (state) => state.dog.pos;

export const selectBackyardSkinValue = (state) => state.dog.backyardSkin; // extra alias if needed

export default dogSlice.reducer;