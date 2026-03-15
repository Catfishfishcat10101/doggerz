import { describe, expect, it } from "vitest";

import {
  consumeInventoryItem,
  createInventoryState,
} from "@/features/inventory/InventoryManager.js";

describe("InventoryManager", () => {
  it("clears equippedOutfitId when consuming the last equipped outfit", () => {
    const state = createInventoryState({
      outfits: [{ id: "raincoat", quantity: 1 }],
      equippedOutfitId: "raincoat",
    });

    const result = consumeInventoryItem(state, "outfits", "raincoat", 1);

    expect(result.consumed).toBe(true);
    expect(result.remaining).toBe(0);
    expect(result.inventory.outfits).toEqual([]);
    expect(result.inventory.equippedOutfitId).toBe(null);
  });

  it("filters zero-quantity seed items and refuses to consume them", () => {
    const seed = {
      foods: [{ id: "kibble", quantity: 0 }],
      outfits: [{ id: "raincoat", quantity: 0 }],
      equippedOutfitId: "raincoat",
    };

    const normalized = createInventoryState(seed);
    const result = consumeInventoryItem(seed, "foods", "kibble", 1);

    expect(normalized.foods).toEqual([]);
    expect(normalized.outfits).toEqual([]);
    expect(normalized.equippedOutfitId).toBe(null);
    expect(result.consumed).toBe(false);
    expect(result.inventory.foods).toEqual([]);
  });

  it("trims equippedOutfitId during inventory normalization", () => {
    const state = createInventoryState({
      outfits: [{ id: "raincoat", quantity: 1 }],
      equippedOutfitId: "  raincoat  ",
    });

    expect(state.equippedOutfitId).toBe("raincoat");
  });

  it("merges duplicate seeded items by id", () => {
    const state = createInventoryState({
      foods: [
        {
          id: "kibble",
          label: "Kibble",
          quantity: 2,
          meta: { rarity: "common" },
        },
        {
          id: "kibble",
          label: "Kibble",
          quantity: 3,
          meta: { source: "starterPack" },
        },
      ],
    });

    expect(state.foods).toEqual([
      {
        id: "kibble",
        category: "foods",
        label: "Kibble",
        quantity: 5,
        meta: {
          rarity: "common",
          source: "starterPack",
        },
      },
    ]);
  });
});
