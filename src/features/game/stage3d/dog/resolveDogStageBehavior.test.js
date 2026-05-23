import { describe, expect, it } from "vitest";

import { resolveDogStageBehavior } from "./resolveDogStageBehavior.js";

describe("resolveDogStageBehavior", () => {
  it.each([
    ["speak", "Speak"],
    ["sit_pretty", "Sit_Pretty"],
    ["roll_over", "Roll_Over"],
    ["spin", "Spin"],
    ["crawl", "Crawl"],
    ["play_dead", "Play_Dead"],
    ["backflip", "Backflip"],
    ["high_five", "High_Five"],
  ])("uses the trained command clip for recent %s actions", (action, clip) => {
    const behavior = resolveDogStageBehavior(
      {
        energyPct: 80,
        happinessPct: 80,
        bondPct: 80,
        healthPct: 100,
        lastAction: action,
        lastCareResponse: { createdAt: 10_000 },
      },
      11_000
    );

    expect(behavior.clip).toBe(clip);
    expect(behavior.id).toBe(`action:${action}`);
  });
});
