// src/features/game/DogAIEngine.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { hydrateDog, tick, selectDog } from "@/redux/dogSlice.js";

const STORAGE_KEY = "doggerz:dog";

export default function DogAIEngine() {
  const dispatch = useDispatch();
  const dog = useSelector(selectDog);

  // 1) Hydrate from localStorage and apply offline time
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      const lastUpdatedAt =
        typeof parsed.lastUpdatedAt === "number"
          ? parsed.lastUpdatedAt
          : Date.now();

      // Bring saved state into Redux
      dispatch(
        hydrateDog({
          ...parsed,
          lastUpdatedAt,
        })
      );

      // Apply offline decay once on load
      const now = Date.now();
      if (now > lastUpdatedAt) {
        dispatch(
          tick({
            now,
          })
        );
      }
    } catch (err) {
      console.warn("[Doggerz] Failed to hydrate dog from localStorage", err);
    }
  }, [dispatch]);

  // 2) Persist to localStorage whenever dog changes
  useEffect(() => {
    if (typeof window === "undefined" || !dog) return;

    try {
      const withTimestamp = {
        ...dog,
        lastUpdatedAt: Date.now(),
      };
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(withTimestamp)
      );
    } catch (err) {
      console.warn("[Doggerz] Failed to persist dog to localStorage", err);
    }
  }, [dog]);

  // 3) Soft game loop: tick every 60 seconds
  useEffect(() => {
    if (typeof window === "undefined") return;

    const id = window.setInterval(() => {
      dispatch(
        tick({
          now: Date.now(),
        })
      );
    }, 60 * 1000); // 1 minute

    return () => window.clearInterval(id);
  }, [dispatch]);

  // Headless component – nothing to render
  return null;
}
