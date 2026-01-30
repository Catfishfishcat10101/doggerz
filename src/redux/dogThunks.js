// src/redux/dogThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, firebaseReady, assertFirebaseReady } from "@/firebase.js";
import { hydrateDog, DOG_SAVE_SCHEMA_VERSION } from "./dogSlice.js";

const CLOUD_DOG_VERSION = 2;

function parseSavedAtToMs(value) {
  if (!value) return 0;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const t = Date.parse(String(value));
  return Number.isFinite(t) ? t : 0;
}

// ensure we only save plain JSON + meta
const buildCloudDogPayload = (dog) => {
  const now = Date.now();

  // Make a deep copy that removes functions, DOM nodes, and other non-serializable values.
  let clone;
  try {
    clone =
      typeof structuredClone === "function"
        ? structuredClone(dog)
        : JSON.parse(JSON.stringify(dog));
  } catch {
    try {
      clone = JSON.parse(JSON.stringify(dog));
    } catch {
      clone = {
        name: dog?.name ?? null,
        lifeStage: dog?.lifeStage ?? null,
        adoptedAt: dog?.adoptedAt ?? null,
      };
    }
  }

  // Remove known volatile or large runtime-only keys if present
  const volatileKeys = [
    "pixiApp",
    "textures",
    "canvas",
    "ctx",
    "socket",
    "__proto__",
    "_private",
  ];
  for (const k of volatileKeys) {
    if (clone && typeof clone === "object" && k in clone) delete clone[k];
  }

  return {
    ...clone,
    meta: {
      ...(clone?.meta || {}),
      schemaVersion: DOG_SAVE_SCHEMA_VERSION,
      savedAt: new Date(now).toISOString(),
    },
    lastCloudSyncAt: now,
    version: CLOUD_DOG_VERSION,
  };
};

// defensively unwrap data from Firestore for the client
const parseCloudDog = (raw) => {
  if (!raw) return null;
  const { version: _version, lastCloudSyncAt, userId: _userId, ...rest } = raw;
  return {
    ...rest,
    lastCloudSyncAt: lastCloudSyncAt ?? null,
  };
};

function getLocalDogTimestamp(localDog) {
  return Math.max(
    parseSavedAtToMs(localDog?.meta?.savedAt),
    parseSavedAtToMs(localDog?.meta?.lastTickAt),
    parseSavedAtToMs(localDog?.lastUpdatedAt),
    parseSavedAtToMs(localDog?.adoptedAt)
  );
}

function getCloudDogTimestamp(cloudDog) {
  return Math.max(
    parseSavedAtToMs(cloudDog?.meta?.savedAt),
    parseSavedAtToMs(cloudDog?.lastCloudSyncAt),
    parseSavedAtToMs(cloudDog?.lastUpdatedAt),
    parseSavedAtToMs(cloudDog?.adoptedAt)
  );
}

function mergeCloudOverLocal(localDog, cloudDog) {
  if (!localDog) return cloudDog || null;
  if (!cloudDog) return localDog;

  return {
    ...localDog,
    ...cloudDog,
    stats: { ...(localDog.stats || {}), ...(cloudDog.stats || {}) },
    memory: { ...(localDog.memory || {}), ...(cloudDog.memory || {}) },
    temperament: {
      ...(localDog.temperament || {}),
      ...(cloudDog.temperament || {}),
    },
    personality: {
      ...(localDog.personality || {}),
      ...(cloudDog.personality || {}),
    },
    training: { ...(localDog.training || {}), ...(cloudDog.training || {}) },
    dreams: { ...(localDog.dreams || {}), ...(cloudDog.dreams || {}) },
    journal: { ...(localDog.journal || {}), ...(cloudDog.journal || {}) },
    streak: { ...(localDog.streak || {}), ...(cloudDog.streak || {}) },
    bond: { ...(localDog.bond || {}), ...(cloudDog.bond || {}) },
    cosmetics: { ...(localDog.cosmetics || {}), ...(cloudDog.cosmetics || {}) },
    skillTree: { ...(localDog.skillTree || {}), ...(cloudDog.skillTree || {}) },
    meta: { ...(localDog.meta || {}), ...(cloudDog.meta || {}) },
  };
}

export const loadDogFromCloud = createAsyncThunk(
  "dog/loadDogFromCloud",
  async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      try {
        assertFirebaseReady("Dog load");
      } catch (err) {
        return rejectWithValue(String(err.message || err));
      }

      if (!firebaseReady || !db || !auth?.currentUser) {
        return rejectWithValue(
          "Cloud sync disabled: Firebase not configured or user not logged in"
        );
      }

      const userId = auth.currentUser.uid;
      const dogRef = doc(db, "users", userId, "dog", "state");
      const docSnap = await getDoc(dogRef);

      if (!docSnap.exists()) {
        console.log("[Doggerz] No cloud save found for this user");
        return { data: null, hydrated: false, reason: "no_cloud_save" };
      }

      const cloudData = parseCloudDog(docSnap.data());

      if (cloudData) {
        /** @type {any} */
        const state = getState();
        const localDog = state?.dog;

        const localHasDog = Boolean(localDog?.adoptedAt);
        const cloudHasDog = Boolean(cloudData?.adoptedAt);

        // Policy: local is the source of truth for moment-to-moment play.
        // Cloud is a backup/sync target. We only apply cloud over local if
        // cloud appears newer.
        const localTs = getLocalDogTimestamp(localDog);
        const cloudTs = getCloudDogTimestamp(cloudData);

        const shouldHydrateFromCloud =
          cloudHasDog && (!localHasDog || cloudTs > localTs + 1000);
        const shouldMerge =
          cloudHasDog && localHasDog && Math.abs(cloudTs - localTs) <= 1000;

        if (shouldHydrateFromCloud) {
          dispatch(hydrateDog(cloudData));
          console.log(
            "[Doggerz] Dog loaded from cloud and hydrated successfully"
          );
        } else if (shouldMerge) {
          const merged = mergeCloudOverLocal(localDog, cloudData);
          dispatch(hydrateDog(merged));
          console.log("[Doggerz] Cloud save merged with local");
        } else {
          console.log("[Doggerz] Cloud save ignored (local appears newer)");
        }

        return {
          data: cloudData,
          hydrated: shouldHydrateFromCloud,
          localTs,
          cloudTs,
          merged: shouldMerge,
        };
      }

      return { data: null, hydrated: false, reason: "empty_cloud_payload" };
    } catch (err) {
      console.error("[Doggerz] Failed to load dog from cloud", err);
      return rejectWithValue(err.message || "loadDogFromCloud failed");
    }
  }
);

export const saveDogToCloud = createAsyncThunk(
  "dog/saveDogToCloud",
  async (_, { getState, rejectWithValue }) => {
    try {
      try {
        assertFirebaseReady("Dog save");
      } catch (err) {
        return rejectWithValue(String(err.message || err));
      }
      if (!firebaseReady || !db || !auth?.currentUser) {
        return rejectWithValue(
          "Cloud sync disabled: Firebase not configured or user not logged in"
        );
      }

      const userId = auth.currentUser.uid;
      if (!userId) {
        return rejectWithValue("User ID is missing");
      }

      /** @type {any} */
      const state = getState();
      const dogState = state?.dog;

      // Don't sync if no dog adopted
      if (!dogState || !dogState.adoptedAt) {
        console.warn("[Doggerz] No dog to sync");
        return { success: false, reason: "no_dog" };
      }

      const dogRef = doc(db, "users", userId, "dog", "state");
      const payload = buildCloudDogPayload({
        ...dogState,
        userId,
      });

      // Sanity-size check: avoid writing huge blobs. 500KB threshold.
      try {
        const raw = JSON.stringify(payload);
        const bytes =
          typeof Buffer !== "undefined" && Buffer.byteLength
            ? Buffer.byteLength(raw, "utf8")
            : raw.length;
        const maxBytes = 500 * 1024;
        if (bytes > maxBytes) {
          console.warn("[Doggerz] Cloud payload too large (bytes)", bytes);
          return rejectWithValue("payload_too_large");
        }
      } catch (e) {
        // If size check fails, continue but log
        console.warn("[Doggerz] Failed to compute payload size", e);
      }

      await setDoc(dogRef, payload, { merge: true });
      console.log("[Doggerz] Dog saved to cloud successfully");
      return { success: true, timestamp: Date.now() };
    } catch (err) {
      console.error("[Doggerz] Failed to save dog to cloud", err);
      return rejectWithValue(err.message || "saveDogToCloud failed");
    }
  }
);
