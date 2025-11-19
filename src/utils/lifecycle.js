import { LIFE_STAGES } from "@/constants/game.js";

export function calculateDogAge(adoptedAt) {
  if (!adoptedAt) return { days: 0, stage: "PUPPY", label: "Newborn" };

  const now = Date.now();
  const elapsed = now - adoptedAt;
  const gameDays = Math.floor(elapsed / (24 * 60 * 60 * 1000));

  let stage = "SENIOR";
  if (gameDays <= LIFE_STAGES.PUPPY.max) stage = "PUPPY";
  else if (gameDays <= LIFE_STAGES.ADULT.max) stage = "ADULT";

  return {
    days: gameDays,
    stage,
    label: LIFE_STAGES[stage].label,
  };
}

export function getSpriteSheet(stage) {
  const sheets = {
    PUPPY: "/sprites/jack_russell_puppy.png",
    ADULT: "/sprites/jack_russell_adult.png",
    SENIOR: "/sprites/jack_russell_senior.png",
  };
  return sheets[stage] || sheets.ADULT;
}
