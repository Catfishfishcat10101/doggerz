//src/store/dogThunks.js

import { createAsyncThunk } from "@reduxjs/toolkit";
import { deleteDoc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
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
  createDogPersistenceSnapshot,
  getPersistenceSnapshotTimestamp,
  splitDogPersistenceSnapshot,
} from "@/store/dog/persistenceSnapshot.js";
import {
  hydrateProgression,
  resetProgression,
} from "@/features/progression/progressionSlice.js";
import { setDogName as setUserDogName, setUser } from "./userSlice.js";

const getDogTimestamp = (dog) => {
  return getPersistenceSnapshotTimestamp(dog);
};

function buildCloudDogPayload(state) {
  return {
    ...createDogPersistenceSnapshot(state),
    lastCloudSyncAt: Date.now(),
    updatedAt: serverTimestamp(),
  };
}

function sanitizeAdoptedName(value) {
  const trimmed = String(value || "")
    .trim()
    .replace(/\s+/g, " ");
  return trimmed.slice(0, 24) || "Your dog";
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

      const parsedCloud = splitDogPersistenceSnapshot(snap.data() || {});
      if (!parsedCloud.ok) {
        setCloudSyncStatus(dispatch, {
          status: "error",
          lastAttemptAt: Date.now(),
          errorMessage: `Invalid cloud save: ${parsedCloud.reason}`,
        });
        return rejectWithValue(`Invalid cloud save: ${parsedCloud.reason}`);
      }

      const localTs = getDogTimestamp(localDog);
      const cloudTs = parsedCloud.timestamp;

      // Only hydrate if cloud is significantly newer (1s buffer)
      if (cloudTs > localTs + 1000) {
        dispatch(hydrateDog(parsedCloud.dog));
        if (parsedCloud.progression) {
          dispatch(hydrateProgression(parsedCloud.progression));
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

export const deleteDogFromCloud = createAsyncThunk(
  "dog/deleteDogFromCloud",
  async (_, { dispatch, rejectWithValue }) => {
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
      if (!userId) return rejectWithValue("User not logged in");

      setCloudSyncStatus(dispatch, {
        status: "syncing",
        lastAttemptAt: Date.now(),
        errorMessage: null,
      });

      const docRef = dogMainDoc(userId);
      if (!docRef) return rejectWithValue("Cloud document unavailable");
      await deleteDoc(docRef);

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
          : err?.message || "Cloud delete failed",
      });
      return rejectWithValue(err?.message || "Cloud delete failed");
    }
  }
);
