// src/components/FirebaseAutoSave.jsx
import React, { useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { auth, db } from "../../firebase";
import {
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { loadState, selectDog } from "../redux/dogSlice"; // path note below

/**
 * NOTE on import path:
 * If this file sits at src/components/FirebaseAutoSave.jsx and dogSlice is in src/redux/dogSlice.js,
 * then the correct import is "../../redux/dogSlice". Adjust if your tree differs.
 */
 
// 🔧 If your folder is exactly as above, CHANGE the import to:
 // import { loadState, selectDog } from "../../redux/dogSlice";

export default function FirebaseAutoSave() {
  // ^^^ If you changed the import above, delete this comment.

  const dispatch = useDispatch();
  const dog = useSelector(selectDog);

  // Unique client id to break feedback loops between snapshot and local writes
  const clientIdRef = useRef(typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `c_${Math.random().toString(36).slice(2)}`);

  // Keep a cached JSON to compare and debounce writes
  const lastSavedJsonRef = useRef("");
  const debounceRef = useRef(null);
  const unsubRef = useRef(null);
  const readyRef = useRef(false);         // snapshot subscription established
  const writingRef = useRef(false);       // during our own write
  const lastRemoteAtRef = useRef(0);
  const lastLocalWriteAtRef = useRef(0);

  // Clean state to persist (strip meta/transient)
  const stateForSave = useMemo(() => {
    const { _meta, _version, ...rest } = dog || {};
    // Always store version in the document root, state under 'state'
    return rest;
  }, [dog]);

  // --- Subscribe to remote document
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, "dogs", user.uid);

    unsubRef.current = onSnapshot(ref, (snap) => {
      if (!snap.exists()) {
        // Nothing yet in Firestore; allow local state to create it on first write
        readyRef.current = true;
        return;
      }

      const data = snap.data() || {};
      // Remote freshness guard
      const remoteAt = data.updatedAt?.toMillis?.() || 0;
      lastRemoteAtRef.current = remoteAt;

      // If the last write was ours, ignore (prevents loop)
      if (data.clientId && data.clientId === clientIdRef.current) {
        readyRef.current = true;
        return;
      }

      // Merge in remote state
      if (data.state) {
        dispatch(loadState({ ...data.state, _version: data.version || 1 }));
      }
      readyRef.current = true;
    });

    return () => {
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    };
  }, [dispatch]);

  // --- Debounced writer whenever local state changes
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Wait until snapshot has connected once to avoid stomp
    if (!readyRef.current) return;

    // Compare JSONs to avoid redundant writes
    const json = JSON.stringify(stateForSave);
    if (json === lastSavedJsonRef.current) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        writingRef.current = true;
        lastLocalWriteAtRef.current = Date.now();

        const ref = doc(db, "dogs", user.uid);
        await setDoc(
          ref,
          {
            version: 1,
            clientId: clientIdRef.current,
            updatedAt: serverTimestamp(),
            state: stateForSave,
          },
          { merge: true }
        );

        lastSavedJsonRef.current = json;
      } catch (e) {
        // You could surface an error toast here if you want
        // console.error("Autosave failed", e);
      } finally {
        writingRef.current = false;
      }
    }, 400); // debounce 400ms

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [stateForSave]);

  // --- Flush on page hide / offline
  useEffect(() => {
    const flush = async () => {
      const user = auth.currentUser;
      if (!user) return;
      if (writingRef.current) return; // an in-flight write will finish
      const json = JSON.stringify(stateForSave);
      if (json === lastSavedJsonRef.current) return;

      try {
        const ref = doc(db, "dogs", user.uid);
        await setDoc(
          ref,
          {
            version: 1,
            clientId: clientIdRef.current,
            updatedAt: serverTimestamp(),
            state: stateForSave,
          },
          { merge: true }
        );
        lastSavedJsonRef.current = json;
      } catch {}
    };

    const onHide = () => flush();
    const onOffline = () => flush();

    window.addEventListener("pagehide", onHide);
    window.addEventListener("beforeunload", onHide);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("pagehide", onHide);
      window.removeEventListener("beforeunload", onHide);
      window.removeEventListener("offline", onOffline);
    };
  }, [stateForSave]);

  return null; // headless component
}
