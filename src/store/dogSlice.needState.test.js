// src/store/dogSlice.needState.test.js
import { describe, expect, it } from "vitest";

import dogReducer, {
  addMemories,
  claimDailyReward,
  feed,
  giveWater,
  goPotty,
  hydrateDog,
  petDog,
  play,
  setAdoptedAt,
  trainObedience,
} from "@/store/dogSlice.js";

const MINUTE_MS = 60_000;

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

  it("derives emotional state from treatment memories instead of raw happiness edits", () => {
    const { state, now } = buildActiveDogState({
      stats: {
        happiness: 20,
      },
    });

    const baselineScore = state.memory.treatment.score;
    expect(baselineScore).toBeGreaterThan(60);
    expect(state.stats.happiness).toBe(baselineScore);

    const caredFor = dogReducer(
      state,
      addMemories([
        {
          type: "petted",
          category: "CARE",
          moodTag: "AFFECTIONATE",
          summary: "Shared calm attention.",
          timestamp: now + 1_000,
          happiness: 4,
        },
      ])
    );

    expect(caredFor.memory.treatment.score).toBeGreaterThan(baselineScore);
    expect(caredFor.stats.happiness).toBe(caredFor.memory.treatment.score);
    expect(caredFor.memory.treatment.positiveCareCount).toBeGreaterThan(0);

    const routineSlipped = dogReducer(
      caredFor,
      addMemories([
        {
          type: "accident",
          category: "NEGLECT",
          moodTag: "UNEASY",
          summary: "Routine slipped.",
          timestamp: now + 2_000,
          happiness: -3,
        },
      ])
    );

    expect(routineSlipped.memory.treatment.score).toBeLessThan(
      caredFor.memory.treatment.score
    );
    expect(routineSlipped.memory.treatment.negativeCareCount).toBeGreaterThan(
      0
    );
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

  it("records trick xp, success chance, and animation outcome for obedience practice", () => {
    const { state, now } = buildActiveDogState({
      stats: {
        energy: 78,
        happiness: 76,
        hunger: 18,
        thirst: 18,
      },
    });
    const readyState = dogReducer(
      state,
      hydrateDog({
        level: 3,
        bond: { value: 45, updatedAt: now },
        training: {
          potty: {
            successCount: 5,
            goal: 5,
            completedAt: now - MINUTE_MS,
          },
        },
      })
    );

    const nextState = dogReducer(
      readyState,
      trainObedience({
        now,
        commandId: "sit",
        success: true,
        forcedReaction: { kind: "obey" },
      })
    );

    expect(["train", "train_perfect"]).toContain(nextState.lastAction);
    expect(nextState.skills.obedience.sit.xp).toBeGreaterThan(0);
    expect(nextState.memory.lastTrainingOutcome).toMatchObject({
      commandId: "sit",
      success: true,
      animationKey: "sit",
    });
    expect(nextState.memory.lastTrainingOutcome.xpGained).toBeGreaterThan(0);
    expect(nextState.memory.lastTrainingOutcome.successChance).toBeGreaterThan(
      0
    );
  });

  it("claims the day-seven reward as coins, accessory, streak memory, and dog reaction", () => {
    const rewardNow = Date.now();
    const { state, now } = buildActiveDogState({
      now: rewardNow,
      memory: {
        lastSeenAt: rewardNow - 24 * 60 * MINUTE_MS,
      },
    });

    const nextState = dogReducer(
      state,
      claimDailyReward({
        now,
        day: 7,
        reward: {
          day: 7,
          type: "BUNDLE",
          value: 500,
          accessoryId: "tag_star",
          label: "500 Coins + Star Tag",
        },
      })
    );

    expect(nextState.coins).toBeGreaterThanOrEqual(500);
    expect(nextState.consecutiveDays).toBe(7);
    expect(nextState.lastAction).toBe("daily_reward");
    expect(nextState.cosmetics.unlockedIds).toContain("tag_star");
    expect(nextState.cosmetics.equipped.tag).toBe("tag_star");
    expect(nextState.lastCareResponse?.message).toMatch(/Streak 7 is saved/i);
    expect(
      nextState.memories.some((memory) => memory.type === "daily_reward")
    ).toBe(true);
  });

  it("records an offline return reaction when Fireball was away for hours", () => {
    const prior = Date.now() - 4 * 60 * MINUTE_MS;
    const { state } = buildActiveDogState({
      now: prior,
      stats: {
        hunger: 88,
        energy: 42,
      },
      memory: {
        lastSeenAt: prior,
        lastFedAt: prior - 5 * 60 * MINUTE_MS,
        neglectStrikes: 1,
      },
    });

    const nextState = dogReducer(
      state,
      hydrateDog({
        lastUpdatedAt: prior,
        memory: {
          ...state.memory,
          lastReturnReactionAt: null,
        },
      })
    );

    expect(nextState.lastAction).toBe("return_annoyed");
    expect(nextState.memory.lastReturnReaction).toMatchObject({
      reaction: "annoyed",
    });
    expect(
      nextState.memories.some((memory) => memory.type === "return_moment")
    ).toBe(true);
    expect(nextState.lastCareResponse?.message).toMatch(/gap|reassurance/i);
  });

  it("records potty success timestamps and resets potty pressure", () => {
    const { state, now } = buildActiveDogState({
      pottyLevel: 96,
    });

    const nextState = dogReducer(
      state,
      goPotty({ now: now + 1_000, forceSuccess: true })
    );

    expect(["potty", "guilty_paws"]).toContain(nextState.lastAction);
    expect(nextState.pottyLevel).toBe(0);
    expect(nextState.potty.lastSuccessAt).toBe(now + 1_000);
    expect(nextState.potty.lastPottySuccessAt).toBe(now + 1_000);
    expect(nextState.potty.lastOutdoorTripAt).toBe(now + 1_000);
    expect(nextState.potty.totalSuccesses).toBeGreaterThan(0);
  });

  it("prevents generated accidents for 90 minutes after potty success", () => {
    const { state, now } = buildActiveDogState({
      pottyLevel: 98,
    });
    const successAt = now + 1_000;
    const afterSuccess = dogReducer(
      state,
      goPotty({ now: successAt, forceSuccess: true })
    );
    const pressuredState = {
      ...afterSuccess,
      pottyLevel: 99,
      lastUpdatedAt: successAt,
      potty: {
        ...afterSuccess.potty,
        lastAccidentAt: now - 15 * MINUTE_MS,
      },
    };

    const nextState = dogReducer(
      pressuredState,
      feed({
        now: successAt + 89 * MINUTE_MS,
        foodType: "regular_kibble",
      })
    );

    expect(nextState.lastAction).not.toBe("accident");
    expect(nextState.potty.lastAccidentAt).toBe(now - 15 * MINUTE_MS);
    expect(nextState.potty.totalAccidents).toBe(
      pressuredState.potty.totalAccidents
    );
  });

  it("keeps generated accident risk low for the next 90 minutes", () => {
    const { state, now } = buildActiveDogState({
      pottyLevel: 98,
    });
    const successAt = now + 1_000;
    const afterSuccess = dogReducer(
      state,
      goPotty({ now: successAt, forceSuccess: true })
    );
    const pressuredState = {
      ...afterSuccess,
      pottyLevel: 99,
      lastUpdatedAt: successAt,
    };

    const nextState = dogReducer(
      pressuredState,
      feed({
        now: successAt + 120 * MINUTE_MS,
        foodType: "regular_kibble",
      })
    );

    expect(nextState.lastAction).not.toBe("accident");
    expect(nextState.potty.totalAccidents).toBe(
      pressuredState.potty.totalAccidents
    );
  });
});
