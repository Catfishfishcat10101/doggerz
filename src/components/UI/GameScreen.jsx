// src/components/UI/GameScreen.jsx
import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { move, setMoving, tick } from "@/redux/dogSlice.js";
import DogSprite from "@/components/UI/DogSprite.jsx";
import StatsBar from "@/components/UI/StatsBar.jsx";

// ✅ Add this import
import BackgroundScene from "@/components/Features/BackgroundScene.jsx";

export default function GameScreen() {
  const dispatch = useDispatch();
  const dog = useSelector((s) => s.dog);
  const rafRef = useRef(null);
  const keysRef = useRef({});

  // Keyboard controls
  useEffect(() => {
    const onDown = (e) => {
      const k = e.key.toLowerCase();
      if (["arrowup","arrowdown","arrowleft","arrowright","w","a","s","d"].includes(k)) {
        keysRef.current[k] = true;
        dispatch(setMoving(true));
      }
    };
    const onUp = (e) => {
      const k = e.key.toLowerCase();
      if (["arrowup","arrowdown","arrowleft","arrowright","w","a","s","d"].includes(k)) {
        keysRef.current[k] = false;
        const any = Object.values(keysRef.current).some(Boolean);
        if (!any) dispatch(setMoving(false));
      }
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      dispatch(setMoving(false));
    };
  }, [dispatch]);

  // Game loop
  useEffect(() => {
    let prev = performance.now();
    const loop = (t) => {
      const dt = Math.min(0.05, (t - prev) / 1000);
      prev = t;

      const k = keysRef.current;
      const dx = (k["arrowright"] || k["d"] ? 1 : 0) - (k["arrowleft"] || k["a"] ? 1 : 0);
      const dy = (k["arrowdown"] || k["s"] ? 1 : 0) - (k["arrowup"] || k["w"] ? 1 : 0);
      if (dx || dy) {
        const len = Math.hypot(dx, dy) || 1;
        const stepX = (dx / len) * dog.speed * dt;
        const stepY = (dy / len) * dog.speed * dt;
        dispatch(move({ dx: stepX, dy: stepY }));
      }

      dispatch(tick({ dt }));
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [dispatch, dog.speed]);

  return (
    <main className="min-h-[calc(100dvh-56px)] bg-slate-900 text-slate-100">
      <div className="mx-auto max-w-5xl p-4 space-y-4">
        <StatsBar stats={dog.stats} mood={dog.mood} />

        {/* ✅ Wrap your stage with BackgroundScene */}
        <BackgroundScene skin="neon" accent="#22d3ee" className="my-4">
          {/* This is your existing playfield */}
          <div
            className="relative h-[480px] rounded-2xl border border-white/15 bg-slate-800/30 overflow-hidden"
            aria-label="Playfield"
          >
            {/* Non-color cue/help */}
            <div className="absolute left-3 top-3 text-xs px-2 py-1 rounded bg-black/30 border border-white/10">
              WASD / Arrow keys to move
            </div>

            {/* Optional yard zone on right */}
            <div className="absolute inset-y-0 right-0 w-40 bg-emerald-700/20 border-l border-emerald-400/30 pointer-events-none flex items-center justify-center">
              <span className="rotate-90 text-xs text-emerald-200/80">Yard</span>
            </div>

            {/* Dog sprite */}
            <div className="absolute" style={{ left: dog.pos.x, top: dog.pos.y }}>
              <DogSprite
                size={96}
                frames={8}
                fps={8}
                facing="right"
                playing={dog.moving}
              />
            </div>
          </div>
        </BackgroundScene>
      </div>
    </main>
  );
}
