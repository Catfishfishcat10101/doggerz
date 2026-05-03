import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/storage/LocalSaveManager.js", () => ({
  loadLocalSave: vi.fn(),
  removeLocalSave: vi.fn(),
  saveLocalSave: vi.fn(),
}));

import {
  buildPersistedDogRecord,
  loadDogSnapshotFromDevice,
  splitPersistedDogRecord,
} from "@/lib/storage/dogPersistence.js";
import { loadLocalSave } from "@/lib/storage/LocalSaveManager.js";

describe("dogPersistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("splits flat persisted records into dog and progression payloads", () => {
    expect(
      splitPersistedDogRecord({
        adoptedAt: 123,
        progression: { queue: ["a"] },
      })
    ).toEqual({
      dogPayload: { adoptedAt: 123 },
      progressionPayload: { queue: ["a"] },
    });
  });

  it("builds a persistable record with progression and metadata", () => {
    expect(
      buildPersistedDogRecord({
        dogState: { adoptedAt: 123 },
        progressionState: { queue: [] },
        savedAt: "2026-04-21T16:00:00.000Z",
      })
    ).toEqual(
      expect.objectContaining({
        adoptedAt: 123,
        progression: { queue: [] },
        meta: expect.objectContaining({
          savedAt: "2026-04-21T16:00:00.000Z",
        }),
      })
    );
  });

  it("falls back to the legacy guest key when the active guest key is empty", async () => {
    loadLocalSave
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ adoptedAt: 456, progression: { queue: [] } });

    const result = await loadDogSnapshotFromDevice(null);

    expect(loadLocalSave).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      dogPayload: { adoptedAt: 456 },
      progressionPayload: { queue: [] },
    });
  });
});
