import React, { useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { auth, db } from "../../firebase";
import { doc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { loadState, selectDog } from "../../redux/dogSlice";

export default function FirebaseAutoSave() {
  const dispatch = useDispatch();
  const dog = useSelector(selectDog);
  const clientIdRef = useRef(crypto?.randomUUID?.() || `c_${Math.random().toString(36).slice(2)}`);
  const lastSavedJsonRef = useRef("");
  const debounceRef = useRef(null);
  const unsubRef = useRef(null);
  const readyRef = useRef(false);
  const writingRef = useRef(false);

  const stateForSave = useMemo(() => {
    const { _meta, _version, ...rest } = dog || {};
    return rest;
  }, [dog]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const ref = doc(db, "dogs", user.uid);

    unsubRef.current = onSnapshot(ref, (snap) => {
      if (!snap.exists()) { readyRef.current = true; return; }
      const data = snap.data() || {};
      if (data.clientId && data.clientId === clientIdRef.current) { readyRef.current = true; return; }
      if (data.state) dispatch(loadState({ ...data.state, _version: data.version || 1 }));
      readyRef.current = true;
    });

    return () => { unsubRef.current?.(); unsubRef.current = null; };
  }, [dispatch]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user || !readyRef.current) return;

    const json = JSON.stringify(stateForSave);
    if (json === lastSavedJsonRef.current) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        writingRef.current = true;
        const ref = doc(db, "dogs", user.uid);
        await setDoc(ref, {
          version: 1,
          clientId: clientIdRef.current,
          updatedAt: serverTimestamp(),
          state: stateForSave,
        }, { merge: true });
        lastSavedJsonRef.current = json;
      } finally {
        writingRef.current = false;
      }
    }, 400);

    return () => { debounceRef.current && clearTimeout(debounceRef.current); };
  }, [stateForSave]);

  useEffect(() => {
    const flush = async () => {
      const user = auth.currentUser; if (!user) return;
      const json = JSON.stringify(stateForSave);
      if (json === lastSavedJsonRef.current) return;
      const ref = doc(db, "dogs", user.uid);
      await setDoc(ref, { version: 1, clientId: clientIdRef.current, updatedAt: serverTimestamp(), state: stateForSave }, { merge: true });
      lastSavedJsonRef.current = json;
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

  return null;
}
