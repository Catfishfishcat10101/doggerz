import { describe, expect, it } from "vitest";

import { resolveJrtTrainingReaction } from "@/features/training/jrtTrainingController.js";

describe("jrtTrainingController", () => {
  it("normalizes camelCase obey actions to snake_case", () => {
    const reaction = resolveJrtTrainingReaction({
      commandId: "rollOver",
      unlockedIds: [],
      stats: {
        energy: 40,
        hunger: 10,
        happiness: 60,
        cleanliness: 90,
      },
      bond: 90,
      profile: {
        dynamicStates: { frustration: 0, confidence: 80 },
        trust: { score: 90 },
        coreTemperament: { inquisitiveness: 10, energyCeiling: 40 },
        bigFive: { extroversion: 60 },
      },
      rng: () => 0.5,
    });

    expect(reaction.kind).toBe("obey");
    expect(reaction.performedActionId).toBe("roll_over");
    expect(reaction.performedCommandId).toBe("rollOver");
  });

  it("normalizes camelCase unlocked ids before picking a showoff action", () => {
    const rolls = [0, 0.99];
    const reaction = resolveJrtTrainingReaction({
      commandId: "sit",
      unlockedIds: ["playDead"],
      skillNode: { level: 10, xp: 20 },
      stats: {
        energy: 72,
        hunger: 5,
        happiness: 80,
        cleanliness: 95,
      },
      bond: 95,
      profile: {
        dynamicStates: { frustration: 0, confidence: 95 },
        trust: { score: 95 },
        coreTemperament: { inquisitiveness: 5, energyCeiling: 72 },
        bigFive: { extroversion: 95 },
      },
      rng: () => rolls.shift() ?? 0.99,
    });

    expect(reaction.kind).toBe("reinterpret");
    expect(reaction.performedActionId).toBe("play_dead");
    expect(reaction.performedCommandId).toBe("playDead");
  });

  it("normalizes spaced and hyphenated action ids consistently", () => {
    const reaction = resolveJrtTrainingReaction({
      commandId: "play dead",
      unlockedIds: [],
      stats: {
        energy: 30,
        hunger: 10,
        happiness: 50,
        cleanliness: 90,
      },
      bond: 90,
      profile: {
        dynamicStates: { frustration: 0, confidence: 70 },
        trust: { score: 90 },
        coreTemperament: { inquisitiveness: 0, energyCeiling: 30 },
        bigFive: { extroversion: 50 },
      },
      rng: () => 0.5,
    });

    expect(reaction.kind).toBe("obey");
    expect(reaction.performedActionId).toBe("play_dead");
  });
});
