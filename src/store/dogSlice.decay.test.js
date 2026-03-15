import { describe, expect, it } from "vitest";

import dogReducer, {
  feed,
  registerSessionStart,
  setAdoptedAt,
} from "@/store/dogSlice.js";

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
    adoptedAt: now - 45 * 24 * 60 * 60 * 1000,
    lifecycleStatus: "ACTIVE",
    lastUpdatedAt: now - hoursAway * 60 * 60 * 1000,
    lastAction: "idle",
    lifeStage: {
      stage: "ADULT",
      label: "Adult",
      days: 45,
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

  it("rescues dogs whose health collapses from prolonged neglect", () => {
    const now = Date.now();
    const start = {
      ...buildAwayState({ now, hoursAway: 48 }),
      stats: {
        ...buildAwayState({ now, hoursAway: 48 }).stats,
        hunger: 97,
        cleanliness: 5,
        health: 2,
      },
      memory: {
        ...buildAwayState({ now, hoursAway: 48 }).memory,
        lastFedAt: now - 48 * 60 * 60 * 1000,
        neglectStrikes: 3,
      },
    };

    const next = dogReducer(start, registerSessionStart({ now }));

    expect(next.lifecycleStatus).toBe("RESCUED");
    expect(next.adoptedAt).toBe(null);
  });

  it("rescues the dog on app reopen after roughly three days without food", () => {
    const now = Date.now();
    const hoursAway = 72;
    const base = buildAwayState({ now, hoursAway });
    const start = {
      ...base,
      stats: {
        ...base.stats,
        hunger: 0,
        cleanliness: 50,
        health: 80,
      },
      memory: {
        ...base.memory,
        lastFedAt: now - hoursAway * 60 * 60 * 1000,
        lastSeenAt: now - hoursAway * 60 * 60 * 1000,
      },
    };

    const next = dogReducer(start, registerSessionStart({ now }));

    expect(next.lifecycleStatus).toBe("RESCUED");
    expect(next.danger.rescueReason).toMatch(/starvation|neglect/i);
    expect(next.adoptedAt).toBe(null);
  });

  it("immediately rescues dogs if a care action reveals zero health", () => {
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

    expect(next.lifecycleStatus).toBe("RESCUED");
    expect(next.adoptedAt).toBe(null);
  });

  it("triggers Rainbow Bridge once the dog reaches 180 real days", () => {
    const now = Date.now();
    const base = dogReducer(undefined, { type: "@@INIT" });
    const adopted = dogReducer(
      base,
      setAdoptedAt(now - 180 * 24 * 60 * 60 * 1000)
    );

    const next = dogReducer(adopted, registerSessionStart({ now }));

    expect(next.lifecycleStatus).toBe("FAREWELL");
    expect(next.adoptedAt).toBe(null);
    expect(next.legacyJourney.farewellLetterAt).toBe(now);
  });

  it("lets farewell win even if a stale lifeStage and zero health would otherwise look rescued", () => {
    const now = Date.now();
    const base = dogReducer(undefined, { type: "@@INIT" });
    const start = {
      ...base,
      adoptedAt: now - 180 * 24 * 60 * 60 * 1000,
      lifecycleStatus: "ACTIVE",
      lastUpdatedAt: now - 72 * 60 * 60 * 1000,
      lifeStage: {
        stage: "SENIOR",
        label: "Senior",
        days: 179,
      },
      stats: {
        ...base.stats,
        hunger: 100,
        cleanliness: 3,
        health: 0,
      },
      memory: {
        ...base.memory,
        lastFedAt: now - 72 * 60 * 60 * 1000,
        lastSeenAt: now - 72 * 60 * 60 * 1000,
        neglectStrikes: 12,
      },
    };

    const next = dogReducer(start, registerSessionStart({ now }));

    expect(next.lifecycleStatus).toBe("FAREWELL");
    expect(next.adoptedAt).toBe(null);
    expect(next.legacyJourney.farewellLetterAt).toBe(now);
  });

  it("protects final-stretch senior dogs from rescue during the last 5 days", () => {
    const now = Date.now();
    const base = dogReducer(undefined, { type: "@@INIT" });
    const start = {
      ...base,
      adoptedAt: now - 179 * 24 * 60 * 60 * 1000,
      lifecycleStatus: "ACTIVE",
      lastUpdatedAt: now - 72 * 60 * 60 * 1000,
      lifeStage: {
        stage: "SENIOR",
        label: "Senior",
        days: 179,
      },
      stats: {
        ...base.stats,
        hunger: 99,
        cleanliness: 5,
        health: 0,
      },
      memory: {
        ...base.memory,
        lastFedAt: now - 72 * 60 * 60 * 1000,
        lastSeenAt: now - 72 * 60 * 60 * 1000,
        neglectStrikes: 12,
      },
    };

    const next = dogReducer(start, registerSessionStart({ now }));

    expect(next.lifecycleStatus).toBe("ACTIVE");
    expect(next.adoptedAt).not.toBe(null);
    expect(next.stats.health).toBe(1);
  });
});
