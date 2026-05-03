// src/components/dog/simulation/DogSimulationEngine.js
/** @format */

import {
  addMemories,
  giveWater,
  play,
  rest,
  simulationTick,
  tickDog,
  tickDogPolls,
  tryConsumeFoodBowl,
} from "@/store/dogSlice.js";
import {
  getDogStateDurationMs,
  resolveEmergencyDogState,
} from "@/components/dog/DogAIStateMachine.js";
import { updateDogMovement } from "@/components/dog/DogMovementSystem.js";
import { createMemoryEvent } from "@/components/dog/DogMemoryEvents.js";
import { generateDream } from "@/components/dog/DogDreamEngine.js";
import { generateMemoryFromTransition } from "@/components/dog/memory/DogStateTransitionMemory.js";
import {
  buildDogBrainState,
  evaluateDogBrain,
} from "@/features/dog/brain/DogBrain.js";
import { applyBrainDecision } from "@/features/dog/brain/applyBrainDecision.js";

let simulationRunning = false;
let interval = null;
let lastWorldTickAt = 0;
let lastSimTickAt = 0;

const WORLD_TICK_MS = 60_000;
const DREAM_SLEEP_ROLL_CHANCE = 0.15;
const DREAM_SLEEP_MIN_INTERVAL_MS = 2 * 60 * 60 * 1000;

function getLocalTimeBucket(ms = Date.now()) {
  try {
    const hour = new Date(ms).getHours();
    if (hour >= 21 || hour < 6) return "night";
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  } catch {
    return "local";
  }
}

function normalizeTickMs(value) {
  const ms = Number(value);
  if (!Number.isFinite(ms) || ms <= 0) return 1_000;
  return Math.max(1_000, Math.floor(ms));
}

function handleEnvironmentInteraction(store, interaction, now) {
  if (!interaction || typeof interaction !== "object") return;

  if (interaction.kind === "drink") {
    store?.dispatch?.(
      giveWater({
        now,
        amount: 70,
        action: "water",
      })
    );
    return;
  }

  if (interaction.kind === "play") {
    store?.dispatch?.(
      play({
        now,
        toyId: interaction.toyId || "toy_tennis_ball_basic",
        action: "play",
      })
    );
    return;
  }

  if (interaction.kind === "rest") {
    store?.dispatch?.(
      rest({
        now,
        action: "rest",
        napSpotId:
          interaction.id === "apartment-bed"
            ? "indoors"
            : interaction.type === "doghouse"
              ? "doghouse"
              : "yard",
      })
    );
    return;
  }

  if (interaction.kind === "eat") {
    store?.dispatch?.(
      tryConsumeFoodBowl({
        now,
        hungerThreshold: 0,
        action: "feed",
      })
    );
    return;
  }

  if (interaction.kind === "dig") {
    store?.dispatch?.(
      simulationTick({
        now,
        aiState: "dig",
        aiStateUntilAt: now + getDogStateDurationMs("dig"),
        mood: "restless",
        action: "digging",
      })
    );
    store?.dispatch?.(
      addMemories([
        createMemoryEvent("found_dig_spot", {
          category: "MEMORY",
          moodTag: "CURIOUS",
          summary: "Stopped to dig.",
          body: "Your pup reached a promising patch of ground and immediately started digging.",
          position: interaction.position || null,
          happiness: 2,
        }),
      ])
    );
    return;
  }

  if (interaction.kind === "tree_pause") {
    store?.dispatch?.(
      simulationTick({
        now,
        aiState: "idle",
        aiStateUntilAt: now + getDogStateDurationMs("idle"),
        mood: "calm",
        action: "idle",
      })
    );
    store?.dispatch?.(
      addMemories([
        createMemoryEvent("wandered", {
          category: "MEMORY",
          moodTag: "CALM",
          summary: "Paused under the tree.",
          body: "Your pup drifted into the shade and took a quiet moment to sniff and settle.",
          position: interaction.position || null,
          happiness: 1,
        }),
      ])
    );
  }
}

export function startDogSimulation(store, options = {}) {
  if (simulationRunning || interval) return interval;

  simulationRunning = true;

  const tickMs = normalizeTickMs(options?.tickMs);
  const now = Date.now();
  lastWorldTickAt = now;
  lastSimTickAt = now;

  interval = setInterval(() => {
    const now = Date.now();
    if (typeof document !== "undefined" && document.hidden) {
      lastSimTickAt = now;
      return;
    }

    const state = store?.getState?.();
    const dog = state?.dog;

    if (!dog?.adoptedAt) return;

    const deltaMs = Math.max(0, now - lastSimTickAt);
    lastSimTickAt = now;
    const deltaSeconds = Math.max(0.001, deltaMs / 1000);
    const result = runSimulation(dog, { now, deltaSeconds });
    const updates = result?.updates || null;
    const memories = Array.isArray(result?.memories) ? result.memories : [];

    if (updates) {
      store?.dispatch?.(
        simulationTick({
          ...updates,
          now,
        })
      );
    }

    if (memories.length) {
      store?.dispatch?.(addMemories(memories));
    }

    if (result?.interaction) {
      handleEnvironmentInteraction(store, result.interaction, now);
    }

    const dreamState =
      dog?.dreams && typeof dog.dreams === "object" ? dog.dreams : null;
    const lastDreamAt = Number(dreamState?.lastGeneratedAt || 0);
    if (
      String(dog?.aiState || "").toLowerCase() === "sleep" &&
      (!lastDreamAt || now - lastDreamAt >= DREAM_SLEEP_MIN_INTERVAL_MS) &&
      Math.random() < DREAM_SLEEP_ROLL_CHANCE
    ) {
      const dream = generateDream(dog?.memories);
      if (dream) {
        store?.dispatch?.({
          type: "dog/addDream",
          payload: dream,
        });
      }
    }

    if (now - lastWorldTickAt < WORLD_TICK_MS) return;

    lastWorldTickAt = now;
    store?.dispatch?.(
      tickDog({
        now,
        weather: state?.weather?.condition || null,
        timeBucket: getLocalTimeBucket(now),
        source: "simulation_engine",
      })
    );
    store?.dispatch?.(tickDogPolls({ now }));
  }, tickMs);

  return interval;
}

export function stopDogSimulation() {
  simulationRunning = false;
  if (!interval) return;
  clearInterval(interval);
  interval = null;
  lastWorldTickAt = 0;
  lastSimTickAt = 0;
}

export function runSimulation(
  dog,
  { now = Date.now(), deltaSeconds = 1 } = {}
) {
  const stats = dog?.stats && typeof dog.stats === "object" ? dog.stats : {};
  const changes = {};
  const memories = [];
  const movement = updateDogMovement(dog, deltaSeconds);
  const arrivedTarget =
    dog?.targetPosition &&
    movement &&
    Object.hasOwn(movement, "targetPosition") &&
    movement.targetPosition === null
      ? dog.targetPosition
      : null;
  if (movement) {
    if (movement.position) {
      changes.position = movement.position;
    }
    if (Object.hasOwn(movement, "targetPosition")) {
      changes.targetPosition = movement.targetPosition;
    }
    if (movement.facing) {
      changes.facing = movement.facing;
    }
  }

  const currentAiState = String(dog?.aiState || "idle")
    .trim()
    .toLowerCase();
  const holdUntil = Number(dog?.aiStateUntilAt || 0);
  const resolvedTargetPosition = Object.hasOwn(changes, "targetPosition")
    ? changes.targetPosition
    : dog?.targetPosition || null;
  const dogAfterNeeds = {
    ...dog,
    position: changes.position || dog?.position,
    targetPosition: resolvedTargetPosition,
    facing: changes.facing || dog?.facing,
    stats: {
      ...stats,
    },
  };
  let nextState = movement?.aiState || "";
  let interaction = null;
  const emergencyState = resolveEmergencyDogState(dogAfterNeeds);
  if (!nextState) {
    const brainDecision = evaluateDogBrain(buildDogBrainState(dogAfterNeeds), {
      now,
    });
    const brainResult = applyBrainDecision({
      dog: dogAfterNeeds,
      decision: brainDecision,
      now,
      currentAiState,
      holdUntil,
      currentTarget: resolvedTargetPosition,
      emergencyState,
    });

    if (Object.hasOwn(brainResult || {}, "targetPosition")) {
      changes.targetPosition = brainResult?.targetPosition || null;
    }
    if (brainResult?.action) {
      changes.action = brainResult.action;
    }
    if (brainResult?.mood) {
      changes.mood = brainResult.mood;
    }
    if (
      brainResult?.startedWalk &&
      brainResult?.targetPosition &&
      String(brainResult?.targetPosition?.type || "").toLowerCase() !==
        "brain_wander"
    ) {
      const targetPosition = brainResult.targetPosition;
      memories.push(
        createMemoryEvent("wandered", {
          category: "MEMORY",
          moodTag: "CURIOUS",
          summary: targetPosition.label
            ? `Headed toward the ${targetPosition.label}.`
            : "Set off for a calm stroll.",
          body: targetPosition.label
            ? `Your pup calmly wandered toward the ${targetPosition.label}.`
            : "Your pup picked a nearby spot and started a gentle yard stroll.",
          position: targetPosition,
          happiness: 1,
        })
      );
    }

    nextState = brainResult?.aiState || "idle";
  } else if (emergencyState && emergencyState !== nextState) {
    nextState = emergencyState;
  }

  if (arrivedTarget && typeof arrivedTarget === "object") {
    interaction = {
      kind: String(arrivedTarget.interaction || "")
        .trim()
        .toLowerCase(),
      targetId: String(arrivedTarget.id || ""),
      targetType: String(arrivedTarget.type || ""),
      position: {
        x: Number(arrivedTarget.x || dogAfterNeeds?.position?.x || 0),
        y: Number(arrivedTarget.y || dogAfterNeeds?.position?.y || 0),
      },
      toyId: arrivedTarget.toyId || null,
    };
    nextState = "idle";
  }

  if (nextState !== currentAiState) {
    memories.push(
      ...generateMemoryFromTransition(currentAiState, nextState, dogAfterNeeds)
    );
  }

  changes.aiState = nextState;
  if (nextState !== currentAiState || holdUntil <= now) {
    changes.aiStateUntilAt = now + getDogStateDurationMs(nextState);
  }

  if (nextState === "scratch") {
    changes.mood = "dirty";
  } else if (nextState === "beg") {
    changes.mood = "hungry";
  } else if (nextState === "sleep") {
    changes.mood = "tired";
  } else if (nextState === "dig") {
    changes.mood = "restless";
  }

  if (!dog?.isAsleep && !changes.action) {
    if (nextState === "bark") {
      changes.action = "bark";
    } else if (nextState === "walk") {
      changes.action = "walk";
    } else if (nextState === "dig") {
      changes.action = "digging";
    } else if (nextState === "beg") {
      changes.action = "paw";
    } else if (nextState === "scratch") {
      changes.action = "scratch";
    } else if (nextState === "sleep") {
      changes.action = "sleep";
    }
  }

  if (!Object.keys(changes).length && !memories.length) {
    return null;
  }

  return {
    updates: Object.keys(changes).length ? changes : null,
    memories,
    interaction,
  };
}

export const calculateDogChanges = (dog) =>
  runSimulation(dog, { deltaSeconds: 1 })?.updates || null;
