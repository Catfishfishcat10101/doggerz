// src/redux/dogThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, firebaseReady } from "@/firebase.js";
import { hydrateDog, DOG_SAVE_SCHEMA_VERSION } from './dogSlice.js';

const CLOUD_DOG_VERSION = 1;

function parseSavedAtToMs(value) {
  if (!value) return 0;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const t = Date.parse(String(value));
  return Number.isFinite(t) ? t : 0;
}

// ensure we only save plain JSON + meta
const buildCloudDogPayload = (dog) => {
  const now = Date.now();
  return {
    ...dog,
    meta: {
      ...(dog?.meta || {}),
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

export const loadDogFromCloud = createAsyncThunk(
  'dog/loadDogFromCloud',
  async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      if (!firebaseReady || !db || !auth?.currentUser) {
        return rejectWithValue(
          'Cloud sync disabled: Firebase not configured or user not logged in'
        );
      }

      const userId = auth.currentUser.uid;
      const dogRef = doc(db, 'users', userId, 'dog', 'state');
      const docSnap = await getDoc(dogRef);

      if (!docSnap.exists()) {
        console.log('[Doggerz] No cloud save found for this user');
        return { data: null, hydrated: false, reason: 'no_cloud_save' };
      }

      const cloudData = parseCloudDog(docSnap.data());

      // Automatically hydrate the dog state
      if (cloudData) {
        /** @type {any} */
        const state = getState();
        const localDog = state?.dog;

        const localHasDog = Boolean(localDog?.adoptedAt);
        const cloudHasDog = Boolean(cloudData?.adoptedAt);

        // Policy: local is the source of truth for moment-to-moment play.
        // Cloud is a backup/sync target. We only apply cloud over local if
        // cloud appears newer.
        const localTs = Math.max(
          parseSavedAtToMs(localDog?.meta?.savedAt),
          parseSavedAtToMs(localDog?.meta?.lastTickAt),
          parseSavedAtToMs(localDog?.adoptedAt)
        );
        const cloudTs = Math.max(
          parseSavedAtToMs(cloudData?.meta?.savedAt),
          parseSavedAtToMs(cloudData?.lastCloudSyncAt),
          parseSavedAtToMs(cloudData?.adoptedAt)
        );

        const shouldHydrateFromCloud =
          cloudHasDog && (!localHasDog || cloudTs > localTs + 1000);

        if (shouldHydrateFromCloud) {
          dispatch(hydrateDog(cloudData));
          console.log(
            '[Doggerz] Dog loaded from cloud and hydrated successfully'
          );
        } else {
          console.log('[Doggerz] Cloud save ignored (local appears newer)');
        }

        return {
          data: cloudData,
          hydrated: shouldHydrateFromCloud,
          localTs,
          cloudTs,
        };
      }

      return { data: null, hydrated: false, reason: 'empty_cloud_payload' };
    } catch (err) {
      console.error('[Doggerz] Failed to load dog from cloud', err);
      return rejectWithValue(err.message || 'loadDogFromCloud failed');
    }
  }
);

export const saveDogToCloud = createAsyncThunk(
  "dog/saveDogToCloud",
  async (_, { getState, rejectWithValue }) => {
    try {
      if (!firebaseReady || !db || !auth?.currentUser) {
        return rejectWithValue(
          "Cloud sync disabled: Firebase not configured or user not logged in",
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

      await setDoc(dogRef, payload, { merge: true });
      console.log("[Doggerz] Dog saved to cloud successfully");
      return { success: true, timestamp: Date.now() };
    } catch (err) {
      console.error("[Doggerz] Failed to save dog to cloud", err);
      return rejectWithValue(err.message || "saveDogToCloud failed");
    }
  },
);
