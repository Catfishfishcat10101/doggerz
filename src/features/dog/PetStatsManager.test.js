import { describe, expect, it } from "vitest";

import {
  applyPetStatDecay,
  NEEDS_THAT_RISE_WITH_NEGLECT,
} from "@/features/dog/PetStatsManager.js";

describe("PetStatsManager", () => {
  it("uses an explicit neglect map for rising needs", () => {
    expect(NEEDS_THAT_RISE_WITH_NEGLECT.hunger).toBe(true);
    expect(NEEDS_THAT_RISE_WITH_NEGLECT.thirst).toBe(true);
    expect(NEEDS_THAT_RISE_WITH_NEGLECT.energy).toBeUndefined();
  });

  it("ignores invalid decay values instead of zeroing stats", () => {
    const next = applyPetStatDecay({
      stats: {
        happiness: 80,
        hunger: 20,
      },
      decayByStat: {
        happiness: "abc",
        hunger: "nope",
      },
    });

    expect(next.happiness).toBe(80);
    expect(next.hunger).toBe(20);
  });

  it("ignores invalid energy recovery values while sleeping", () => {
    const next = applyPetStatDecay({
      stats: {
        energy: 40,
      },
      decayByStat: {
        energy: 2,
      },
      sleeping: true,
      energyRecoveryGain: "abc",
    });

    expect(next.energy).toBe(40);
  });
});
