import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { doc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";               // <- keep this path for UI/
import { loadState } from "../../redux/dogSlice";

/**
 * FirebaseAutoSave
 * - Subscribes to dogs/{uid}
 * - Hydrates local Redux when remote changes
 * - Debounces writes on local changes
 * - Tags writes with clientId to avoid feedback loops
 */

const CLIENT_ID_KEY = "doggerz_client_id";
function getClientId() {
  let id = localStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id = (crypto?.randomUUID?.() ??
      Math.random().toString(36).slice(2) + Date.now().toString(36));
    localStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
}

// Key-sorted stringify to avoid false diffs from key order
function orderedStringify(obj) {
  const seen = new WeakSet();
  const sort = (v) => {
    if (v && typeof v === "object") {
      if (seen.has(v)) return null;
      seen.add(v);
      if (Array.isArray(v)) return v.map(sort);
      return Object.keys(v).sort().reduce((acc, k) => {
        acc[k] = sort(v[k]);
        return acc;
      }, {});
    }
    return v;
  };
  return JSON.stringify(sort(obj));
}

const SAVE_DEBOUNCE_MS = 1200;

export default function FirebaseAutoSave() {
  const dispatch = useDispatch();

  // Support either shape: user.uid, user.id, or user.currentUser.uid
  const uid = useSelector(
    (s) => s.user?.uid ?? s.user?.id ?? s.user?.currentUser?.uid ?? null
  );
  const dogState = useSelector((s) => s.dog);

  const clientIdRef = useRef(getClientId());
  const unsubRef = useRef(null);
  const saveTimerRef = useRef(null);
  const lastSavedJSONRef = useRef(null);
  const hasInitialSnapshotRef = useRef(false);
  const pendingFlushRef = useRef(false);

  // Subscribe to remote changes
  useEffect(() => {
    // cleanup old sub
    if (unsubRef.current) {
      unsubRef.current();
      unsubRef.current = null;
    }
    hasInitialSnapshotRef.current = false;
    lastSavedJSONRef.current = null;

    if (!uid) return;

    const ref = doc(db, "dogs", uid);
    unsubRef.current = onSnapshot(
      ref,
      (snap) => {
        hasInitialSnapshotRef.current = true;
        if (!snap.exists()) return; // nothing remote yet

        const data = snap.data();
        // Ignore our own write (prevents ping-pong)
        if (data?.clientId === clientIdRef.current) {
          lastSavedJSONRef.current = orderedStringify(data?.state ?? data);
          return;
        }

        // If remote != local, hydrate
        const remoteJSON = orderedStringify(data?.state ?? data);
        const localJSON = orderedStringify(dogState);
        if (remoteJSON !== localJSON) {
          try {
            dispatch(loadState(data?.state ?? data));
          } catch (e) {
            console.error("loadState from Firestore failed:", e);
          }
        }
      },
      (err) => console.error("Firestore onSnapshot error:", err)
    );

    return () => {
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, dispatch]);

  // Debounced save on local changes
  useEffect(() => {
    if (!uid || !hasInitialSnapshotRef.current) return;

    const localJSON = orderedStringify(dogState);
    if (localJSON === lastSavedJSONRef.current) return; // nothing changed

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        await flushSave(uid, dogState, clientIdRef.current);
        lastSavedJSONRef.current = orderedStringify(dogState);
        pendingFlushRef.current = false;
        // console.log("✅ Dog state saved");
      } catch (err) {
        pendingFlushRef.current = true;
        console.error("❌ Save failed:", err);
      }
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, [dogState, uid]);

  // Flush on page hide / back online
  useEffect(() => {
    if (!uid) return;

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
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
  }, [dogState, uid]);

  return null;
}

async function flushSave(uid, dogState, clientId) {
  const ref = doc(db, "dogs", uid);
  const toSave = dogState; // whitelist keys here if you want
  await setDoc(
    ref,
    { version: 1, state: toSave, updatedAt: serverTimestamp(), clientId },
    { merge: true }
  );
}