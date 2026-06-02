import { describe, expect, it } from "vitest";

import {
  DOG_CLOUD_SCHEMA_VERSION,
  createDogPersistenceSnapshot,
  getDogPersistenceSignature,
  splitDogPersistenceSnapshot,
} from "./persistenceSnapshot.js";

describe("dog persistence snapshot", () => {
  it("serializes a narrow, versioned cloud model", () => {
    const snapshot = createDogPersistenceSnapshot(
      {
        dog: {
          adoptedAt: 100,
          name: "Fireball",
          stats: { hunger: 40, energy: 80, health: 90 },
          bond: { value: 12 },
          memory: { lastFedAt: 200 },
          internalScratch: "not persisted",
        },
        progression: { updatedAt: 300, events: [] },
        user: { dogName: "Fallback" },
        settings: { audio: { masterVolume: 0.5 } },
      },
      { savedAt: 400 }
    );

    expect(snapshot.schemaVersion).toBe(DOG_CLOUD_SCHEMA_VERSION);
    expect(snapshot.dog.name).toBe("Fireball");
    expect(snapshot.dog.internalScratch).toBeUndefined();
    expect(snapshot.progression.updatedAt).toBe(300);
    expect(snapshot.summary.schemaVersion).toBe(DOG_CLOUD_SCHEMA_VERSION);
    expect(snapshot.meta.savedAt).toBe(400);
  });

  it("uses the dedicated serialized snapshot for save signatures", () => {
    const first = createDogPersistenceSnapshot(
      { dog: { adoptedAt: 1, stats: { hunger: 20 } } },
      { savedAt: 0 }
    );
    const second = createDogPersistenceSnapshot(
      {
        dog: {
          adoptedAt: 1,
          stats: { hunger: 20 },
          unrelatedUiState: { open: true },
        },
      },
      { savedAt: 0 }
    );

    expect(getDogPersistenceSignature(first)).toBe(
      getDogPersistenceSignature(second)
    );
  });

  it("splits both versioned and legacy cloud saves", () => {
    const versioned = splitDogPersistenceSnapshot({
      schemaVersion: 2,
      dog: { name: "Fireball", lastUpdatedAt: 500 },
      progression: { updatedAt: 550 },
      meta: { savedAt: 600 },
    });

    expect(versioned).toMatchObject({
      ok: true,
      schemaVersion: 2,
      dog: { name: "Fireball" },
      progression: { updatedAt: 550 },
      timestamp: 600,
    });

    const legacy = splitDogPersistenceSnapshot({
      name: "Legacy Fireball",
      lastUpdatedAt: 700,
      progression: { updatedAt: 720 },
      cloudSummary: {},
    });

    expect(legacy.ok).toBe(true);
    expect(legacy.schemaVersion).toBe(1);
    expect(legacy.dog.name).toBe("Legacy Fireball");
    expect(legacy.dog.cloudSummary).toBeUndefined();
  });
});
