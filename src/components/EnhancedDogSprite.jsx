// src/components/EnhancedDogSprite.jsx
// src/components/EnhancedDogSprite.jsx
// @ts-nocheck

import React, { useEffect, useState, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { selectDog } from "@/redux/dogSlice.js";

import { calculateDogAge, getSpriteForLifeStage } from "@/utils/lifecycle.js";
import useDogAnimation from "@/features/game/useDogAnimation.jsx";

// We support two sheet formats:
//  1. Legacy small sheet: 256x320 (4 cols x 5 rows, 64x64 frames)
//  2. New full sheet: 2048x2048 (16 cols x 16 rows, 128x128 frames)

function getSheetVariant(width, height) {
  if (width === 256 && height === 320) {
    return { frameSize: 64, cols: 4, rows: 5, variant: "legacy" };
  }
  if (width === 2048 && height === 2048) {
    return { frameSize: 128, cols: 16, rows: 16, variant: "full" };
  }
  // Fallback: attempt to infer square grid
  const guessedCols = 16;
  return {
    frameSize: Math.floor(width / guessedCols) || 128,
    cols: guessedCols,
    rows: Math.floor(height / (Math.floor(width / guessedCols) || 128)) || 16,
    variant: "unknown",
  };
}

function getAnimationsForVariant(variant) {
  if (variant === "legacy") {
    // 5-row legacy mapping (keep names subset; all rows have 4 frames)
    return {
      idle: { row: 0, fps: 8 },
      bark: { row: 1, fps: 12 },
      scratch: { row: 2, fps: 10 },
      attention: { row: 3, fps: 12 },
      sleep: { row: 4, fps: 6 },
    };
  }
  // Full mapping (16 rows) per SPRITESHEET_SPEC.md
  return {
    idle: { row: 0, fps: 8 },
    walk: { row: 1, fps: 12 },
    run: { row: 2, fps: 12 },
    sit: { row: 3, fps: 10 },
    lay: { row: 4, fps: 8 },
    eat: { row: 5, fps: 10 },
    play_ball: { row: 6, fps: 10 },
    play_tug: { row: 7, fps: 10 },
    sleep: { row: 8, fps: 6 },
    bark: { row: 9, fps: 15 },
    scratch: { row: 10, fps: 12 },
    shake: { row: 11, fps: 15 },
    potty: { row: 12, fps: 10 },
    sad: { row: 13, fps: 8 },
    excited: { row: 14, fps: 12 },
    special: { row: 15, fps: 12 },
  };
}

function buildRowSequence(row, cols) {
  const start = row * cols;
  return Array.from({ length: cols }, (_, i) => start + i);
}

function deriveAnimationFromDog(dog) {
  if (!dog) return "idle";
  const stats = dog.stats || {};
  const happiness = stats.happiness ?? 100;
  const energy = stats.energy ?? 100;
  const cleanliness = stats.cleanliness ?? 100;

  // Priority-based state selection (highest precedence first)
  if (energy < 20) return "sleep"; // tired overrides others
  if (cleanliness < 30) return "scratch"; // dirty/fleas scratching
  if (happiness < 25) return "sad"; // unhappy
  if (happiness > 75) return "excited"; // very happy
  return "idle";
}

export default function EnhancedDogSprite({
  animation: forcedAnimation,
  scale = 1,
  reducedMotion: forcedReducedMotion = false,
}) {
  const dog = useSelector(selectDog);

  const [frameIndex, setFrameIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgPreloadedRef = useRef(false);

  // IMPORTANT: Do not early-return before hooks; we render a placeholder later if no dog.

  const adoptedAt = dog?.adoptedAt ?? dog?.createdAt ?? null;
  const ageInfo = adoptedAt ? calculateDogAge(adoptedAt) : null;
  const stageId = ageInfo?.stageId ?? "PUPPY";
  const spriteSrc = getSpriteForLifeStage(stageId);

  // Life stage scaling tweaks (spec: puppy 0.8, adult 1.0, senior 0.9)
  const lifeScale =
    stageId === "PUPPY" ? 0.8 : stageId === "SENIOR" ? 0.9 : 1.0;
  const effectiveScale = scale * lifeScale;

  // Determine animation if not explicitly passed
  const { animation: hookAnimation, reducedMotion: autoReducedMotion } = useDogAnimation();
  const resolvedAnimation = forcedAnimation || hookAnimation || "idle";
  const [sheetMeta, setSheetMeta] = useState({ frameSize: 128, cols: 16, rows: 16, variant: "pending" });
  const [animations, setAnimations] = useState(getAnimationsForVariant("full"));

  const animMeta = animations[resolvedAnimation] || animations.idle || { row: 0, fps: 8 };
  const sequence = useMemo(() => buildRowSequence(animMeta.row, sheetMeta.cols), [animMeta.row, sheetMeta.cols]);
  const frameDuration = Math.round(1000 / animMeta.fps);

  // Preload image once
  useEffect(() => {
    if (!spriteSrc || imgPreloadedRef.current) return;
    const img = new Image();
    img.src = spriteSrc;
    img.onload = () => {
      imgPreloadedRef.current = true;
      const variant = getSheetVariant(img.naturalWidth, img.naturalHeight);
      setSheetMeta(variant);
      setAnimations(getAnimationsForVariant(variant.variant));
      setIsLoaded(true);
    };
    img.onerror = () => {
      setHasError(true);
      setIsLoaded(true);
    };
  }, [spriteSrc]);

  // Animation loop
  useEffect(() => {
    const effectiveReduced = forcedReducedMotion || autoReducedMotion;
    if (effectiveReduced) return;
    const id = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % sequence.length);
    }, frameDuration);
    return () => clearInterval(id);
  }, [sequence, frameDuration, forcedReducedMotion, autoReducedMotion]);

  // We allow spriteSrc to be undefined; handle fallback in render instead of early-return.

  const logicalFrame = sequence[frameIndex];
  const col = logicalFrame % sheetMeta.cols;
  const row = Math.floor(logicalFrame / sheetMeta.cols);
  const backgroundPosition = `-${col * sheetMeta.frameSize}px -${row * sheetMeta.frameSize}px`;

  // Accessibility live region: announce transient overrides
  const [announce, setAnnounce] = useState("");
  // Flea particle state (generated when tier becomes FLEAS/MANGE)
  const [fleas, setFleas] = useState([]);
  useEffect(() => {
    if (dog?.animationOverride) {
      const name = dog.animationOverride.name;
      // Friendly label mapping
      const map = {
        eat: "Eating",
        play_ball: "Playing with ball",
        play_tug: "Playing tug",
        shake: "Shaking off water",
        potty: "Going potty",
        sit: "Training sit",
        lay: "Resting",
        sleep: "Sleeping",
        scratch: "Scratching",
        excited: "Excited",
      };
      setAnnounce(`${dog.name || 'Pup'}: ${map[name] || name}`);
      const t = setTimeout(() => setAnnounce(""), 2500);
      return () => clearTimeout(t);
    }
  }, [dog?.animationOverride, dog?.name]);

  // Generate fleas when entering FLEAS/MANGE cleanliness tiers
  useEffect(() => {
    const tier = dog?.cleanlinessTier;
    if (!tier) return;
    if (tier !== "FLEAS" && tier !== "MANGE") return;
    if (fleas.length > 0) return; // already generated
    const count = tier === "FLEAS" ? 14 : 26;
    const generated = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage
      y: Math.random() * 100,
      d: 2 + Math.random() * 2, // size in px
      delay: Math.random() * 4, // seconds
      dur: 2.5 + Math.random() * 3.5, // seconds
    }));
    setFleas(generated);
  }, [dog?.cleanlinessTier, fleas.length]);

  // Performance instrumentation: dispatch frame events (dev only)
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    window.dispatchEvent(
      new CustomEvent("doggerz:spriteFrame", {
        detail: {
          ts: performance.now(),
          animation: resolvedAnimation,
          frame: frameIndex,
        },
      })
    );
  }, [frameIndex, resolvedAnimation]);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width: sheetMeta.frameSize * effectiveScale,
        height: sheetMeta.frameSize * effectiveScale,
      }}
    >
      {!dog && (
        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-zinc-500">
          No pup yet. Adopt one to bring this area to life.
        </div>
      )}
      {!isLoaded && !hasError && dog && (
        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-zinc-500">
          Loading…
        </div>
      )}
      {hasError && dog && (
        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-red-400">
          Sprite load failed.
        </div>
      )}
      {dog && spriteSrc && (
        <div
          aria-label={dog?.name || "Your pup"}
          role="img"
          className="rounded-xl shadow-lg shadow-emerald-900/30 bg-zinc-900/40 overflow-hidden will-change-[background-position]"
          style={{
            width: sheetMeta.frameSize * effectiveScale,
            height: sheetMeta.frameSize * effectiveScale,
            backgroundImage: `url(${spriteSrc})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${sheetMeta.cols * sheetMeta.frameSize}px ${sheetMeta.rows * sheetMeta.frameSize}px`,
            imageRendering: "pixelated",
            backgroundPosition,
            transition: "background-position 40ms linear",
          }}
        />
      )}
      {/* Cleanliness overlay */}
      {dog && dog.cleanlinessTier !== "FRESH" && (
        <div
          className="pointer-events-none absolute inset-0 rounded-xl"
          style={{
            mixBlendMode: "overlay",
            opacity:
              dog.cleanlinessTier === "DIRTY"
                ? 0.28
                : dog.cleanlinessTier === "FLEAS"
                  ? 0.42
                  : 0.6,
            background:
              dog.cleanlinessTier === "DIRTY"
                ? "radial-gradient(circle at 35% 45%, rgba(90,60,20,0.45) 0%, rgba(60,40,15,0.25) 45%, transparent 75%), radial-gradient(circle at 70% 65%, rgba(70,50,25,0.35), transparent 70%)"
                : dog.cleanlinessTier === "FLEAS"
                  ? "radial-gradient(circle at 30% 40%, rgba(95,55,20,0.35), transparent 70%), radial-gradient(circle at 65% 60%, rgba(70,35,15,0.30), transparent 65%)"
                  : "radial-gradient(circle at 50% 50%, rgba(120,40,20,0.65), transparent 75%), radial-gradient(circle at 25% 70%, rgba(140,60,25,0.55), transparent 80%)",
            filter: dog.cleanlinessTier === "MANGE" ? "contrast(1.05) saturate(0.85)" : undefined,
          }}
        />
      )}
      {/* Flea particle overlay (separate layer) */}
      {dog && fleas.length > 0 && (
        <>
          {/* keyframes injected once */}
          <style>{`
            @keyframes fleaMove {
              0% { transform: translate(0,0) scale(1); }
              45% { transform: translate(2px,-2px) scale(1.1); }
              90% { transform: translate(-1px,1px) scale(0.95); }
              100% { transform: translate(0,0) scale(1); }
            }
          `}</style>
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
            {fleas.map(f => (
              <div
                key={f.id}
                className="absolute rounded-full bg-zinc-800 dark:bg-black"
                style={{
                  top: `${f.y}%`,
                  left: `${f.x}%`,
                  width: f.d,
                  height: f.d,
                  boxShadow: "0 0 2px rgba(0,0,0,0.7)",
                  opacity: dog.cleanlinessTier === "MANGE" ? 0.9 : 0.75,
                  animation: (forcedReducedMotion || autoReducedMotion) ? undefined : `fleaMove ${f.dur}s linear ${f.delay}s infinite`,
                }}
              />
            ))}
          </div>
        </>
      )}
      {/* Live region for screen readers */}
      <div
        aria-live="polite"
        className="sr-only"
      >
        {announce}
      </div>
    </div>
  );
}

EnhancedDogSprite.displayName = "EnhancedDogSprite";
EnhancedDogSprite.framework = "react";
EnhancedDogSprite.group = "components";
EnhancedDogSprite.propagateFirebaseReady = false;
EnhancedDogSprite.propagateUser = false;
EnhancedDogSprite.propagateDog = false;
EnhancedDogSprite.defaultSize = { width: 128, height: 128 };
