/** @format */
// src/utils/trainingMath.js
// Shared training math helpers (keeps UI + reducer consistent).

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, Number(n) || 0));
const clamp01 = (n) => clamp(n, 0, 1);
const clampPct = (n) => clamp(n, 0, 100);

function softCurve(x) {
  const v = clamp01(x);
  return v * v * (3 - 2 * v);
}

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
  focus = 50,
  trust = 50,
  stress = 30,
  distraction = 25,
  trainingStreak = 0,
  lastTrainingSuccess = true,
  environment = "yard",
  difficulty = "normal",
  rng = Math.random,
} = {}) {
  const voice = String(input || "").toLowerCase() === "voice";
  const env = String(environment || "yard").toLowerCase();
  const diff = String(difficulty || "normal").toLowerCase();

  let chance = voice ? 0.62 : 0.78;

  const bondClamped = clampPct(bond) / 100;
  chance += softCurve(bondClamped) * (voice ? 0.32 : 0.25);

  if (energy >= 75) chance += 0.05;
  if (energy <= 30) chance -= 0.1;
  if (energy <= 15) chance -= 0.06;

  if (hunger >= 70) chance -= 0.06;
  if (thirst >= 70) chance -= 0.06;
  if (happiness <= 35) chance -= 0.04;

  if (isSpicy) chance -= 0.05;
  if (foodMotivated >= 55 && fedRecently) chance += 0.08;

  const focusFactor = softCurve(clampPct(focus) / 100);
  const trustFactor = softCurve(clampPct(trust) / 100);
  chance += (focusFactor - 0.5) * 0.12;
  chance += (trustFactor - 0.5) * (voice ? 0.16 : 0.12);

  const stressFactor = clampPct(stress) / 100;
  chance -= stressFactor * 0.1;

  const distractionFactor = clampPct(distraction) / 100;
  chance -= distractionFactor * 0.08;

  const streakBonus = Math.min(0.12, clamp(trainingStreak, 0, 6) * 0.02);
  chance += streakBonus;

  if (!lastTrainingSuccess) chance -= 0.04;

  if (env === "park") chance -= 0.03;
  if (env === "busy") chance -= 0.06;
  if (env === "quiet") chance += 0.03;

  if (diff === "easy") chance += 0.06;
  if (diff === "hard") chance -= 0.08;
  if (diff === "expert") chance -= 0.12;

  const min = voice ? 0.3 : 0.4;
  return clamp(chance, min, 0.98);
}

export function formatChancePercent(chance) {
  return clampPct(Math.round(Number(chance || 0) * 100));
}

export function computeTrainingDifficulty({
  bond = 0,
  focus = 50,
  trust = 50,
  stress = 30,
  distraction = 25,
} = {}) {
  const bondScore = softCurve(clampPct(bond) / 100);
  const focusScore = softCurve(clampPct(focus) / 100);
  const trustScore = softCurve(clampPct(trust) / 100);
  const stressScore = clampPct(stress) / 100;
  const distractionScore = clampPct(distraction) / 100;

  const score =
    bondScore * 0.35 +
    focusScore * 0.25 +
    trustScore * 0.2 -
    stressScore * 0.12 -
    distractionScore * 0.08;

  if (score >= 0.7) return "easy";
  if (score <= 0.35) return "hard";
  return "normal";
}

export function computeTrainingOutcome({
  chance = 0,
  rng = Math.random,
} = {}) {
  const roll = typeof rng === "function" ? rng() : Math.random();
  return roll <= clamp01(chance);
}
