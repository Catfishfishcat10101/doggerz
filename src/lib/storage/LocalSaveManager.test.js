import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/utils/nativeStorage.js", () => ({
  getStoredValue: vi.fn(),
  listStoredKeys: vi.fn(),
  removeStoredValue: vi.fn(),
  removeStoredValues: vi.fn(),
  setStoredValue: vi.fn(),
}));

import {
  clearLocalSaves,
  exportLocalSaves,
  loadLocalSave,
  migrateLegacySave,
  removeLocalSave,
} from "@/lib/storage/LocalSaveManager.js";
import {
  getStoredValue,
  listStoredKeys,
  removeStoredValue,
  removeStoredValues,
  setStoredValue,
} from "@/utils/nativeStorage.js";

describe("LocalSaveManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the fallback when storage reads throw", async () => {
    getStoredValue.mockRejectedValueOnce(new Error("read failed"));

    await expect(loadLocalSave("dog-save", { ok: false })).resolves.toEqual({
      ok: false,
    });
  });

  it("returns false when save removal throws", async () => {
    removeStoredValue.mockRejectedValueOnce(new Error("remove failed"));

    await expect(removeLocalSave("dog-save")).resolves.toBe(false);
  });

  it("returns the migration result with cleanup status", async () => {
    getStoredValue.mockResolvedValueOnce(JSON.stringify({ adoptedAt: 123 }));
    setStoredValue.mockResolvedValueOnce(true);
    removeStoredValue.mockRejectedValueOnce(new Error("cleanup failed"));

    await expect(
      migrateLegacySave({
        legacyKey: "legacy-save",
        activeKey: "active-save",
      })
    ).resolves.toEqual({
      migrated: true,
      cleanedUp: false,
      data: { adoptedAt: 123 },
    });
  });

  it("returns an empty export object when listing keys fails", async () => {
    listStoredKeys.mockRejectedValueOnce(new Error("keys failed"));

    await expect(exportLocalSaves(["dog"])).resolves.toEqual({});
  });

  it("returns 0 when bulk clearing throws", async () => {
    removeStoredValues.mockRejectedValueOnce(new Error("clear failed"));

    await expect(clearLocalSaves(["dog-save"])).resolves.toBe(0);
  });
});
