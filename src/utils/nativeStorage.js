/** @format */
// src/utils/nativeStorage.js

import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";

const hasLocalStorage = () => {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
};

const isNativePlatform = () => {
  try {
    if (Capacitor?.isNativePlatform) return Capacitor.isNativePlatform();
    const platform = Capacitor?.getPlatform?.();
    return platform && platform !== "web";
  } catch {
    return false;
  }
};

const canUsePreferences = () => {
  return Boolean(
    Preferences?.get && (isNativePlatform() || !hasLocalStorage())
  );
};

async function getPreference(key) {
  if (!canUsePreferences()) return null;
  try {
    const result = await Preferences.get({ key });
    return result?.value ?? null;
  } catch {
    return null;
  }
}

async function setPreference(key, value) {
  if (!canUsePreferences()) return false;
  try {
    await Preferences.set({ key, value });
    return true;
  } catch {
    return false;
  }
}

async function removePreference(key) {
  if (!canUsePreferences()) return false;
  try {
    await Preferences.remove({ key });
    return true;
  } catch {
    return false;
  }
}

export async function getStoredValue(key) {
  const prefValue = await getPreference(key);
  if (prefValue != null) return prefValue;

  if (hasLocalStorage()) {
    try {
      const localValue = window.localStorage.getItem(key);
      if (localValue != null) {
        // migrate into Preferences for native builds
        await setPreference(key, localValue);
      }
      return localValue;
    } catch {
      return null;
    }
  }

  return null;
}

export async function setStoredValue(key, value) {
  const normalized = value == null ? null : String(value);
  if (normalized != null) {
    if (hasLocalStorage()) {
      try {
        window.localStorage.setItem(key, normalized);
      } catch {
        // ignore localStorage failures
      }
    }
    await setPreference(key, normalized);
    return true;
  }

  await removeStoredValue(key);
  return false;
}

export async function removeStoredValue(key) {
  if (hasLocalStorage()) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
  await removePreference(key);
  return true;
}

export function canUseNativePreferences() {
  return canUsePreferences();
}

export async function listStoredKeys() {
  const keys = new Set();

  if (hasLocalStorage()) {
    try {
      Object.keys(window.localStorage).forEach((key) => keys.add(key));
    } catch {
      // ignore
    }
  }

  if (canUsePreferences()) {
    try {
      const result = await Preferences.keys();
      const prefKeys = Array.isArray(result?.keys) ? result.keys : [];
      prefKeys.forEach((key) => keys.add(key));
    } catch {
      // ignore
    }
  }

  return Array.from(keys);
}

export async function removeStoredValues(keys) {
  if (!Array.isArray(keys) || !keys.length) return 0;
  await Promise.all(keys.map((key) => removeStoredValue(key)));
  return keys.length;
}

export async function removeStoredValuesByPrefix(prefixes) {
  const list = Array.isArray(prefixes) ? prefixes.filter(Boolean) : [];
  if (!list.length) return 0;
  const keys = await listStoredKeys();
  const toDelete = keys.filter((key) =>
    list.some((prefix) => String(key).startsWith(String(prefix)))
  );
  return removeStoredValues(toDelete);
}
