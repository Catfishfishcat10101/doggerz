//src/redux/dogSelector.js
import { createSelector } from "@reduxjs/toolkit";
import { initialState as DOG_DEFAULTS } from "./dogSlice";

// Use a stable fallback object so memoization works even if dog is missing.
const EMPTY_DOG = DOG_DEFAULTS; // or Object.freeze({ ...DOG_DEFAULTS })

/** Root selector (stable) */
export const selectDog = (state) => state.dog || EMPTY_DOG;

/** Core need stats (safe defaults) */
export const selectCoreStats = createSelector([selectDog], (d) => ({
  happiness: d.happiness ?? 100,
  energy: d.energy ?? 100,
  hunger: d.hunger ?? 100,
  pottyLevel: d.pottyLevel ?? 0,
  isPottyTrained: !!d.isPottyTrained,
}));

/** Level/XP */
export const selectProgress = createSelector([selectDog], (d) => {
  const xpNeeded = Number.isFinite(d.xpNeeded) ? d.xpNeeded : 100;
  const xp = Number.isFinite(d.xp) ? d.xp : 0;
  const raw = xpNeeded > 0 ? (xp / xpNeeded) * 100 : 0;
  const xpPct = Math.max(0, Math.min(100, Math.round(raw)));
  return { level: d.level ?? 1, xp, xpNeeded, xpPct };
});

/** Sprite-facing state */
export const selectSpriteState = createSelector([selectDog], (d) => ({
  x: d.x ?? 96,
  y: d.y ?? 96,
  direction: d.direction ?? "down",
  isWalking: (d.isWalking ?? d.walking ?? false) || !!d.isRunning,
  isHappy: (d.happiness ?? 100) > 70,
  isDirty: !!d.isDirty,
}));

/** HUD/Toast alerts derived from state */
export const selectAlerts = createSelector([selectDog], (d) => {
  const alerts = [];
  const hunger = d.hunger ?? 100;
  const energy = d.energy ?? 100;
  const happiness = d.happiness ?? 100;
  const pottyLevel = d.pottyLevel ?? 0;

  if (hunger < 30) alerts.push({ type: "warn", msg: "Your pup is getting hungry." });
  if (energy < 30) alerts.push({ type: "warn", msg: "Energy is low. Consider a nap." });
  if (happiness < 30) alerts.push({ type: "info", msg: "Playtime would cheer your pup up." });

  if (d.isDirty) alerts.push({ type: "info", msg: "Bath time! Pup is dirty." });
  if (d.hasFleas) alerts.push({ type: "error", msg: "Your pup has fleas. Bathe soon!" });
  if (d.hasMange) alerts.push({ type: "error", msg: "Mange detected. Vet visit needed." });

  if (pottyLevel > 75 && !d.isPottyTrained) alerts.push({ type: "info", msg: "Pup needs to potty." });

  return alerts;
});