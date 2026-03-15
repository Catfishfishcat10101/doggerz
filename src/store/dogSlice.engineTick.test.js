import { describe, expect, it } from "vitest";

import dogReducer, { hydrateDog } from "@/store/dogSlice.js";

describe("dogSlice engine tick bridge", () => {
  it("handles engine/TICK through extraReducers using the shared world tick logic", () => {
    const adoptedAt = Date.now() - 2 * 60 * 60 * 1000;
    const start = dogReducer(
      undefined,
      hydrateDog({
        adoptedAt,
        lifecycleStatus: "ACTIVE",
        lastUpdatedAt: adoptedAt,
        stats: {
          hunger: 40,
          thirst: 40,
          happiness: 70,
          energy: 80,
          cleanliness: 80,
          health: 80,
          affection: 60,
          mentalStimulation: 60,
        },
      })
    );
    const tickNow = Number(start.lastUpdatedAt || adoptedAt) + 60 * 60 * 1000;

    const next = dogReducer(start, {
      type: "engine/TICK",
      payload: {
        now: tickNow,
        source: "test",
      },
    });

    expect(Number(next.lastUpdatedAt || 0)).toBeGreaterThan(0);
    expect(next.lifecycleStatus).toBe("ACTIVE");
    expect(Number(next.lastUpdatedAt || 0)).toBeGreaterThanOrEqual(tickNow);
    expect(next.stats).not.toEqual(start.stats);
  });
});
