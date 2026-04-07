import {
  getRemoteConfigNumber,
  getRemoteConfigString,
  initRemoteConfig,
} from "@/lib/firebase/remoteConfig.js";

export const DEFAULT_GAME_EXPERIMENT_CONFIG = Object.freeze({
  dogScaleBias: 0.95,
  idleAnimationIntensity: "calm",
  uiLayoutVariant: "default",
});

// Temporary Phase 4C remote-config keys for game A/B tests.
const EXPERIMENT_KEYS = Object.freeze({
  DOG_SCALE_BIAS: "ab_game_dog_scale_bias",
  IDLE_ANIMATION_INTENSITY: "ab_game_idle_animation_intensity",
  UI_LAYOUT_VARIANT: "ab_game_ui_layout_variant",
});

const CACHE_TTL_MS = 10 * 60 * 1000;

let cachedConfig = { ...DEFAULT_GAME_EXPERIMENT_CONFIG };
let cachedAt = 0;
let inflightPromise = null;

function clamp(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function normalizeIdleIntensity(value) {
  const key = String(value || "")
    .trim()
    .toLowerCase();
  if (["minimal", "calm", "standard", "lively"].includes(key)) return key;
  return DEFAULT_GAME_EXPERIMENT_CONFIG.idleAnimationIntensity;
}

function normalizeLayoutVariant(value) {
  const key = String(value || "")
    .trim()
    .toLowerCase();
  if (["default", "compact_hud", "expanded_yard"].includes(key)) return key;
  return DEFAULT_GAME_EXPERIMENT_CONFIG.uiLayoutVariant;
}

function withSafeDefaults(partial = {}) {
  return {
    dogScaleBias: clamp(
      Number(
        partial?.dogScaleBias ?? DEFAULT_GAME_EXPERIMENT_CONFIG.dogScaleBias
      ),
      0.82,
      1.12
    ),
    idleAnimationIntensity: normalizeIdleIntensity(
      partial?.idleAnimationIntensity
    ),
    uiLayoutVariant: normalizeLayoutVariant(partial?.uiLayoutVariant),
  };
}

export function getDefaultGameExperimentConfig() {
  return { ...DEFAULT_GAME_EXPERIMENT_CONFIG };
}

export async function resolveGameExperimentConfig({
  forceRefresh = false,
} = {}) {
  const now = Date.now();
  if (
    !forceRefresh &&
    cachedAt > 0 &&
    now - cachedAt < CACHE_TTL_MS &&
    cachedConfig
  ) {
    return { ...cachedConfig };
  }

  if (inflightPromise) {
    const existing = await inflightPromise;
    return { ...existing };
  }

  inflightPromise = (async () => {
    try {
      await initRemoteConfig();

      const [dogScaleBias, idleAnimationIntensity, uiLayoutVariant] =
        await Promise.all([
          getRemoteConfigNumber(
            EXPERIMENT_KEYS.DOG_SCALE_BIAS,
            DEFAULT_GAME_EXPERIMENT_CONFIG.dogScaleBias
          ),
          getRemoteConfigString(
            EXPERIMENT_KEYS.IDLE_ANIMATION_INTENSITY,
            DEFAULT_GAME_EXPERIMENT_CONFIG.idleAnimationIntensity
          ),
          getRemoteConfigString(
            EXPERIMENT_KEYS.UI_LAYOUT_VARIANT,
            DEFAULT_GAME_EXPERIMENT_CONFIG.uiLayoutVariant
          ),
        ]);

      cachedConfig = withSafeDefaults({
        dogScaleBias,
        idleAnimationIntensity,
        uiLayoutVariant,
      });
    } catch {
      cachedConfig = withSafeDefaults(DEFAULT_GAME_EXPERIMENT_CONFIG);
    } finally {
      cachedAt = Date.now();
      inflightPromise = null;
    }

    return cachedConfig;
  })();

  const next = await inflightPromise;
  return { ...next };
}
