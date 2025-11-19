// src/features/game/DogAIEngine.jsx
import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectDog,
  hydrateDog,
  tickDog,
  registerSessionStart,
  resetDogState,
  DOG_STORAGE_KEY,
} from "@/redux/dogSlice.js";
import { auth } from "@/firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import {
  loadDogFromCloud,
  saveDogToCloud,
} from "@/redux/dogThunks.js";
import { CLOUD_SAVE_DEBOUNCE } from "@/constants/game.js";

export default function DogAIEngine() {
  const dispatch = useDispatch();
  const dog = useSelector(selectDog);
  const saveTimeoutRef = useRef(null);

  // On mount: hydrate from localStorage or initialize new dog
  useEffect(() => {
    if (typeof window === "undefined") return;

    const now = Date.now();

    try {
      const raw = window.localStorage.getItem(DOG_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        dispatch(
          hydrateDog({
            ...parsed,
            lastUpdatedAt: parsed.lastUpdatedAt ?? now,
          })
        );
        // Immediately apply any offline time since lastUpdatedAt
        dispatch(tickDog({ now }));
      } else {
        // No save – start a fresh pup
        dispatch(resetDogState());
        dispatch(registerSessionStart({ now }));
      }
    } catch (err) {
      console.warn(
        "[Doggerz] Failed to read dog from localStorage",
        err
      );
      dispatch(resetDogState());
      dispatch(registerSessionStart({ now }));
    }
  }, [dispatch]);

  // Persist to localStorage & cloud whenever dog changes
  useEffect(() => {
    if (!dog) return;
    if (typeof window === "undefined") return;

    // Local (immediate)
    try {
      window.localStorage.setItem(
        DOG_STORAGE_KEY,
        JSON.stringify(dog)
      );
    } catch (err) {
      console.warn(
        "[Doggerz] Failed to persist dog to localStorage",
        err
      );
    }

    // Cloud (debounced to avoid excessive writes)
    const user = auth?.currentUser;
    if (user) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        dispatch(saveDogToCloud({ uid: user.uid, dog }));
      }, CLOUD_SAVE_DEBOUNCE);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [dog, dispatch]);

  // Soft game loop: tick every 60 seconds
  useEffect(() => {
    if (typeof window === "undefined") return;

    const id = window.setInterval(() => {
      dispatch(tickDog({ now: Date.now() }));
    }, 60_000); // 60s

    return () => {
      window.clearInterval(id);
    };
  }, [dispatch]);

  // Listen for auth changes and pull cloud dog when a user logs in
  useEffect(() => {
    const unsub =
      auth &&
      onAuthStateChanged(auth, (user) => {
        if (user) {
          dispatch(loadDogFromCloud({ uid: user.uid }));
        }
      });

    return () => {
      if (unsub) unsub();
    };
  }, [dispatch]);

  // This component renders nothing – it just runs effects.
  return null;
}
