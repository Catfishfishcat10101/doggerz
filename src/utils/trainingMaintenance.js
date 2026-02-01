/** @format */

// src/utils/trainingMaintenance.js
import { getSkillNode } from "@/constants/trainingTree.js";

const clamp = (n, lo = 0, hi = 100) =>
  Math.max(lo, Math.min(hi, Number(n) || 0));

export function computeRustDelta({
  skillId,
  currentLevel,
  lastMaintainedAt,
  now = Date.now(),
  trainingStreak = 0,
  bond = 50,
  focus = 50,
  difficulty = "normal",
} = {}) {
  const node = getSkillNode(skillId);
  if (!node) return 0;

  const rustPerDay = Number(node.rustPerDay || 0);
  if (!rustPerDay) return 0;

  const last = Number(lastMaintainedAt || now);
  const elapsedMs = Math.max(0, now - last);
  const days = elapsedMs / (1000 * 60 * 60 * 24);

  const baseRust = rustPerDay * days;

  // Rust pressure increases at higher mastery (keeps maintenance meaningful)
  const factor = currentLevel >= 80 ? 1.15 : currentLevel >= 50 ? 1.0 : 0.85;

  const streakReducer = 1 - Math.min(0.25, clamp(trainingStreak, 0, 10) * 0.02);
  const bondReducer = 1 - Math.min(0.2, (clamp(bond, 0, 100) / 100) * 0.2);
  const focusReducer = 1 - Math.min(0.12, (clamp(focus, 0, 100) / 100) * 0.12);
  const diff = String(difficulty || "normal").toLowerCase();
  const diffFactor =
    diff === "easy"
      ? 0.85
      : diff === "hard"
        ? 1.1
        : diff === "expert"
          ? 1.2
          : 1;

  return (
    baseRust * factor * streakReducer * bondReducer * focusReducer * diffFactor
  );
}

export function applyRustToLevel(level, rustAmount) {
  return clamp(level - rustAmount, 0, 100);
}

export function applyPracticeToLevel(level, practiceAmount, opts = {}) {
  const {
    bond = 50,
    focus = 50,
    energy = 50,
    isSpicy = false,
    trainingStreak = 0,
    difficulty = "normal",
  } = opts;

  // Practice is more effective at low levels; slower at high levels.
  const baseFactor = level >= 80 ? 0.5 : level >= 50 ? 0.75 : 1.0;

  const bondBoost = Math.min(0.15, (clamp(bond, 0, 100) / 100) * 0.15);
  const focusBoost = Math.min(0.1, (clamp(focus, 0, 100) / 100) * 0.1);
  const energyBoost = energy >= 70 ? 0.05 : energy <= 25 ? -0.08 : 0;
  const streakBoost = Math.min(0.08, clamp(trainingStreak, 0, 8) * 0.01);
  const spicyPenalty = isSpicy ? -0.06 : 0;

  const diff = String(difficulty || "normal").toLowerCase();
  const diffFactor =
    diff === "easy"
      ? 1.08
      : diff === "hard"
        ? 0.9
        : diff === "expert"
          ? 0.82
          : 1;

  const factor =
    baseFactor +
    bondBoost +
    focusBoost +
    energyBoost +
    streakBoost +
    spicyPenalty;

  return clamp(level + practiceAmount * factor * diffFactor, 0, 100);
}

export function getSkillMaintenanceStatus(level) {
  const v = clamp(level, 0, 100);
  if (v >= 80) return "mastered";
  if (v >= 50) return "steady";
  if (v >= 25) return "learning";
  return "fresh";
}
