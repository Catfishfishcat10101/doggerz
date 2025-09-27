// src/lib/persistence.js
// Local-first, Firebase-optional save/load.
import { auth, db } from "@/lib/firebase"; // if you don't have these yet, it still falls back
import { doc, getDoc, setDoc } from "firebase/firestore";

const KEY = "doggerz/save/v1";

export async function saveSnapshot(dogState) {
  // local
  localStorage.setItem(KEY, JSON.stringify(dogState));
  // remote (best-effort)
  const u = auth?.currentUser;
  if (u && db) {
    const ref = doc(db, "doggerz_saves", u.uid);
    await setDoc(ref, { dog: dogState, updatedAt: Date.now() }, { merge: true });
  }
}

export async function loadSnapshot() {
  // prefer remote if logged in
  const u = auth?.currentUser;
  if (u && db) {
    try {
      const ref = doc(db, "doggerz_saves", u.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) return snap.data().dog;
    } catch {}
  }
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}