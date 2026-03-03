/** @format */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/firebase.js";
import { dogMainDoc } from "@/firebase/paths.js";
import { ensureAnonSignIn } from "@/lib/firebaseClient.js";
import { hydrateDog } from "./dogSlice.js";

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

/**
 * Loads and Hydrates the Dog.
 * Merges cloud data only if it is newer than the local state.
 */
export const loadDogFromCloud = createAsyncThunk(
  "dog/loadDogFromCloud",
  async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      if (!db) return rejectWithValue("Cloud sync unavailable");
      const user = await ensureAnonSignIn();
      const userId = user?.uid || auth.currentUser?.uid;
      if (!userId) return rejectWithValue("User not logged in");

      const docRef = dogMainDoc(userId);
      const snap = await getDoc(docRef);

      if (!snap.exists()) return { hydrated: false, reason: "no_cloud_save" };

      const cloudData = snap.data();
      const localDog = getState().dog;

      const localTs = getDogTimestamp(localDog);
      const cloudTs = getDogTimestamp(cloudData);

      // Only hydrate if cloud is significantly newer (1s buffer)
      if (cloudTs > localTs + 1000) {
        dispatch(hydrateDog(cloudData));
        return { hydrated: true, cloudTs };
      }

      // Local is newer: push it to cloud to keep the server in sync.
      dispatch(saveDogToCloud());
      return { hydrated: false, reason: "local_is_newer" };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/**
 * Atomic Save to Firestore.
 */
export const saveDogToCloud = createAsyncThunk(
  "dog/saveDogToCloud",
  async (_, { getState, rejectWithValue }) => {
    try {
      if (!db) return rejectWithValue("Cloud sync unavailable");
      const user = await ensureAnonSignIn();
      const userId = user?.uid || auth.currentUser?.uid;
      const dogState = getState().dog;

      if (!userId || !dogState?.adoptedAt)
        return rejectWithValue("No dog to sync");

      const docRef = dogMainDoc(userId);

      // We use serverTimestamp for the authoritative "updatedAt"
      const payload = {
        ...dogState,
        lastCloudSyncAt: Date.now(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(docRef, payload, { merge: true });
      return { success: true };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);
