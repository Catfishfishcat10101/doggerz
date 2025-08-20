// src/components/FirebaseAutoSave.jsx
import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { loadState } from "../../redux/dogSlice";

/**
 * FirebaseAutoSave
 * - Subscribes to the current user's dog document.
 * - Debounces writes when local Redux dog state changes.
 * - Uses serverTimestamp() + clientId to avoid feedback loops.
 * - Flushes pending changes on page hide and when the network comes back.
 *
 * Schema (dogs/{uid}):
 * {
 *   version: 1,
 *   state: <dogState object>,
 *   updatedAt: serverTimestamp(),
 *   clientId: "<random-per-device>"
 * }
 */

// ---- small utilities
const CLIENT_ID_KEY = "doggerz_client_id";
function getClientId() {
  let id = localStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    // Generate a lightweight RFC4122-ish id
    id = crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
}

// Stable, key-sorted stringify so object order changes don’t cause false “diffs”
function orderedStringify(obj) {
  const seen = new WeakSet();
  const sorter = (value) => {
    if (value && typeof value === "object") {
      if (seen.has(value)) return null; // circular guard (shouldn’t happen in Redux state)
      seen.add(value);
      if (Array.isArray(value)) return value.map(sorter);
      return Object.keys(value)
        .sort()
        .reduce((acc, k) => {
          acc[k] = sorter(value[k]);
          return acc;
        }, {});
    }
    return value;
  };
  return JSON.stringify(sorter(obj));
}

const SAVE_DEBOUNCE_MS = 1200; // responsive but not spammy

export default function FirebaseAutoSave() {
  const dogState = useSelector((s) => s.dog);
  const currentUser = useSelector((s) => s.user?.currentUser);
  const dispatch = useDispatch();

  const clientIdRef = useRef(getClientId());
  const unsubRef = useRef(null);
  const saveTimerRef = useRef(null);
  const lastSavedJSONRef = useRef(null);
  const hasInitialSnapshotRef = useRef(false);
  const pendingFlushRef = useRef(false);
  const latestRemoteJSONRef = useRef(null);

  // Subscribe to Firestore changes for this user
  useEffect(() => {
    // Cleanup previous sub
    if (unsubRef.current) {
      unsubRef.current();
      unsubRef.current = null;
    }
    hasInitialSnapshotRef.current = false;
    lastSavedJSONRef.current = null;
    latestRemoteJSONRef.current = null;

    const uid = currentUser?.uid;
    if (!uid) return; // not logged in

    const ref = doc(db, "dogs", uid);

    unsubRef.current = onSnapshot(
      ref,
      (snap) => {
        hasInitialSnapshotRef.current = true;

        if (!snap.exists()) {
          // Nothing remote yet; first local save will create it.
          latestRemoteJSONRef.current = null;
          return;
        }

        const data = snap.data();
        latestRemoteJSONRef.current = orderedStringify(data?.state ?? data);

        // Ignore our own just-written update (prevents ping-pong)
        if (data?.clientId === clientIdRef.current) {
          lastSavedJSONRef.current = latestRemoteJSONRef.current;
          return;
        }

        // If remote differs from local, hydrate/merge
        const localJSON = orderedStringify(dogState);
        if (latestRemoteJSONRef.current !== localJSON) {
          try {
            dispatch(loadState(data?.state ?? data));
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error("Failed to dispatch loadState from Firestore snapshot:", e);
          }
        }
      },
      (err) => {
        // eslint-disable-next-line no-console
        console.error("Firestore onSnapshot error:", err);
      }
    );

    return () => {
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.uid, dispatch]); // re-subscribe on user change

  // Debounced save when dogState changes
  useEffect(() => {
    const uid = currentUser?.uid;
    if (!uid) return;

    // Avoid writing before we’ve seen the first snapshot (prevents overwriting server with empty local)
    if (!hasInitialSnapshotRef.current) return;

    const localJSON = orderedStringify(dogState);

    // Skip if nothing changed vs our last confirmed save
    if (localJSON === lastSavedJSONRef.current) return;

    // Debounce
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      await flushSave(uid, dogState, clientIdRef.current)
        .then(() => {
          lastSavedJSONRef.current = orderedStringify(dogState);
          pendingFlushRef.current = false;
          // eslint-disable-next-line no-console
          console.log("✅ Dog state saved to Firebase");
        })
        .catch((err) => {
          pendingFlushRef.current = true; // try again on next opportunity
          // eslint-disable-next-line no-console
          console.error("❌ Failed to save dog state:", err);
        });
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, [dogState, currentUser?.uid]);

  // Flush on page hide / regain connectivity
  useEffect(() => {
    const uid = currentUser?.uid;
    if (!uid) return;

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        // Try a best-effort flush
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        const localJSON = orderedStringify(dogState);
        if (localJSON !== lastSavedJSONRef.current) {
          flushSave(uid, dogState, clientIdRef.current).catch(() => {});
        }
      }
    };

    const handleOnline = () => {
      if (pendingFlushRef.current) {
        flushSave(uid, dogState, clientIdRef.current)
          .then(() => {
            pendingFlushRef.current = false;
            lastSavedJSONRef.current = orderedStringify(dogState);
          })
          .catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pagehide", handleVisibility);
    window.addEventListener("beforeunload", handleVisibility);
    window.addEventListener("online", handleOnline);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", handleVisibility);
      window.removeEventListener("beforeunload", handleVisibility);
      window.removeEventListener("online", handleOnline);
    };
  }, [dogState, currentUser?.uid]);

  return null;
}

// ---- save helper with merge + version + serverTimestamp
async function flushSave(uid, dogState, clientId) {
  const ref = doc(db, "dogs", uid);

  // If your dogState is huge, consider whitelisting keys to save:
  // const toSave = pick(dogState, ["happiness", "energy", "xp", ...]);
  const toSave = dogState;

  await setDoc(
    ref,
    {
      version: 1,
      state: toSave,
      updatedAt: serverTimestamp(),
      clientId,
    },
    { merge: true }
  );
}