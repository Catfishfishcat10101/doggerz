//src/layout/dogThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { auth, db } from "../utils/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { hydrateDog } from "../redux/dogSlice";

/** Fetch the current user's dog and hydrate Redux. */
export const fetchDog = createAsyncThunk("dog/fetch", async (_, { dispatch }) => {
  const u = auth.currentUser;
  if (!u) return null;
  const ref = doc(db, "dogs", u.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const data = snap.data();
    dispatch(hydrateDog(data));
    return data;
  }
  return null;
});

/** Persist a partial update to the dog doc and hydrate Redux with the result. */
export const saveDog = createAsyncThunk("dog/save", async (patch, { dispatch }) => {
  const u = auth.currentUser;
  if (!u) throw new Error("Not authenticated");
  const ref = doc(db, "dogs", u.uid);
  const payload = { ...patch, updatedAt: serverTimestamp() };
  await setDoc(ref, payload, { merge: true });
  const snap = await getDoc(ref);
  const data = snap.exists() ? snap.data() : null;
  if (data) dispatch(hydrateDog(data));
  return data;
});