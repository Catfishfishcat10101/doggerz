// src/features/game/useDogAnimation.jsx
// Central hook for resolving current dog animation with override logic,
// reduced-motion respect, and auto-expiration of overrides.

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectDog } from "@/redux/dogSlice.js";
import { calculateDogAge, getSpriteForLifeStage } from "@/utils/lifecycle.js";
import { setAnimationOverride } from "@/redux/dogSlice.js";
import { deriveBaseAnimation } from "@/features/game/animationUtils.js";
import { pickRandomIdleVariant } from "@/features/game/animationMap.js";

// Derive base animation from stats when no override applies.

export function useDogAnimation() {
  const dog = useSelector(selectDog);
  const dispatch = useDispatch();
  const [prefetchedNext, setPrefetchedNext] = useState(false);

  const now = Date.now();
  const override = dog?.animationOverride;
  let animation = deriveBaseAnimation(dog);
  if (override && override.expiresAt > now) {
    animation = override.name;
  }

  // Passive expiration: we simply ignore expired overrides without dispatching during render.
  // Cleanup of stale override can be done by a periodic reducer (e.g., tickDog) if desired.

  // Random idle variants: low probability every 6-10s when idle & no override
  useEffect(() => {
    if (!dog) return;
    if (override && override.expiresAt > Date.now()) return; // active override
    if (animation !== 'idle') return;
    let cancelled = false;
    const delay = 6000 + Math.random() * 4000; // 6-10s
    const id = setTimeout(() => {
      if (cancelled) return;
      // 25% chance to trigger
      if (Math.random() < 0.25) {
        const variant = pickRandomIdleVariant();
        if (variant !== 'idle') {
          dispatch(setAnimationOverride({ name: variant, durationMs: 1600 }));
        }
      }
    }, delay);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [dog, animation, override, dispatch]);

  // Prefetch next life stage sheet once threshold reached
  useEffect(() => {
    if (!dog || prefetchedNext) return;
    const adoptedAt = dog.adoptedAt ?? dog.createdAt;
    if (!adoptedAt) return;
    const ageInfo = calculateDogAge(adoptedAt);
    if (!ageInfo) return;
    const { ageInGameDays, stage } = ageInfo;
    const span = stage.max - stage.min;
    const threshold = stage.max - span * 0.3; // last 30% of stage
    if (ageInGameDays >= threshold) {
      const nextStageId = stage.id === "PUPPY" ? "ADULT" : stage.id === "ADULT" ? "SENIOR" : null;
      if (nextStageId) {
        const src = getSpriteForLifeStage(nextStageId);
        const img = new Image();
        img.src = src;
        setPrefetchedNext(true);
      }
    }
  }, [dog, prefetchedNext]);

  // Reduced motion detection
  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  return { animation, reducedMotion };
}

export default useDogAnimation;