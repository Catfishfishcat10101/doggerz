// src/logic/dogLifeStages.js
export const LIFE_STAGES = Object.freeze({
  PUPPY: "PUPPY",
  ADULT: "ADULT",
  SENIOR: "SENIOR",
});

export const LIFE_STAGE_ORDER = Object.freeze([
  LIFE_STAGES.PUPPY,
  LIFE_STAGES.ADULT,
  LIFE_STAGES.SENIOR,
]);

export const LIFE_STAGE_LABELS = Object.freeze({
  [LIFE_STAGES.PUPPY]: "Puppy",
  [LIFE_STAGES.ADULT]: "Adult",
  [LIFE_STAGES.SENIOR]: "Senior",
});

export function getLifeStageLabel(lifeStage) {
  return LIFE_STAGE_LABELS[lifeStage] || "Unknown";
}

export function isValidLifeStage(lifeStage) {
  return LIFE_STAGE_ORDER.includes(lifeStage);
}

export function getNextLifeStage(lifeStage) {
  const index = LIFE_STAGE_ORDER.indexOf(lifeStage);
  if (index === -1 || index === LIFE_STAGE_ORDER.length - 1) {
    return null;
  }
  return LIFE_STAGE_ORDER[index + 1];
}
