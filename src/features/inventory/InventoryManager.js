// src/logic/InventoryManager.js
export const INVENTORY_CATEGORIES = Object.freeze(["foods", "toys", "outfits"]);

function normalizeCategory(value) {
  const key = String(value || "")
    .trim()
    .toLowerCase();
  if (key === "food" || key === "foods") return "foods";
  if (key === "toy" || key === "toys") return "toys";
  if (key === "outfit" || key === "outfits" || key === "cosmetics")
    return "outfits";
  return "";
}

function normalizeQuantity(value, fallback = 1) {
  const n = Number(value);
  if (!Number.isFinite(n)) return Math.max(0, Math.floor(fallback));
  return Math.max(0, Math.floor(n));
}

function normalizeItem(raw, fallbackCategory = "") {
  const category = normalizeCategory(raw?.category || fallbackCategory);
  const id = String(raw?.id || "").trim();
  if (!id || !category) return null;
  return {
    id,
    category,
    label: String(raw?.label || id),
    quantity: normalizeQuantity(raw?.quantity, 1),
    meta: raw?.meta && typeof raw.meta === "object" ? { ...raw.meta } : {},
  };
}

function normalizeInventoryList(list, category) {
  const merged = [];
  const byId = new Map();

  for (const rawItem of Array.isArray(list) ? list : []) {
    const item = normalizeItem(rawItem, category);
    if (!item || Number(item.quantity || 0) <= 0) continue;

    const existing = byId.get(item.id);
    if (!existing) {
      const nextItem = {
        ...item,
        meta: { ...(item.meta || {}) },
      };
      byId.set(item.id, nextItem);
      merged.push(nextItem);
      continue;
    }

    existing.quantity = normalizeQuantity(
      Number(existing.quantity || 0) + Number(item.quantity || 0),
      0
    );
    existing.label = item.label || existing.label;
    existing.meta = {
      ...(existing.meta || {}),
      ...(item.meta || {}),
    };
  }

  return merged;
}

export function createInventoryState(seed = {}) {
  const state = {
    foods: [],
    toys: [],
    outfits: [],
    equippedOutfitId: String(seed?.equippedOutfitId || "").trim() || null,
  };

  for (const category of INVENTORY_CATEGORIES) {
    const list = Array.isArray(seed?.[category]) ? seed[category] : [];
    state[category] = normalizeInventoryList(list, category);
  }

  if (!state.outfits.some((item) => item.id === state.equippedOutfitId)) {
    state.equippedOutfitId = null;
  }

  return state;
}

export function listInventoryByCategory(inventoryState, category) {
  const key = normalizeCategory(category);
  if (!key) return [];
  const list = Array.isArray(inventoryState?.[key]) ? inventoryState[key] : [];
  return list.map((item) => ({ ...item, meta: { ...(item.meta || {}) } }));
}

export function hasInventoryItem(inventoryState, category, itemId) {
  const key = normalizeCategory(category);
  const id = String(itemId || "").trim();
  if (!key || !id) return false;
  return listInventoryByCategory(inventoryState, key).some(
    (item) => item.id === id && Number(item.quantity || 0) > 0
  );
}

export function upsertInventoryItem(inventoryState, category, payload = {}) {
  const key = normalizeCategory(category);
  if (!key) return createInventoryState(inventoryState);
  const base = createInventoryState(inventoryState);
  const normalized = normalizeItem(payload, key);
  if (!normalized) return base;

  const next = [...base[key]];
  const index = next.findIndex((item) => item.id === normalized.id);
  if (index === -1) {
    next.push(normalized);
  } else {
    const existing = next[index];
    next[index] = {
      ...existing,
      ...normalized,
      quantity: normalizeQuantity(
        Number(existing.quantity || 0) + Number(normalized.quantity || 0),
        0
      ),
      meta: {
        ...(existing.meta || {}),
        ...(normalized.meta || {}),
      },
    };
  }

  return {
    ...base,
    [key]: next.filter((item) => Number(item.quantity || 0) > 0),
  };
}

export function consumeInventoryItem(
  inventoryState,
  category,
  itemId,
  amount = 1
) {
  const key = normalizeCategory(category);
  const id = String(itemId || "").trim();
  if (!key || !id) {
    return { inventory: createInventoryState(inventoryState), consumed: false };
  }

  const qty = Math.max(1, normalizeQuantity(amount, 1));
  const base = createInventoryState(inventoryState);
  const next = [...base[key]];
  const index = next.findIndex((item) => item.id === id);
  if (index === -1) {
    return { inventory: base, consumed: false };
  }

  const item = next[index];
  const currentQty = Number(item.quantity || 0);

  if (currentQty <= 0) {
    return { inventory: base, consumed: false, remaining: 0 };
  }

  const after = Math.max(0, currentQty - qty);
  if (after <= 0) {
    next.splice(index, 1);
  } else {
    next[index] = { ...item, quantity: after };
  }

  const nextInventory = { ...base, [key]: next };
  if (
    key === "outfits" &&
    after <= 0 &&
    String(base.equippedOutfitId || "").trim() === id
  ) {
    nextInventory.equippedOutfitId = null;
  }

  return {
    inventory: nextInventory,
    consumed: true,
    remaining: after,
  };
}

export function equipOutfit(inventoryState, outfitId) {
  const id = String(outfitId || "").trim();
  const base = createInventoryState(inventoryState);
  if (!id) return { ...base, equippedOutfitId: null };
  if (!hasInventoryItem(base, "outfits", id)) {
    return base;
  }
  return { ...base, equippedOutfitId: id };
}
