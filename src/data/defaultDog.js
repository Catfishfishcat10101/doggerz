export const DEFAULT_DOG = Object.freeze({
  id: "doggerz-local-dog",
  name: "",
  stage: "puppy",
  ageDays: 1,
  level: 1,
  xp: 0,
  condition: "Hungry",
  location: "Backyard",
  pottyProgress: 0,
  createdAt: null,
  updatedAt: null,
  lastRewardDate: null,
  streak: 0,
  stats: {
    hunger: 100,
    thirst: 100,
    energy: 100,
    happiness: 100,
    cleanliness: 100,
    health: 100,
    bond: 1,
  },
});

export function createDefaultDog(overrides = {}) {
  const now = new Date().toISOString();

  return {
    ...DEFAULT_DOG,
    ...overrides,
    createdAt: now,
    updatedAt: now,
    stats: {
      ...DEFAULT_DOG.stats,
      ...overrides.stats,
    },
  };
}
