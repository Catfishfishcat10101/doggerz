// src/components/dog/DogEnvironmentTargets.js
import {
  DOG_WORLD_HEIGHT,
  DOG_WORLD_WIDTH,
  chooseWanderTarget,
} from "@/components/dog/simulation/DogWanderBehavior.js";

function baseTargets() {
  return [
    {
      id: "yard_center",
      type: "yard",
      label: "Yard",
      interaction: "wander",
      x: DOG_WORLD_WIDTH * 0.5,
      y: DOG_WORLD_HEIGHT * 0.74,
      interactionRadius: 36,
    },
    {
      id: "doghouse",
      type: "rest",
      label: "Doghouse",
      interaction: "rest",
      x: DOG_WORLD_WIDTH * 0.22,
      y: DOG_WORLD_HEIGHT * 0.7,
      interactionRadius: 42,
    },
    {
      id: "shade_tree",
      type: "sniff",
      label: "Shade tree",
      interaction: "sniff",
      x: DOG_WORLD_WIDTH * 0.78,
      y: DOG_WORLD_HEIGHT * 0.66,
      interactionRadius: 40,
    },
  ];
}

export function getDogEnvironmentTargets(dog = {}) {
  const targets = baseTargets();
  const foodBowl = dog?.yard?.foodBowl;
  if (foodBowl?.active) {
    targets.push({
      id: "food_bowl",
      type: "food",
      label: "Food bowl",
      interaction: "food",
      x: Number(foodBowl.x || DOG_WORLD_WIDTH * 0.62),
      y: Number(foodBowl.y || DOG_WORLD_HEIGHT * 0.74),
      interactionRadius: 34,
    });
  }
  return targets;
}

export function chooseEnvironmentTarget(dog = {}, now = Date.now()) {
  const targets = getDogEnvironmentTargets(dog);
  const needsRest =
    dog?.isAsleep ||
    dog?.sleeping ||
    Number(dog?.stats?.energy ?? 100) <= 22;
  if (needsRest) {
    return targets.find((target) => target.interaction === "rest") || targets[0];
  }
  return (
    targets.find((target) => target.interaction === "sniff") ||
    chooseWanderTarget(now)
  );
}
