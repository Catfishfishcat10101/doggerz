import { describe, expect, it } from "vitest";

import {
  getManifestAnimMeta,
  resolveDogAnimationState,
  resolveManifestAnimKey,
  resolveViewportAnim,
} from "@/components/dog/dogAnimationEngine.js";

describe("dogAnimationEngine", () => {
  it("resolves feed actions through the shared manifest alias chain", () => {
    const state = resolveDogAnimationState({
      lifeStage: { stage: "PUPPY" },
      cleanlinessTier: "FRESH",
      lastAction: "feed",
      stats: { happiness: 40, health: 100 },
      memory: {},
    });

    expect(state.requestedAnim).toBe("eat");
    expect(state.anim).toBe("eat");
    expect(state.manifestMeta.key).toBe("eat");
  });

  it("routes water actions through the central behavior map", () => {
    const state = resolveDogAnimationState({
      lifeStage: { stage: "PUPPY" },
      cleanlinessTier: "FRESH",
      lastAction: "water",
      stats: { happiness: 40, health: 100 },
      memory: {},
    });

    expect(state.requestedAnim).toBe("drink");
    expect(state.anim).toBe("drink");
  });

  it("routes rest actions through the central behavior map", () => {
    const state = resolveDogAnimationState({
      lifeStage: { stage: "ADULT" },
      cleanlinessTier: "FRESH",
      lastAction: "rest",
      stats: { happiness: 50, health: 100 },
      memory: {},
    });

    expect(state.requestedAnim).toBe("idle_resting");
    expect(state.anim).toBe("idle_resting");
  });

  it("uses the expanded ai behavior map for begging", () => {
    const state = resolveDogAnimationState({
      lifeStage: { stage: "PUPPY" },
      cleanlinessTier: "FRESH",
      aiState: "beg",
      stats: { happiness: 40, health: 100 },
      memory: {},
    });

    expect(state.requestedAnim).toBe("beg");
    expect(state.anim).toBe("beg");
  });

  it("uses deep rem sleep when the dog is asleep and dreaming", () => {
    const state = resolveDogAnimationState({
      lifeStage: { stage: "ADULT" },
      cleanlinessTier: "FRESH",
      isAsleep: true,
      dreams: { active: { id: "dream-1" } },
      stats: { happiness: 50, health: 100 },
    });

    expect(state.isSleeping).toBe(true);
    expect(state.restState).toBe("deep_rem_sleep");
  });

  it("limits high impact senior animations when joint stiffness is high", () => {
    const state = resolveDogAnimationState({
      lifeStage: { stage: "SENIOR" },
      cleanlinessTier: "FRESH",
      lastAction: "fetch",
      healthSilo: { jointStiffness: 80 },
      stats: { happiness: 50, health: 100 },
    });

    expect(state.requestedAnim).toBe("walk");
    expect(state.anim).toBe("walk");
  });

  it("forces canonical walk playback while moving in the viewport", () => {
    expect(
      resolveViewportAnim({
        anim: "idle",
        behaviorState: "walk",
        dogIsSleeping: false,
      })
    ).toBe("walk");
  });

  it("exposes manifest metadata from the shared engine", () => {
    expect(resolveManifestAnimKey("sleep")).toBe("sleep");
    expect(getManifestAnimMeta("walk")).toMatchObject({
      key: "walk",
      rowIndex: 1,
      frames: 16,
    });
  });
});
