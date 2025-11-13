import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  move,
  feedDog,
  batheDog,
  setStat,
  increasePottyLevel,
  selectDog,
} from "@/redux/dogSlice.js";

/**
 * Headless “brain” for the dog.
 * - Decays/recovers needs over time.
 * - Chooses goals and walks toward zones.
 * - Triggers actions (feed, rest via setStat, bath, potty train) on arrival.
 */
export default function DogAIEngine({
  worldW = 480,
  worldH = 320,
  speed = 70, // px/sec
}) {
  const dispatch = useDispatch();
  const dog = useSelector(selectDog);

  const lastTs = useRef(0);
  const target = useRef(null);
  const mode = useRef("idle"); // "idle" | "wander" | "seek:bowl|bed|bath|potty"
  const cooldowns = useRef({ eat: 0, rest: 0, bath: 0, potty: 0 });
  const zones = useRef({
    bowl:  { x: 56,  y: worldH - 40, r: 22 },
    bed:   { x: worldW - 64, y: worldH - 32, r: 26 },
    bath:  { x: worldW - 64, y: 32, r: 20 },
    potty: { x: 56,  y: 32, r: 18 },
  });

  useEffect(() => {
    let raf = 0;

    const step = (ts) => {
      const dt = Math.min(0.05, (ts - (lastTs.current || ts)) / 1000);
      lastTs.current = ts;

      // soft decay (every frame; tiny)
      if (dt > 0) {
        // Treat "hunger" as fullness (higher is better) per your slice.
        // Gradually get hungry/tired/dirty.
        const { hunger, energy, cleanliness } = dog.stats;
        if (hunger > 0) dispatch(setStat({ key: "hunger",      value: hunger - dt * 1.0 }));
        if (cleanliness > 0) dispatch(setStat({ key: "cleanliness", value: cleanliness - dt * 0.4 }));
        // lose a little energy while moving, gain a hair while idle
        const movingNow = target.current != null;
        const nextEnergy = energy + (movingNow ? -dt * 0.8 : dt * 0.3);
        dispatch(setStat({ key: "energy", value: nextEnergy }));
      }

      // cooldowns
      Object.keys(cooldowns.current).forEach(
        (k) => (cooldowns.current[k] = Math.max(0, cooldowns.current[k] - dt))
      );

      // goal selection (priority order)
      const s = dog.stats;
      if (s.energy < 30 && cooldowns.current.rest <= 0)       mode.current = "seek:bed";
      else if (s.hunger < 40 && cooldowns.current.eat <= 0)   mode.current = "seek:bowl";
      else if (s.cleanliness < 35 && cooldowns.current.bath<=0) mode.current = "seek:bath";
      else if (dog.pottyLevel < 100 && cooldowns.current.potty <= 0) mode.current = "seek:potty";
      else if (!target.current || reached(dog.pos, target.current, 8)) {
        // happy wanderer
        target.current = randPoint(worldW, worldH, 24);
        mode.current = "wander";
      }

      // update target for seek modes
      if (mode.current.startsWith("seek:")) {
        const key = mode.current.split(":")[1];
        target.current = zones.current[key];
      }

      // move toward target if any
      if (target.current) {
        const { nx, ny } = seek(dog.pos.x, dog.pos.y, target.current.x, target.current.y, speed * dt, worldW, worldH);
        if (nx !== dog.pos.x || ny !== dog.pos.y) dispatch(move({ x: nx, y: ny }));

        // arrived?
        if (reached({ x: nx, y: ny }, target.current, target.current.r || 14)) {
          if (mode.current === "seek:bowl" && cooldowns.current.eat <= 0) {
            dispatch(feedDog());                // raises fullness in your slice
            cooldowns.current.eat = 5;
          }
          if (mode.current === "seek:bed" && cooldowns.current.rest <= 0) {
            // No "rest" reducer in your slice; bump energy directly.
            dispatch(setStat({ key: "energy", value: Math.min(100, s.energy + 18) }));
            cooldowns.current.rest = 6;
          }
          if (mode.current === "seek:bath" && cooldowns.current.bath <= 0) {
            dispatch(batheDog());
            cooldowns.current.bath = 8;
          }
          if (mode.current === "seek:potty" && cooldowns.current.potty <= 0) {
            dispatch(increasePottyLevel(15));
            cooldowns.current.potty = 6;
          }
          target.current = null;
          mode.current = "idle";
        }
      }

      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [dispatch, dog.pos.x, dog.pos.y, dog.stats, dog.pottyLevel, worldW, worldH]);

  return null; // headless controller
}

// helpers
function seek(x, y, tx, ty, step, W, H) {
  const dx = tx - x, dy = ty - y;
  const d = Math.hypot(dx, dy) || 1;
  const nx = clamp0(x + (dx / d) * step, 0, W - 1);
  const ny = clamp0(y + (dy / d) * step, 0, H - 1);
  return { nx, ny };
}
function reached(p, t, r = 10) {
  const tx = t.x ?? t, ty = t.y ?? t;
  return Math.hypot(p.x - tx, p.y - ty) <= r;
}
function randPoint(W, H, m = 10) {
  return { x: m + Math.random() * (W - 2 * m), y: m + Math.random() * (H - 2 * m) };
}
function clamp0(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }