/** @format */

// src/utils/trainingMaintenance.js
import { getSkillNode } from "@/constants/trainingTree.js";

const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

export function computeRustDelta({
  skillId,
  currentLevel,
  lastMaintainedAt,
  now = Date.now(),
}) {
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

  return baseRust * factor;
}

export function applyRustToLevel(level, rustAmount) {
  return clamp(level - rustAmount, 0, 100);
}

export function applyPracticeToLevel(level, practiceAmount) {
  // Practice is more effective at low levels; slower at high levels.
  const factor = level >= 80 ? 0.5 : level >= 50 ? 0.75 : 1.0;
  return clamp(level + practiceAmount * factor, 0, 100);
}
