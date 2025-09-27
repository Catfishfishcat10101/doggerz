// src/redux/dogSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  name: typeof localStorage !== "undefined" ? localStorage.getItem("dogName") || "" : "",
  pos: { x: 320, y: 180 },      // center(ish) of a 640x360 world
  direction: "down",            // "up" | "down" | "left" | "right"
  moving: false,
  happiness: 50,                // 0–100
  xp: 0,
  needs: { hunger: 50, thirst: 50, poop: 0 }, // 0–100 simple model
  backyardSkin: "default",      // placeholder theme
};

const clamp01 = (v) => Math.max(0, Math.min(100, v));

const dogSlice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    setDogName(state, action) {
      state.name = (action.payload || "").trim();
      try {
        localStorage.setItem("dogName", state.name);
      } catch {}
    },
    setPosition(state, action) {
      const { x, y } = action.payload || {};
      if (typeof x === "number") state.pos.x = x;
      if (typeof y === "number") state.pos.y = y;
    },
    setDirection(state, action) {
      const d = action.payload;
      if (d === "up" || d === "down" || d === "left" || d === "right") state.direction = d;
    },
    setMoving(state, action) {
      state.moving = !!action.payload;
    },
    setHappiness(state, action) {
      state.happiness = clamp01(Number(action.payload ?? state.happiness));
    },
    addXP(state, action) {
      const inc = Number(action.payload || 0);
      state.xp = Math.max(0, state.xp + inc);
    },
    tickNeeds(state, action) {
      const dt = Number(action.payload || 1); // arbitrary tick units
      state.needs.hunger = clamp01(state.needs.hunger + 0.2 * dt);
      state.needs.thirst = clamp01(state.needs.thirst + 0.3 * dt);
      state.needs.poop   = clamp01(state.needs.poop + 0.15 * dt);
      // simple happiness decay
      const penalty = (state.needs.hunger + state.needs.thirst) / 100;
      state.happiness = clamp01(state.happiness - 0.1 * dt - 0.25 * penalty * dt);
    },
    setBackyardSkin(state, action) {
      state.backyardSkin = action.payload || "default";
    },
    resetDog(state) {
      Object.assign(state, initialState);
    },
  },
});

export const {
  setDogName,
  setPosition,
  setDirection,
  setMoving,
  setHappiness,
  addXP,
  tickNeeds,
  setBackyardSkin,
  resetDog,
} = dogSlice.actions;

// Selectors used around the app
export const selectDog       = (s) => s.dog;
export const selectName      = (s) => s.dog.name;
export const selectPos       = (s) => s.dog.pos;
export const selectDirection = (s) => s.dog.direction;
export const selectMoving    = (s) => s.dog.moving;
export const selectHappiness = (s) => s.dog.happiness;
export const selectXP        = (s) => s.dog.xp;
export const selectBackyardSkin = (s) => s.dog.backyardSkin;

export default dogSlice.reducer;
