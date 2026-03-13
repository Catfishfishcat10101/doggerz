import {
  getObedienceSkillMasteryPct,
  resolveJrtTrainingReaction,
} from "@/logic/jrtTrainingController.js";

function createQueuedRng(values = []) {
  const queue = [...values];
  return () => {
    if (!queue.length) return 0.5;
    return queue.shift();
  };
}

describe("jrtTrainingController", () => {
  it("converts obedience progress into a capped mastery percent", () => {
    expect(getObedienceSkillMasteryPct(null)).toBe(0);
    expect(getObedienceSkillMasteryPct({ xp: 200, level: 4 })).toBe(47);
    expect(getObedienceSkillMasteryPct({ xp: 1000, level: 20 })).toBe(100);
  });

  it("triggers zoomies when energy is extreme and the roll lands in range", () => {
    const reaction = resolveJrtTrainingReaction({
      commandId: "sit",
      unlockedIds: ["sit", "spin"],
      skillNode: { xp: 0, level: 0 },
      stats: {
        energy: 96,
        hunger: 20,
        happiness: 88,
        cleanliness: 90,
      },
      bond: 28,
      archetypeId: "ATHLETE",
      isSpicy: true,
      profile: {
        dynamicStates: { frustration: 24, confidence: 66 },
        trust: { score: 34 },
        coreTemperament: {
          inquisitiveness: 42,
          energyCeiling: 94,
        },
        bigFive: { extroversion: 72 },
      },
      rng: createQueuedRng([0.25, 0.01]),
    });

    expect(reaction.kind).toBe("zoomies");
    expect(reaction.performedActionId).toBe("zoomies");
  });

  it("can ignore a cue when trust is low and need pressure is high", () => {
    const reaction = resolveJrtTrainingReaction({
      commandId: "shake",
      unlockedIds: ["sit", "speak", "shake", "spin"],
      skillNode: { xp: 0, level: 0 },
      stats: {
        energy: 62,
        hunger: 86,
        happiness: 40,
        cleanliness: 92,
      },
      bond: 12,
      archetypeId: "MISCHIEVOUS",
      isSpicy: true,
      profile: {
        dynamicStates: { frustration: 68, confidence: 28 },
        trust: { score: 18 },
        coreTemperament: {
          inquisitiveness: 74,
          energyCeiling: 70,
        },
        bigFive: { extroversion: 44 },
      },
      rng: createQueuedRng([0.3, 0.1]),
    });

    expect(reaction.kind).toBe("ignore");
    expect(["sniff", "scratch", "idle", "dig", "bark"]).toContain(
      reaction.performedActionId
    );
  });

  it("can reinterpret a cue into a different show-off trick", () => {
    const reaction = resolveJrtTrainingReaction({
      commandId: "sit",
      unlockedIds: ["sit", "spin", "sitPretty"],
      skillNode: { xp: 280, level: 5 },
      stats: {
        energy: 84,
        hunger: 18,
        happiness: 86,
        cleanliness: 88,
      },
      bond: 84,
      archetypeId: "SHADOW",
      isSpicy: false,
      profile: {
        dynamicStates: { frustration: 14, confidence: 92 },
        trust: { score: 82 },
        coreTemperament: {
          inquisitiveness: 46,
          energyCeiling: 86,
        },
        bigFive: { extroversion: 90 },
      },
      rng: createQueuedRng([0.2, 0.995]),
    });

    expect(reaction.kind).toBe("reinterpret");
    expect(["spin", "sitPretty"]).toContain(reaction.performedActionId);
    expect(reaction.performedActionId).not.toBe("sit");
  });
});
