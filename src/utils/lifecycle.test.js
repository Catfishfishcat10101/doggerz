import { describe, expect, it } from "vitest";

import {
  calculateDogAge,
  getLifeStageProgressLabel,
  getLifeStageForAge,
  getLifeStageTransitionCopy,
  getLifeStageUi,
  MS_PER_GAME_DAY,
} from "@/utils/lifecycle.js";

describe("lifecycle helpers", () => {
  it("formats next-stage countdown labels", () => {
    expect(
      getLifeStageProgressLabel({
        stage: "PUPPY",
        stageProgressPct: 45,
        daysUntilNextStage: 7,
        nextStage: { label: "Adult" },
      })
    ).toBe("7d to Adult");
  });

  it("uses a stable label for senior dogs without a next stage", () => {
    expect(
      getLifeStageProgressLabel({
        stage: "SENIOR",
        stageProgressPct: 62,
        daysUntilNextStage: null,
        nextStage: null,
      })
    ).toBe("Golden years");
  });

  it("returns stage-specific transition copy", () => {
    const adultCopy = getLifeStageTransitionCopy("ADULT", "PUPPY");
    const seniorUi = getLifeStageUi("SENIOR");

    expect(adultCopy.title).toBe("Adult stage reached");
    expect(adultCopy.ctaLabel).toBe("Start training");
    expect(seniorUi.headline).toBe("Golden years");
  });

  it("uses the new 30/150 day lifecycle thresholds", () => {
    expect(getLifeStageForAge(0).id).toBe("PUPPY");
    expect(getLifeStageForAge(29).id).toBe("PUPPY");
    expect(getLifeStageForAge(30).id).toBe("ADULT");
    expect(getLifeStageForAge(149).id).toBe("ADULT");
    expect(getLifeStageForAge(150).id).toBe("SENIOR");
  });

  it("derives age and stage from adoption timestamps even after the app was closed", () => {
    const now = Date.now();
    const adoptedAt = now - 150 * MS_PER_GAME_DAY;
    const age = calculateDogAge(adoptedAt, now);

    expect(age).toMatchObject({
      days: 150,
      stage: "SENIOR",
      label: "Senior",
    });
  });
});
