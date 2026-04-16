import { describe, expect, it } from "vitest";

import {
  buildPottyGuidanceModel,
  buildTrainingRoadmapModel,
} from "@/features/training/trainingRoadmap.js";

describe("trainingRoadmap", () => {
  it("keeps obedience locked until potty training is mastered", () => {
    const model = buildTrainingRoadmapModel({
      dogName: "Fireball",
      pottyTrack: {
        phase: "learning",
        progressPct: 42,
      },
      unlockedFeatures: ["potty_training_panel"],
      reliableCommandCount: 0,
      masteredCommandCount: 0,
      unlockedSkillIds: [],
    });

    expect(model.steps[0].status).toBe("active");
    expect(model.steps[1].status).toBe("locked");
    expect(model.obedienceUnlocked).toBe(false);
    expect(model.nextFocus.title).toBe("House routine");
  });

  it("shows obedience and specialization once progression is established", () => {
    const model = buildTrainingRoadmapModel({
      dogName: "Fireball",
      pottyTrack: {
        phase: "mastered",
        progressPct: 100,
      },
      unlockedFeatures: ["potty_training_panel", "obedience_training"],
      reliableCommandCount: 2,
      masteredCommandCount: 1,
      unlockedSkillIds: ["lap-loyalty", "comfort-routine"],
      nextMilestone: {
        title: "Bond anchor",
        body: "The bond is starting to feel deeper than maintenance.",
      },
    });

    expect(model.steps[0].status).toBe("complete");
    expect(model.steps[1].status).toBe("complete");
    expect(model.steps[2].status).toBe("active");
    expect(model.milestoneLabel).toBe("Bond anchor");
  });

  it("raises potty urgency when the current need window is critical", () => {
    const guidance = buildPottyGuidanceModel({
      dog: {
        pottyLevel: 94,
        stats: {
          cleanliness: 52,
          energy: 28,
          hunger: 74,
          thirst: 61,
        },
      },
      pottyTrack: {
        phase: "learning",
        progressPct: 38,
      },
    });

    expect(guidance.urgency).toBe("critical");
    expect(guidance.phaseMeta.shortLabel).toBe("Learning");
    expect(guidance.pressureTags.length).toBeGreaterThan(1);
  });
});
