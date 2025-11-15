// src/features/game/DogAIEngine.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { hydrateDog, tick, selectDog } from "@/redux/dogSlice.js";

const STORAGE_KEY = "doggerz:dog";

export default function DogAIEngine() {
  const dispatch = useDispatch();
  const dog = useSelector(selectDog);

  // 1) Hydrate from localStorage on mount + apply offline time
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        // First run: just stamp a lastUpdatedAt
        dispatch(
          hydrateDog({
            lastUpdatedAt: Date.now(),
          })
        );
        return;
      }

      const parsed = JSON.parse(raw);

      dispatch(
        hydrateDog({
          ...parsed,
        })
      );

      // Immediately apply any offline drift with now
      dispatch(tick({ now: Date.now() }));
    } catch (err) {
      console.warn("[Doggerz] Failed to hydrate dog from localStorage", err);
      dispatch(
        hydrateDog({
          lastUpdatedAt: Date.now(),
        })
      );
    }
  }, [dispatch]);

  // 2) Persist to localStorage when dog changes
  useEffect(() => {
    if (typeof window === "undefined" || !dog) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dog));
    } catch (err) {
      console.warn("[Doggerz] Failed to persist dog to localStorage", err);
    }
  }, [dog]);

  // 3) Soft game loop: tick every 60 seconds
  useEffect(() => {
    if (typeof window === "undefined") return;

    const id = window.setInterval(() => {
      try {
        dispatch(tick({ now: Date.now() }));
      } catch (err) {
        console.warn("[Doggerz] tick() loop failed", err);
      }
    }, 60 * 1000);

    return () => window.clearInterval(id);
  }, [dispatch]);

  // 4) Debug hook (does nothing if it fails)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (!window.__DOGGERZ_DEBUG) {
        window.__DOGGERZ_DEBUG = {};
      }
      window.__DOGGERZ_DEBUG.dog = dog;
    } catch {
      // ignore
    }
  }, [dog]);

  // Headless engine: no visible UI
  return null;
}
