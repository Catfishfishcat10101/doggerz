// src/components/dog/DogMemoryDrives.js
function clamp(value, min = 0, max = 100) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function normalizeType(memory) {
  return String(memory?.type || "")
    .trim()
    .toLowerCase();
}

function getAgeWeight(timestamp, now) {
  const ageMs = Math.max(0, now - Number(timestamp || 0));
  const maxAgeMs = 12 * 60 * 60 * 1000;
  if (ageMs >= maxAgeMs) return 0;
  return 1 - ageMs / maxAgeMs;
}

function findMostRecentMemory(memories, type, now, maxAgeMs) {
  const list = Array.isArray(memories) ? memories : [];
  let best = null;

  list.forEach((memory) => {
    if (!memory || typeof memory !== "object") return;
    if (normalizeType(memory) !== type) return;

    const timestamp = Number(memory.timestamp || 0);
    if (!timestamp) return;

    const ageMs = Math.max(0, now - timestamp);
    if (ageMs > maxAgeMs) return;

    if (!best || timestamp > best.timestamp) {
      best = { memory, timestamp, ageMs };
    }
  });

  return best;
}

export function scoreRecentMemoryDrives(memories, now = Date.now()) {
  const list = Array.isArray(memories)
    ? memories
        .filter((memory) => memory && typeof memory === "object")
        .slice(0, 40)
    : [];

  const drives = {
    hungry: 0,
    lonely: 0,
    playful: 0,
    restless: 0,
  };

  list.forEach((memory) => {
    const type = normalizeType(memory);
    const weight = getAgeWeight(memory.timestamp, now);
    if (weight <= 0) return;

    switch (type) {
      case "begged_for_food":
        drives.hungry += 28 * weight;
        drives.restless += 6 * weight;
        break;
      case "ate_food":
        drives.hungry -= 26 * weight;
        drives.playful += 6 * weight;
        break;
      case "petted":
        drives.lonely -= 24 * weight;
        drives.playful += 8 * weight;
        break;
      case "played_with_toy":
        drives.playful += 22 * weight;
        drives.lonely -= 10 * weight;
        drives.restless -= 6 * weight;
        break;
      case "potty_success":
        drives.restless -= 12 * weight;
        drives.playful += 4 * weight;
        break;
      case "accident":
        drives.restless += 18 * weight;
        drives.lonely += 7 * weight;
        break;
      case "wandered":
        drives.restless += 10 * weight;
        break;
      case "found_dig_spot":
        drives.restless += 14 * weight;
        drives.playful += 5 * weight;
        break;
      case "random_bark":
        drives.lonely += 8 * weight;
        drives.restless += 10 * weight;
        break;
      case "fell_asleep":
        drives.restless -= 8 * weight;
        break;
      default:
        break;
    }
  });

  return {
    hungry: clamp(drives.hungry),
    lonely: clamp(drives.lonely),
    playful: clamp(drives.playful),
    restless: clamp(drives.restless),
  };
}

export function getRecentMemorySignals(memories, now = Date.now()) {
  const lastPlayed = findMostRecentMemory(
    memories,
    "played_with_toy",
    now,
    25 * 60 * 1000
  );
  const lastFed = findMostRecentMemory(
    memories,
    "ate_food",
    now,
    35 * 60 * 1000
  );
  const lastPetted = findMostRecentMemory(
    memories,
    "petted",
    now,
    20 * 60 * 1000
  );
  const lastPottySuccess = findMostRecentMemory(
    memories,
    "potty_success",
    now,
    30 * 60 * 1000
  );
  const lastAccident = findMostRecentMemory(
    memories,
    "accident",
    now,
    45 * 60 * 1000
  );

  return {
    lastPlayedRecently: Boolean(lastPlayed),
    lastFedRecently: Boolean(lastFed),
    lastPettedRecently: Boolean(lastPetted),
    lastPottySuccessRecently: Boolean(lastPottySuccess),
    lastAccidentRecently: Boolean(lastAccident),
    lastPlayedAgeMs: lastPlayed?.ageMs ?? null,
    lastFedAgeMs: lastFed?.ageMs ?? null,
    lastPettedAgeMs: lastPetted?.ageMs ?? null,
    lastPottySuccessAgeMs: lastPottySuccess?.ageMs ?? null,
    lastAccidentAgeMs: lastAccident?.ageMs ?? null,
  };
}
