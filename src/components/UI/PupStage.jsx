import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { move, setMoving, tick, selectDog } from "@/redux/dogSlice.js";
import DogSprite from "@/components/UI/DogSprite.jsx";

export default function PupStage({ interactive = true, className = "" }) {
  const dispatch = useDispatch();
  const dog = useSelector(selectDog);
  const rafRef = useRef(null);
  const keysRef = useRef({});

  // Keyboard controls
  useEffect(() => {
    if (!interactive) return;
    const down = (e) => {
      const k = e.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(k)) {
        keysRef.current[k] = true;
        dispatch(setMoving(true));
      }
    };
    const up = (e) => {
      const k = e.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(k)) {
        keysRef.current[k] = false;
        const any = Object.values(keysRef.current).some(Boolean);
        if (!any) dispatch(setMoving(false));
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      dispatch(setMoving(false));
      keysRef.current = {};
    };
  }, [interactive, dispatch]);

  // Game loop
  useEffect(() => {
    let prev = performance.now();
    const loop = (t) => {
      const dt = Math.min(0.05, (t - prev) / 1000);
      prev = t;

      if (interactive) {
        const k = keysRef.current;
        const speed = dog.speed;
        const dx = (k["arrowright"] || k["d"] ? 1 : 0) - (k["arrowleft"] || k["a"] ? 1 : 0);
        const dy = (k["arrowdown"] || k["s"] ? 1 : 0) - (k["arrowup"] || k["w"] ? 1 : 0);
        if (dx || dy) {
          const len = Math.hypot(dx, dy) || 1;
          dispatch(move({ dx: (dx / len) * speed * dt, dy: (dy / len) * speed * dt }));
        }
      }
      dispatch(tick({ dt }));
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [interactive, dispatch, dog.speed]);

  // Accessible non-color cue: dashed boundary + label
  return (
    <div
      className={[
        "relative rounded-xl border border-dashed border-white/20 bg-slate-800/50 overflow-hidden",
        "outline-none focus-within:ring-2 focus-within:ring-white/40",
        className,
      ].join(" ")}
      tabIndex={0}
      aria-label="Pup playfield"
    >
      <div className="absolute left-2 top-2 text-xs px-2 py-1 rounded bg-black/30 border border-white/10">
        WASD / Arrow keys to move
      </div>

      {/* Dog */}
      <div className="absolute" style={{ left: dog.pos.x, top: dog.pos.y }}>
        <DogSprite size={96} frames={8} fps={8} facing="right" playing={dog.moving} />
      </div>
    </div>
  );
}
