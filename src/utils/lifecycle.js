// src/utils/lifecycle.js

import { withBaseUrl } from "@/utils/assetUtils.js";

export const GAME_DAYS_PER_REAL_DAY = 1;
export const MS_PER_GAME_DAY = (24 * 60 * 60 * 1000) / GAME_DAYS_PER_REAL_DAY;

export const LIFE_STAGES = Object.freeze({
  PUPPY: { min: 0, max: 29, label: "Puppy" },
  ADULT: { min: 30, max: 149, label: "Adult" },
  SENIOR: { min: 150, max: Number.POSITIVE_INFINITY, label: "Senior" },
});

const ALL_STAGES = Object.entries(LIFE_STAGES).map(([id, stage]) => ({
  id,
  ...stage,
}));

export function getLifeStageForAge(ageInGameDays) {
  if (!Number.isFinite(ageInGameDays) || ageInGameDays < 0) {
    return { id: "PUPPY", ...LIFE_STAGES.PUPPY };
  }

  return (
    ALL_STAGES.find(
      (stage) => ageInGameDays >= stage.min && ageInGameDays <= stage.max
    ) || { id: "SENIOR", ...LIFE_STAGES.SENIOR }
  );
}

export function getNextLifeStage(stageId) {
  const key = String(stageId || "PUPPY")
    .toUpperCase()
    .trim();

  if (key === "PUPPY") return { id: "ADULT", ...LIFE_STAGES.ADULT };
  if (key === "ADULT") return { id: "SENIOR", ...LIFE_STAGES.SENIOR };
  return null;
}

export function calculateDogAge(adoptedAtMs, now = Date.now()) {
  if (!Number.isFinite(adoptedAtMs) || adoptedAtMs <= 0) return null;

  const ageInGameDays = Math.max(
    0,
    Math.floor((now - adoptedAtMs) / MS_PER_GAME_DAY)
  );

  const stageInfo = getLifeStageForAge(ageInGameDays);
  const nextStage = getNextLifeStage(stageInfo.id);

  return {
    ageInGameDays,
    stageId: stageInfo.id,
    stageLabel: stageInfo.label,
    stageInfo,
    daysUntilNextStage: nextStage
      ? Math.max(0, nextStage.min - ageInGameDays)
      : null,
    nextStage,
  };
}

export function getLifeStageLabel(stageId) {
  const key = String(stageId || "PUPPY")
    .toUpperCase()
    .trim();
  return LIFE_STAGES[key]?.label ?? LIFE_STAGES.PUPPY.label;
}

export function getDogAgeProgress(adoptedAtMs, now = Date.now()) {
  const age = calculateDogAge(adoptedAtMs, now);
  if (!age) return null;

  const { stageInfo, ageInGameDays } = age;
  const total = Math.max(1, stageInfo.max - stageInfo.min);
  const elapsed = Math.max(0, ageInGameDays - stageInfo.min);
  const stageProgress = Math.max(0, Math.min(1, elapsed / total));

  return {
    ...age,
    stageProgress,
    stageProgressPct: Math.round(stageProgress * 100),
  };
}

export function getLifeStageProgressLabel(ageInfo) {
  if (!ageInfo || typeof ageInfo !== "object") return "No age data";

  const stageId = String(ageInfo.stageId || "PUPPY")
    .toUpperCase()
    .trim();
  const nextStageLabel =
    ageInfo?.nextStage?.label || getNextLifeStage(stageId)?.label || null;
  const daysUntilNextStage = Number(ageInfo?.daysUntilNextStage);
  const stageProgressPct = Math.max(
    0,
    Math.min(100, Math.round(Number(ageInfo?.stageProgressPct || 0)))
  );

  if (
    Number.isFinite(daysUntilNextStage) &&
    daysUntilNextStage > 0 &&
    nextStageLabel
  ) {
    return `${daysUntilNextStage}d to ${nextStageLabel}`;
  }

  if (stageId === "SENIOR") return "Golden years";

  return `${stageProgressPct}% through ${getLifeStageLabel(stageId)}`;
}

export function getSpriteForLifeStage(stageId) {
  const key = String(stageId || "PUPPY")
    .trim()
    .toUpperCase();
  const stage = key === "ADULT" ? "adult" : key === "SENIOR" ? "senior" : "pup";
  return withBaseUrl(`/assets/sprites/jr/${stage}_clean.png`);
}
