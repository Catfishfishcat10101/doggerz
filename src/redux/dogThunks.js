// src/redux/dogThunks.js
// Doggerz: Cloud sync thunks for dog state (Firebase).
// Usage:
//   dispatch(loadDogFromCloud())
//   dispatch(saveDogToCloud())
// Always safe: they no-op / reject cleanly if Firebase/auth/dog are missing.

// @ts-nocheck

import { createAsyncThunk } from "@reduxjs/toolkit";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, firebaseReady } from "@/firebase.js";
import { hydrateDog } from "./dogSlice.js";

const CLOUD_DOG_VERSION = 1;

const DOG_DOC_COLLECTION = "dogs";

/**
 * Build a cloud payload for dog state (plain JSON + meta).
 * @param {object} dog
 * @returns {object}
 */
const buildCloudDogPayload = (dog) => ({
  ...dog,
  lastCloudSyncAt: Date.now(),
  version: CLOUD_DOG_VERSION,
});

/**
 * Defensively unwrap data from Firestore for the client.
 * @param {object} raw
 * @returns {object|null}
 */
const parseCloudDog = (raw) => {
  if (!raw) return null;
  const { version, ...rest } = raw;
  // Later: handle migrations by version.
  return rest;
};

const selectDogState = (state) => state.dog?.dog ?? null;

/**
 * Load dog from Firestore into Redux.
 */
export const loadDogFromCloud = createAsyncThunk(
  "dog/loadDogFromCloud",
  async (_, { dispatch, rejectWithValue }) => {
    if (!firebaseReady) {
      console.warn("[Doggerz] Firebase not ready; skipping cloud load.");
      return rejectWithValue("firebase-not-ready");
    }

    const user = auth.currentUser;
    if (!user) {
      console.warn("[Doggerz] No user; cannot load cloud dog.");
      return rejectWithValue("not-authenticated");
    }

    try {
      const ref = doc(db, DOG_DOC_COLLECTION, user.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        console.info("[Doggerz] No cloud dog document yet.");
        return rejectWithValue("no-cloud-dog");
      }

      const parsed = parseCloudDog(snap.data());
      if (!parsed) {
        return rejectWithValue("invalid-cloud-dog");
      }

      dispatch(hydrateDog(parsed));
      return parsed;
    } catch (err) {
      console.error("[Doggerz] loadDogFromCloud failed", err);
      return rejectWithValue(err.message || "load-failed");
    }
  },
);

/**
 * Save current dog to Firestore.
 * Safely no-ops if:
 *   - firebase not ready
 *   - user not authed
 *   - there is no adopted dog (no adoptedAt)
 */
export const saveDogToCloud = createAsyncThunk(
  "dog/saveDogToCloud",
  async (_, { getState, rejectWithValue }) => {
    if (!firebaseReady) {
      console.warn("[Doggerz] Firebase not ready; skipping cloud save.");
      return rejectWithValue("firebase-not-ready");
    }

    const user = auth.currentUser;
    if (!user) {
      console.warn("[Doggerz] No user; cannot save cloud dog.");
      return rejectWithValue("not-authenticated");
    }

    const dog = selectDogState(getState());

    if (!dog || !dog.adoptedAt) {
      console.warn("[Doggerz] No adopted dog to sync; skipping cloud save.");
      return rejectWithValue("no-dog");
    }

    try {
      const ref = doc(db, DOG_DOC_COLLECTION, user.uid);
      const payload = buildCloudDogPayload(dog);
      await setDoc(ref, payload, { merge: true });
      return payload;
    } catch (err) {
      console.error("[Doggerz] saveDogToCloud failed", err);
      return rejectWithValue(err.message || "save-failed");
    }
  },
);
