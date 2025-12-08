// src/redux/dogThunks.js
// @ts-nocheck
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
          "Cloud sync disabled: Firebase not configured or user not logged in",
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
          "[Doggerz] Dog loaded from cloud and hydrated successfully",
        );
      }

      return cloudData;
    } catch (err) {
      console.error("[Doggerz] Failed to load dog from cloud", err);
      return rejectWithValue(err.message || "loadDogFromCloud failed");
    }
  },
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

export const saveMemorialToCloud = createAsyncThunk(
  "dog/saveMemorialToCloud",
  async (memorial, { rejectWithValue }) => {
    try {
      if (!firebaseReady || !db || !auth?.currentUser) {
        return rejectWithValue(
          "Cloud sync disabled: Firebase not configured or user not logged in"
        );
      }

      const userId = auth.currentUser.uid;
      const memorialRef = doc(
        db,
        "users",
        userId,
        "memorials",
        `${Date.now()}`
      );
      // avoid spreading unknown types for stricter typing
      /** @type {any} */
      const m = memorial || {};
      await setDoc(memorialRef, {
        name: m.name || null,
        deceasedAt: m.deceasedAt || null,
        journal: m.journal || [],
        createdAt: Date.now(),
        userId,
      });
      console.log("[Doggerz] Memorial saved to cloud");
      return { success: true };
    } catch (err) {
      console.error("[Doggerz] Failed to save memorial to cloud", err);
      return rejectWithValue(err.message || "saveMemorialToCloud failed");
    }
  }
);
