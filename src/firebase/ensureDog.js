// src/firebase/ensureDog.js
import { serverTimestamp, setDoc, getDoc } from "firebase/firestore";
import { assertFirebaseReady } from "@/firebase.js";
import { dogMainDoc } from "@/firebase/paths.js";

/**
 * Create a minimal, safe default payload for a new dog document.
 * Values are clamped to expected ranges to avoid accidentally large uploads.
 */
function _defaultDogPayload() {
  return {
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    stage: "PUPPY",
    name: "",
    stats: {
      hunger: 100,
      happiness: 80,
      energy: 80,
      cleanliness: 80,
    },
    training: {
      pottyPercent: 0,
    },
  };
}

/**
 * Ensure the main dog document exists for a given user.
 * - Validates inputs, returns an object describing whether a new doc was created
 *   and the document reference. When an existing document is found, its data
 *   is returned as `data`.
 */
export async function ensureDogMain(uid) {
  assertFirebaseReady("Dog save data");

  if (!uid || typeof uid !== "string") {
    throw new Error("ensureDogMain requires a valid user id (uid)");
  }

  const ref = dogMainDoc(uid);

  try {
    const snap = await getDoc(ref);

    if (snap.exists()) {
      return { created: false, ref, data: snap.data() };
    }

    // Use a minimal, sanitized payload to avoid accidental large writes
    const payload = _defaultDogPayload();

    await setDoc(ref, payload, { merge: true });

    // Fetch the document back so callers receive the server-resolved fields
    try {
      const createdSnap = await getDoc(ref);
      return {
        created: true,
        ref,
        data: createdSnap.exists() ? createdSnap.data() : undefined,
      };
    } catch (readErr) {
      // Do not fail the creation if the immediate read-back fails; return ref.
      console.warn(
        "[Doggerz] created dog doc but failed to read it back",
        readErr,
      );
      return { created: true, ref };
    }
  } catch (err) {
    console.error("[Doggerz] ensureDogMain failed", err);
    throw err;
  }
}
