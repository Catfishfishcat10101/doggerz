import { serverTimestamp, setDoc, getDoc } from "firebase/firestore";
import { dogMainDoc } from "./paths.js";
import {
  ensureAnonSignIn,
  isAnonymousFirebaseUser,
  isFirestorePermissionError,
} from "@/lib/firebaseClient.js";
import { db } from "@/firebase.js";

function _defaultDogPayload() {
  return {
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    stage: "PUPPY",
    name: "Fireball",
    stats: {
      hunger: 100,
      happiness: 80,
      energy: 80,
      cleanliness: 80,
    },
    condition: "clean", // Added to match your asset folders!
    training: {
      pottyPercent: 0,
    },
    inventory: [],
    coins: 100,
  };
}

export async function ensureDogMain(uid) {
  if (!db) {
    return { created: false, ref: null, data: null, skipped: true };
  }
  const user = await ensureAnonSignIn();
  const targetUid = uid || user?.uid;
  if (!targetUid) throw new Error("User ID is required");
  if (isAnonymousFirebaseUser(user)) {
    return {
      created: false,
      ref: null,
      data: null,
      skipped: true,
      reason: "anonymous_session",
    };
  }

  const ref = dogMainDoc(targetUid);
  if (!ref) {
    return { created: false, ref: null, data: null, skipped: true };
  }

  try {
    const snap = await getDoc(ref);

    if (snap.exists()) {
      return { created: false, ref, data: snap.data() };
    }

    const payload = _defaultDogPayload();

    // We use setDoc without the immediate re-read to keep it fast
    await setDoc(ref, payload, { merge: true });

    return {
      created: true,
      ref,
      data: { ...payload, createdAt: Date.now() }, // Local estimate of the timestamp
    };
  } catch (err) {
    if (isFirestorePermissionError(err)) {
      return {
        created: false,
        ref,
        data: null,
        skipped: true,
        reason: "permission_denied",
      };
    }
    console.error("[Doggerz] Database check failed:", err);
    throw err;
  }
}
