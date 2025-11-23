// src/utils/getSpriteForLifeStage.js
// Kept for compatibility; delegates to public sprite paths.
// Prefer importing from "@/utils/lifecycle.js" where this also exists.

export function getSpriteForLifeStage(stageId) {
  switch (stageId) {
    case "PUPPY":
      return "/sprites/jack_russell_puppy.png";
    case "ADULT":
      return "/sprites/jack_russell_adult.png";
    case "SENIOR":
    default:
      return "/sprites/jack_russell_senior.png";
  }
}
