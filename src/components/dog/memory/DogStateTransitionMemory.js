/** @format */

import { createMemoryEvent } from "@/components/dog/DogMemoryEvents.js";

function clonePosition(position) {
  if (!position || typeof position !== "object") return null;

  return {
    x: Number(position.x || 0),
    y: Number(position.y || 0),
  };
}

export function generateMemoryFromTransition(prevState, nextState, dog) {
  const memories = [];
  const from = String(prevState || "idle")
    .trim()
    .toLowerCase();
  const to = String(nextState || "idle")
    .trim()
    .toLowerCase();
  const transition = `${from}->${to}`;
  const stats = dog?.stats && typeof dog.stats === "object" ? dog.stats : {};
  const hunger = Number(stats.hunger || 0);
  const energy = Number(stats.energy || 0);

  switch (transition) {
    case "walk->dig":
      memories.push(
        createMemoryEvent("found_dig_spot", {
          category: "MEMORY",
          moodTag: "CURIOUS",
          summary: "Found a digging spot.",
          body: "Your pup wandered over, sniffed the ground, and started digging with purpose.",
          position: clonePosition(dog?.position),
          happiness: 2,
        })
      );
      break;

    case "idle->bark":
      memories.push(
        createMemoryEvent("random_bark", {
          category: "MEMORY",
          moodTag: "ALERT",
          summary: "Let out a random bark.",
          body: "A sudden burst of terrier confidence cut through the yard for no obvious reason.",
          happiness: 1,
        })
      );
      break;

    case "idle->sleep":
    case "walk->sleep":
    case "beg->sleep":
      memories.push(
        createMemoryEvent("fell_asleep", {
          category: "MEMORY",
          moodTag: "CALM",
          summary: "Curled up and fell asleep.",
          body: "All that roaming finally caught up. Your pup settled down for a nap.",
          energy,
          happiness: 1,
        })
      );
      break;

    default:
      break;
  }

  if (to === "beg" && from !== "beg" && hunger >= 90) {
    memories.push(
      createMemoryEvent("begged_for_food", {
        category: "MEMORY",
        moodTag: "HUNGRY",
        summary: "Started begging for food.",
        body: "That look was direct: your pup decided it was absolutely time to be fed.",
        hunger,
        happiness: -2,
      })
    );
  }

  return memories;
}
