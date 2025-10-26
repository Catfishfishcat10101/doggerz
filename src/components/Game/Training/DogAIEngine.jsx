/* src/components/Features/DogAIEngine.jsx */
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
    case "puppy":
      return 90;
    case "senior":
      return 60;
    default:
      return 75;
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
  tickHz = 4, // redux time/needs loop frequency
}) {
  const dispatch = useDispatch();

  // Select *once* into a ref for the RAF loop; keep it fresh via a side-effect.
  const dog = useSelector(selectDog);
  const stage = useSelector(selectStage);
  const isMuted = useSelector(selectMute);

  const dogRef = useRef(dog);
  useEffect(() => {
    dogRef.current = dog;
  }, [dog]);

  // Motion prefs
  const prefersReduced = useMemo(() => {
    try {
      return !!window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    } catch {
      return false;
    }
  }, []);

  // SFX (created once, then volume-follow mute)
  const barkSfxRef = useRef(null);
  useEffect(() => {
    const howl = new Howl({ src: [barkSfxUrl], volume: 0 });
    barkSfxRef.current = howl;
    return () => howl.unload();
  }, []);
  useEffect(() => {
    barkSfxRef.current?.volume(isMuted ? 0 : 0.75);
  }, [isMuted]);

  // AI working state (local only)
  const [mode, setMode] = useState(MODE.WANDER);
  const targetRef = useRef({ x: 0.5, y: 0.65 }); // normalized (0..1)
  const normPosRef = useRef({
    x: dog.pos?.x ? clamp(dog.pos.x / worldW, 0.05, 0.95) : 0.5,
    y: dog.pos?.y ? clamp(dog.pos.y / worldH, 0.5, 0.9) : 0.65,
  });

  // ---- Global time/needs ticker (paused when hidden) ----
  useEffect(() => {
    let id;
    let lastTs = performance.now();

    function tick() {
      const now = performance.now();
      // reducer can compute dt from 'now' relative to its last snapshot
      dispatch(tickRealTime(Date.now()));
      lastTs = now;
    }

    function start() {
      if (id) return;
      const period = Math.max(250, Math.floor(1000 / tickHz));
      id = setInterval(tick, period);
    }
    function stop() {
      if (id) {
        clearInterval(id);
        id = null;
      }
    }

    function onVis() {
      if (document.hidden) stop();
      else {
        // reset any clocks so we don't dump a huge dt
        lastTs = performance.now();
        start();
      }
    }

    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [dispatch, tickHz]);

  // Wander target scheduler
  useEffect(() => {
    let tm = 0;
    const schedule = () => {
      const roam = stage === "puppy" ? 0.85 : stage === "senior" ? 0.65 : 0.75;
      let tx = 0.5 + (Math.random() - 0.5) * roam;
      let ty = 0.65 + (Math.random() - 0.5) * 0.2;
      targetRef.current = {
        x: clamp(tx, 0.08, 0.92),
        y: clamp(ty, 0.52, 0.9),
      };
      const dwell = 1800 + Math.random() * 3200;
      tm = window.setTimeout(schedule, dwell);
    };
    schedule();
    return () => clearTimeout(tm);
  }, [stage]);

  // Mode arbitration (energy-aware) — uses ref so loop stays stable
  useEffect(() => {
    if (dog.energy < 18 && mode !== MODE.NAP) {
      setMode(MODE.NAP);
      dispatch(rest(18)); // small top-up on nap start
      return;
    }
    if (dog.energy > 30 && mode === MODE.NAP) {
      setMode(MODE.WANDER);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, mode, dog.energy]);

  // ---- Movement solver (stable RAF; no re-mounting on state changes) ----
  useEffect(() => {
    const dt = 1 / logicHz;
    let raf = 0;
    let accum = 0;
    let last = performance.now();

    const step = (now) => {
      const dogNow = dogRef.current;
      const frameDt = Math.min(0.066, (now - last) / 1000);
      last = now;
      accum += frameDt;

      // run a few fixed steps to catch up smoothly
      let guard = 0;
      while (accum >= dt && guard++ < 5) {
        const np = normPosRef.current;

        if (mode === MODE.NAP) {
          dispatch(setMoving(false));
        } else {
          let speed = stageSpeed(stage);
          if (stage === "puppy") speed *= 1.1;
          if (stage === "senior") speed *= 0.85;
          if (dogNow.happiness < 35) speed *= 0.92;
          if (dogNow.energy < 25) speed *= 0.9;
          if (prefersReduced) speed *= 0.85;

          const vxNorm = (speed / worldW) * dt;
          const vyNorm = (speed / worldH) * dt;

          // seek target
          const tx = targetRef.current.x - np.x;
          const ty = targetRef.current.y - np.y;
          const dist = Math.hypot(tx, ty);

          let dx = 0,
            dy = 0;
          if (dist > 0.0015) {
            dx = (tx / dist) * vxNorm;
            dy = (ty / dist) * vyNorm;
          }

          const nx = clamp(np.x + dx, 0.05, 0.95);
          const ny = clamp(np.y + dy, 0.5, 0.9);
          np.x = nx;
          np.y = ny;

          const px = Math.round(nx * worldW);
          const py = Math.round(ny * worldH);
          dispatch(setPosition({ x: px, y: py }));

          const movingNow = Math.abs(dx) + Math.abs(dy) > 0.0001;
          dispatch(setMoving(movingNow));
          dispatch(setDirection(dx >= 0 ? "right" : "left"));
        }

        accum -= dt;
      }

      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // only re-create when geometry/frequency changes
  }, [dispatch, logicHz, worldW, worldH, prefersReduced, stage, mode]);

  // Debug overlay
  if (!debug) return null;

  const d = dogRef.current;
  const dbg = {
    mode,
    stage,
    pos: d.pos,
    energy: Math.round(d.energy),
    hunger: Math.round(d.hunger),
    happiness: Math.round(d.happiness),
  };

  return (
    <div
      className="pointer-events-none fixed bottom-3 left-3 z-[60] rounded-lg border border-white/10 bg-slate-900/80 p-3 text-xs text-slate-100 shadow-lg"
      style={{
        fontFamily:
          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace",
      }}
    >
      <div className="font-semibold mb-1">Dog AI (debug)</div>
      <pre className="whitespace-pre-wrap leading-4">
        {JSON.stringify(dbg, null, 2)}
      </pre>
      <div className="mt-2 text-[10px] text-slate-300">Autonomous mode</div>
    </div>
  );
}
/* vite.config.js */
