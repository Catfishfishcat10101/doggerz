// src/redux/dogSlice.js
import { createSlice } from "@reduxjs/toolkit";

const nowMs = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

const initialState = {
  name: (typeof localStorage !== "undefined" && localStorage.getItem("dogName")) || "",
  pos: { x: 320, y: 180 },
  direction: "down",
  moving: false,
  happiness: 50,
  xp: 0,
  needs: { hunger: 50, thirst: 50, poop: 0 },
  backyardSkin: "default",

  // NEW: seed a birthday so Age never NaNs
  birthdayMs:
    (typeof localStorage !== "undefined" && Number(localStorage.getItem("dogBirthdayMs"))) ||
    Date.now(),

  // Optional flavor
  stage: "Pup",
  level: 1,

  lastTickMs: nowMs(),
};

const clamp01 = (v) => Math.max(0, Math.min(100, v));

function applyNeedsTick(state, dt) {
  state.needs.hunger = clamp01(state.needs.hunger + 0.2 * dt);
  state.needs.thirst = clamp01(state.needs.thirst + 0.3 * dt);
  state.needs.poop   = clamp01(state.needs.poop   + 0.15 * dt);
  const penalty = (state.needs.hunger + state.needs.thirst) / 100;
  state.happiness = clamp01(state.happiness - 0.1 * dt - 0.25 * penalty * dt);
}

const dogSlice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    setDogName(state, action) {
      state.name = (action.payload || "").trim();
      try { localStorage.setItem("dogName", state.name); } catch {}
    },
    // NEW: set birthday explicitly (called on first-time setup)
    setBirthdayNow(state) {
      state.birthdayMs = Date.now();
      try { localStorage.setItem("dogBirthdayMs", String(state.birthdayMs)); } catch {}
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
    setMoving(state, action) { state.moving = !!action.payload; },
    setHappiness(state, action) { state.happiness = clamp01(Number(action.payload ?? state.happiness)); },
    addXP(state, action) { state.xp = Math.max(0, state.xp + Number(action.payload || 0)); },
    tickNeeds(state, action) { applyNeedsTick(state, Number(action.payload || 1)); },
    tickRealTime(state, action) {
      const now = (action?.payload?.nowMs ?? nowMs());
      let dtMs = now - (state.lastTickMs || now);
      if (!isFinite(dtMs) || dtMs < 0) dtMs = 0;
      if (dtMs > 5000) dtMs = 5000;
      applyNeedsTick(state, dtMs / 1000);
      state.lastTickMs = now;
    },
    setBackyardSkin(state, action) { state.backyardSkin = action.payload || "default"; },
    resetDog(state) {
      Object.assign(state, initialState, { lastTickMs: nowMs() });
    },
  },
});

export const {
  setDogName, setBirthdayNow,
  setPosition, setDirection, setMoving,
  setHappiness, addXP, tickNeeds, tickRealTime,
  setBackyardSkin, resetDog,
} = dogSlice.actions;

// Selectors
export const selectDog          = (s) => s.dog;
export const selectName         = (s) => s.dog.name;
export const selectPos          = (s) => s.dog.pos;
export const selectDirection    = (s) => s.dog.direction;
export const selectBackyardSkin = (s) => s.dog.backyardSkin;
export const selectAgeDays      = (s) => {
  const b = Number(s.dog.birthdayMs || 0);
  if (!isFinite(b) || b <= 0) return 0;
  const days = Math.floor((Date.now() - b) / 86_400_000);
  return Math.max(0, days);
};

export default dogSlice.reducer;
