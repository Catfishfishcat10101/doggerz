import { describe, expect, it } from "vitest";

import {
  canRunAmbientBehavior,
  getAmbientBehaviorPlan,
} from "./aliveDogBehavior.js";

describe("canRunAmbientBehavior", () => {
  it("rejects ambient when resolver marks one-shot priority", () => {
    const allowed = canRunAmbientBehavior({
      resolution: {
        baseAction: "idle",
        oneShot: false,
        sleeping: false,
        moving: false,
        priorityBucket: "one_shot",
      },
      dog: { stats: { hunger: 20, thirst: 20, energy: 80, cleanliness: 90 } },
      requestedAction: "",
    });

    expect(allowed).toBe(false);
  });

  it("rejects ambient during locomotion", () => {
    const allowed = canRunAmbientBehavior({
      resolution: {
        baseAction: "walk",
        oneShot: false,
        sleeping: false,
        moving: true,
        priorityBucket: "locomotion",
      },
      dog: { stats: { hunger: 20, thirst: 20, energy: 80, cleanliness: 90 } },
      requestedAction: "",
    });

    expect(allowed).toBe(false);
  });

  it("allows ambient during healthy idle base loop", () => {
    const allowed = canRunAmbientBehavior({
      resolution: {
        baseAction: "idle_resting",
        oneShot: false,
        sleeping: false,
        moving: false,
        priorityBucket: "base_idle",
      },
      dog: { stats: { hunger: 25, thirst: 22, energy: 78, cleanliness: 88 } },
      requestedAction: "",
    });

    expect(allowed).toBe(true);
  });

  it("never picks bark or paw as direct ambient clips", () => {
    const blocked = new Set(["bark", "paw"]);

    for (let i = 0; i < 250; i += 1) {
      const plan = getAmbientBehaviorPlan({
        dog: {
          stats: {
            hunger: 24,
            thirst: 21,
            energy: 79,
            cleanliness: 87,
            happiness: 58,
          },
          temperament: { archetype: "spicy" },
        },
        renderModel: {},
        resolution: { baseAction: "idle", priorityBucket: "base_idle" },
        now: 1700000000000 + i * 1000,
      });

      expect(plan).toBeTruthy();
      expect(blocked.has(plan.action)).toBe(false);
    }
  });
});
