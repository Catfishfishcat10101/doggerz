// src/features/game/EnhancedDogSprite.jsx
// @ts-nocheck  // remove this line if you want TS checking here

import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { selectDog } from "@/redux/dogSlice.js";
import { calculateDogAge, getSpriteSheet } from "@/utils/lifecycle.js";
import { shouldHowlAtMoon, getTimeOfDay } from "@/utils/weather.js";

const ANIMATIONS = {
  idle_neutral: { row: 0, frames: 6, fps: 4 },
  idle_sit: { row: 1, frames: 6, fps: 3 },
  walk_left: { row: 2, frames: 6, fps: 10 },
  walk_right: { row: 3, frames: 6, fps: 10 },
  run_left: { row: 4, frames: 6, fps: 12 },
  run_right: { row: 5, frames: 6, fps: 12 },
  sleep_curled: { row: 6, frames: 4, fps: 2 },
  sleep_stretched: { row: 6, frames: 4, fps: 2, startFrame: 4 },
  eating: { row: 7, frames: 6, fps: 8 },
  drinking: { row: 8, frames: 6, fps: 8 },
  bark: { row: 9, frames: 6, fps: 6 },
  howl: { row: 10, frames: 6, fps: 5 },
  trick_sit: { row: 11, frames: 4, fps: 6 },
  trick_stay: { row: 11, frames: 4, fps: 3, startFrame: 4 },
  trick_rollover: { row: 12, frames: 8, fps: 10 },
  trick_speak: { row: 13, frames: 6, fps: 6 },
  trick_playdead: { row: 13, frames: 6, fps: 5, startFrame: 6 },
  scratch_ear: { row: 14, frames: 6, fps: 8 },
  shake_off: { row: 14, frames: 6, fps: 10, startFrame: 6 },
  attention: { row: 15, frames: 4, fps: 8 },
  happy_jump: { row: 15, frames: 4, fps: 10, startFrame: 4 },
  tired: { row: 15, frames: 4, fps: 3, startFrame: 8 },
};

const DEFAULT_ANIMATION = "idle_neutral";

// Higher = can't be interrupted by lower-priority anims
const ANIMATION_PRIORITY = {
  sleep_curled: 10,
  sleep_stretched: 10,
  eating: 9,
  drinking: 9,
  happy_jump: 8,
  howl: 7,
  bark: 5,
  scratch_ear: 5,
  tired: 4,
  idle_sit: 2,
  idle_neutral: 1,
};

const SPRITE_SIZE = 128;
const SHEET_COLS = 16;
const SHEET_SIZE = SPRITE_SIZE * SHEET_COLS;

export default function EnhancedDogSprite() {
  const dog = useSelector(selectDog);

  const [animation, setAnimation] = useState(DEFAULT_ANIMATION);
  const [frameIndex, setFrameIndex] = useState(0);

  // Time-of-day is its own reactive thing, not tied to adoption date
  const [timeOfDay, setTimeOfDay] = useState(() => getTimeOfDay());

  const timeoutsRef = useRef([]);
  const lastActionRef = useRef(null);
  const howlCheckedRef = useRef(false);
  const lastRandomAnimRef = useRef(0);
  const currentPriorityRef = useRef(1);

  // Clear all timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, []);

  // Tick time-of-day every 60s so weather / lighting / howling can react
  useEffect(() => {
    const id = setInterval(() => {
      try {
        setTimeOfDay(getTimeOfDay());
      } catch (err) {
        console.error("[Doggerz] Failed to get time of day", err);
      }
    }, 60_000);

    return () => clearInterval(id);
  }, []);

  // Helper to set animation with priority check
  const playAnimation = useCallback((anim, duration) => {
    const newPriority = ANIMATION_PRIORITY[anim] || 1;

    // Don't interrupt higher-priority animation
    if (newPriority < currentPriorityRef.current) {
      return;
    }

    currentPriorityRef.current = newPriority;
    setAnimation(anim);

    if (duration) {
      const timeout = setTimeout(() => {
        currentPriorityRef.current = 1;
        setAnimation(DEFAULT_ANIMATION);
      }, duration);
      timeoutsRef.current.push(timeout);
    }
  }, []);

  // Calculate age and sprite sheet (memoized)
  const { age, spriteSheet } = useMemo(() => {
    if (!dog?.adoptedAt) {
      return { age: null, spriteSheet: null };
    }

    try {
      const calculatedAge = calculateDogAge(dog.adoptedAt);
      return {
        age: calculatedAge,
        spriteSheet: getSpriteSheet(calculatedAge.stage),
      };
    } catch (error) {
      console.error("[Doggerz] Error calculating dog age / sprite sheet:", error);
      return { age: null, spriteSheet: null };
    }
  }, [dog?.adoptedAt]);

  // Auto-trigger howling at full moon (once per moon phase-ish)
  useEffect(() => {
    if (!dog) return;

    try {
      // Pass timeOfDay in case your helper supports it; harmless if ignored
      const shouldHowl = shouldHowlAtMoon(timeOfDay);

      if (shouldHowl && !dog.isAsleep && !howlCheckedRef.current) {
        howlCheckedRef.current = true;

        if (Math.random() < 0.3) {
          playAnimation("howl", 3000);
        }
      } else if (!shouldHowl) {
        // Reset flag when moon phase / condition changes
        howlCheckedRef.current = false;
      }
    } catch (error) {
      console.error("[Doggerz] Error in howl check:", error);
    }
  }, [dog?.isAsleep, timeOfDay, playAnimation]);

  // Handle dog state changes with a priority-based state machine
  useEffect(() => {
    if (!dog) return;

    const currentActionKey = `${dog.lastAction}-${dog.isAsleep}-${dog.stats?.energy}`;

    // Prevent duplicate processing
    if (lastActionRef.current === currentActionKey) {
      return;
    }
    lastActionRef.current = currentActionKey;

    // Clear existing timeouts for old animations
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    // State machine
    if (dog.isAsleep) {
      const sleepAnim = Math.random() < 0.5 ? "sleep_curled" : "sleep_stretched";
      playAnimation(sleepAnim); // no duration = "permanent" until state changes
      return;
    }

    if (dog.lastAction === "feed") {
      playAnimation("eating", 2000);
      return;
    }

    if (dog.lastAction === "play") {
      playAnimation("happy_jump", 1500);
      return;
    }

    if (dog.lastAction === "drink") {
      playAnimation("drinking", 1500);
      return;
    }

    if (dog.stats?.energy < 30) {
      playAnimation("tired");
      return;
    }

    // Idle logic
    currentPriorityRef.current = 1;

    const now = Date.now();
    const currentAnim = animation;

    // Random idle variants with debounce (max once per 5s)
    if (now - lastRandomAnimRef.current > 5000) {
      const roll = Math.random();

      if (roll < 0.05) {
        lastRandomAnimRef.current = now;
        playAnimation("bark", 1000);
      } else if (roll < 0.1) {
        lastRandomAnimRef.current = now;
        playAnimation("scratch_ear", 1200);
      } else if (roll < 0.15) {
        setAnimation("idle_sit");
      } else {
        setAnimation(DEFAULT_ANIMATION);
      }
    } else if (currentAnim !== DEFAULT_ANIMATION && currentAnim !== "idle_sit") {
      // Drift back to idle if we somehow got stuck
      setAnimation(DEFAULT_ANIMATION);
    }
  }, [dog?.lastAction, dog?.isAsleep, dog?.stats?.energy, playAnimation, animation, dog]);

  // Pick animation meta
  const meta = ANIMATIONS[animation] || ANIMATIONS[DEFAULT_ANIMATION];

  // Frame stepping for current animation
  useEffect(() => {
    setFrameIndex(0);

    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % meta.frames);
    }, 1000 / meta.fps);

    return () => clearInterval(interval);
  }, [animation, meta.frames, meta.fps]);

  // Early return if no dog data ready
  if (!dog || !age || !spriteSheet) {
    return (
      <div className="relative w-32 h-32 flex items-center justify-center bg-zinc-900/50 rounded-lg border border-zinc-800">
        <p className="text-xs text-zinc-500">Loading...</p>
      </div>
    );
  }

  // Calculate sprite offset
  const frameX = -((meta.startFrame || 0) + frameIndex) * SPRITE_SIZE;
  const frameY = -(meta.row * SPRITE_SIZE);

  const spriteStyle = {
    width: `${SPRITE_SIZE}px`,
    height: `${SPRITE_SIZE}px`,
    backgroundImage: `url(${spriteSheet})`,
    backgroundSize: `${SHEET_SIZE}px ${SHEET_SIZE}px`,
    backgroundPosition: `${frameX}px ${frameY}px`,
    imageRendering: "pixelated",
    filter: `brightness(${timeOfDay === "night" ? 0.7 : 1})`,
    transition: "filter 0.3s ease",
  };

  return (
    <div className="relative select-none">
      <div
        style={spriteStyle}
        aria-label={`${dog.name} the dog, currently ${animation.replace(/_/g, " ")}`}
        role="img"
      />
      <p className="text-xs text-center mt-2 text-zinc-400 font-medium">
        {age.label} • {dog.name}
      </p>
      {import.meta.env.DEV && (
        <p className="text-xs text-center text-zinc-600 font-mono">
          {animation} (p{currentPriorityRef.current})
        </p>
      )}
    </div>
  );
}
// End of src/features/game/EnhancedDogSprite.jsx