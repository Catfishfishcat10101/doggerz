// src/redux/dogThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, assertFirebaseReady } from "@/firebase.js";
import { hydrateDog } from "./dogSlice.js";

const CLOUD_DOG_VERSION = 1;

// ensure we only save plain JSON + meta
const buildCloudDogPayload = (dog) => {
  // Make a deep copy that removes functions, DOM nodes, and other non-serializable values.
  let clone;
  try {
    // structuredClone would be ideal, but fallback to JSON stringify/parse for portability
    clone =
      typeof structuredClone === "function"
        ? structuredClone(dog)
        : JSON.parse(JSON.stringify(dog));
  } catch (e) {
    // Last resort: try JSON roundtrip, catching circular reference errors.
    try {
      clone = JSON.parse(JSON.stringify(dog));
    } catch (err) {
      // If cloning fails, fall back to a minimal snapshot
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
    if (k in clone) delete clone[k];
  }

  // Ensure adoptedAt values are normalized to milliseconds (number) or null
  const normalizeAdoptedAt = (v) => {
    if (v === undefined || v === null) return null;
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (v instanceof Date) return v.getTime();
    if (typeof v === "string") {
      const num = Number(v);
      if (!Number.isNaN(num)) return num;
      const parsed = Date.parse(v);
      if (!Number.isNaN(parsed)) return parsed;
    }
    return null;
  };

  if (clone.adoptedAt) clone.adoptedAt = normalizeAdoptedAt(clone.adoptedAt);
  if (clone.temperament && clone.temperament.adoptedAt)
    clone.temperament.adoptedAt = normalizeAdoptedAt(
      clone.temperament.adoptedAt,
    );

  return {
    ...clone,
    lastCloudSyncAt: Date.now(),
    version: CLOUD_DOG_VERSION,
  };
};

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
      try {
        assertFirebaseReady("Dog load");
      } catch (err) {
        return rejectWithValue(String(err.message || err));
      }

      if (!db || !auth?.currentUser) {
        return rejectWithValue("Cloud sync disabled: DB or auth missing");
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
      try {
        assertFirebaseReady("Dog save");
      } catch (err) {
        return rejectWithValue(String(err.message || err));
      }

      if (!db || !auth?.currentUser) {
        return rejectWithValue("Cloud sync disabled: DB or auth missing");
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
      const payload = buildCloudDogPayload({ ...dogState, userId });

      // Sanity-size check: avoid writing huge blobs. 500KB threshold.
      try {
        const raw = JSON.stringify(payload);
        const bytes = Buffer ? Buffer.byteLength(raw, "utf8") : raw.length;
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
  },
);
