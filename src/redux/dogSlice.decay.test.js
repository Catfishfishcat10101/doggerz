import { describe, expect, it } from "vitest";

import dogReducer, { feed, registerSessionStart } from "@/redux/dogSlice.js";

function buildAwayState({
  now,
  hoursAway = 8,
  unlockedIds = [],
  level = 8,
} = {}) {
  const base = dogReducer(undefined, { type: "@@INIT" });
  return {
    ...base,
    level,
    adoptedAt: now - 20 * 24 * 60 * 60 * 1000,
    lifecycleStatus: "ACTIVE",
    lastUpdatedAt: now - hoursAway * 60 * 60 * 1000,
    lastAction: "idle",
    lifeStage: {
      stage: "ADULT",
      label: "Adult",
      days: 400,
    },
    stats: {
      ...base.stats,
      hunger: 50,
      thirst: 40,
      happiness: 60,
      energy: 60,
      cleanliness: 60,
      health: 80,
    },
    pottyLevel: 0,
    potty: {
      ...base.potty,
      totalAccidents: 0,
    },
    memory: {
      ...base.memory,
      lastFedAt: now - 10 * 60 * 60 * 1000,
      lastSeenAt: now - hoursAway * 60 * 60 * 1000,
    },
    skillTree: {
      unlockedIds,
      lastUnlockedId: unlockedIds[unlockedIds.length - 1] || null,
      lastUnlockedAt: null,
      lastBranchId: null,
    },
  };
}

describe("dogSlice decay balance", () => {
  it("keeps a normal 8-hour absence playable", () => {
    const now = Date.now();
    const start = buildAwayState({ now, hoursAway: 8, unlockedIds: [] });

    const next = dogReducer(start, registerSessionStart({ now }));

    expect(next.potty.totalAccidents).toBe(0);
    expect(next.pottyLevel).toBeGreaterThan(0);
    expect(next.pottyLevel).toBeLessThan(60);
    expect(next.stats.health).toBeGreaterThanOrEqual(79);
    expect(next.stats.energy).toBeGreaterThanOrEqual(56);
    expect(next.stats.happiness).toBeGreaterThanOrEqual(56);
    expect(next.stats.hunger).toBeGreaterThan(50);
    expect(next.stats.hunger).toBeLessThanOrEqual(55);
  });

  it("lets guardian routine perks meaningfully soften workday strain", () => {
    const now = Date.now();
    const baseline = dogReducer(
      buildAwayState({ now, hoursAway: 8, unlockedIds: [] }),
      registerSessionStart({ now })
    );
    const protectedState = dogReducer(
      buildAwayState({
        now,
        hoursAway: 8,
        unlockedIds: [
          "tidy-patrol",
          "cozy-fort",
          "weather-watch",
          "accident-shield",
        ],
      }),
      registerSessionStart({ now })
    );

    expect(protectedState.stats.hunger).toBeLessThan(baseline.stats.hunger);
    expect(protectedState.stats.thirst).toBeLessThan(baseline.stats.thirst);
    expect(protectedState.pottyLevel).toBeLessThan(baseline.pottyLevel);
  });

  it("keeps active dogs at one health instead of dropping to zero from neglect", () => {
    const now = Date.now();
    const start = {
      ...buildAwayState({ now, hoursAway: 4 }),
      stats: {
        ...buildAwayState({ now, hoursAway: 4 }).stats,
        hunger: 97,
        cleanliness: 5,
        health: 2,
      },
      memory: {
        ...buildAwayState({ now, hoursAway: 4 }).memory,
        neglectStrikes: 3,
      },
    };

    const next = dogReducer(start, registerSessionStart({ now }));

    expect(next.lifecycleStatus).toBe("ACTIVE");
    expect(next.stats.health).toBe(1);
  });

  it("does not let junk-food penalties push active dogs to zero health", () => {
    const now = Date.now();
    const base = buildAwayState({ now, hoursAway: 0 });
    const start = {
      ...base,
      lastUpdatedAt: now,
      stats: {
        ...base.stats,
        health: 1,
        hunger: 80,
      },
      memory: {
        ...base.memory,
        lastSeenAt: now,
      },
    };

    const next = dogReducer(start, feed({ now, foodType: "junk_food" }));

    expect(next.lifecycleStatus).toBe("ACTIVE");
    expect(next.stats.health).toBe(1);
  });
});
