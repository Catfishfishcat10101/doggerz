/** @format */

import {
  getRecentMemorySignals,
  scoreRecentMemoryDrives,
} from "@/components/dog/DogMemoryDrives.js";

function clampStat(value, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, n));
}

function getBehaviorStats(dog) {
  const stats = dog?.stats && typeof dog.stats === "object" ? dog.stats : {};
  return {
    hunger: clampStat(stats.hunger, 0),
    energy: clampStat(stats.energy, 0),
    happiness: clampStat(stats.happiness, 50),
    boredom: 100 - clampStat(stats.mentalStimulation, 100),
    cleanliness: clampStat(stats.cleanliness, 100),
    bond: clampStat(dog?.bond?.value, 0),
  };
}

function weightedPick(weights) {
  const entries = Object.entries(weights).filter(
    ([, weight]) => Number(weight) > 0
  );
  if (!entries.length) return "idle";

  const total = entries.reduce((sum, [, weight]) => sum + Number(weight), 0);
  let roll = Math.random() * total;

  for (const [state, weight] of entries) {
    roll -= Number(weight);
    if (roll <= 0) return state;
  }

  return entries[entries.length - 1]?.[0] || "idle";
}

export function resolveEmergencyDogState(dog) {
  const { hunger, energy, cleanliness } = getBehaviorStats(dog);
  const drives = scoreRecentMemoryDrives(dog?.memories, Date.now());

  if (Boolean(dog?.isAsleep) || energy < 10) {
    return "sleep";
  }

  if (hunger > 96 || drives.hungry >= 90) {
    return "beg";
  }

  if (cleanliness < 8) {
    return "scratch";
  }

  return null;
}

export function determineDogState(dog) {
  const now = Date.now();
  const { hunger, energy, happiness, boredom, cleanliness, bond } =
    getBehaviorStats(dog);
  const drives = scoreRecentMemoryDrives(dog?.memories, now);
  const recency = getRecentMemorySignals(dog?.memories, now);
  const emergencyState = resolveEmergencyDogState(dog);
  if (emergencyState) return emergencyState;

  if (hunger > 92 || drives.hungry >= 82) {
    return "beg";
  }

  if (cleanliness < 12) {
    return "scratch";
  }

  const weights = {
    idle:
      12 +
      bond * 0.12 +
      happiness * 0.06 -
      boredom * 0.08 -
      drives.restless * 0.05,
    walk:
      10 +
      boredom * 0.2 +
      happiness * 0.08 +
      drives.playful * 0.18 +
      drives.restless * 0.12 +
      bond * 0.03 -
      Math.max(0, 35 - energy) * 0.3,
    dig:
      4 +
      boredom * 0.24 +
      drives.restless * 0.22 +
      happiness * 0.05 -
      Math.max(0, 30 - energy) * 0.35,
    bark:
      2 +
      drives.lonely * 0.24 +
      hunger * 0.08 +
      Math.max(0, 55 - bond) * 0.1 +
      boredom * 0.05 -
      happiness * 0.03,
    beg:
      1 + hunger * 0.26 + drives.hungry * 0.22 + bond * 0.04 - happiness * 0.02,
    scratch: Math.max(0, 24 - cleanliness) * 0.9 + drives.restless * 0.04,
    sleep:
      Math.max(0, 42 - energy) * 0.75 +
      Math.max(0, 30 - happiness) * 0.08 +
      Math.max(0, 25 - bond) * 0.04,
  };

  if (energy < 24) {
    weights.sleep += 12;
    weights.walk *= 0.55;
    weights.dig *= 0.45;
  }

  if (hunger > 74) {
    weights.beg += 14;
    weights.idle *= 0.8;
  }

  if (recency.lastFedRecently) {
    weights.beg *= 0.3;
    weights.idle += 3;
  }

  if (recency.lastPlayedRecently && energy > 28) {
    weights.walk += 4;
    weights.dig += 2;
    weights.idle *= 0.92;
  }

  if (recency.lastPettedRecently) {
    weights.bark *= 0.6;
    weights.idle += 4;
    weights.walk += 2;
  }

  if (recency.lastPottySuccessRecently) {
    weights.walk *= 0.92;
    weights.dig *= 0.82;
    weights.idle += 2;
  }

  if (recency.lastAccidentRecently) {
    weights.bark += 3;
    weights.scratch += 2;
    weights.idle *= 0.88;
  }

  if (drives.playful > 55 && energy > 30) {
    weights.walk += 10;
    weights.dig += 6;
  }

  if (drives.lonely > 50) {
    weights.bark += 8;
    weights.idle *= 0.85;
  }

  if (boredom > 70) {
    weights.walk += 10;
    weights.dig += 10;
  }

  return weightedPick(weights);
}

export function getDogStateDurationMs(state) {
  const key = String(state || "")
    .trim()
    .toLowerCase();

  if (key === "walk") return 7_000;
  if (key === "dig") return 4_500;
  if (key === "bark") return 2_000;
  if (key === "beg") return 3_000;
  if (key === "scratch") return 3_500;
  if (key === "sleep") return 12_000;
  return 3_000;
}
