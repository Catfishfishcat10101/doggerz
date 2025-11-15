// src/redux/dogThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase.js";
import { hydrateDog } from "./dogSlice.js";

const DOG_COLLECTION = "dogs";

// Load dog state for a given user id from Firestore
export const loadDogFromCloud = createAsyncThunk(
  "dog/loadDogFromCloud",
  async ({ uid }, { dispatch, rejectWithValue }) => {
    try {
      if (!uid) {
        return rejectWithValue("Missing uid");
      }

      const ref = doc(db, DOG_COLLECTION, uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        // No cloud dog yet – nothing to hydrate
        return null;
      }

      const data = snap.data();
      dispatch(hydrateDog(data));
      return data;
    } catch (err) {
      console.error("[Doggerz] Failed to load dog from cloud", err);
      return rejectWithValue(err.message || "loadDogFromCloud failed");
    }
  }
);

// Save dog state for a given user id to Firestore
export const saveDogToCloud = createAsyncThunk(
  "dog/saveDogToCloud",
  async ({ uid, dog }, { rejectWithValue }) => {
    try {
      if (!uid || !dog) {
        return rejectWithValue("Missing uid or dog");
      }

      const ref = doc(db, DOG_COLLECTION, uid);
      await setDoc(ref, dog, { merge: true });
      return true;
    } catch (err) {
      console.error("[Doggerz] Failed to save dog to cloud", err);
      return rejectWithValue(err.message || "saveDogToCloud failed");
    }
  }
);
