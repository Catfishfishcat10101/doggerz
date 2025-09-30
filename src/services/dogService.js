import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

/** One-dog-per-user; create if missing, return the doc */
export async function ensureDogForUser(uid) {
  const ref = doc(db, "dogs", uid);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (snap.exists()) return;
    tx.set(ref, {
      ownerId: uid,
      name: null,
      mood: "idle",
      stats: { hunger: 100, energy: 100, cleanliness: 100 },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      schemaVersion: 1,
    });
  });
  const snap = await getDoc(ref);
  return { id: ref.id, ...(snap.data() || {}) };
}

export async function nameDog(uid, name) {
  const trimmed = String(name || "").trim().slice(0, 24);
  if (!trimmed) throw new Error("Name required");
  const ref = doc(db, "dogs", uid);
  await updateDoc(ref, { name: trimmed, updatedAt: serverTimestamp() });
  return trimmed;
}
