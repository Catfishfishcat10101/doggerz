import { doc, collection } from "firebase/firestore";
import { db } from "@/firebase.js";

/* ------------------ Validation ------------------ */
const _v = (id) => {
  if (!id || typeof id !== "string") throw new Error("Invalid ID");
};

/* ------------------ Paths ------------------ */

// The central "Brain" of the dog - Keep stats/training/personality here!
export const dogMainDoc = (uid) => {
  _v(uid);
  return doc(db, "users", uid, "dog", "main");
};

// Journal (Keep separate as it grows indefinitely)
export const dogJournalCol = (uid) => {
  _v(uid);
  return collection(db, "users", uid, "dog", "journal");
};

// Events/History (Keep separate)
export const dogEventsCol = (uid) => {
  _v(uid);
  return collection(db, "users", uid, "dog", "events");
};

/** * NOTE: I removed statsDoc, trainingDoc, etc.
 * Better to store these as fields inside dogMainDoc
 * so you get the whole dog in one single "getDoc" call.
 */
