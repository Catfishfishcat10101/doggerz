import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function ensureDogForUser(uid) {
  const ref = doc(db, "dogs", uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return { id: uid, ...snap.data() };

  const dog = {
    ownerId: uid,
    name: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    stats: { hunger: 100, energy: 100, cleanliness: 100 },
    mood: "idle",
  };
  await setDoc(ref, dog, { merge: false });
  return { id: uid, ...dog };
}

export async function nameDog(uid, name) {
  const trimmed = String(name || "").trim().slice(0, 24);
  if (!trimmed) throw new Error("Name required");
  const ref = doc(db, "dogs", uid);
  await updateDoc(ref, { name: trimmed, updatedAt: serverTimestamp() });
  return trimmed;
}
