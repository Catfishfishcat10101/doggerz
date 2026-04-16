import { describe, expect, it } from "vitest";

import dogReducer, {
  hydrateDog,
  petDog,
  setAdoptedAt,
} from "@/store/dogSlice.js";

function buildActiveDogState(overrides = {}) {
  const now = Number(overrides.now || Date.now());
  const adoptedAt = Math.max(1, now - 60_000);

  let state = dogReducer(undefined, setAdoptedAt(adoptedAt));
  state = dogReducer(
    state,
    hydrateDog({
      adoptedAt,
      lifecycleStatus: "ACTIVE",
      lastUpdatedAt: now,
      memory: {
        lastSeenAt: now,
        lastFedAt: now,
        lastDrankAt: now,
        lastPlayedAt: now,
        ...overrides.memory,
      },
      stats: {
        hunger: 45,
        thirst: 35,
        happiness: 60,
        energy: 62,
        cleanliness: 68,
        health: 82,
        affection: 56,
        mentalStimulation: 58,
        ...overrides.stats,
      },
      pottyLevel: overrides.pottyLevel ?? 0,
      cleanlinessTier: overrides.cleanlinessTier || "FRESH",
      healthSilo: {
        parasiteLoad: 0,
        jointStiffness: 0,
        dentalHealth: 100,
        coatCondition: 100,
        weightStatus: 0,
        ...overrides.healthSilo,
      },
    })
  );

  return { state, now };
}

describe("dogSlice need-state consequences", () => {
  it("surfaces potty urgency as a walk-seeking behavior cue", () => {
    const { state } = buildActiveDogState({
      stats: {
        hunger: 82,
        thirst: 79,
      },
      pottyLevel: 96,
    });

    expect(state.emotionCue).toBe("potty");
    expect(state.animation.desiredAction).toBe("walk");
    expect(state.moodlets.some((entry) => entry.type === "potty")).toBe(true);
    expect(state.moodlets.some((entry) => entry.type === "hungry")).toBe(true);
    expect(state.moodlets.some((entry) => entry.type === "thirsty")).toBe(true);
  });

  it("turns severe thirst into a drink-seeking mood", () => {
    const { state } = buildActiveDogState({
      stats: {
        thirst: 93,
        hunger: 64,
        energy: 72,
      },
      pottyLevel: 24,
    });

    expect(state.emotionCue).toBe("thirsty");
    expect(state.animation.desiredAction).toBe("drink");
  });

  it("lets care actions rebuild affection and reduce neglect pressure", () => {
    const { state, now } = buildActiveDogState({
      stats: {
        affection: 12,
        happiness: 28,
      },
      memory: {
        neglectStrikes: 3,
      },
    });

    const nextState = dogReducer(state, petDog({ now: now + 1_000 }));

    expect(nextState.memory.neglectStrikes).toBe(2);
    expect(nextState.stats.affection).toBeGreaterThan(12);
  });
});
