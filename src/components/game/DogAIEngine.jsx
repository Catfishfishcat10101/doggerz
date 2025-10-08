/**
 * DogAIEngine.jsx — Autonomous-only
 * ---------------------------------------------------------------------------
 * Headless orchestrator:
 *  - Real-time needs decay (tickRealTime)
 *  - Autonomous locomotion (wander/nap) with stage/energy-aware speed
 *  - Optional bark SFX trigger via external dispatch(bark()) only (no user keys)
 *
 * Renders nothing (unless debug=true). Mount once in the scene.
 * This variant intentionally has **no** keyboard handlers and **no** manual override.
 * ---------------------------------------------------------------------------
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  bark as barkAction,
  feed,
  rest,
  pet,
  selectDog,
  selectStage,
  selectMute,
  setDirection,
  setMoving,
  setPosition,
  tickRealTime,
} from "@/redux/dogSlice";
import { Howl } from "howler";
import barkSfxUrl from "@/assets/audio/bark1.mp3"; // Vite-managed asset

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

function stageSpeed(stage) {
  switch (stage) {
    case "puppy": return 90;
    case "senior": return 60;
    default: return 75; // adult
  }
}

const MODE = Object.freeze({
  IDLE: "idle",
  WANDER: "wander",
  NAP: "nap",
  PLAY: "play",
});

export default function DogAIEngine({
  worldW = 640,
  worldH = 360,
  debug = false,
  logicHz = 30, // movement solver frequency
  tickHz = 4,   // redux time/needs loop frequency
}) {
  const dispatch = useDispatch();
  const dog = useSelector(selectDog);
  const stage = useSelector(selectStage);
  const isMuted = useSelector(selectMute);

  // Motion prefs
  const prefersReduced = useMemo(() => {
    try { return !!window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches; }
    catch { return false; }
  }, []);

  // SFX (triggered only by external actions; engine won’t bind keys)
  const barkSfxRef = useRef(null);
  useEffect(() => {
    barkSfxRef.current = new Howl({ src: [barkSfxUrl], volume: isMuted ? 0 : 0.75 });
    return () => barkSfxRef.current?.unload();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (barkSfxRef.current) barkSfxRef.current.volume(isMuted ? 0 : 0.75);
  }, [isMuted]);

  // AI working state (local only)
  const [mode, setMode] = useState(MODE.WANDER);
  const targetRef = useRef({ x: 0.5, y: 0.65 }); // normalized (0..1)
  const normPosRef = useRef({
    x: dog.pos?.x ? clamp(dog.pos.x / worldW, 0.05, 0.95) : 0.5,
    y: dog.pos?.y ? clamp(dog.pos.y / worldH, 0.50, 0.90) : 0.65,
  });
  const facingRef = useRef("right");

  // Global time/needs ticker
  useEffect(() => {
    const period = Math.max(250, Math.floor(1000 / tickHz));
    const id = setInterval(() => dispatch(tickRealTime(Date.now())), period);
    return () => clearInterval(id);
  }, [dispatch, tickHz]);

  // Wander target scheduler
  useEffect(() => {
    let tm = 0;
    const schedule = () => {
      const roam = stage === "puppy" ? 0.85 : stage === "senior" ? 0.65 : 0.75;
      let tx = 0.5 + (Math.random() - 0.5) * roam;
      let ty = 0.65 + (Math.random() - 0.5) * 0.20;
      targetRef.current = {
        x: clamp(tx, 0.08, 0.92),
        y: clamp(ty, 0.52, 0.90),
      };
      const dwell = 1800 + Math.random() * 3200;
      tm = window.setTimeout(schedule, dwell);
    };
    schedule();
    return () => clearTimeout(tm);
  }, [stage]);

  // Mode arbitration (energy-aware)
  useEffect(() => {
    if (dog.energy < 18 && mode !== MODE.NAP) {
      setMode(MODE.NAP);
      dispatch(rest(18)); // small top-up on nap start
      return;
    }
    if (dog.energy > 30 && mode === MODE.NAP) {
      setMode(MODE.WANDER);
    }
  }, [dog.energy, mode, dispatch]);

  // Movement solver (autonomy only)
  useEffect(() => {
    const dt = 1 / logicHz;
    const pxPerSecBase = stageSpeed(stage);
    let raf = 0;
    let accum = 0;
    let last = performance.now();

    const step = (now) => {
      const frameDt = Math.min(0.066, (now - last) / 1000); // clamp worst-case
      last = now;
      accum += frameDt;

      let guard = 0;
      while (accum >= dt && guard++ < 5) {
        const np = normPosRef.current;

        if (mode === MODE.NAP) {
          dispatch(setMoving(false));
        } else {
          let speed = pxPerSecBase;
          if (stage === "puppy") speed *= 1.1;
          if (stage === "senior") speed *= 0.85;
          if (dog.happiness < 35) speed *= 0.92;
          if (dog.energy < 25) speed *= 0.9;
          if (prefersReduced) speed *= 0.85;

          const vxNorm = (speed / worldW) * dt;
          const vyNorm = (speed / worldH) * dt;

          // Seek current target
          const tx = targetRef.current.x - np.x;
          const ty = targetRef.current.y - np.y;
          const dist = Math.hypot(tx, ty);

          let dx = 0, dy = 0;
          if (dist > 0.0015) {
            dx = (tx / dist) * vxNorm;
            dy = (ty / dist) * vyNorm;
          }

          let nx = clamp(np.x + dx, 0.05, 0.95);
          let ny = clamp(np.y + dy, 0.50, 0.90);

          // bounce hint for facing
          if (nx <= 0.05 || nx >= 0.95) {
            facingRef.current = nx <= 0.05 ? "right" : "left";
          }

          np.x = nx; np.y = ny;

          const px = Math.round(nx * worldW);
          const py = Math.round(ny * worldH);
          dispatch(setPosition({ x: px, y: py }));
          const movingNow = Math.abs(dx) + Math.abs(dy) > 0.0001;
          dispatch(setMoving(movingNow));
          const facing = dx >= 0 ? "right" : "left";
          dispatch(setDirection(facing));
          facingRef.current = facing;
        }

        accum -= dt;
      }

      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logicHz, stage, worldW, worldH, mode, dog.happiness, dog.energy, prefersReduced]);

  // Debug overlay only
  if (!debug) return null;

  const dbg = {
    mode,
    stage,
    pos: dog.pos,
    energy: Math.round(dog.energy),
    hunger: Math.round(dog.hunger),
    happy: Math.round(dog.happiness),
  };

  return (
    <div
      className="pointer-events-none fixed bottom-3 left-3 z-[60] rounded-lg border border-white/10 bg-slate-900/80 p-3 text-xs text-slate-100 shadow-lg"
      style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace" }}
    >
      <div className="font-semibold mb-1">Dog AI (debug)</div>
      <pre className="whitespace-pre-wrap leading-4">{JSON.stringify(dbg, null, 2)}</pre>
      <div className="mt-2 text-[10px] text-slate-300">Autonomous mode</div>
    </div>
  );
}
