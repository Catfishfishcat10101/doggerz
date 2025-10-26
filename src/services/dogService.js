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

// Create a new dog object
function createNewDog(uid) {
  return {
    uid,
    id: crypto.randomUUID(),
    name: null,
    breed: DEFAULT_BREED,
    createdAt: new Date().toISOString(),
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
