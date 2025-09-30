import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { move, setMoving, tick } from "@/redux/dogSlice";
import DogSprite from "./DogSprite.jsx";
import StatsBar from "./StatsBar.jsx";

export default function GameScreen() {
  const dispatch = useDispatch();
  const dog = useSelector((s) => s.dog);
  const pressed = useRef(new Set());

  // keyboard
  useEffect(() => {
    const down = (e) => { pressed.current.add(e.key); dispatch(setMoving(true)); };
    const up   = (e) => { pressed.current.delete(e.key); if (!pressed.current.size) dispatch(setMoving(false)); };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [dispatch]);

  // loop (1Hz ticks; movement at 60Hz)
  useEffect(() => {
    let last = performance.now(), acc = 0, raf;
    const step = (now) => {
      const dt = (now - last) / 1000; last = now; acc += dt;

      // movement
      const speed = 80; // px/sec
      let dx = 0, dy = 0;
      const keys = pressed.current;
      if (keys.has("ArrowLeft") || keys.has("a"))  dx -= speed * dt;
      if (keys.has("ArrowRight")|| keys.has("d"))  dx += speed * dt;
      if (keys.has("ArrowUp")   || keys.has("w"))  dy -= speed * dt;
      if (keys.has("ArrowDown") || keys.has("s"))  dy += speed * dt;
      if (dx || dy) dispatch(move({ dx, dy }));

      // 1-second game tick
      if (acc >= 1) { const whole = Math.floor(acc); acc -= whole; dispatch(tick(whole)); }

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [dispatch]);

  return (
    <div className="relative mx-auto max-w-5xl p-6">
      <StatsBar dog={dog} />
      <div className="relative mt-6 h-[360px] rounded-2xl bg-slate-900/60">
        <DogSprite x={dog.x} y={dog.y} />
      </div>
      <p className="mt-3 text-sm opacity-70">Tip: WASD/Arrows to move • Space to bark</p>
    </div>
  );
}