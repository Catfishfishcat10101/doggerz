// src/features/weather/RealTimeWeatherFetcher.test.js
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/weatherApi.js", () => ({
  fetchWeatherSnapshot: vi.fn(),
}));

vi.mock("@/lib/storage/LocalSaveManager.js", () => ({
  loadLocalSave: vi.fn(),
  saveLocalSave: vi.fn(),
}));

import { fetchWeatherSnapshot } from "@/lib/weatherApi.js";
import {
  loadLocalSave,
  saveLocalSave,
} from "@/lib/storage/LocalSaveManager.js";
import { fetchRealTimeWeather } from "@/features/weather/RealTimeWeatherFetcher.js";

describe("RealTimeWeatherFetcher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rethrows aborted requests instead of falling back to cache", async () => {
    const abortError = new Error("Aborted");
    abortError.name = "AbortError";

    loadLocalSave.mockResolvedValue({
      condition: "rain",
      intensity: "medium",
      zip: "60601",
      fetchedAt: Date.now() - 60_000,
      source: "cache",
    });
    fetchWeatherSnapshot.mockRejectedValue(abortError);

    await expect(
      fetchRealTimeWeather({
        zip: "60601",
        forceRefresh: true,
      })
    ).rejects.toBe(abortError);

    expect(loadLocalSave).not.toHaveBeenCalled();
  });

  it("normalizes fetched snapshots before caching them", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-15T09:45:00.000Z"));

    fetchWeatherSnapshot.mockResolvedValue({
      condition: "sunny",
    });
    saveLocalSave.mockResolvedValue(true);

    const result = await fetchRealTimeWeather({
      zip: "60601",
      forceRefresh: true,
    });

    expect(saveLocalSave).toHaveBeenCalledWith(
      "doggerz:weather:60601",
      expect.objectContaining({
        condition: "sunny",
        intensity: "medium",
        zip: "60601",
        fetchedAt: Date.now(),
        source: "network",
        details: null,
        error: null,
        disabled: false,
      })
    );
    expect(result).toEqual(
      expect.objectContaining({
        condition: "sunny",
        intensity: "medium",
        zip: "60601",
        fetchedAt: Date.now(),
        source: "network",
        fromCache: false,
      })
    );

    vi.useRealTimers();
  });

  it("falls back to the default ttl when cacheTtlMs is invalid", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-15T10:00:00.000Z"));

    loadLocalSave.mockResolvedValue({
      condition: "cloudy",
      intensity: "medium",
      zip: "60601",
      fetchedAt: Date.now() - 5 * 60_000,
      source: "network",
    });

    const result = await fetchRealTimeWeather({
      zip: "60601",
      cacheTtlMs: "abc",
    });

    expect(fetchWeatherSnapshot).not.toHaveBeenCalled();
    expect(result).toEqual(
      expect.objectContaining({
        condition: "cloudy",
        fromCache: true,
      })
    );

    vi.useRealTimers();
  });
});
