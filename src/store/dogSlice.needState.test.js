// src/store/dogSlice.needState.test.js
import { describe, expect, it } from "vitest";

import dogReducer, {
<<<<<<< HEAD
  hydrateDog,
  petDog,
  setAdoptedAt,
=======
  feed,
  giveWater,
  goPotty,
  hydrateDog,
  petDog,
  play,
  setAdoptedAt,
  trainObedience,
>>>>>>> 10f88903 (chore: remove committed backup folders)
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
<<<<<<< HEAD
=======

  it("forms a daily relationship memory from feed, water, potty, and bond care", () => {
    const { state, now } = buildActiveDogState({
      stats: {
        hunger: 82,
        thirst: 78,
        energy: 78,
        happiness: 58,
      },
      pottyLevel: 92,
    });

    let nextState = dogReducer(
      state,
      feed({ now, foodType: "regular_kibble" })
    );
    nextState = dogReducer(nextState, giveWater({ now: now + 1_000 }));
    nextState = dogReducer(
      nextState,
      goPotty({ now: now + 2_000, forceSuccess: true })
    );
    nextState = dogReducer(nextState, play({ now: now + 3_000 }));

    expect(nextState.memory.dailyCareLoop.categories).toEqual(
      expect.arrayContaining(["feed", "water", "potty", "bond"])
    );
    expect(
      nextState.memories.some((memory) => memory.type === "daily_care_loop")
    ).toBe(true);
    expect(nextState.lastCareResponse?.message).toMatch(/play|bond/i);
  });

  it("keeps trick training locked behind potty training", () => {
    const { state, now } = buildActiveDogState();

    const nextState = dogReducer(
      state,
      trainObedience({ now, commandId: "sit" })
    );

    expect(nextState.lastAction).toBe("trainBlocked");
    expect(nextState.lastCareResponse?.message).toMatch(/potty training/i);
  });
>>>>>>> 10f88903 (chore: remove committed backup folders)
});
