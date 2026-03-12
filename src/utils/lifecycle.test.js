import { describe, expect, it } from "vitest";

import {
  getLifeStageProgressLabel,
  getLifeStageTransitionCopy,
  getLifeStageUi,
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
});
