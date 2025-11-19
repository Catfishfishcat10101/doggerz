// src/redux/dogThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, firebaseReady } from "@/firebase.js";
import { hydrateDog } from "./dogSlice.js";

const CLOUD_DOG_VERSION = 1;

// ensure we only save plain JSON + meta
const buildCloudDogPayload = (dog) => ({
  ...dog,
  lastCloudSyncAt: Date.now(),
  version: CLOUD_DOG_VERSION,
});

// defensively unwrap data from Firestore for the client
const parseCloudDog = (raw) => {
  if (!raw) return null;
  const { version, lastCloudSyncAt, userId, ...rest } = raw;
  return {
    ...rest,
    lastCloudSyncAt: lastCloudSyncAt ?? null,
  };
};

export const loadDogFromCloud = createAsyncThunk(
  "dog/loadDogFromCloud",
  async (_, { dispatch, rejectWithValue }) => {
    try {
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
        return null;
      }

      const cloudData = parseCloudDog(docSnap.data());

      // Automatically hydrate the dog state
      if (cloudData) {
        dispatch(hydrateDog(cloudData));
        console.log(
          "[Doggerz] Dog loaded from cloud and hydrated successfully"
        );
      }

      return cloudData;
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
      if (!firebaseReady || !db || !auth?.currentUser) {
        return rejectWithValue(
          "Cloud sync disabled: Firebase not configured or user not logged in"
        );
      }

      const userId = auth.currentUser.uid;
      if (!userId) {
        return rejectWithValue("User ID is missing");
      }

      // Get current dog state from Redux
      /** @type {any} */
      const state = getState();
      const dogState = state?.dog;

      if (!dogState) {
        console.warn("[Doggerz] saveDogToCloud called with no dog state");
        return rejectWithValue("No dog state to sync");
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
      console.error("[Doggerz] Error code:", err.code);
      console.error("[Doggerz] Error message:", err.message);
      return rejectWithValue(err.message || "saveDogToCloud failed");
    }
  }
);
