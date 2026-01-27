/** @format */
// src/utils/trainingMath.js
// Shared training math helpers (keeps UI + reducer consistent).

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, Number(n) || 0));

export function computeTrainingSuccessChance({
  input = "button",
  bond = 0,
  energy = 50,
  hunger = 50,
  thirst = 50,
  happiness = 50,
  isSpicy = false,
  foodMotivated = 0,
  fedRecently = false,
} = {}) {
  const voice = String(input || "").toLowerCase() === "voice";

  let chance = voice ? 0.62 : 0.78;

  const bondClamped = clamp(bond, 0, 100) / 100;
  chance += bondClamped * (voice ? 0.32 : 0.25);

  if (energy >= 75) chance += 0.05;
  if (energy <= 30) chance -= 0.1;
  if (energy <= 15) chance -= 0.06;

  if (hunger >= 70) chance -= 0.06;
  if (thirst >= 70) chance -= 0.06;
  if (happiness <= 35) chance -= 0.04;

  if (isSpicy) chance -= 0.05;
  if (foodMotivated >= 55 && fedRecently) chance += 0.08;

  const min = voice ? 0.3 : 0.4;
  return clamp(chance, min, 0.98);
}

export function formatChancePercent(chance) {
  return Math.max(0, Math.min(100, Math.round(Number(chance || 0) * 100)));
}
