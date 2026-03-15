import { describe, expect, it } from "vitest";

import dogReducer, {
  dropFoodBowl,
  hydrateDog,
  setAdoptedAt,
  tickDog,
} from "@/redux/dogSlice.js";

describe("dogSlice yard environment", () => {
  it("normalizes legacy apartment hydrates to yard", () => {
    const baseState = dogReducer(undefined, { type: "@@INIT" });

    const next = dogReducer(
      baseState,
      hydrateDog({
        yard: {
          environment: "apartment",
          holes: [],
          foodBowl: null,
          chewBoneAvailable: false,
        },
      })
    );

    expect(next.yard.environment).toBe("yard");
  });

  it("drops bowls on the floor without apartment-only metadata", () => {
    const now = Date.now();
    let state = dogReducer(undefined, { type: "@@INIT" });
    state = dogReducer(state, setAdoptedAt(now));
    state = dogReducer(
      state,
      dropFoodBowl({ now: now + 1, xNorm: 0.62, yNorm: 0.48, readyDelayMs: 0 })
    );

    expect(state.yard.foodBowl).toMatchObject({
      xNorm: 0.62,
      yNorm: 0.48,
    });
    expect("surface" in state.yard.foodBowl).toBe(false);
    expect("stealReadyAt" in state.yard.foodBowl).toBe(false);

    state = dogReducer(
      {
        ...state,
        stats: {
          ...state.stats,
          hunger: 80,
        },
      },
      tickDog({ now: now + 2 })
    );

    expect(state.yard.foodBowl).toBe(null);
  });
});
