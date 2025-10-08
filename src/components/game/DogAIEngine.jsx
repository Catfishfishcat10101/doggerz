// src/components/Features/DogAIEngine.jsx
/**
 * DogAIEngine.jsx
 * ---------------------------------------------------------------------------
 * Headless orchestration layer that drives:
 *  - Real-time aging & needs decay (redux: tickRealTime)
 *  - Autonomous locomotion (wander/idle/nap) with stage/energy-aware speed
 *  - Bark interaction (Space or click from any consumer via dispatch(bark()))
 *  - Optional manual override with arrow keys (temporary) for QA
 *  - Bark SFX playback via howler w/ mute toggle in redux
 *
 * This component renders nothing (unless debug=true). Mount it once per scene
 * that contains the dog world (e.g., GameScreen). It will not duplicate
 * state—everything authoritative lives in redux/dogSlice.
 *
 * Usage:
 *   <DogAIEngine worldW={640} worldH={360} debug={false} />
 *
 * Hard requirements:
 *   npm i howler
 *
 * Sprite rendering is handled by your visual component (e.g., Dog.jsx).
 * This engine only updates redux: position, moving, direction, and global tick.
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

// Public asset (place at public/assets/audio/bark1.mp3)
const BARK_URL = "/assets/audio/bark1.mp3";

// World-safe clamps
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

/** Stage-aware base speed in pixels/sec */
function stageSpeed(stage) {
  switch (stage) {
    case "puppy": return 90;
    case "senior": return 60;
    default: return 75; // adult
  }
}

/** Simple state machine enumerations */
const MODE = {
  IDLE: "idle",
  WANDER: "wander",
  NAP: "nap",
  PLAY: "play", // reserved for future toys
};

export default function DogAIEngine({
  worldW = 640,
  worldH = 360,
  debug = false,
  logicHz = 30,      // movement solver frequency
  tickHz = 4,        // redux time/needs loop frequency
  manualOverrideMs = 2500, // arrow-key control hold time
}) {
  const dispatch = useDispatch();
  const dog = useSelector(selectDog);
  const stage = useSelector(selectStage);
  const isMuted = useSelector(selectMute);

  // SFX
  const barkSfxRef = useRef(null);

  // AI working state (not stored in redux to keep save small)
  const [mode, setMode] = useState(MODE.WANDER);
  const targetRef = useRef({ x: 0.5, y: 0.65 }); // normalized targets (0..1)
  const normPosRef = useRef({
    x: dog.pos?.x ? clamp(dog.pos.x / worldW, 0.05, 0.95) : 0.5,
    y: dog.pos?.y ? clamp(dog.pos.y / worldH, 0.50, 0.90) : 0.65,
  });
  const facingRef = useRef("right");
  const lastCommandTs = useRef(0); // manual override timer

  // ---------- Init sound ----------
  useEffect(() => {
    barkSfxRef.current = new Howl({ src: [BARK_URL], volume: isMuted ? 0 : 0.75 });
    return () => barkSfxRef.current?.unload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (barkSfxRef.current) barkSfxRef.current.volume(isMuted ? 0 : 0.75);
  }, [isMuted]);

  // ---------- Global time/needs ticker ----------
  useEffect(() => {
    const period = Math.max(1, Math.floor(1000 / tickHz));
    const id = setInterval(() => dispatch(tickRealTime(Date.now())), period);
    return () => clearInterval(id);
  }, [dispatch, tickHz]);

  // ---------- Wander target scheduler ----------
  useEffect(() => {
    let tm = 0;
    const schedule = () => {
      // Puppies roam more; seniors keep tighter loops
      const roam = stage === "puppy" ? 0.85 : stage === "senior" ? 0.65 : 0.75;
      targetRef.current = {
        x: 0.5 + (Math.random() - 0.5) * roam,
        y: 0.65 + (Math.random() - 0.5) * 0.2,
      };
      targetRef.current.x = clamp(targetRef.current.x, 0.08, 0.92);
      targetRef.current.y = clamp(targetRef.current.y, 0.52, 0.90);

      const dwell = 1800 + Math.random() * 3200;
      tm = window.setTimeout(schedule, dwell);
    };
    schedule();
    return () => clearTimeout(tm);
  }, [stage]);

  // ---------- Mode arbitration (energy-aware) ----------
  useEffect(() => {
    // When energy is low, nap opportunistically
    if (dog.energy < 18 && mode !== MODE.NAP) {
      setMode(MODE.NAP);
      dispatch(rest(18)); // small top-up on nap start
      return;
    }
    if (dog.energy > 30 && mode === MODE.NAP) {
      setMode(MODE.WANDER);
    }
  }, [dog.energy, mode, dispatch]);

  // ---------- Movement solver ----------
  useEffect(() => {
    const dt = 1 / logicHz;
    const pxPerSec = stageSpeed(stage);
    let raf = 0;
    let accum = 0;
    let last = performance.now();

    const loop = (now) => {
      const frameDt = (now - last) / 1000;
      last = now;
      accum += frameDt;

      // Fixed-step integrator for stable movement
      while (accum >= dt) {
        const np = normPosRef.current;

        // manual override window
        const manualActive = now - lastCommandTs.current < manualOverrideMs;

        if (mode === MODE.NAP && !manualActive) {
          dispatch(setMoving(false));
        } else {
          let speed = pxPerSec;
          // small stage/mood modifiers
          if (stage === "puppy") speed *= 1.1;
          if (stage === "senior") speed *= 0.85;
          if (dog.happiness < 35) speed *= 0.92;
          if (dog.energy < 25) speed *= 0.9;

          // convert to normalized per-step velocity
          const vxNorm = (speed / worldW) * dt;
          const vyNorm = (speed / worldH) * dt;

          let dx = 0, dy = 0;
          if (manualActive) {
            // manual direction already encoded in facingRef; dx set on key press
            dx = facingRef.current === "right" ? vxNorm : -vxNorm;
            dy = 0;
          } else {
            // seek target
            const tx = targetRef.current.x - np.x;
            const ty = targetRef.current.y - np.y;
            const dist = Math.hypot(tx, ty);
            if (dist > 0.0015) {
              dx = (tx / dist) * vxNorm;
              dy = (ty / dist) * vyNorm;
            }
          }

          // integrate & clamp
          let nx = clamp(np.x + dx, 0.05, 0.95);
          let ny = clamp(np.y + dy, 0.50, 0.90);

          // bounce at edges
          if (nx <= 0.05 || nx >= 0.95) {
            facingRef.current = nx <= 0.05 ? "right" : "left";
          }

          // writeback
          np.x = nx; np.y = ny;

          const px = Math.round(nx * worldW);
          const py = Math.round(ny * worldH);
          dispatch(setPosition({ x: px, y: py }));
          dispatch(setMoving(Math.abs(dx) + Math.abs(dy) > 0.0001));
          const facing = dx >= 0 ? "right" : "left";
          dispatch(setDirection(facing));
          facingRef.current = facing;
        }
        accum -= dt;
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logicHz, stage, worldW, worldH, mode, dog.happiness, dog.energy]);

  // ---------- Keyboard controls ----------
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        dispatch(barkAction(Date.now()));
        barkSfxRef.current?.play();
      }
      if (e.code === "ArrowLeft")  { lastCommandTs.current = performance.now(); facingRef.current = "left"; }
      if (e.code === "ArrowRight") { lastCommandTs.current = performance.now(); facingRef.current = "right"; }
      if (e.code === "KeyF") { dispatch(feed(20)); }
      if (e.code === "KeyR") { dispatch(rest(20)); }
      if (e.code === "KeyP") { dispatch(pet(8)); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  // ---------- Debug overlay (optional) ----------
  const debugInfo = useMemo(() => ({
    mode,
    stage,
    energy: Math.round(dog.energy),
    hunger: Math.round(dog.hunger),
    happy: Math.round(dog.happiness),
    pos: dog.pos,
  }), [mode, stage, dog.energy, dog.hunger, dog.happiness, dog.pos]);

  if (!debug) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-3 left-3 z-[60] rounded-lg border border-white/10 bg-slate-900/80 p-3 text-xs text-slate-100 shadow-lg"
      style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace" }}
    >
      <div className="font-semibold mb-1">Dog AI (debug)</div>
      <pre className="whitespace-pre-wrap leading-4">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
      <div className="mt-2 text-[10px] text-slate-300">
        ⌨ Space=bark • ←/→=manual nudge • F=feed • R=rest • P=pet
      </div>
    </div>
  );
}