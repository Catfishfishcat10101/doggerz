// src/components/DogAIEngine.jsx
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  startWalking,
  stopWalking,
  startBarking,
  stopBarking,
  startPooping,
  stopPooping,
  updateCleanliness,
} from "../../redux/dogSlice.js";
import useJitteredTimer from "./UI/hooks/useJitteredTimer";
import usePageVisibility from "./UI/hooks/usePageVisibility";

/**
 * Tunables – keep the same base cadence you had, but add jitter to avoid patterns.
 */
const WALK_BASE_MS = 8_000;
const BARK_BASE_MS = 12_000;
const POOP_BASE_MS = 20_000;
const CLEANLINESS_MS = 60_000;

/**
 * Probabilities are modulated by time-of-day.
 * Morning/evening: more walk/bark; Night: less active, more poop “chance”.
 */
function getTimeBuckets(date = new Date()) {
  const h = date.getHours();
  if (h >= 6 && h < 11) return "morning";
  if (h >= 11 && h < 17) return "day";
  if (h >= 17 && h < 22) return "evening";
  return "night";
}

function pickProbabilities(bucket) {
  switch (bucket) {
    case "morning":
      return { walk: 0.18, bark: 0.18, poop: 0.12 };
    case "day":
      return { walk: 0.12, bark: 0.16, poop: 0.10 };
    case "evening":
      return { walk: 0.20, bark: 0.16, poop: 0.12 };
    case "night":
    default:
      return { walk: 0.06, bark: 0.08, poop: 0.14 };
  }
}

/**
 * A tiny lock so the dog doesn’t try to walk & poop & bark at once.
 */
function useBehaviorLock() {
  const ref = useRef(false);
  const withLock = async (ms, fn) => {
    if (ref.current) return false;
    ref.current = true;
    try {
      await fn();
      await new Promise((r) => setTimeout(r, ms)); // enforce min duration
    } finally {
      ref.current = false;
    }
    return true;
  };
  return withLock;
}

export default function DogAIEngine({
  walkDurationMs = 3_000,
  barkDurationMs = 2_000,
  poopDurationMs = 2_500,
  jitterPct = 0.35, // up to ±35% timing jitter
} = {}) {
  const dispatch = useDispatch();
  const dog = useSelector((s) => s.dog); // if you later want to gate behaviors on hunger, energy, etc.

  const isVisible = usePageVisibility(); // pause when hidden
  const withLock = useBehaviorLock();

  // Cleanliness decay (kept as a steady beat; no jitter to keep UX predictable)
  useEffect(() => {
    if (!isVisible) return;
    const decay = setInterval(() => dispatch(updateCleanliness()), CLEANLINESS_MS);
    return () => clearInterval(decay);
  }, [dispatch, isVisible]);

  // WALK scheduler (jittered)
  useJitteredTimer(
    async () => {
      if (!isVisible) return;
      const bucket = getTimeBuckets();
      const { walk } = pickProbabilities(bucket);
      if (Math.random() < walk) {
        await withLock(walkDurationMs, async () => {
          dispatch(startWalking());
          setTimeout(() => dispatch(stopWalking()), walkDurationMs);
        });
      }
    },
    WALK_BASE_MS,
    { jitterPct },
    [isVisible, walkDurationMs]
  );

  // BARK scheduler (jittered)
  useJitteredTimer(
    async () => {
      if (!isVisible) return;
      const bucket = getTimeBuckets();
      const { bark } = pickProbabilities(bucket);
      if (Math.random() < bark) {
        await withLock(barkDurationMs, async () => {
          dispatch(startBarking());
          setTimeout(() => dispatch(stopBarking()), barkDurationMs);
          // Optional: fire a custom event any audio system can listen for
          window.dispatchEvent(new CustomEvent("dog:sfx", { detail: { type: "bark" } }));
        });
      }
    },
    BARK_BASE_MS,
    { jitterPct },
    [isVisible, barkDurationMs]
  );

  // POOP scheduler (jittered)
  useJitteredTimer(
    async () => {
      if (!isVisible) return;
      const bucket = getTimeBuckets();
      const { poop } = pickProbabilities(bucket);
      if (Math.random() < poop) {
        await withLock(poopDurationMs, async () => {
          dispatch(startPooping());
          setTimeout(() => dispatch(stopPooping()), poopDurationMs);
        });
      }
    },
    POOP_BASE_MS,
    { jitterPct },
    [isVisible, poopDurationMs]
  );

  return null; // logic only
}