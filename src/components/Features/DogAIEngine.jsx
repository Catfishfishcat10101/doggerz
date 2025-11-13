import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  move, feedDog, batheDog, setStat, increasePottyLevel, selectDog
} from "@/redux/dogSlice.js";

export default function DogAIEngine({ worldW = 480, worldH = 320, speed = 70 }) {
  const dispatch = useDispatch();
  const dog = useSelector(selectDog);

  const lastTs = useRef(0);
  const target = useRef(null);
  const mode = useRef("idle");
  const cooldowns = useRef({ eat: 0, rest: 0, bath: 0, potty: 0 });
  const zones = useRef({
    bowl:  { x: 56,        y: worldH - 40, r: 22 },
    bed:   { x: worldW-64, y: worldH - 32, r: 26 },
    bath:  { x: worldW-64, y: 32,          r: 20 },
    potty: { x: 56,        y: 32,          r: 18 },
  });

  useEffect(() => {
    let raf = 0;
    const step = (ts) => {
      const dt = Math.min(0.05, (ts - (lastTs.current || ts)) / 1000);
      lastTs.current = ts;

      // soft decay / regen
      const s = dog.stats;
      if (s.hunger > 0)      dispatch(setStat({ key: "hunger",      value: s.hunger - dt * 1.0 }));
      if (s.cleanliness > 0) dispatch(setStat({ key: "cleanliness", value: s.cleanliness - dt * 0.4 }));
      dispatch(setStat({ key: "energy", value: s.energy + (target.current ? -dt * 0.8 : dt * 0.3) }));

      // cooldowns
      for (const k of Object.keys(cooldowns.current)) cooldowns.current[k] = Math.max(0, cooldowns.current[k] - dt);

      // pick a goal
      if (s.energy < 30 && cooldowns.current.rest <= 0)           mode.current = "seek:bed";
      else if (s.hunger < 40 && cooldowns.current.eat <= 0)       mode.current = "seek:bowl";
      else if (s.cleanliness < 35 && cooldowns.current.bath <= 0) mode.current = "seek:bath";
      else if (dog.pottyLevel < 100 && cooldowns.current.potty <= 0) mode.current = "seek:potty";
      else if (!target.current || reached(dog.pos, target.current, 8)) {
        target.current = randPoint(worldW, worldH, 24); mode.current = "wander";
      }

      if (mode.current.startsWith("seek:")) {
        const key = mode.current.split(":")[1];
        target.current = zones.current[key];
      }

      if (target.current) {
        const { nx, ny } = seek(dog.pos.x, dog.pos.y, target.current.x, target.current.y, speed * dt, worldW, worldH);
        if (nx !== dog.pos.x || ny !== dog.pos.y) dispatch(move({ x: nx, y: ny }));

        if (reached({ x: nx, y: ny }, target.current, target.current.r || 14)) {
          if (mode.current === "seek:bowl"  && cooldowns.current.eat  <= 0) { dispatch(feedDog()); cooldowns.current.eat  = 5; }
          if (mode.current === "seek:bed"   && cooldowns.current.rest <= 0) { dispatch(setStat({ key:"energy", value: Math.min(100, s.energy + 18) })); cooldowns.current.rest = 6; }
          if (mode.current === "seek:bath"  && cooldowns.current.bath <= 0) { dispatch(batheDog()); cooldowns.current.bath = 8; }
          if (mode.current === "seek:potty" && cooldowns.current.potty<= 0) { dispatch(increasePottyLevel(15)); cooldowns.current.potty = 6; }
          target.current = null; mode.current = "idle";
        }
      }

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [dispatch, dog.pos.x, dog.pos.y, dog.stats, dog.pottyLevel, worldW, worldH]);

  return null;
}

function seek(x, y, tx, ty, step, W, H) {
  const dx = tx - x, dy = ty - y, d = Math.hypot(dx, dy) || 1;
  const nx = Math.max(0, Math.min(W - 1, x + (dx / d) * step));
  const ny = Math.max(0, Math.min(H - 1, y + (dy / d) * step));
  return { nx, ny };
}
function reached(p, t, r = 10) { return Math.hypot(p.x - (t.x ?? t), p.y - (t.y ?? t)) <= r; }
function randPoint(W, H, m = 10) { return { x: m + Math.random() * (W - 2*m), y: m + Math.random() * (H - 2*m) }; }