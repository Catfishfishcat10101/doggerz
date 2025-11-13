//src/services/dogService.js
const KEY = "doggerz:dog";
const DEFAULT_BREED = "jack-russell";

// Internal helper to read dog from localStorage
function loadDog() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "null");
  } catch {
    return null;
  }
}

// Internal helper to write dog to localStorage
function saveDogToStorage(dog) {
  try {
    localStorage.setItem(KEY, JSON.stringify(dog));
    return true;
  } catch {
    return false;
  }
}

function createNewDog(uid) {
  return {
    uid,
    id: crypto.randomUUID(),
    name: null,
    breed: DEFAULT_BREED,
    createdAt: new Date().toISOString(),
    mood: "neutral",            // happy, sad, playful, tired, angry
    energy: 100,                // 0–100
    hunger: 0,                  // 0–100 (higher = hungrier)
    affection: 50,             // 0–100 (mood amplifier)
    inventory: [],              // Items collected
    poopCount: 0,               // For realism. And fun.
    lastUpdated: Date.now()
  };
}


// Ensure there's a dog associated with this user
export async function ensureDogForUser(uid) {
  if (!uid) return null;
  const existing = loadDog();
  if (existing && existing.uid === uid) return existing;

  const dog = createNewDog(uid);
  saveDogToStorage(dog);
  return dog;
}

// Get the current dog
export function getDog() {
  return loadDog();
}

// Save the dog's name
export async function saveDogName(name) {
  const dog = loadDog();
  if (!dog) return null;

  dog.name = String(name || "").slice(0, 24);
  saveDogToStorage(dog);
  return dog;
}
export async function tickDog(timePassedMs = 10000) {
  const dog = loadDog();
  if (!dog) return null;

  const decayRate = timePassedMs / 10000;

  dog.hunger = Math.min(100, dog.hunger + 1 * decayRate);
  dog.energy = Math.max(0, dog.energy - 1 * decayRate);

  if (dog.hunger > 80 || dog.energy < 20) {
    dog.mood = "sad";
  } else if (dog.hunger < 30 && dog.energy > 50) {
    dog.mood = "happy";
  } else {
    dog.mood = "neutral";
  }

  dog.lastUpdated = Date.now();
  saveDogToStorage(dog);
  return dog;
}


// Update arbitrary dog fields (e.g., inventory, stats, mood swings)
export async function updateDogFields(fields = {}) {
  const dog = loadDog();
  if (!dog) return null;

  Object.assign(dog, fields);
  saveDogToStorage(dog);
  return dog;
}

// Remove the dog (e.g., on logout or dramatic user betrayal)
export function deleteDog() {
  localStorage.removeItem(KEY);
}
