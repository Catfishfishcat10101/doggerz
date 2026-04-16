// src/bootstrap/doggerzController.js
import store from "@/store/store.js";
import {
  DOG_STORAGE_KEY,
  getDogStorageKey,
  hydrateDog,
} from "@/store/dogSlice.js";
import {
  hydrateProgression,
  resetProgression,
} from "@/features/progression/progressionSlice.js";
import {
  hydrateSettings,
  selectSettings,
  SETTINGS_STORAGE_KEY,
} from "@/store/settingsSlice.js";
import {
  hydrateUserState,
  selectUserZip,
  USER_STORAGE_KEY,
} from "@/store/userSlice.js";
import { setWeatherSnapshot } from "@/store/weatherSlice.js";
import { getStoredValue } from "@/utils/nativeStorage.js";
import {
  initFirebase,
  ensureFirebasePersistence,
  firebaseReady,
} from "@/lib/firebase/index.js";
import {
  ensureAnonSignIn,
  isAnonymousFirebaseUser,
} from "@/lib/firebaseClient.js";
import { getGrantedLocationSnapshot } from "@/lib/locationReality.js";
import { fetchRealTimeWeather } from "@/features/weather/RealTimeWeatherFetcher.js";
import { DOGS } from "@/app/config/assets.js";
import { selectDogRenderModel } from "@/components/dog/redux/dogSelectors.js";
import {
  getDogAnimSpriteUrl,
  getDogPixiSheetUrl,
} from "@/utils/dogSpritePaths.js";
import { configureStatusBar } from "@/utils/statusBar.js";
// This module orchestrates the startup sequence of the Doggerz application, handling local data hydration, asset preloading, Firebase synchronization, and weather reality matching. It includes robust error handling to ensure a smooth user experience even when certain services are unavailable.

const STARTUP_ASSET_TIMEOUT_MS = 5000;

function parseStoredJson(raw, label) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`[Doggerz] Failed to parse startup ${label}:`, error);
    return null;
  }
}

function splitPersistedDogRecord(raw) {
  if (!raw || typeof raw !== "object") {
    return { dogPayload: null, progressionPayload: null };
  }

  if (raw.dog && typeof raw.dog === "object") {
    return {
      dogPayload: raw.dog,
      progressionPayload:
        raw.progression && typeof raw.progression === "object"
          ? raw.progression
          : null,
    };
  }

  const dogPayload = { ...raw };
  const progressionPayload =
    dogPayload.progression && typeof dogPayload.progression === "object"
      ? dogPayload.progression
      : null;
  delete dogPayload.progression;

  return {
    dogPayload,
    progressionPayload,
  };
}
// Builds a fallback weather snapshot for startup, using sunny/day defaults and including any relevant error information.

export function buildFallbackWeatherSnapshot(zip, error) {
  return {
    condition: "sun",
    intensity: "light",
    zip: zip || null,
    fetchedAt: Date.now(),
    source: "fallback",
    details: {
      liveWeather: false,
      reason: "startup_fallback",
      isDark: false,
    },
    error: error ? String(error) : null,
  };
}
// Constructs a prioritized list of assets to preload at startup, based on the current dog render model and static fallbacks.

export function buildStartupAssetList(state) {
  const renderModel = selectDogRenderModel(state || {});
  const stage = renderModel?.stage || "PUPPY";
  const anim = renderModel?.anim || "idle";

  return [
    ...new Set(
      [
        DOGS.staticFallback,
        renderModel?.staticSpriteUrl,
        getDogAnimSpriteUrl(stage, anim),
        getDogAnimSpriteUrl(stage, "idle"),
        renderModel?.pixiSheetUrl,
        renderModel?.pixiSheetFallbackUrl,
        getDogPixiSheetUrl(stage, "clean"),
      ].filter(Boolean)
    ),
  ];
}
// Preloads an image asset with a timeout, returning a result object indicating success or failure.
function preloadImage(src, timeoutMs = STARTUP_ASSET_TIMEOUT_MS) {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || typeof Image === "undefined") {
      resolve({ src, loaded: false, reason: "image_unavailable" });
      return;
    }
    //
    const img = new Image();
    let settled = false;
    const timeoutId = setTimeout(() => {
      if (settled) return;
      settled = true;
      resolve({ src, loaded: false, reason: "timeout" });
    }, timeoutMs);

    const finish = (loaded, reason = null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      resolve({ src, loaded, reason });
    };

    img.onload = () => {
      if (typeof img.decode === "function") {
        img
          .decode()
          .catch(() => {})
          .finally(() => finish(true));
        return;
      }
      finish(true);
    };
    img.onerror = () => finish(false, "error");
    img.src = String(src || "");
  });
}
// Loads local fallback data for user, settings, and dog state from storage, and hydrates the Redux store accordingly. This allows the app to have a functional baseline state even if Firebase is unavailable at startup.

async function loadLocalFallbacks() {
  const [userRaw, settingsRaw, dogRaw, dogLegacyRaw] = await Promise.all([
    getStoredValue(USER_STORAGE_KEY),
    getStoredValue(SETTINGS_STORAGE_KEY),
    getStoredValue(getDogStorageKey(null)),
    getStoredValue(DOG_STORAGE_KEY),
  ]);

  const userParsed = parseStoredJson(userRaw, USER_STORAGE_KEY);
  if (userParsed && typeof userParsed === "object") {
    store.dispatch(hydrateUserState(userParsed));
  }

  const settingsParsed = parseStoredJson(settingsRaw, SETTINGS_STORAGE_KEY);
  if (settingsParsed && typeof settingsParsed === "object") {
    store.dispatch(hydrateSettings(settingsParsed));
  }

  const dogParsed = parseStoredJson(dogRaw, getDogStorageKey(null));
  const dogLegacyParsed = parseStoredJson(dogLegacyRaw, DOG_STORAGE_KEY);
  const persistedRecord = dogParsed || dogLegacyParsed;
  const { dogPayload, progressionPayload } =
    splitPersistedDogRecord(persistedRecord);
  if (dogPayload && typeof dogPayload === "object") {
    store.dispatch(hydrateDog(dogPayload));
    if (progressionPayload) {
      store.dispatch(hydrateProgression(progressionPayload));
    } else {
      store.dispatch(resetProgression());
    }
  }

  return store.getState();
}
// The main Doggerz controller object, providing methods for module registration, local fallback loading, Firebase synchronization, weather reality matching, and application initialization. It also includes a simple UI error message renderer for critical startup failures.
const Doggerz = {
  registry: {
    modules: ["Firebase", "Weather", "Renderer", "Voice"],
    commands: [],
    assets: [],
  },

  registerModule(name) {
    const normalized = String(name || "").trim();
    if (!normalized) return;
    if (!this.registry.modules.includes(normalized)) {
      this.registry.modules.push(normalized);
    }
  },

  registerCommand(command) {
    const normalized = String(command || "").trim();
    if (!normalized) return;
    if (!this.registry.commands.includes(normalized)) {
      this.registry.commands.push(normalized);
    }
  },

  registerAsset(asset) {
    const normalized = String(asset || "").trim();
    if (!normalized) return;
    if (!this.registry.assets.includes(normalized)) {
      this.registry.assets.push(normalized);
    }
  },

  async loadLocalFallbacks() {
    return loadLocalFallbacks();
  },

  Firebase: {
    async sync() {
      const services = initFirebase();
      if (!firebaseReady || !services?.db) {
        console.warn(
          "[Doggerz] Firebase unavailable at startup; using local cache."
        );
        return { mode: "local", user: store.getState()?.user || null };
      }

      await ensureFirebasePersistence();

      try {
        const user = await ensureAnonSignIn();
        if (!user || isAnonymousFirebaseUser(user)) {
          return { mode: "local", user: null };
        }
        return { mode: "firebase", user };
      } catch (error) {
        console.warn(
          "[Doggerz] Firebase offline during startup; using local cache.",
          error
        );
        return { mode: "local", user: store.getState()?.user || null, error };
      }
    },
  },

  Weather: {
    apply(snapshot) {
      store.dispatch(setWeatherSnapshot(snapshot));
      return snapshot;
    },

    async matchReality() {
      const state = store.getState();
      const zip = selectUserZip(state);
      const settings = selectSettings(state);
      const usePreciseRealityLocation =
        settings?.usePreciseDayNightLocation === true;

      let coords = null;
      if (usePreciseRealityLocation) {
        coords = await getGrantedLocationSnapshot({
          maximumAge: 10 * 60 * 1000,
          timeout: 8000,
          enableHighAccuracy: false,
        }).catch(() => null);
      }

      if (!zip && !coords) {
        return this.apply(
          buildFallbackWeatherSnapshot(null, "Weather ZIP unavailable")
        );
      }

      try {
        const snapshot = await fetchRealTimeWeather({ zip, coords });
        if (!snapshot?.condition || snapshot.condition === "unknown") {
          return this.apply(buildFallbackWeatherSnapshot(zip, snapshot?.error));
        }
        return this.apply(snapshot);
      } catch (error) {
        console.warn(
          "[Doggerz] Reality sync failed. Defaulting to sunny/day.",
          error
        );
        return this.apply(
          buildFallbackWeatherSnapshot(zip, error?.message || error)
        );
      }
    },
  },

  Renderer: {
    async preload() {
      const assets = buildStartupAssetList(store.getState());
      Doggerz.registry.assets = [];
      assets.forEach((asset) => Doggerz.registerAsset(asset));

      const results = await Promise.all(
        assets.map((asset) => preloadImage(asset))
      );
      const loadedCount = results.filter((result) => result.loaded).length;
      console.info("[Doggerz] Renderer preload complete", {
        requested: assets.length,
        loaded: loadedCount,
      });
      return results;
    },
  },

  UI: {
    showErrorMessage(error) {
      if (typeof document === "undefined") return;
      document.body.innerHTML = `
        <div style="text-align:center; padding:50px 24px; font-family:system-ui,sans-serif; color:#e5e7eb; background:#090a0f; min-height:100vh; box-sizing:border-box;">
          <h2 style="color:#a7f3d0; margin-bottom:12px;">Jack is taking a nap!</h2>
          <p style="margin:0 0 16px; color:rgba(229,231,235,0.82);">We're having trouble connecting. Check your internet and try again?</p>
          <button onclick="location.reload()" style="border-radius:999px; border:1px solid rgba(16,185,129,0.45); background:rgba(16,185,129,0.12); color:#ecfccb; padding:10px 18px; cursor:pointer;">Retry</button>
          ${error ? `<pre style="max-width:720px; margin:24px auto 0; text-align:left; white-space:pre-wrap; background:rgba(255,255,255,0.05); border-radius:16px; padding:16px; overflow:auto;">${String(error?.stack || error?.message || error)}</pre>` : ""}
        </div>
      `;
    },
  },

  async init({ startGameLoop, onCriticalError } = {}) {
    console.log("System Initializing...");

    try {
      await configureStatusBar();
      await this.loadLocalFallbacks();
      await this.Renderer.preload();
      await this.Firebase.sync();
      await this.Weather.matchReality();

      if (typeof startGameLoop === "function") {
        await startGameLoop();
      }

      return true;
    } catch (error) {
      console.error("Startup Shield triggered:", error);
      if (typeof onCriticalError === "function") {
        onCriticalError(error);
      } else {
        this.UI.showErrorMessage(error);
      }
      return false;
    }
  },
};

if (typeof window !== "undefined") {
  window.Doggerz = Doggerz;
}

export async function initializeDoggerz(options) {
  return Doggerz.init(options);
}

export default Doggerz;
