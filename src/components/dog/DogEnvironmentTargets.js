/** @format */

import {
  DOG_WORLD_HEIGHT,
  DOG_WORLD_WIDTH,
} from "@/components/dog/simulation/DogWanderBehavior.js";

function clamp(n, lo, hi) {
  const value = Number(n);
  if (!Number.isFinite(value)) return lo;
  return Math.max(lo, Math.min(hi, value));
}

function toWorldTarget(definition) {
  return {
    ...definition,
    x: clamp(
      Number(definition.xNorm || 0.5) * DOG_WORLD_WIDTH,
      0,
      DOG_WORLD_WIDTH
    ),
    y: clamp(
      Number(definition.yNorm || 0.5) * DOG_WORLD_HEIGHT,
      0,
      DOG_WORLD_HEIGHT
    ),
    interactionRadius: Math.max(12, Number(definition.interactionRadius || 22)),
  };
}

const YARD_TARGETS = Object.freeze([
  {
    id: "yard-ball",
    type: "ball",
    label: "tennis ball",
    xNorm: 0.88,
    yNorm: 0.9,
    interaction: "play",
    toyId: "toy_tennis_ball_basic",
  },
  {
    id: "yard-bone",
    type: "bone",
    label: "chew bone",
    xNorm: 0.76,
    yNorm: 0.78,
    interaction: "play",
    toyId: "toy_indestructible_bone",
  },
  {
    id: "yard-water-bowl",
    type: "water_bowl",
    label: "water bowl",
    xNorm: 0.55,
    yNorm: 0.87,
    interaction: "drink",
  },
  {
    id: "yard-hole-spot",
    type: "hole_spot",
    label: "digging spot",
    xNorm: 0.42,
    yNorm: 0.82,
    interaction: "dig",
  },
  {
    id: "yard-tree",
    type: "tree",
    label: "tree shade",
    xNorm: 0.24,
    yNorm: 0.64,
    interaction: "tree_pause",
  },
  {
    id: "yard-doghouse",
    type: "doghouse",
    label: "doghouse",
    xNorm: 0.78,
    yNorm: 0.65,
    interaction: "rest",
  },
]);

const APARTMENT_TARGETS = Object.freeze([
  {
    id: "apartment-ball",
    type: "ball",
    label: "living room ball",
    xNorm: 0.9,
    yNorm: 0.9,
    interaction: "play",
    toyId: "toy_tennis_ball_basic",
  },
  {
    id: "apartment-bone",
    type: "bone",
    label: "chew bone",
    xNorm: 0.48,
    yNorm: 0.88,
    interaction: "play",
    toyId: "toy_indestructible_bone",
  },
  {
    id: "apartment-water-bowl",
    type: "water_bowl",
    label: "water bowl",
    xNorm: 0.3,
    yNorm: 0.86,
    interaction: "drink",
  },
  {
    id: "apartment-bed",
    type: "doghouse",
    label: "cozy bed",
    xNorm: 0.22,
    yNorm: 0.74,
    interaction: "rest",
  },
]);

function getStaticTargets(environment) {
  return String(environment || "yard").toLowerCase() === "apartment"
    ? APARTMENT_TARGETS
    : YARD_TARGETS;
}

function createFoodBowlTarget(dog) {
  const bowl = dog?.yard?.foodBowl;
  if (!bowl || typeof bowl !== "object") return null;

  return toWorldTarget({
    id: String(bowl.id || "food-bowl"),
    type: "food_bowl",
    label:
      String(bowl.surface || "").toLowerCase() === "low_table"
        ? "table snack"
        : "food bowl",
    xNorm: clamp(Number(bowl.xNorm || 0.55), 0, 1),
    yNorm: clamp(Number(bowl.yNorm || 0.75), 0, 1),
    interaction: "eat",
    interactionRadius: 18,
  });
}

export function getDogEnvironmentTargets(dog) {
  const environment = dog?.yard?.environment || "yard";
  const staticTargets = getStaticTargets(environment).map(toWorldTarget);
  const dynamicTargets = [];
  const bowlTarget = createFoodBowlTarget(dog);
  if (bowlTarget) dynamicTargets.push(bowlTarget);
  return [...staticTargets, ...dynamicTargets];
}

function getNeedWeight(target, dog, now) {
  const stats = dog?.stats && typeof dog.stats === "object" ? dog.stats : {};
  const memory =
    dog?.memory && typeof dog.memory === "object" ? dog.memory : {};
  const thirst = Number(stats.thirst || 0);
  const energy = Number(stats.energy || 0);
  const happiness = Number(stats.happiness || 0);
  const mentalStimulation = Number(stats.mentalStimulation || 0);
  const hunger = Number(stats.hunger || 0);
  const lastPlayedAt = Number(memory.lastPlayedAt || 0);
  const lastDrankAt = Number(memory.lastDrankAt || 0);
  const lastFedAt = Number(memory.lastFedAt || 0);

  switch (target.interaction) {
    case "drink":
      if (thirst < 35) return 0;
      if (lastDrankAt && now - lastDrankAt < 90_000) return 0;
      return 1 + thirst / 18;
    case "rest":
      if (energy > 55) return 0;
      return 1 + (55 - energy) / 8;
    case "play":
      if (lastPlayedAt && now - lastPlayedAt < 45_000) return 0;
      return (
        1 +
        (100 - mentalStimulation) / 26 +
        (60 - happiness > 0 ? (60 - happiness) / 22 : 0)
      );
    case "dig":
      return 0.8 + (100 - mentalStimulation) / 24;
    case "tree_pause":
      return energy < 45 ? 1.8 : 0.7;
    case "eat":
      if (hunger < 50) return 0;
      if (lastFedAt && now - lastFedAt < 30_000) return 0;
      return 2 + hunger / 16;
    default:
      return 0;
  }
}

export function chooseEnvironmentTarget(dog, now = Date.now()) {
  const candidates = getDogEnvironmentTargets(dog)
    .map((target) => ({
      ...target,
      weight: getNeedWeight(target, dog, now),
    }))
    .filter((target) => target.weight > 0);

  if (!candidates.length) return null;

  const totalWeight = candidates.reduce(
    (sum, target) => sum + Number(target.weight || 0),
    0
  );
  if (totalWeight <= 0) return null;

  let roll = Math.random() * totalWeight;
  for (const candidate of candidates) {
    roll -= Number(candidate.weight || 0);
    if (roll <= 0) {
      return {
        id: candidate.id,
        type: candidate.type,
        label: candidate.label,
        interaction: candidate.interaction,
        toyId: candidate.toyId || null,
        interactionRadius: candidate.interactionRadius,
        x: candidate.x,
        y: candidate.y,
      };
    }
  }

  const fallback = candidates[0];
  return fallback
    ? {
        id: fallback.id,
        type: fallback.type,
        label: fallback.label,
        interaction: fallback.interaction,
        toyId: fallback.toyId || null,
        interactionRadius: fallback.interactionRadius,
        x: fallback.x,
        y: fallback.y,
      }
    : null;
}
