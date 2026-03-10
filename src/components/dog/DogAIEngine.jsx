// src/components/dog/DogAIEngine.jsx
// @ts-check

import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector, useDispatch } from "react-redux";
import { Capacitor } from "@capacitor/core";
import { onAuthStateChanged } from "firebase/auth";
import { onSnapshot } from "firebase/firestore";
import { auth } from "@/firebase.js";
import {
  grantFounderReward,
  grantPreRegGift,
  hydrateDog,
  resetDogState,
  registerSessionStart,
  DOG_STORAGE_KEY,
  getDogStorageKey,
} from "@/redux/dogSlice.js";
import {
  setWeatherError,
  setWeatherLoading,
  setWeatherSnapshot,
} from "@/redux/weatherSlice.js";
import { loadDogFromCloud, saveDogToCloud } from "@/redux/dogThunks.js";
import {
  clearUser,
  selectUserIsFounder,
  selectUserZip,
  setUser,
} from "@/redux/userSlice.js";
import { selectSettings } from "@/redux/settingsSlice.js";
import { useDogActionSfx } from "@/features/audio/useDogActionSfx.js";
import useDynamicMusic from "@/features/audio/useDynamicMusic.js";
import { useDogEngineState } from "@/hooks/useDogState.js";
import { ensureDogMain } from "@/firebase/ensureDog.js";
import { userProfileDoc } from "@/firebase/paths.js";
import {
  hasPreRegistrationRewardPurchase,
  PRE_REG_GIFT_COINS,
} from "@/features/billing/preRegistrationReward.js";
import {
  loadLocalSave,
  migrateLegacySave,
  saveLocalSave,
} from "@/logic/LocalSaveManager.js";
import { fetchRealTimeWeather } from "@/logic/RealTimeWeatherFetcher.js";

const CLOUD_SAVE_DEBOUNCE = 3_000; // 3 seconds
const WEATHER_POLL_INTERVAL_MS = 12 * 60_000; // 12 minutes (gentle on API limits)

const HYDRATE_ERROR_KEY = "doggerz:hydrateError";

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
    .then((mod) => mod?.App || null)
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

export default function DogAIEngine() {
  const dispatch = useDispatch();
  const { dog: dogState, renderModel } = useDogEngineState();
  const zip = useSelector(selectUserZip);
  const settings = useSelector(selectSettings);
  const isFounder = useSelector(selectUserIsFounder);

  const hasHydratedRef = useRef(false);
  const cloudSaveTimeoutRef = useRef(
    /** @type {ReturnType<typeof setTimeout> | null} */ (null)
  );
  const localSaveTimeoutRef = useRef(
    /** @type {ReturnType<typeof setTimeout> | null} */ (null)
  );

  useDogActionSfx({
    anim: renderModel?.anim,
    energy: dogState?.stats?.energy,
    audio: settings?.audio,
    hapticsEnabled: settings?.hapticsEnabled !== false,
  });
  useDynamicMusic();

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
  const lastHydratedUserIdRef = useRef(/** @type {string | null} */ (null));
  const storageKeyRef = useRef(getDogStorageKey(null));
  const [userId, setUserId] = useState(null);

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
    } catch (err) {
      console.error("[Doggerz] Failed to flush local save", err);
    }
  }, []);

  useEffect(() => {
    zipRef.current = zip;
  }, [zip]);

  const weatherQuery = useQuery({
    queryKey: [
      "weather",
      zip || import.meta.env.VITE_WEATHER_DEFAULT_ZIP || "10001",
    ],
    queryFn: ({ signal }) =>
      fetchRealTimeWeather({ zip: zipRef.current || zip, signal }),
    refetchInterval: WEATHER_POLL_INTERVAL_MS,
    refetchIntervalInBackground: false,
    staleTime: WEATHER_POLL_INTERVAL_MS,
  });

  useEffect(() => {
    dispatch(setWeatherLoading({ zip }));
  }, [dispatch, zip]);

  useEffect(() => {
    if (!weatherQuery.data) return;
    dispatch(setWeatherSnapshot(weatherQuery.data));
  }, [dispatch, weatherQuery.data]);

  useEffect(() => {
    if (!weatherQuery.error) return;
    dispatch(
      setWeatherError(
        getErrorMessage(weatherQuery.error, "Weather fetch failed")
      )
    );
  }, [dispatch, weatherQuery.error]);

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
      const CapacitorApp = await getCapacitorApp();
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
              flushLocalSave();
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
  }, [flushLocalSave]);

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

  // Track auth changes reactively (auth.currentUser is not a reactive value by itself).
  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, async (user) => {
      const nextId = user?.uid || null;
      userIdRef.current = nextId;
      setUserId(nextId);
      if (user) {
        try {
          await ensureDogMain(user.uid);
        } catch (err) {
          console.error("[Doggerz] Failed to ensure cloud document:", err);
        }

        const createdAt = user?.metadata?.creationTime
          ? Date.parse(user.metadata.creationTime)
          : null;
        dispatch(
          setUser({
            id: user.uid,
            displayName: user.displayName || "Trainer",
            email: user.email || null,
            avatarUrl: user.photoURL || null,
            createdAt: Number.isFinite(createdAt) ? createdAt : null,
          })
        );
      } else {
        lastHydratedUserIdRef.current = null;
        dispatch(clearUser());
      }
    });
    return () => {
      try {
        unsub();
      } catch {
        // ignore
      }
    };
  }, [dispatch]);

  useEffect(() => {
    if (!userId) return undefined;

    const unsub = onSnapshot(
      userProfileDoc(userId),
      (snap) => {
        const data =
          snap.exists() && snap.data() && typeof snap.data() === "object"
            ? snap.data()
            : {};
        const streak =
          data.streak && typeof data.streak === "object"
            ? data.streak
            : undefined;

        dispatch(
          setUser({
            zip: data.zip,
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
  }, [dispatch, userId]);

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

      let parsed = null;
      try {
        let parsed = await loadLocalSave(nextKey, null);
        if (!parsed && nextKey === getDogStorageKey(null)) {
          parsed = await migrateLegacySave({
            legacyKey: DOG_STORAGE_KEY,
            activeKey: nextKey,
          });
        }
        if (parsed) parsed = reviveDogDates(parsed);
      } catch (err) {
        console.warn("[Doggerz] Failed to load dog from new storage key", err);
      }

      if (cancelled) return;
      dispatch(resetDogState());
      if (parsed) {
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

    let cancelled = false;

    const run = async () => {
      // Preferences/localStorage hydrate (skip if store already preloaded it)
      if (!dogState?.adoptedAt) {
        try {
          const activeKey =
            storageKeyRef.current || getDogStorageKey(userIdRef.current);
          let parsed = await loadLocalSave(activeKey, null);

          if (!parsed && activeKey === getDogStorageKey(null)) {
            parsed = await migrateLegacySave({
              legacyKey: DOG_STORAGE_KEY,
              activeKey,
            });
          }

          if (!cancelled && parsed) {
            dispatch(hydrateDog(reviveDogDates(parsed)));
          }
        } catch (err) {
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
      if (auth?.currentUser) {
        const thunkPromise = dispatch(loadDogFromCloud());

        // RTK's unwrap if available; fall back to raw promise
        if (thunkPromise && typeof thunkPromise.unwrap === "function") {
          thunkPromise.unwrap().catch((err) => {
            console.error("[Doggerz] Failed to load dog from cloud", err);
          });
        } else if (thunkPromise?.catch) {
          thunkPromise.catch((err) => {
            console.error("[Doggerz] Failed to load dog from cloud", err);
          });
        }
      }

      // Register session start (catch-up decay, penalties, streak, etc.)
      const now = Date.now();
      dispatch(
        registerSessionStart({ now, timeBucket: getLocalTimeBucket(now) })
      );
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [dispatch, dogState?.adoptedAt]);

  // 1b. If user logs in *after* mount, pull from cloud once
  useEffect(() => {
    if (!userId) return;
    if (!hasHydratedRef.current) return; // let the first effect run first
    if (lastHydratedUserIdRef.current === userId) return;

    const thunkPromise = dispatch(loadDogFromCloud());
    lastHydratedUserIdRef.current = userId;

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
          console.error("[Doggerz] Late cloud load failed", err);
        });
    }
  }, [dispatch, userId]);

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

  // Pre-registration reward entitlement check (native only, one-time grant).
  useEffect(() => {
    if (!dogState?.adoptedAt) return;
    if (dogState?.claimedPreReg) return;

    let cancelled = false;
    const run = async () => {
      const hasEntitlement = await hasPreRegistrationRewardPurchase();
      if (!hasEntitlement || cancelled) return;
      dispatch(
        grantPreRegGift({
          coins: PRE_REG_GIFT_COINS,
          now: Date.now(),
        })
      );
    };

    run().catch((err) => {
      console.warn("[Doggerz] Pre-registration reward check failed", err);
    });

    return () => {
      cancelled = true;
    };
  }, [dispatch, dogState?.adoptedAt, dogState?.claimedPreReg]);

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
      } catch (err) {
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
    if (!auth || !userIdRef.current) return;

    // Clear existing timeout if any
    if (cloudSaveTimeoutRef.current) {
      clearTimeout(cloudSaveTimeoutRef.current);
    }

    // Schedule new debounced save
    cloudSaveTimeoutRef.current = setTimeout(() => {
      if (!auth?.currentUser || !userIdRef.current) return;
      dispatch(saveDogToCloud());
    }, CLOUD_SAVE_DEBOUNCE);

    // Cleanup on dependency change / unmount
    return () => {
      if (cloudSaveTimeoutRef.current) {
        clearTimeout(cloudSaveTimeoutRef.current);
      }
    };
  }, [dogState, dispatch]);

  // Headless "brain" component: never renders UI
  return null;
}
