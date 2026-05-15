import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import { loadDogFromCloud, saveDogToCloud } from "@/store/dogThunks.js";
import {
  selectIsAuthResolved,
  selectUserId,
  setUser,
} from "@/store/userSlice.js";

const CLOUD_SAVE_DEBOUNCE_MS = 2500;

export default function CloudSaveSync() {
  const dispatch = useDispatch();
  const authResolved = useSelector(selectIsAuthResolved);
  const userId = useSelector(selectUserId);
  const dog = useSelector((state) => state.dog);
  const progression = useSelector((state) => state.progression);
  const loadedUserRef = useRef(null);
  const saveTimerRef = useRef(null);
  const saveSignatureRef = useRef("");

  useEffect(() => {
    if (!authResolved) return;

    if (!userId) {
      loadedUserRef.current = null;
      saveSignatureRef.current = "";
      dispatch(setUser({ cloudSync: { status: "local", errorMessage: null } }));
      return;
    }

    if (loadedUserRef.current === userId) return;
    loadedUserRef.current = userId;

    const promise = dispatch(loadDogFromCloud());
    if (promise && typeof promise.unwrap === "function") {
      promise.unwrap().catch(() => {
        // The thunk stores user-visible sync state; keep the boot path quiet.
      });
    }
  }, [authResolved, dispatch, userId]);

  useEffect(() => {
    if (!authResolved || !userId || !dog?.adoptedAt) return undefined;
    if (loadedUserRef.current !== userId) return undefined;

    const signature = JSON.stringify({
      userId,
      dogUpdatedAt: dog?.updatedAt || null,
      dogLastAction: dog?.lastAction || null,
      dogStats: dog?.stats || null,
      dogTraining: dog?.training || null,
      dogLifecycleStatus: dog?.lifecycleStatus || null,
      progressionUpdatedAt: progression?.updatedAt || null,
      progression,
    });

    if (signature === saveSignatureRef.current) return undefined;

    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = window.setTimeout(() => {
      saveSignatureRef.current = signature;
      const promise = dispatch(saveDogToCloud());
      if (promise && typeof promise.unwrap === "function") {
        promise.unwrap().catch(() => {
          // The thunk records cloud sync errors in user state.
        });
      }
    }, CLOUD_SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, [authResolved, dispatch, dog, progression, userId]);

  useEffect(() => {
    const flush = () => {
      if (!authResolved || !userId || !dog?.adoptedAt) return;
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      dispatch(saveDogToCloud());
    };

    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("beforeunload", flush);
    };
  }, [authResolved, dispatch, dog?.adoptedAt, userId]);

  return null;
}
