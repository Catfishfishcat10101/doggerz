// src/lib/firebase/remoteConfig.js
import {
  fetchAndActivate,
  getRemoteConfig,
  getValue,
  isSupported,
} from "firebase/remote-config";
import { app, firebaseReady } from "@/lib/firebase/index.js";

const REMOTE_CONFIG_FETCH_TIMEOUT_MS = 10_000;
const REMOTE_CONFIG_MIN_FETCH_INTERVAL_MS = import.meta.env.DEV
  ? 0
  : 60 * 60 * 1000;

const DEFAULT_REMOTE_CONFIG = Object.freeze({
  enable_runtime_logging: "false",
  perf_mode_override: "",
  seasonal_event_override: "",
  // Phase 4C game experiment defaults (safe fallbacks when fetch fails).
  ab_game_dog_scale_bias: "0.95",
  ab_game_idle_animation_intensity: "calm",
  ab_game_ui_layout_variant: "default",
});

let remoteConfigPromise = null;

async function resolveRemoteConfig() {
  if (remoteConfigPromise) return remoteConfigPromise;

  remoteConfigPromise = (async () => {
    if (typeof window === "undefined") return null;
    if (!firebaseReady || !app) return null;

    try {
      const supported = await isSupported();
      if (!supported) return null;

      const remoteConfig = getRemoteConfig(app);
      remoteConfig.settings = {
        fetchTimeoutMillis: REMOTE_CONFIG_FETCH_TIMEOUT_MS,
        minimumFetchIntervalMillis: REMOTE_CONFIG_MIN_FETCH_INTERVAL_MS,
      };
      remoteConfig.defaultConfig = { ...DEFAULT_REMOTE_CONFIG };
      return remoteConfig;
    } catch {
      return null;
    }
  })();

  return remoteConfigPromise;
}

export async function initRemoteConfig() {
  const remoteConfig = await resolveRemoteConfig();
  if (!remoteConfig) {
    return {
      enabled: false,
      fetched: false,
      source: "unsupported",
    };
  }

  try {
    const activated = await fetchAndActivate(remoteConfig);
    return {
      enabled: true,
      fetched: true,
      activated,
      fetchTimeMillis: Number(remoteConfig.fetchTimeMillis || 0) || null,
    };
  } catch (error) {
    return {
      enabled: true,
      fetched: false,
      activated: false,
      fetchTimeMillis: Number(remoteConfig.fetchTimeMillis || 0) || null,
      error,
    };
  }
}

export async function refreshRemoteConfig() {
  return initRemoteConfig();
}

export async function getRemoteConfigString(key, fallback = "") {
  const remoteConfig = await resolveRemoteConfig();
  if (!remoteConfig) return String(fallback || "");

  try {
    const value = getValue(remoteConfig, String(key || "")).asString();
    return value || String(fallback || "");
  } catch {
    return String(fallback || "");
  }
}

export async function getRemoteConfigBoolean(key, fallback = false) {
  const raw = await getRemoteConfigString(key, fallback ? "true" : "false");
  const normalized = String(raw || "")
    .trim()
    .toLowerCase();
  if (["true", "1", "yes", "on"].includes(normalized)) return true;
  if (["false", "0", "no", "off"].includes(normalized)) return false;
  return Boolean(fallback);
}

export async function getRemoteConfigNumber(key, fallback = 0) {
  const raw = await getRemoteConfigString(key, String(fallback ?? 0));
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : Number(fallback || 0);
}
