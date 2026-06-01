// src/features/dog/memory/memoryJournalModel.test.js
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

  it("summarizes daily care, bond, neglect, favorite actions, and remembered moments", () => {
    const model = buildMemoryJournalModel({
      memoryState: {
        dailyCareLogs: [
          {
            dayKey: "2026-06-01",
            updatedAt: 200,
            categories: ["feed", "water", "play", "sleep", "clean", "potty"],
            counts: { feed: 2, water: 1, play: 1 },
          },
        ],
        bondHistory: [
          {
            id: "b1",
            timestamp: 220,
            delta: 1.4,
            value: 34,
            source: "play",
          },
        ],
        neglectHistory: [
          {
            id: "n1",
            timestamp: 150,
            strikes: 1,
            moodTag: "LONELY",
            summary: "Long absence remembered.",
          },
        ],
        favoriteActionCounts: { feed: 2, play: 4 },
      },
      memories: [
        {
          id: "m1",
          timestamp: 210,
          category: "TRAINING",
          summary: "Sit mastered",
          body: "A training milestone became part of the bond.",
        },
      ],
    });

    expect(model.dailyCareLogs[0].completedCount).toBe(6);
    expect(model.bondHistory[0].delta).toBe(1.4);
    expect(model.neglectHistory[0].summary).toBe("Long absence remembered.");
    expect(model.favoriteActions[0].id).toBe("play");
    expect(model.rememberedMoments[0].summary).toBe("Sit mastered");
  });
});
