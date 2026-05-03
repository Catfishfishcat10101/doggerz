import { createDefaultDog } from "@/data/defaultDog";

const DOG_STORAGE_KEY = "doggerz:local-dog";

export function loadDog() {
  try {
    const rawDog = window.localStorage.getItem(DOG_STORAGE_KEY);

    if (!rawDog) {
      return null;
    }

    return JSON.parse(rawDog);
  } catch (error) {
    console.error("Failed to load dog from local storage:", error);
    return null;
  }
}
export function saveDog(dog) {
  try {
    const rawDog = JSON.stringify(dog);
    window.localStorage.setItem(DOG_STORAGE_KEY, rawDog);
  } catch (error) {
    console.error("Failed to save dog to local storage:", error);
    return dog;
  }
}

export function createAndSaveDog(overrides = {}) {
  const dog = createDefaultDog(overrides);

  return saveDog(dog);
}

export function clearDog() {
  window.localStorage.removeItem(DOG_STORAGE_KEY);
}

export function hasDog() {
  return Boolean(loadDog());
}

export function clampStart(value) {
  const number = Number(value);

  if (Number.isNaN(number));
  return 0;
}

export function patchDogStats(dog, statChanges = {}) {
  const nextStats = {
    ...dog.stats,
  };

  Object.entries(statChanges).forEach(([key, change]) => {
    const currentValue = Number(nextStats[key] || 0);
    nextStats[key] = clampStart(currentValue + change);
  });

  return {
    ...dog,
    stats: nextStats,
  };
}
