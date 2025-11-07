// src/utils/firebase/dogService.js
import { auth, db } from "./firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

// Shape aligned to redux initialState so Firestore → Redux is 1:1
const DEFAULT_DOG_DOC = {
  name: "Pup",
  level: 1,
  coins: 0,
  stats: { hunger: 50, happiness: 60, energy: 60, cleanliness: 60 },
  pos: { x: 0, y: 0 },
  isPottyTrained: false,
  pottyLevel: 0,
  poopCount: 0,
  lastTrainedAt: null,
  sprite: "/sprites/jackrussell/idle.svg",
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
};

export async function getMyDogDoc() {
  const u = auth.currentUser;
  if (!u) return null;
  const ref = doc(db, "dogs", u.uid);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: u.uid, ...snap.data() } : null;
}

export async function adoptDog(name) {
  const u = auth.currentUser;
  if (!u) throw new Error("Not signed in");

  const ref = doc(db, "dogs", u.uid);
  const payload = {
    ...DEFAULT_DOG_DOC,
    name: String(name || "Pup").slice(0, 24),
    // if a doc exists, we won’t overwrite progress; just set missing fields
    updatedAt: serverTimestamp(),
  };

  await setDoc(ref, payload, { merge: true });
  const snap = await getDoc(ref);
  return { id: u.uid, ...snap.data() };
}