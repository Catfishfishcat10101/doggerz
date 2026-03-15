// src/logic/LocalSaveManager.js
import {
  getStoredValue,
  listStoredKeys,
  removeStoredValue,
  removeStoredValues,
  setStoredValue,
} from "@/utils/nativeStorage.js";

function safeParseJson(raw) {
  if (raw == null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function normalizeKey(key) {
  return String(key || "").trim();
}

export async function loadLocalSave(key, fallback = null) {
  const storageKey = normalizeKey(key);
  if (!storageKey) return fallback;
  try {
    const raw = await getStoredValue(storageKey);
    const parsed = safeParseJson(raw);
    return parsed == null ? fallback : parsed;
  } catch {
    return fallback;
  }
}

export async function saveLocalSave(key, data) {
  const storageKey = normalizeKey(key);
  if (!storageKey) return false;
  try {
    await setStoredValue(storageKey, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export async function removeLocalSave(key) {
  const storageKey = normalizeKey(key);
  if (!storageKey) return false;
  try {
    await removeStoredValue(storageKey);
    return true;
  } catch {
    return false;
  }
}

export async function migrateLegacySave({
  legacyKey,
  activeKey,
  transform,
} = {}) {
  const fromKey = normalizeKey(legacyKey);
  const toKey = normalizeKey(activeKey);
  if (!fromKey || !toKey || fromKey === toKey) return null;

  const legacy = await loadLocalSave(fromKey, null);
  if (legacy == null) return null;

  const next =
    typeof transform === "function" ? (transform(legacy) ?? legacy) : legacy;
  const saved = await saveLocalSave(toKey, next);
  if (!saved) return null;

  const removed = await removeLocalSave(fromKey);
  if (!removed) {
    return {
      migrated: true,
      cleanedUp: false,
      data: next,
    };
  }

  return {
    migrated: true,
    cleanedUp: true,
    data: next,
  };
}

export async function exportLocalSaves(prefixes = []) {
  const normalizedPrefixes = Array.isArray(prefixes)
    ? prefixes.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
  try {
    const keysRaw = await listStoredKeys();
    const keys = Array.isArray(keysRaw) ? keysRaw : [];
    const matchedKeys = normalizedPrefixes.length
      ? keys.filter((key) =>
          normalizedPrefixes.some((prefix) => String(key).startsWith(prefix))
        )
      : keys;

    const entries = await Promise.all(
      matchedKeys.map(async (key) => {
        const raw = await getStoredValue(key);
        return [
          key,
          {
            raw,
            parsed: safeParseJson(raw),
          },
        ];
      })
    );

    return Object.fromEntries(entries);
  } catch {
    return {};
  }
}

export async function clearLocalSaves(keys = []) {
  const normalizedKeys = Array.isArray(keys)
    ? keys.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
  if (!normalizedKeys.length) return 0;
  try {
    await removeStoredValues(normalizedKeys);
    return normalizedKeys.length;
  } catch {
    return 0;
  }
}
