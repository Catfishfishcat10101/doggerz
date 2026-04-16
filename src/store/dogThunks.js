//src/store/dogThunks.js

import { createAsyncThunk } from "@reduxjs/toolkit";
import { getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/index.js";
import { dogMainDoc } from "@/lib/firebase/paths.js";
import {
  ensureAnonSignIn,
  isAnonymousFirebaseUser,
  isFirestorePermissionError,
} from "@/lib/firebaseClient.js";
import {
  hydrateDog,
  setAdoptedAt,
  setDogName as setDogProfileName,
} from "./dogSlice.js";
import {
  hydrateProgression,
  resetProgression,
} from "@/features/preogression/progressionSlice.js";
import { setDogName as setUserDogName, setUser } from "./userSlice.js";

function toMs(value) {
  if (!value) return 0;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (value instanceof Date) return value.getTime();
  if (typeof value?.toMillis === "function") {
    const ms = Number(value.toMillis());
    return Number.isFinite(ms) ? ms : 0;
  }
  if (typeof value === "object" && Number.isFinite(value?.seconds)) {
    return Math.max(0, Math.floor(value.seconds * 1000));
  }
  const parsed = Date.parse(String(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

const getDogTimestamp = (dog) => {
  return Math.max(
    toMs(dog?.updatedAt),
    toMs(dog?.lastCloudSyncAt),
    toMs(dog?.meta?.savedAt),
    toMs(dog?.lastUpdatedAt),
    toMs(dog?.adoptedAt)
  );
};

function clampPct(value) {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function pickMoodLabel(dog) {
  if (typeof dog?.mood === "string" && dog.mood.trim()) return dog.mood.trim();
  if (typeof dog?.emotionCue === "string" && dog.emotionCue.trim()) {
    return dog.emotionCue.trim();
  }
  return "Content";
}

function buildCloudSummary(state) {
  const dog = state?.dog || {};
  const user = state?.user || {};
  const settings = state?.settings || {};
  return {
    schemaVersion: 1,
    dog: {
      name:
        String(dog?.name || user?.dogName || "Fireball").trim() || "Fireball",
      stage:
        String(
          dog?.lifeStage?.label || dog?.lifeStage?.stage || "Puppy"
        ).trim() || "Puppy",
      ageDays: Math.max(0, Math.round(Number(dog?.lifeStage?.days || 0))),
      level: Math.max(1, Math.round(Number(dog?.level || 1))),
    },
    stats: {
      energy: clampPct(dog?.stats?.energy),
      health: clampPct(dog?.stats?.health),
      mood: pickMoodLabel(dog),
    },
    settings: {
      weatherNotifications: settings?.dailyRemindersEnabled !== false,
      soundVolume: clampPct(Number(settings?.audio?.masterVolume ?? 0.8) * 100),
      weatherFx: settings?.showWeatherFx !== false,
    },
  };
}

function buildCloudDogPayload(state) {
  const dogState = state?.dog || {};
  const progressionState = state?.progression || null;
  return {
    ...dogState,
    ...(progressionState && typeof progressionState === "object"
      ? { progression: progressionState }
      : {}),
    cloudSchemaVersion: 1,
    cloudSummary: buildCloudSummary(state),
    lastCloudSyncAt: Date.now(),
    updatedAt: serverTimestamp(),
  };
}

function sanitizeAdoptedName(value) {
  const trimmed = String(value || "")
    .trim()
    .replace(/\s+/g, " ");
  return trimmed.slice(0, 24) || "Fireball";
}

function setCloudSyncStatus(dispatch, cloudSync = {}) {
  dispatch(
    setUser({
      cloudSync,
    })
  );
}

export const adoptPup = createAsyncThunk(
  "dog/adoptPup",
  async (payload, { dispatch }) => {
    const requestedName =
      typeof payload === "string" ? payload : payload?.name || "";
    const adoptedAt =
      typeof payload?.now === "number" && Number.isFinite(payload.now)
        ? payload.now
        : Date.now();
    const name = sanitizeAdoptedName(requestedName);

    dispatch(setDogProfileName(name));
    dispatch(setUserDogName(name));
    dispatch(setAdoptedAt(adoptedAt));

    let cloudSaved = false;
    try {
      const result = await dispatch(saveDogToCloud()).unwrap();
      cloudSaved = Boolean(result?.success);
    } catch {
      // Adoption must still succeed locally even if cloud sync is unavailable.
      cloudSaved = false;
    }

    return {
      success: true,
      name,
      adoptedAt,
      cloudSaved,
    };
  }
);

/**
 * Loads and Hydrates the Dog.
 * Merges cloud data only if it is newer than the local state.
 */
export const loadDogFromCloud = createAsyncThunk(
  "dog/loadDogFromCloud",
  async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      if (!db) {
        setCloudSyncStatus(dispatch, {
          status: "local",
          errorMessage: null,
        });
        return rejectWithValue("Cloud sync unavailable");
      }
      const user = await ensureAnonSignIn();
      const userId = user?.uid || auth?.currentUser?.uid;
      if (isAnonymousFirebaseUser(user)) {
        setCloudSyncStatus(dispatch, {
          status: "local",
          errorMessage: null,
        });
        return rejectWithValue("Cloud sync disabled for anonymous session");
      }
      if (!userId) {
        setCloudSyncStatus(dispatch, {
          status: "local",
          errorMessage: null,
        });
        return rejectWithValue("User not logged in");
      }
      setCloudSyncStatus(dispatch, {
        status: "syncing",
        lastAttemptAt: Date.now(),
        errorMessage: null,
      });

      const localDog = getState().dog;

      const docRef = dogMainDoc(userId);
      if (!docRef) return rejectWithValue("Cloud document unavailable");
      const snap = await getDoc(docRef);

      if (!snap.exists()) {
        if (localDog?.adoptedAt) {
          await dispatch(saveDogToCloud()).unwrap();
          return { hydrated: false, reason: "uploaded_local_seed" };
        }

        setCloudSyncStatus(dispatch, {
          status: "saved",
          lastAttemptAt: Date.now(),
          lastSuccessAt: null,
          errorMessage: null,
        });
        return { hydrated: false, reason: "no_cloud_save" };
      }

      const cloudData = { ...(snap.data() || {}) };
      const progressionPayload =
        cloudData.progression && typeof cloudData.progression === "object"
          ? cloudData.progression
          : null;
      delete cloudData.progression;
      delete cloudData.cloudSummary;
      delete cloudData.cloudSchemaVersion;
      const cloudDogState = cloudData;

      const localTs = getDogTimestamp(localDog);
      const cloudTs = getDogTimestamp(cloudDogState);

      // Only hydrate if cloud is significantly newer (1s buffer)
      if (cloudTs > localTs + 1000) {
        dispatch(hydrateDog(cloudDogState));
        if (progressionPayload) {
          dispatch(hydrateProgression(progressionPayload));
        } else {
          dispatch(resetProgression());
        }
        setCloudSyncStatus(dispatch, {
          status: "saved",
          lastSuccessAt: Date.now(),
          errorMessage: null,
        });
        return { hydrated: true, cloudTs };
      }

      // Local is newer: push it to cloud to keep the server in sync.
      await dispatch(saveDogToCloud()).unwrap();
      return { hydrated: false, reason: "local_is_newer" };
    } catch (err) {
      const permissionDenied = isFirestorePermissionError(err);
      setCloudSyncStatus(dispatch, {
        status: permissionDenied ? "local" : "error",
        lastAttemptAt: Date.now(),
        errorMessage: permissionDenied
          ? null
          : err?.message || "Cloud load failed",
      });
      return rejectWithValue(err?.message || "Cloud load failed");
    }
  }
);

/**
 * Atomic Save to Firestore.
 */
export const saveDogToCloud = createAsyncThunk(
  "dog/saveDogToCloud",
  async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      if (!db) {
        setCloudSyncStatus(dispatch, {
          status: "local",
          errorMessage: null,
        });
        return rejectWithValue("Cloud sync unavailable");
      }
      const user = await ensureAnonSignIn();
      const userId = user?.uid || auth?.currentUser?.uid;
      const state = getState();
      const dogState = state.dog;
      if (isAnonymousFirebaseUser(user)) {
        setCloudSyncStatus(dispatch, {
          status: "local",
          errorMessage: null,
        });
        return rejectWithValue("Cloud sync disabled for anonymous session");
      }

      if (!userId || !dogState?.adoptedAt)
        return rejectWithValue("No dog to sync");

      setCloudSyncStatus(dispatch, {
        status: "syncing",
        lastAttemptAt: Date.now(),
        errorMessage: null,
      });

      const docRef = dogMainDoc(userId);
      if (!docRef) return rejectWithValue("Cloud document unavailable");

      const payload = buildCloudDogPayload(state);

      await setDoc(docRef, payload, { merge: true });
      setCloudSyncStatus(dispatch, {
        status: "saved",
        lastSuccessAt: Date.now(),
        errorMessage: null,
      });
      return { success: true };
    } catch (err) {
      const permissionDenied = isFirestorePermissionError(err);
      setCloudSyncStatus(dispatch, {
        status: permissionDenied ? "local" : "error",
        lastAttemptAt: Date.now(),
        errorMessage: permissionDenied
          ? null
          : err?.message || "Cloud save failed",
      });
      return rejectWithValue(err?.message || "Cloud save failed");
    }
  }
);
