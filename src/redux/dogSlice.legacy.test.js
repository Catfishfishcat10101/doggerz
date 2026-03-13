import { describe, expect, it } from "vitest";

import dogReducer, { hydrateDog, setAdoptedAt } from "@/redux/dogSlice.js";

describe("dogSlice legacy lifecycle safety", () => {
  it("normalizes seconds-based adoptedAt values and clears impossible farewell hydrate state", () => {
    const now = Date.now();
    const adoptedAtSeconds = Math.floor((now - 3 * 24 * 60 * 60 * 1000) / 1000);
    const baseState = dogReducer(undefined, { type: "@@INIT" });

    const next = dogReducer(
      baseState,
      hydrateDog({
        adoptedAt: adoptedAtSeconds,
        lifecycleStatus: "FAREWELL",
        lifeStage: { stage: "SENIOR", label: "Senior", days: 99999 },
        bond: { value: 100 },
        legacyJourney: {
          farewellLetterAt: now,
          rainbowBridgeReadyAt: now,
          ghostDogUnlocked: true,
          ghostPlayBowPending: true,
          previousDogs: [],
        },
      })
    );

    expect(next.adoptedAt).toBe(adoptedAtSeconds * 1000);
    expect(next.lifeStage.stage).toBe("PUPPY");
    expect(next.lifeStage.days).toBeLessThan(10);
    expect(next.lifecycleStatus).toBe("ACTIVE");
    expect(next.legacyJourney.farewellLetterAt).toBe(null);
    expect(next.legacyJourney.rainbowBridgeReadyAt).toBe(null);
  });

  it("handles Firestore-style adoptedAt timestamps during hydrate", () => {
    const now = Date.now();
    const adoptedAtMs = now - 2 * 24 * 60 * 60 * 1000;
    const baseState = dogReducer(undefined, { type: "@@INIT" });

    const next = dogReducer(
      baseState,
      hydrateDog({
        adoptedAt: { seconds: Math.floor(adoptedAtMs / 1000), nanoseconds: 0 },
        lifecycleStatus: "ACTIVE",
        bond: { value: 85 },
      })
    );

    expect(next.adoptedAt).toBe(Math.floor(adoptedAtMs / 1000) * 1000);
    expect(next.lifeStage.stage).toBe("PUPPY");
    expect(next.lifecycleStatus).toBe("ACTIVE");
  });

  it("can adopt a new puppy from farewell state even with malformed journal data", () => {
    const now = Date.now();
    const base = dogReducer(undefined, { type: "@@INIT" });
    const farewellState = {
      ...base,
      adoptedAt: null,
      lifecycleStatus: "FAREWELL",
      journal: null,
      legacyJourney: {
        ...base.legacyJourney,
        ghostPlayBowPending: true,
        previousDogs: [
          {
            name: "Old Friend",
            outcome: "LONG_LIFE",
            bond: 92,
            favoriteToyId: null,
            ageDays: 179,
            recordedAt: now - 1000,
          },
        ],
      },
    };

    const next = dogReducer(farewellState, setAdoptedAt(now));

    expect(next.lifecycleStatus).toBe("ACTIVE");
    expect(next.adoptedAt).toBe(now);
    expect(next.legacyJourney.ghostPlayBowPending).toBe(false);
    expect(Array.isArray(next.journal.entries)).toBe(true);
  });
});
