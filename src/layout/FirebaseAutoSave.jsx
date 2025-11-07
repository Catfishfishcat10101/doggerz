import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { auth, db } from "../utils/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

/**
 * FirebaseAutoSave
 * Watches the dog slice and debounced-writes to Firestore: dogs/{uid}
 * Safe to mount globally (no-op if not authed).
 */
export default function FirebaseAutoSave() {
  const dog = useSelector((s) => s.dog);
  const tRef = useRef(null);
  const lastPayloadRef = useRef("");

  useEffect(() => {
    if (!auth.currentUser) return; // guest
    const uid = auth.currentUser.uid;
    if (!uid) return;

    const payload = {
      // Write only game-relevant fields (avoid auth-only stuff)
      name: dog.name,
      level: dog.level,
      xp: dog.xp ?? 0,
      coins: dog.coins ?? 0,
      stats: dog.stats,
      pos: dog.pos,
      isPottyTrained: dog.isPottyTrained,
      pottyLevel: dog.pottyLevel,
      poopCount: dog.poopCount,
      lastTrainedAt: dog.lastTrainedAt ?? null,
      updatedAt: serverTimestamp(),
    };

    const serialized = JSON.stringify(payload);
    if (serialized === lastPayloadRef.current) return; // no change

    // Debounce writes (800ms after last change)
    clearTimeout(tRef.current);
    tRef.current = setTimeout(async () => {
      try {
        await setDoc(doc(db, "dogs", uid), payload, { merge: true });
        lastPayloadRef.current = serialized;
      } catch (e) {
        // console.warn("AutoSave failed:", e);
      }
    }, 800);

    const flush = async () => {
      clearTimeout(tRef.current);
      try {
        await setDoc(doc(db, "dogs", uid), payload, { merge: true });
        lastPayloadRef.current = serialized;
      } catch {}
    };

    // Flush on tab hide/close/offline
    const onHide = () => flush();
    const onUnload = () => flush();
    const onOffline = () => flush();

    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("beforeunload", onUnload);
    window.addEventListener("offline", onOffline);

    return () => {
      clearTimeout(tRef.current);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("beforeunload", onUnload);
      window.removeEventListener("offline", onOffline);
    };
  }, [dog]);

  return null;
}