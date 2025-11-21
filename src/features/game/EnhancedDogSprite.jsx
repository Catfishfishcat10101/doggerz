// src/features/game/EnhancedDogSprite.jsx
// @ts-nocheck

import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useSelector } from "react-redux";
import { selectDog } from "@/redux/dogSlice.js";
import { calculateDogAge, getSpriteSheet } from "@/utils/lifecycle.js";
import { shouldHowlAtMoon, getTimeOfDay } from "@/utils/weather.js";

/**
 * Spritesheet spec:
 * - 2048x2048 PNG
 * - 16x16 grid
 * - 128x128 per frame
 *
 * Rows (0–15):
 * 0  Idle
 * 1  Walk
 * 2  Run
 * 3  Sit
 * 4  Lay Down
 * 5  Eat
 * 6  Play (Ball)
 * 7  Play (Tug)
 * 8  Sleep
 * 9  Bark
 * 10 Scratch
 * 11 Shake
 * 12 Potty
 * 13 Sad
 * 14 Excited
 * 15 Special
 */

const SPRITE_SIZE = 128;
const SHEET_COLS = 16;
const SHEET_SIZE = SPRITE_SIZE * SHEET_COLS;

const ANIMATIONS = {
  // Core movement / idle
  idle: { row: 0, frames: 16, fps: 8 },
  walk: { row: 1, frames: 16, fps: 12 },
  run: { row: 2, frames: 16, fps: 12 },
  sit: { row: 3, frames: 16, fps: 8 },
  lay: { row: 4, frames: 16, fps: 8 },

  // Actions
  eat: { row: 5, frames: 16, fps: 10 },
  play_ball: { row: 6, frames: 16, fps: 10 },
  play_tug: { row: 7, frames: 16, fps: 10 },
  sleep: { row: 8, frames: 16, fps: 8 },
  bark: { row: 9, frames: 16, fps: 15 },
  scratch: { row: 10, frames: 16, fps: 12 },
  shake: { row: 11, frames: 16, fps: 15 },
  potty: { row: 12, frames: 16, fps: 10 },

  // Mood / special
  sad: { row: 13, frames: 16, fps: 8 },
  excited: { row: 14, frames: 16, fps: 12 },
  special: { row: 15, frames: 16, fps: 10 },

  // “Howl” piggybacks on bark row until you get a custom anim
  howl: { row: 9, frames: 16, fps: 10 },
};

const DEFAULT_ANIMATION = "idle";

// Higher = can’t be interrupted by lower-priority animations
const ANIMATION_PRIORITY = {
  // Hard locks
  sleep: 10,
  potty: 9,

  // Strong action / feedback
  shake: 9,
  eat: 8,
  play_ball: 8,
  play_tug: 8,
  howl: 7,
  bark: 6,

  // Status / mood
  scratch: 5,
  sad: 4,
  excited: 3,

  // Movement / idle
  run: 2,
  walk: 2,
  sit: 2,
  lay: 2,
  idle: 1,
};

export default function EnhancedDogSprite() {
  const dog = useSelector(selectDog);

  const [animation, setAnimation] = useState(DEFAULT_ANIMATION);
  const [frameIndex, setFrameIndex] = useState(0);
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

  // Time-of-day ticker (for brightness & howling flavor)
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

  // Priority-aware animation setter
  const playAnimation = useCallback((anim, durationMs) => {
    const newPriority = ANIMATION_PRIORITY[anim] || 1;

    if (newPriority < currentPriorityRef.current) {
      return;
    }

    currentPriorityRef.current = newPriority;
    setAnimation(anim);

    if (durationMs) {
      const timeout = setTimeout(() => {
        currentPriorityRef.current = 1;
        setAnimation(DEFAULT_ANIMATION);
      }, durationMs);
      timeoutsRef.current.push(timeout);
    }
  }, []);

  // Age & sprite sheet based on life stage
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
      console.error(
        "[Doggerz] Error calculating dog age / sprite sheet:",
        error
      );
      return { age: null, spriteSheet: null };
    }
  }, [dog?.adoptedAt]);

  // Moon howling: uses “howl” animation mapped to bark row
  useEffect(() => {
    if (!dog) return;

    try {
      const shouldHowl = shouldHowlAtMoon(timeOfDay);

      if (shouldHowl && !dog.isAsleep && !howlCheckedRef.current) {
        howlCheckedRef.current = true;

        if (Math.random() < 0.3) {
          playAnimation("howl", 3000);
        }
      } else if (!shouldHowl) {
        howlCheckedRef.current = false;
      }
    } catch (error) {
      console.error("[Doggerz] Error in howl check:", error);
    }
  }, [dog?.isAsleep, timeOfDay, playAnimation]);

  // Core state machine: dog state → animation
  useEffect(() => {
    if (!dog) return;

    const energy = dog.stats?.energy ?? 0;
    const happiness = dog.stats?.happiness ?? 0;
    const cleanliness = dog.stats?.cleanliness ?? 100;
    const hunger = dog.stats?.hunger ?? 0;

    const currentActionKey = [
      dog.lastAction || "none",
      dog.isAsleep ? "asleep" : "awake",
      Math.round(energy),
      Math.round(happiness),
      Math.round(cleanliness),
      Math.round(hunger),
    ].join("|");

    if (lastActionRef.current === currentActionKey) {
      return;
    }
    lastActionRef.current = currentActionKey;

    // Clear pending “go back to idle” timeouts when state changes
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    // 1) Hard locks: sleep state
    if (dog.isAsleep) {
      playAnimation("sleep"); // no duration; stays until state flips
      return;
    }

    // 2) Direct action mapping (from reducers setting lastAction)
    switch (dog.lastAction) {
      case "feed":
        playAnimation("eat", 2000);
        return;
      case "play":
        playAnimation(
          Math.random() < 0.5 ? "play_ball" : "play_tug",
          1800
        );
        return;
      case "bathe":
        playAnimation("shake", 2000);
        return;
      case "potty":
      case "go_potty":
      case "potty_break":
        playAnimation("potty", 1800);
        return;
      case "bark":
        playAnimation("bark", 1200);
        return;
      default:
      // fall through into mood / idle logic
    }

    // 3) Mood-driven behaviors (spec-driven)
    if (energy < 20) {
      // “Sleep animation even if not resting”
      playAnimation("sleep");
      return;
    }

    if (cleanliness < 30) {
      // “Dirty → scratch”
      playAnimation("scratch");
      return;
    }

    if (happiness < 30) {
      playAnimation("sad");
      return;
    }

    if (happiness > 75) {
      playAnimation("excited");
      return;
    }

    // 4) High hunger → more bark / attention
    if (hunger > 70 && Math.random() < 0.25) {
      playAnimation("bark", 1000);
      return;
    }

    // 5) Idle wandering: mostly idle, occasional sit/lay/bark/scratch
    currentPriorityRef.current = 1;
    const now = Date.now();
    const currentAnim = animation;

    // Debounce random switches to avoid flicker (max once/5s)
    if (now - lastRandomAnimRef.current > 5000) {
      const roll = Math.random();
      lastRandomAnimRef.current = now;

      if (roll < 0.15) {
        playAnimation("bark", 1000);
      } else if (roll < 0.3) {
        playAnimation("scratch", 1200);
      } else if (roll < 0.45) {
        setAnimation("sit");
      } else if (roll < 0.6) {
        setAnimation("lay");
      } else {
        setAnimation(DEFAULT_ANIMATION);
      }
    } else if (
      currentAnim !== DEFAULT_ANIMATION &&
      currentAnim !== "sit" &&
      currentAnim !== "lay"
    ) {
      // Drift back to idle if we somehow get stuck
      setAnimation(DEFAULT_ANIMATION);
    }
  }, [dog, playAnimation, animation]);

  // Pick animation meta
  const meta = ANIMATIONS[animation] || ANIMATIONS[DEFAULT_ANIMATION];

  // Frame stepping
  useEffect(() => {
    setFrameIndex(0);

    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % meta.frames);
    }, 1000 / meta.fps);

    return () => clearInterval(interval);
  }, [animation, meta.frames, meta.fps]);

  // Guard: no dog / no sprite ready yet
  if (!dog || !age || !spriteSheet) {
    return (
      <div className="relative w-32 h-32 flex items-center justify-center bg-zinc-900/50 rounded-lg border border-zinc-800">
        <p className="text-xs text-zinc-500">Loading…</p>
      </div>
    );
  }

  // Sprite offsets (16x16 grid)
  const frameX = -frameIndex * SPRITE_SIZE;
  const frameY = -meta.row * SPRITE_SIZE;

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
        aria-label={`${dog.name} the dog, currently ${animation.replace(
          /_/g,
          " "
        )}`}
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
