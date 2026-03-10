/** @format */

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
  const raw = await getStoredValue(storageKey);
  const parsed = safeParseJson(raw);
  return parsed == null ? fallback : parsed;
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
  await removeStoredValue(storageKey);
  return true;
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
  await saveLocalSave(toKey, next);
  await removeLocalSave(fromKey);
  return next;
}

export async function exportLocalSaves(prefixes = []) {
  const normalizedPrefixes = Array.isArray(prefixes)
    ? prefixes.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
  const keys = await listStoredKeys();
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
}

export async function clearLocalSaves(keys = []) {
  const normalizedKeys = Array.isArray(keys)
    ? keys.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
  if (!normalizedKeys.length) return 0;
  await removeStoredValues(normalizedKeys);
  return normalizedKeys.length;
}
