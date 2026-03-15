// src/components/dog/DogAIEngine.jsx
// @ts-check

import { useCallback, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Capacitor } from "@capacitor/core";
import { onSnapshot, setDoc } from "firebase/firestore";
import { auth, db, firebaseReady } from "@/lib/firebase/index.js";
import {
  grantFounderReward,
  hydrateDog,
  resetDogState,
  registerSessionStart,
  DOG_STORAGE_KEY,
  getDogStorageKey,
} from "@/store/dogSlice.js";
import {
  setWeatherError,
  setWeatherLoading,
  setWeatherSnapshot,
} from "@/store/weatherSlice.js";
import { loadDogFromCloud, saveDogToCloud } from "@/store/dogThunks.js";
import {
  selectIsAuthResolved,
  selectUserIsFounder,
  selectUserId,
  selectUserZip,
  setUser,
} from "@/store/userSlice.js";
import { selectSettings } from "@/store/settingsSlice.js";
import {
  startDogTickEngine,
  stopDogTickEngine,
} from "@/store/middleware/dogTick.js";
import { useDogActionSfx } from "@/hooks/audio/useDogActionSfx.js";
import useDynamicMusic from "@/hooks/audio/useDynamicMusic.js";
import useAmbientSoundscape from "@/hooks/audio/useAmbientSoundscape.js";
import { useDogEngineState } from "@/hooks/useDogState.js";
import { ensureDogMain } from "@/lib/firebase/ensureDog.js";
import { userProfileDoc } from "@/lib/firebase/paths.js";
import {
  loadLocalSave,
  migrateLegacySave,
  saveLocalSave,
} from "@/lib/storage/LocalSaveManager.js";
import {
  isAnonymousFirebaseUser,
  isFirestorePermissionError,
} from "@/lib/firebaseClient.js";
import { fetchRealTimeWeather } from "@/features/weather/RealTimeWeatherFetcher.js";
import { debugError, debugLog, debugWarn } from "@/utils/debugLogger.js";
import { PATHS } from "@/app/routes.js";

const CLOUD_SAVE_DEBOUNCE = 3_000; // 3 seconds
const WEATHER_POLL_INTERVAL_MS = 12 * 60_000; // 12 minutes (gentle on API limits)
const USER_PROFILE_SYNC_DEBOUNCE_MS = 600;

const HYDRATE_ERROR_KEY = "doggerz:hydrateError";
let hasBootstrappedDogSession = false;
let lastHydratedCloudUserId = null;

// Local persistence schema marker (kept here so we don't require dogSlice exports).
const DOG_SAVE_SCHEMA_VERSION = 1;

let pixiTickerPromise = null;
let capacitorAppPromise = null;
async function getPixiTicker() {
  if (pixiTickerPromise) return pixiTickerPromise;
  pixiTickerPromise = import("pixi.js")
    .then((mod) => mod?.Ticker?.shared || null)
    .catch(() => null);
  return pixiTickerPromise;
}

async function getCapacitorApp() {
  const isNative =
    typeof Capacitor?.isNativePlatform === "function"
      ? Capacitor.isNativePlatform()
      : Capacitor.getPlatform?.() !== "web";

  if (!isNative) return null;
  if (capacitorAppPromise) return capacitorAppPromise;

  capacitorAppPromise = import("@capacitor/app")
    .then((mod) => mod || null)
    .catch(() => null);
  return capacitorAppPromise;
}

function getLocalTimeBucket(ms = Date.now()) {
  try {
    const h = new Date(ms).getHours();
    if (h >= 21 || h < 6) return "night";
    if (h < 12) return "morning";
    if (h < 18) return "afternoon";
    return "evening";
  } catch {
    return "local";
  }
}

function getErrorMessage(error, fallback = "Unknown error") {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "object" && "message" in error) {
    const msg = error.message;
    return typeof msg === "string" && msg.trim() ? msg : fallback;
  }
  return fallback;
}

function normalizeZipCode(value) {
  const raw = String(value || "").trim();
  return /^\d{5}$/.test(raw) ? raw : null;
}

export default function DogAIEngine({
  enableAudio = true,
  enableWeather = true,
} = {}) {
  const dispatch = useDispatch();
  const location = useLocation();
  const { dog: dogState, renderModel } = useDogEngineState();
  const zip = useSelector(selectUserZip);
  const settings = useSelector(selectSettings);
  const isFounder = useSelector(selectUserIsFounder);
  const authResolved = useSelector(selectIsAuthResolved);
  const storedUserId = useSelector(selectUserId);
  const userId = authResolved ? storedUserId : null;
  const liveAuthUserId =
    authResolved && auth?.currentUser?.uid === userId ? userId : null;
  const cloudAuthUserId =
    liveAuthUserId && !isAnonymousFirebaseUser(auth?.currentUser)
      ? liveAuthUserId
      : null;
  const shouldRunReduxHeartbeat = location?.pathname !== PATHS.GAME;

  const hasHydratedRef = useRef(false);
  const cloudSaveTimeoutRef = useRef(
    /** @type {ReturnType<typeof setTimeout> | null} */ (null)
  );
  const localSaveTimeoutRef = useRef(
    /** @type {ReturnType<typeof setTimeout> | null} */ (null)
  );
  const profileSyncTimeoutRef = useRef(
    /** @type {ReturnType<typeof setTimeout> | null} */ (null)
  );
  const lastSyncedZipRef = useRef(null);
  const pendingZipSyncRef = useRef(
    /** @type {{ value: string | null } | null} */ (null)
  );

  useEffect(() => {
    debugLog("DogAI", "engine mounted", {
      platform: Capacitor.getPlatform?.() || "web",
      zip,
    });
  }, [zip]);

  useEffect(() => {
    if (!shouldRunReduxHeartbeat) return undefined;
    dispatch(startDogTickEngine());

    return () => {
      dispatch(stopDogTickEngine());
    };
  }, [dispatch, shouldRunReduxHeartbeat]);

  useEffect(() => {
    if (!shouldRunReduxHeartbeat || typeof document === "undefined") {
      return undefined;
    }

    const handleVisibility = () => {
      dispatch(document.hidden ? stopDogTickEngine() : startDogTickEngine());
    };

    const handlePageHide = () => {
      dispatch(stopDogTickEngine());
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [dispatch, shouldRunReduxHeartbeat]);

  useEffect(() => {
    debugLog("DogAI", "firebase runtime config", {
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || null,
      appId: import.meta.env.VITE_FIREBASE_APP_ID || null,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || null,
      firebaseReady,
    });
  }, []);

  useDogActionSfx({
    anim: renderModel?.anim,
    energy: dogState?.stats?.energy,
    audio: settings?.audio,
    enabled: enableAudio,
    hapticsEnabled: settings?.hapticsEnabled !== false,
  });
  useDynamicMusic({ enabled: enableAudio });
  useAmbientSoundscape({ enabled: enableAudio });

  // Helper: revive common date-like fields saved as ISO strings back to numbers
  const reviveDogDates = (raw) => {
    if (!raw || typeof raw !== "object") return raw;
    const copy = { ...raw };
    const tryParse = (v) => {
      if (typeof v === "string") {
        const t = Date.parse(v);
        return Number.isFinite(t) ? t : v;
      }
      return v;
    };

    copy.adoptedAt = tryParse(copy.adoptedAt);
    copy.lastUpdatedAt = tryParse(copy.lastUpdatedAt);

    if (copy.memory && typeof copy.memory === "object") {
      copy.memory = { ...copy.memory };
      copy.memory.lastFedAt = tryParse(copy.memory.lastFedAt);
      copy.memory.lastPlayedAt = tryParse(copy.memory.lastPlayedAt);
      copy.memory.lastBathedAt = tryParse(copy.memory.lastBathedAt);
      copy.memory.lastTrainedAt = tryParse(copy.memory.lastTrainedAt);
      copy.memory.lastSeenAt = tryParse(copy.memory.lastSeenAt);
    }

    if (copy.temperament && typeof copy.temperament === "object") {
      copy.temperament = { ...copy.temperament };
      copy.temperament.adoptedAt = tryParse(copy.temperament.adoptedAt);
      copy.temperament.revealedAt = tryParse(copy.temperament.revealedAt);
      copy.temperament.lastEvaluatedAt = tryParse(
        copy.temperament.lastEvaluatedAt
      );
    }

    if (copy.training && typeof copy.training === "object") {
      copy.training = { ...copy.training };
      if (copy.training.potty) {
        copy.training.potty = { ...copy.training.potty };
        copy.training.potty.completedAt = tryParse(
          copy.training.potty.completedAt
        );
      }
      if (copy.training.adult) {
        copy.training.adult = { ...copy.training.adult };
        copy.training.adult.lastCompletedDate = tryParse(
          copy.training.adult.lastCompletedDate
        );
        copy.training.adult.lastPenaltyDate = tryParse(
          copy.training.adult.lastPenaltyDate
        );
      }
    }

    // Progression dates
    if (copy.progression && typeof copy.progression === "object") {
      copy.progression = { ...copy.progression };
      if (
        copy.progression.season &&
        typeof copy.progression.season === "object"
      ) {
        copy.progression.season = { ...copy.progression.season };
        copy.progression.season.startedAt = tryParse(
          copy.progression.season.startedAt
        );
        copy.progression.season.endsAt = tryParse(
          copy.progression.season.endsAt
        );
      }
      if (
        copy.progression.journey &&
        typeof copy.progression.journey === "object"
      ) {
        copy.progression.journey = { ...copy.progression.journey };
        copy.progression.journey.startedAt = tryParse(
          copy.progression.journey.startedAt
        );
      }
    }

    // Autonomy dates
    if (copy.autonomy && typeof copy.autonomy === "object") {
      copy.autonomy = { ...copy.autonomy };
      copy.autonomy.nextDecisionAt = tryParse(copy.autonomy.nextDecisionAt);
      copy.autonomy.lastDecisionAt = tryParse(copy.autonomy.lastDecisionAt);
      if (
        copy.autonomy.lastEvent &&
        typeof copy.autonomy.lastEvent === "object"
      ) {
        copy.autonomy.lastEvent = { ...copy.autonomy.lastEvent };
        copy.autonomy.lastEvent.createdAt = tryParse(
          copy.autonomy.lastEvent.createdAt
        );
        copy.autonomy.lastEvent.expiresAt = tryParse(
          copy.autonomy.lastEvent.expiresAt
        );
      }
      if (copy.autonomy.routine && typeof copy.autonomy.routine === "object") {
        copy.autonomy.routine = { ...copy.autonomy.routine };
        copy.autonomy.routine.updatedAt = tryParse(
          copy.autonomy.routine.updatedAt
        );
      }
    }

    if (Array.isArray(copy.journal)) {
      copy.journal = copy.journal.map((e) => ({
        ...e,
        timestamp: tryParse(e.timestamp),
      }));
    } else if (copy.journal && Array.isArray(copy.journal.entries)) {
      copy.journal = {
        ...copy.journal,
        entries: copy.journal.entries.map((e) => ({
          ...e,
          timestamp: tryParse(e.timestamp),
        })),
      };
    }

    if (copy.mood && Array.isArray(copy.mood.history)) {
      copy.mood = {
        ...copy.mood,
        history: copy.mood.history.map((h) => ({
          ...h,
          timestamp: tryParse(h.timestamp),
        })),
      };
    }

    if (copy.personality && typeof copy.personality === "object") {
      copy.personality = { ...copy.personality };
      copy.personality.lastUpdatedAt = tryParse(copy.personality.lastUpdatedAt);
      if (Array.isArray(copy.personality.history)) {
        copy.personality.history = copy.personality.history.map((e) => ({
          ...e,
          timestamp: tryParse(e.timestamp),
        }));
      }
    }

    if (copy.dreams && typeof copy.dreams === "object") {
      copy.dreams = { ...copy.dreams };
      copy.dreams.lastGeneratedAt = tryParse(copy.dreams.lastGeneratedAt);
      if (copy.dreams.active && typeof copy.dreams.active === "object") {
        copy.dreams.active = {
          ...copy.dreams.active,
          timestamp: tryParse(copy.dreams.active.timestamp),
        };
      }
      if (Array.isArray(copy.dreams.journal)) {
        copy.dreams.journal = copy.dreams.journal.map((e) => ({
          ...e,
          timestamp: tryParse(e.timestamp),
        }));
      }
    }

    return copy;
  };

  const dogRef = useRef(dogState);
  const zipRef = useRef(zip);
  const userIdRef = useRef(/** @type {string | null} */ (null));
  const lastHydratedUserIdRef = useRef(
    /** @type {string | null} */ (lastHydratedCloudUserId)
  );
  const storageKeyRef = useRef(getDogStorageKey(null));

  const flushLocalSave = useCallback(() => {
    const ds = dogRef.current;
    if (!ds) return;
    try {
      const persisted = {
        ...ds,
        meta: {
          ...(ds.meta || {}),
          schemaVersion: DOG_SAVE_SCHEMA_VERSION,
          savedAt: new Date().toISOString(),
        },
      };
      const key = storageKeyRef.current || getDogStorageKey(userIdRef.current);
      saveLocalSave(key, persisted);
      debugLog("DogAI", "flushed local save", {
        key,
        adoptedAt: ds?.adoptedAt || null,
        lastAction: ds?.lastAction || null,
      });
    } catch (err) {
      debugError("DogAI", "flush local save failed", err);
      console.error("[Doggerz] Failed to flush local save", err);
    }
  }, []);

  useEffect(() => {
    zipRef.current = zip;
  }, [zip]);

  const weatherZip = normalizeZipCode(zip);

  const weatherQuery = useQuery({
    queryKey: ["weather", weatherZip || "unset"],
    queryFn: ({ queryKey, signal }) => {
      const [, zipKey] = queryKey || [];
      return fetchRealTimeWeather({ zip: zipKey, signal });
    },
    enabled: enableWeather && Boolean(weatherZip),
    refetchInterval: WEATHER_POLL_INTERVAL_MS,
    refetchIntervalInBackground: false,
    staleTime: WEATHER_POLL_INTERVAL_MS,
  });

  useEffect(() => {
    if (!enableWeather || !weatherZip) {
      dispatch(
        setWeatherSnapshot({
          condition: "unknown",
          intensity: "medium",
          zip: weatherZip,
          fetchedAt: Date.now(),
          source: "none",
          details: weatherZip
            ? null
            : { reason: "zip_unavailable", liveWeather: false },
          error: null,
        })
      );
      debugLog("DogAI", "weather disabled", { zip: weatherZip });
      return;
    }
    dispatch(setWeatherLoading({ zip: weatherZip }));
    debugLog("DogAI", "weather loading dispatched", { zip: weatherZip });
  }, [dispatch, enableWeather, weatherZip]);

  useEffect(() => {
    if (!enableWeather) return;
    if (!weatherQuery.data) return;
    dispatch(setWeatherSnapshot(weatherQuery.data));
    debugLog("DogAI", "weather snapshot dispatched", {
      zip: weatherZip,
      fromCache: weatherQuery.data?.fromCache === true,
      stale: weatherQuery.data?.stale === true,
      condition: weatherQuery.data?.condition || null,
    });
  }, [dispatch, enableWeather, weatherQuery.data, weatherZip]);

  useEffect(() => {
    if (!enableWeather) return;
    if (!weatherQuery.error) return;
    debugWarn("DogAI", "weather query failed", {
      zip: weatherZip,
      error: getErrorMessage(weatherQuery.error, "Weather fetch failed"),
    });
    dispatch(
      setWeatherError(
        getErrorMessage(weatherQuery.error, "Weather fetch failed")
      )
    );
  }, [dispatch, enableWeather, weatherQuery.error, weatherZip]);

  useEffect(() => {
    if (userId) return;
    if (cloudSaveTimeoutRef.current) {
      clearTimeout(cloudSaveTimeoutRef.current);
      cloudSaveTimeoutRef.current = null;
    }
  }, [userId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let handle = null;
    let cancelled = false;

    const attach = async () => {
      const capacitorAppModule = await getCapacitorApp();
      const CapacitorApp = capacitorAppModule?.App || null;
      if (!CapacitorApp?.addListener) return;
      try {
        const sub = await CapacitorApp.addListener(
          "appStateChange",
          async ({ isActive }) => {
            if (cancelled) return;
            try {
              const ticker = await getPixiTicker();
              if (ticker) {
                if (isActive) ticker.start();
                else ticker.stop();
              }
            } catch {
              // ignore ticker errors
            }

            if (!isActive) {
              if (shouldRunReduxHeartbeat) {
                dispatch(stopDogTickEngine());
              }
              flushLocalSave();
            } else if (shouldRunReduxHeartbeat) {
              dispatch(startDogTickEngine());
            }
          }
        );
        handle = sub;
      } catch {
        // ignore Capacitor App listener errors
      }
    };

    attach();
    return () => {
      cancelled = true;
      try {
        handle?.remove?.();
      } catch {
        // ignore
      }
    };
  }, [dispatch, flushLocalSave, shouldRunReduxHeartbeat]);

  useEffect(() => {
    dogRef.current = dogState;
  }, [dogState]);

  // 2b. Flush local save when leaving/backgrounding (makes refresh/close feel safe)
  useEffect(() => {
    const onVisibility = () => {
      // When going to background, flush immediately.
      if (document?.hidden) flushLocalSave();
    };

    const onPageHide = () => {
      flushLocalSave();
    };

    const onBeforeUnload = () => {
      flushLocalSave();
    };

    window.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [flushLocalSave]);

  useEffect(() => {
    userIdRef.current = liveAuthUserId;
  }, [liveAuthUserId]);

  useEffect(() => {
    if (userId) return;
    lastHydratedUserIdRef.current = null;
    lastHydratedCloudUserId = null;
  }, [userId]);

  useEffect(() => {
    if (!authResolved) return;
    if (cloudAuthUserId) return;
    dispatch(setUser({ cloudSync: { status: "local", errorMessage: null } }));
  }, [authResolved, cloudAuthUserId, dispatch]);

  useEffect(() => {
    if (!firebaseReady || !cloudAuthUserId) return;

    ensureDogMain(cloudAuthUserId).catch((err) => {
      debugError("DogAI", "ensure cloud document failed", err);
      console.error("[Doggerz] Failed to ensure cloud document:", err);
    });
  }, [cloudAuthUserId]);

  useEffect(() => {
    if (!firebaseReady || !db || !cloudAuthUserId) return undefined;
    const profileRef = userProfileDoc(cloudAuthUserId);
    if (!profileRef) return undefined;

    const unsub = onSnapshot(
      profileRef,
      (snap) => {
        const data =
          snap.exists() && snap.data() && typeof snap.data() === "object"
            ? snap.data()
            : {};
        const streak =
          data.streak && typeof data.streak === "object"
            ? data.streak
            : undefined;

        const cloudZip = normalizeZipCode(data.zip);
        const pendingZip = pendingZipSyncRef.current?.value;
        let nextZip = undefined;
        if (pendingZipSyncRef.current) {
          if (cloudZip === pendingZip) {
            nextZip = cloudZip;
            pendingZipSyncRef.current = null;
            lastSyncedZipRef.current = cloudZip;
          }
        } else if (cloudZip) {
          nextZip = cloudZip;
          lastSyncedZipRef.current = cloudZip;
        }

        dispatch(
          setUser({
            zip: nextZip,
            dogName: data.dogName,
            preferredScene: data.preferredScene,
            reduceVfx: data.reduceVfx,
            uiDensity: data.uiDensity,
            locale: data.locale,
            isFounder: Boolean(data.isFounder),
            coins: Number.isFinite(Number(data.coins))
              ? Number(data.coins)
              : undefined,
            streak,
          })
        );
      },
      (err) => {
        if (isFirestorePermissionError(err)) {
          dispatch(
            setUser({ cloudSync: { status: "local", errorMessage: null } })
          );
          debugLog("DogAI", "user profile watch disabled", {
            userId: cloudAuthUserId,
            reason: "permission_denied",
          });
          return;
        }
        debugError("DogAI", "user profile watch failed", err);
        console.error("[Doggerz] Failed to watch user profile:", err);
      }
    );

    return () => {
      try {
        unsub();
      } catch {
        // ignore
      }
    };
  }, [cloudAuthUserId, dispatch]);

  useEffect(() => {
    if (!firebaseReady || !db || !cloudAuthUserId) return undefined;
    const profileRef = userProfileDoc(cloudAuthUserId);
    if (!profileRef) return undefined;

    const normalizedZip = normalizeZipCode(zip);
    if (pendingZipSyncRef.current?.value === normalizedZip) return undefined;
    if (lastSyncedZipRef.current === normalizedZip) return undefined;

    if (profileSyncTimeoutRef.current) {
      clearTimeout(profileSyncTimeoutRef.current);
      profileSyncTimeoutRef.current = null;
    }

    profileSyncTimeoutRef.current = setTimeout(async () => {
      try {
        pendingZipSyncRef.current = { value: normalizedZip };
        await setDoc(
          profileRef,
          {
            zip: normalizedZip,
            updatedAt: Date.now(),
          },
          { merge: true }
        );
        lastSyncedZipRef.current = normalizedZip;
        debugLog("DogAI", "user profile zip synced", {
          userId: cloudAuthUserId,
          zip: normalizedZip,
        });
      } catch (err) {
        if (isFirestorePermissionError(err)) {
          dispatch(
            setUser({ cloudSync: { status: "local", errorMessage: null } })
          );
          pendingZipSyncRef.current = null;
          return;
        }
        debugError("DogAI", "user profile zip sync failed", err);
        pendingZipSyncRef.current = null;
      } finally {
        profileSyncTimeoutRef.current = null;
      }
    }, USER_PROFILE_SYNC_DEBOUNCE_MS);

    return () => {
      if (profileSyncTimeoutRef.current) {
        clearTimeout(profileSyncTimeoutRef.current);
        profileSyncTimeoutRef.current = null;
      }
    };
  }, [cloudAuthUserId, dispatch, zip]);

  useEffect(() => {
    if (!isFounder) return;
    const unlocked = Array.isArray(dogState?.cosmetics?.unlockedIds)
      ? dogState.cosmetics.unlockedIds
      : [];
    if (unlocked.includes("beta_collar_2026")) return;
    dispatch(grantFounderReward({ now: Date.now() }));
  }, [dispatch, dogState?.cosmetics?.unlockedIds, isFounder]);

  // Swap local dog storage when switching auth contexts (guest <-> logged-in).
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const nextKey = getDogStorageKey(userId);
      if (storageKeyRef.current === nextKey) return;

      flushLocalSave();
      storageKeyRef.current = nextKey;
      debugLog("DogAI", "swapping storage key", {
        userId,
        storageKey: nextKey,
      });

      let parsed = null;
      try {
        parsed = await loadLocalSave(nextKey, null);
        if (!parsed && nextKey === getDogStorageKey(null)) {
          const migration = await migrateLegacySave({
            legacyKey: DOG_STORAGE_KEY,
            activeKey: nextKey,
          });
          parsed = migration?.data || null;
        }
        if (parsed) parsed = reviveDogDates(parsed);
      } catch (err) {
        debugWarn("DogAI", "load from switched storage key failed", err);
        console.warn("[Doggerz] Failed to load dog from new storage key", err);
      }

      if (cancelled) return;
      dispatch(resetDogState());
      if (parsed) {
        debugLog("DogAI", "hydrating from switched storage key", {
          storageKey: nextKey,
          adoptedAt: parsed?.adoptedAt || null,
        });
        dispatch(hydrateDog(parsed));
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [dispatch, flushLocalSave, userId]);

  // 1. Hydrate on first mount (Preferences/localStorage → Redux, then optional cloud)
  useEffect(() => {
    if (hasHydratedRef.current) return;
    hasHydratedRef.current = true;
    if (hasBootstrappedDogSession) return;
    hasBootstrappedDogSession = true;

    let cancelled = false;

    const run = async () => {
      debugLog("DogAI", "initial hydrate started", {
        hasAdoptedAt: Boolean(dogState?.adoptedAt),
        currentUser: auth?.currentUser?.uid || null,
      });
      // Preferences/localStorage hydrate (skip if store already preloaded it)
      if (!dogState?.adoptedAt) {
        try {
          const activeKey =
            storageKeyRef.current || getDogStorageKey(userIdRef.current);
          let parsed = await loadLocalSave(activeKey, null);

          if (!parsed && activeKey === getDogStorageKey(null)) {
            const migration = await migrateLegacySave({
              legacyKey: DOG_STORAGE_KEY,
              activeKey,
            });
            parsed = migration?.data || null;
          }

          if (!cancelled && parsed) {
            debugLog("DogAI", "hydrating from local save", {
              storageKey: activeKey,
              adoptedAt: parsed?.adoptedAt || null,
            });
            dispatch(hydrateDog(reviveDogDates(parsed)));
          }
        } catch (err) {
          debugError("DogAI", "dog hydrate parse failed", err);
          console.error("[Doggerz] Failed to parse dog data", err);

          // Don't silently wipe user data. Record a recoverable error so the UI can
          // offer reset/restore options.
          try {
            await saveLocalSave(HYDRATE_ERROR_KEY, {
              type: "DOG_SAVE_PARSE_FAILED",
              at: new Date().toISOString(),
            });
          } catch {
            // ignore
          }
        }
      }

      if (cancelled) return;

      // Cloud hydrate if logged in at mount time
      if (cloudAuthUserId) {
        lastHydratedUserIdRef.current = cloudAuthUserId;
        lastHydratedCloudUserId = cloudAuthUserId;
        const thunkPromise = dispatch(loadDogFromCloud());
        debugLog("DogAI", "cloud hydrate requested", {
          userId: cloudAuthUserId,
        });

        // RTK's unwrap if available; fall back to raw promise
        if (thunkPromise && typeof thunkPromise.unwrap === "function") {
          thunkPromise.unwrap().catch((err) => {
            debugError("DogAI", "cloud hydrate failed", err);
            console.error("[Doggerz] Failed to load dog from cloud", err);
          });
        } else if (thunkPromise?.catch) {
          thunkPromise.catch((err) => {
            debugError("DogAI", "cloud hydrate failed", err);
            console.error("[Doggerz] Failed to load dog from cloud", err);
          });
        }
      }

      // Register session start (catch-up decay, penalties, streak, etc.)
      const now = Date.now();
      debugLog("DogAI", "registering session start", {
        now,
        timeBucket: getLocalTimeBucket(now),
      });
      dispatch(
        registerSessionStart({ now, timeBucket: getLocalTimeBucket(now) })
      );
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [cloudAuthUserId, dispatch, dogState?.adoptedAt]);

  // 1b. If user logs in *after* mount, pull from cloud once
  useEffect(() => {
    if (!cloudAuthUserId) return;
    if (!hasHydratedRef.current) return; // let the first effect run first
    if (lastHydratedUserIdRef.current === cloudAuthUserId) return;
    if (lastHydratedCloudUserId === cloudAuthUserId) return;

    const thunkPromise = dispatch(loadDogFromCloud());
    lastHydratedUserIdRef.current = cloudAuthUserId;
    lastHydratedCloudUserId = cloudAuthUserId;
    debugLog("DogAI", "late cloud hydrate requested", {
      userId: cloudAuthUserId,
    });

    if (thunkPromise && typeof thunkPromise.unwrap === "function") {
      thunkPromise
        .unwrap()
        .then((res) => {
          if (res?.hydrated) {
            const now = Date.now();
            dispatch(
              registerSessionStart({ now, timeBucket: getLocalTimeBucket(now) })
            );
          }
        })
        .catch((err) => {
          debugError("DogAI", "late cloud hydrate failed", err);
          console.error("[Doggerz] Late cloud load failed", err);
        });
    } else if (thunkPromise?.catch) {
      thunkPromise
        .then((res) => {
          if (res?.hydrated) {
            const now = Date.now();
            dispatch(
              registerSessionStart({ now, timeBucket: getLocalTimeBucket(now) })
            );
          }
        })
        .catch((err) => {
          debugError("DogAI", "late cloud hydrate failed", err);
          console.error("[Doggerz] Late cloud load failed", err);
        });
    }
  }, [cloudAuthUserId, dispatch]);

  // Daily reward availability check (runs after hydration and whenever claim changes).
  useEffect(() => {
    if (!dogState?.adoptedAt) return;

    const lastClaim = Number(dogState?.lastRewardClaimedAt || 0);
    const today = new Date().setHours(0, 0, 0, 0);
    const lastClaimDate = lastClaim
      ? new Date(lastClaim).setHours(0, 0, 0, 0)
      : 0;

    if (today > lastClaimDate) {
      // TODO: dispatch(openModal("DAILY_REWARD"));
    }
  }, [dogState?.adoptedAt, dogState?.lastRewardClaimedAt]);

  // 2. Debounced save to storage (Preferences + localStorage fallback).
  useEffect(() => {
    if (!dogState) return;

    if (localSaveTimeoutRef.current) {
      clearTimeout(localSaveTimeoutRef.current);
    }

    localSaveTimeoutRef.current = setTimeout(() => {
      try {
        const persisted = {
          ...dogState,
          meta: {
            ...(dogState.meta || {}),
            schemaVersion: DOG_SAVE_SCHEMA_VERSION,
            savedAt: new Date().toISOString(),
          },
        };
        const key =
          storageKeyRef.current || getDogStorageKey(userIdRef.current);
        saveLocalSave(key, persisted);
        debugLog("DogAI", "debounced local save completed", {
          key,
          lastAction: dogState?.lastAction || null,
        });
      } catch (err) {
        debugError("DogAI", "debounced local save failed", err);
        console.error("[Doggerz] Failed to save dog state", err);
      }
    }, 400);
    return () => {
      if (localSaveTimeoutRef.current) {
        clearTimeout(localSaveTimeoutRef.current);
        localSaveTimeoutRef.current = null;
      }
    };
  }, [dogState]);

  // 3. Debounced cloud save whenever dogState changes while logged in
  useEffect(() => {
    if (!dogState || !dogState.adoptedAt) return;
    if (!cloudAuthUserId || !auth) return;

    // Clear existing timeout if any
    if (cloudSaveTimeoutRef.current) {
      clearTimeout(cloudSaveTimeoutRef.current);
    }

    // Schedule new debounced save
    cloudSaveTimeoutRef.current = setTimeout(() => {
      if (!auth?.currentUser || auth.currentUser.uid !== cloudAuthUserId)
        return;
      debugLog("DogAI", "debounced cloud save dispatched", {
        userId: cloudAuthUserId,
        lastAction: dogState?.lastAction || null,
      });
      dispatch(saveDogToCloud());
    }, CLOUD_SAVE_DEBOUNCE);

    // Cleanup on dependency change / unmount
    return () => {
      if (cloudSaveTimeoutRef.current) {
        clearTimeout(cloudSaveTimeoutRef.current);
      }
    };
  }, [cloudAuthUserId, dispatch, dogState]);

  useEffect(() => {
    return () => {
      if (profileSyncTimeoutRef.current) {
        clearTimeout(profileSyncTimeoutRef.current);
        profileSyncTimeoutRef.current = null;
      }
    };
  }, []);

  // Headless "brain" component: never renders UI
  return null;
}
