// src/redux/dogSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  name: typeof localStorage !== "undefined" ? localStorage.getItem("dogName") || "" : "",
  pos: { x: 320, y: 180 },
  direction: "down",
  moving: false,
  happiness: 50,
  xp: 0,
  // NEW: economy + cosmetics
  coins: 100,
  accessories: {
    owned: [],                              // e.g., ["collar_red"]
    equipped: { collar: null, hat: null },  // { collar: "collar_red", hat: "hat_party" }
  },
  unlocks: {
    accessories: false, // flip to true when you want to unlock early (or rely on level >= 8)
  },

  needs: { hunger: 50, thirst: 50, poop: 0 },
  backyardSkin: "default",
  lastTickMs: typeof performance !== "undefined" ? performance.now() : Date.now(),
};

const clamp01 = (v) => Math.max(0, Math.min(100, v));
function applyNeedsTick(s, dt) {
  s.needs.hunger = clamp01(s.needs.hunger + 0.2 * dt);
  s.needs.thirst = clamp01(s.needs.thirst + 0.3 * dt);
  s.needs.poop   = clamp01(s.needs.poop   + 0.15 * dt);
  const penalty = (s.needs.hunger + s.needs.thirst) / 100;
  s.happiness = clamp01(s.happiness - 0.1 * dt - 0.25 * penalty * dt);
}

const dogSlice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    setDogName(s, a) {
      s.name = (a.payload || "").trim();
      try { localStorage.setItem("dogName", s.name); } catch {}
    },
    setPosition(s, a) {
      const { x, y } = a.payload || {};
      if (Number.isFinite(x)) s.pos.x = x;
      if (Number.isFinite(y)) s.pos.y = y;
    },
    setDirection(s, a) {
      const d = a.payload;
      if (["up", "down", "left", "right"].includes(d)) s.direction = d;
    },
    setMoving(s, a) { s.moving = !!a.payload; },
    setHappiness(s, a) { s.happiness = clamp01(Number(a.payload ?? s.happiness)); },
    addXP(s, a) { s.xp = Math.max(0, s.xp + Number(a.payload || 0)); },

    // realtime tick
    tickNeeds(s, a) { applyNeedsTick(s, Number(a.payload || 1)); },
    tickRealTime(s, a) {
      const now = a?.payload?.nowMs ?? (typeof performance !== "undefined" ? performance.now() : Date.now());
      let dtMs = now - (s.lastTickMs || now);
      if (!isFinite(dtMs) || dtMs < 0) dtMs = 0;
      if (dtMs > 5000) dtMs = 5000;
      applyNeedsTick(s, dtMs / 1000);
      s.lastTickMs = now;
    },

    setBackyardSkin(s, a) { s.backyardSkin = a.payload || "default"; },
    resetDog() {
      return { ...initialState, lastTickMs: typeof performance !== "undefined" ? performance.now() : Date.now() };
    },

    // NEW: simple economy/cosmetics
    grantCoins(s, a) { s.coins = Math.max(0, s.coins + Number(a.payload || 0)); },
    spendCoins(s, a) {
      const amt = Math.max(0, Number(a.payload || 0));
      if (s.coins >= amt) s.coins -= amt;
    },
    unlockAccessory(s, a) {
      const id = String(a.payload || "");
      if (id && !s.accessories.owned.includes(id)) s.accessories.owned.push(id);
    },
    equipAccessory(s, a) {
      const { slot, id } = a.payload || {};
      if (!slot || !["collar", "hat"].includes(slot)) return;
      // allow unequip with id = null
      if (id === null) { s.accessories.equipped[slot] = null; return; }
      // only equip if owned
      if (s.accessories.owned.includes(id)) s.accessories.equipped[slot] = id;
    },
    setAccessoriesUnlocked(s, a) { s.unlocks.accessories = !!a.payload; },
  },
});

export const {
  setDogName, setPosition, setDirection, setMoving, setHappiness,
  addXP, tickNeeds, tickRealTime, setBackyardSkin, resetDog,
  // new:
  grantCoins, spendCoins, unlockAccessory, equipAccessory, setAccessoriesUnlocked,
} = dogSlice.actions;

// selectors
export const selectDog = (s) => s.dog;
export const selectName = (s) => s.dog.name;
export const selectPos = (s) => s.dog.pos;
export const selectDirection = (s) => s.dog.direction;
export const selectBackyardSkin = (s) => s.dog.backyardSkin;

export const selectCoins = (s) => s.dog.coins;
export const selectAccessories = (s) => s.dog.accessories;
export const selectUnlocks = (s) => s.dog.unlocks;
export const selectDogLevel = (s) => Math.floor((s.dog.xp || 0) / 100) + 1; // level 1 at 0–99 xp

export default dogSlice.reducer;
