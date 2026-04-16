import { describe, expect, it } from "vitest";

import {
  buildMemoryJournalModel,
  classifyMemoryStoryCategory,
} from "@/features/dog/memory/memoryJournalModel.js";

describe("memoryJournalModel", () => {
  it("classifies first milestones and funny moments into story chapters", () => {
    expect(
      classifyMemoryStoryCategory({
        summary: "First outside success",
        body: "The first potty trip outside clicked.",
      })
    ).toBe("firsts");

    expect(
      classifyMemoryStoryCategory({
        summary: "Absolute squirrel chaos",
        body: "A dramatic zoomies sprint around the yard.",
      })
    ).toBe("funny");
  });

  it("builds highlights and filters by story category", () => {
    const model = buildMemoryJournalModel({
      memories: [
        {
          id: "m1",
          timestamp: 100,
          category: "CARE",
          summary: "First outside success",
          body: "Potty training finally clicked.",
        },
        {
          id: "m2",
          timestamp: 200,
          category: "TRAINING",
          summary: "Training milestone unlocked",
          body: "Unlocked sit and marked a real milestone in communication.",
        },
        {
          id: "m3",
          timestamp: 300,
          category: "MEMORY",
          summary: "Dramatic zoomies",
          body: "Goofy squirrel chaos in the yard.",
        },
      ],
      categoryFilter: "milestones",
      sortNewest: true,
    });

    expect(model.entries).toHaveLength(1);
    expect(model.entries[0].id).toBe("m2");
    expect(model.highlights.length).toBeGreaterThan(0);
    expect(model.countsByCategory.all).toBe(3);
  });

  it("filters by query against normalized story text", () => {
    const model = buildMemoryJournalModel({
      memories: [
        {
          id: "m1",
          timestamp: 100,
          category: "CARE",
          summary: "Favorite toy discovered",
          body: "The tennis ball became the comfort object.",
        },
        {
          id: "m2",
          timestamp: 200,
          category: "CARE",
          summary: "Bath day",
          body: "Routine cleanup after the muddy yard.",
        },
      ],
      query: "comfort",
      sortNewest: true,
    });

    expect(model.entries).toHaveLength(1);
    expect(model.entries[0].id).toBe("m1");
  });
});
