// src/redux/dogThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, firebaseReady } from "@/firebase.js";
import { hydrateDog } from "./dogSlice.js";

const DOG_COLLECTION = "dogs";
const CLOUD_DOG_VERSION = 1;

// ensure we only save plain JSON + meta
const buildCloudDogPayload = (dog) => ({
  ...dog,
  meta: {
    version: CLOUD_DOG_VERSION,
    updatedAt: serverTimestamp(),
  },
});

// defensively unwrap data from Firestore for the client
const parseCloudDog = (raw) => {
  if (!raw) return null;
  const { meta, ...rest } = raw;
  return {
    ...rest,
    meta: {
      version: meta?.version ?? 1,
      updatedAt: meta?.updatedAt ?? null,
    },
  };
};

export const loadDogFromCloud = createAsyncThunk(
  "dog/loadDogFromCloud",
  async ({ uid }, { dispatch, rejectWithValue }) => {
    try {
      if (!firebaseReady || !db) {
        return rejectWithValue(
          "Cloud sync disabled until Firebase is configured."
        );
      }
      if (!uid) return rejectWithValue("Missing uid");

      const ref = doc(db, DOG_COLLECTION, uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        // no cloud dog yet – caller can decide what to do
        return null;
      }

      const data = parseCloudDog(snap.data());
      dispatch(hydrateDog(data));
      return data;
    } catch (err) {
      console.error("[Doggerz] Failed to load dog from cloud", err);
      return rejectWithValue(err.message || "loadDogFromCloud failed");
    }
  }
);

export const saveDogToCloud = createAsyncThunk(
  "dog/saveDogToCloud",
  async ({ uid, dog }, { rejectWithValue }) => {
    try {
      if (!firebaseReady || !db) {
        return rejectWithValue(
          "Cloud sync disabled until Firebase is configured."
        );
      }
      if (!uid || !dog) return rejectWithValue("Missing uid or dog");

      const ref = doc(db, DOG_COLLECTION, uid);
      const payload = buildCloudDogPayload(dog);

      await setDoc(ref, payload, { merge: true });
      return true;
    } catch (err) {
      console.error("[Doggerz] Failed to save dog to cloud", err);
      return rejectWithValue(err.message || "saveDogToCloud failed");
    }
  }
);
