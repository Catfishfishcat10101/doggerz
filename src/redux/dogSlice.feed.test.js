import { describe, expect, it } from "vitest";

import dogReducer, { feed, quickFeed } from "@/redux/dogSlice.js";

describe("dogSlice feeding reducers", () => {
  it("handles feed with missing legacy state branches", () => {
    const corruptedState = {
      ...dogReducer(undefined, { type: "@@INIT" }),
      stats: null,
      memory: null,
      inventory: null,
    };

    const next = dogReducer(
      corruptedState,
      feed({ now: Date.now(), foodType: "regular_kibble" })
    );

    expect(next).toBeTruthy();
    expect(next.stats).toBeTruthy();
    expect(Number.isFinite(Number(next.stats.hunger))).toBe(true);
    expect(next.memory).toBeTruthy();
    expect(Number.isFinite(Number(next.memory.lastFedAt))).toBe(true);
    expect(next.inventory).toBeTruthy();
  });

  it("handles quickFeed with missing memory and stats", () => {
    const corruptedState = {
      ...dogReducer(undefined, { type: "@@INIT" }),
      stats: undefined,
      memory: undefined,
    };

    const next = dogReducer(corruptedState, quickFeed({ now: Date.now() }));

    expect(next).toBeTruthy();
    expect(next.stats).toBeTruthy();
    expect(next.memory).toBeTruthy();
    expect(next.stats.energy).toBe(100);
  });
});
