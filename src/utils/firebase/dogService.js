// Firestore helpers for one-dog-per-user
import { auth, db } from "./firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export async function getMyDog() {
  const u = auth.currentUser;
  if (!u) return null;
  const ref = doc(db, "dogs", u.uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export async function adoptDog(name) {
  const u = auth.currentUser;
  if (!u) throw new Error("Not signed in.");
  const ref = doc(db, "dogs", u.uid);
  await setDoc(
    ref,
    {
      id: u.uid,
      name: name.trim(),
      level: 1,
      sprite: "/sprites/jackrussell/idle.svg",
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
  return (await getDoc(ref)).data();
}