import { serverTimestamp, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase"; // Use our new central config
import { dogMainDoc } from "./paths.js";

function _defaultDogPayload() {
  return {
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    stage: "PUPPY",
    name: "New Doggo",
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
    coins: 500, // Including that pre-reg bonus we saw in .env!
  };
}

export async function ensureDogMain(uid) {
  if (!uid) throw new Error("User ID is required");

  const ref = dogMainDoc(uid);

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
      data: { ...payload, createdAt: new Date() }, // Local estimate of the timestamp
    };
  } catch (err) {
    console.error("[Doggerz] Database check failed:", err);
    throw err;
  }
}
