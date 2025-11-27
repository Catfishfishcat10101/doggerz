// Legendary breed unlocks: achievement or purchase shortcut
// Usage: import { LEGENDARY_BREEDS, isLegendaryBreedUnlocked } from '@/constants/legendaryBreeds.js'

export const LEGENDARY_BREEDS = [
  {
    id: "dingo",
    name: "Dingo",
    unlock: {
      achievement: "Reach 365-day care streak",
      purchase: 499, // price in coins or $4.99
    },
  },
  {
    id: "wolf",
    name: "Wolf",
    unlock: {
      achievement: "Max all obedience skills",
      purchase: 499, // price in coins or $4.99
    },
  },
];

// Utility: check if breed is unlocked
export function isLegendaryBreedUnlocked(breedId, userAchievements = {}) {
  const breed = LEGENDARY_BREEDS.find((b) => b.id === breedId);
  if (!breed) return false;
  // Example: userAchievements = { streak: 365, obedienceMaxed: true }
  if (breed.id === "dingo" && userAchievements.streak >= 365) return true;
  if (breed.id === "wolf" && userAchievements.obedienceMaxed) return true;
  return false;
}
