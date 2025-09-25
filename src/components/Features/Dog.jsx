// src/components/Features/Dog.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { bark, selectStage, setDirection, setMoving, setPosition } from "@/redux/dogSlice";

const SHEETS = {
  puppy:  { src: "/assets/sprites/puppy_walk.png",  frames: 6, size: 96 },
  adult:  { src: "/assets/sprites/adult_walk.png",  frames: 6, size: 112 },
  senior: { src: "/assets/sprites/senior_walk.png", frames: 6, size: 120 },
};

export default function Dog({ worldW = 640, worldH = 360 }) {
  const dispatch = useDispatch();
  const stage = useSelector(selectStage);

  // local normalized position (0..1)
  const [nx, setNx] = useState(0.5);
  const [ny, setNy] = useState(0.65);
  const [facing, setFacing] = useState("right");
  const targetRef = useRef({ x: 0.8, y: 0.65 });

  // speed by stage (px/sec)
  const pxSpeed = stage === "puppy" ? 85 : stage === "senior" ? 55 : 70;

  // wander: pick a new target every 3–7s
  useEffect(() => {
    let tm = 0;
    const pick = () => {
      targetRef.current = {
        x: 0.1 + Math.random() * 0.8,
        y: 0.55 + Math.random() * 0.1,
      };
      tm = window.setTimeout(pick, 3000 + Math.random() * 4000);
    };
    pick();
    return () => clearTimeout(tm);
  }, []);

  // main loop
  useEffect(() => {
    let raf = 0, last = performance.now();
    const loop = (now) => {
      const dt = (now - last) / 1000; last = now;

      const dx = targetRef.current.x - nx;
      const dy = targetRef.current.y - ny;
      const dist = Math.hypot(dx, dy);
      if (dist > 0.002) {
        const vx = (dx / dist) * (pxSpeed / worldW);
        const vy = (dy / dist) * (pxSpeed / worldH);
        const nnx = Math.min(0.95, Math.max(0.05, nx + vx * dt));
        const nny = Math.min(0.9,  Math.max(0.5, ny + vy * dt));
        setNx(nnx);
        setNy(nny);
        const dir = dx >= 0 ? "right" : "left";
        setFacing(dir);
        dispatch(setDirection(dir));
        dispatch(setMoving(true));
        dispatch(setPosition({ x: Math.round(nnx * worldW), y: Math.round(nny * worldH) }));
      } else {
        dispatch(setMoving(false));
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pxSpeed, worldW, worldH, nx, ny]);

  const { src, frames, size } = useMemo(() => SHEETS[stage] ?? SHEETS.adult, [stage]);
  const left = `calc(${(nx * 100).toFixed(2)}% - ${size / 2}px)`;
  const playState = "running";
  const speedMs = 900; // walk cadence

  const onBark = () => dispatch(bark(Date.now()));

  return (
    <div className="absolute bottom-[12%]" style={{ left }}>
      {/* shadow */}
      <div className="mx-auto mb-1 h-2 w-20 rounded-full bg-black/30 blur-sm" />
      {/* sprite */}
      <div
        title="Click or press Bark to speak"
        onClick={onBark}
        style={{
          width: size,
          height: size,
          imageRendering: "pixelated",
          backgroundImage: `url(${src})`,
          backgroundSize: `${frames * 100}% 100%`,
          animation: `dog-steps ${speedMs}ms steps(${frames}) infinite`,
          animationPlayState: playState,
          transform: `scaleX(${facing === "left" ? -1 : 1})`,
          cursor: "pointer",
        }}
      />
      <style>{`
        @keyframes dog-steps {
          from { background-position-x: 0%; }
          to   { background-position-x: -${100 * (frames - 1)}%; }
        }
      `}</style>
    </div>
  );
}