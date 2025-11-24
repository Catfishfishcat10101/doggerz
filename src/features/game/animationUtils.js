// src/features/game/animationUtils.js
// Shared animation utility functions for testing & reuse.

export function deriveBaseAnimation(dog) {
  if (!dog) return "idle";
  const s = dog.stats || {};
  const happiness = s.happiness ?? 100;
  const energy = s.energy ?? 100;
  const cleanliness = s.cleanliness ?? 100;
  if (energy < 20) return "sleep";
  if (cleanliness < 30) return "scratch";
  if (happiness < 25) return "sad";
  if (happiness > 75) return "excited";
  return "idle";
}

export function isOverrideExpired(override, now = Date.now()) {
  return !override || override.expiresAt <= now;
}
