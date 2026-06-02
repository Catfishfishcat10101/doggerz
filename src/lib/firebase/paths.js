import { doc } from "firebase/firestore";

import { db } from "@/lib/firebase/index.js";

export function dogMainDoc(uid) {
  const userId = String(uid || "").trim();
  if (!db || !userId) return null;
  return doc(db, "users", userId, "dog", "main");
}

export function userProfileDoc(uid) {
  const userId = String(uid || "").trim();
  if (!db || !userId) return null;
  return doc(db, "users", userId);
}
