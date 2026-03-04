/** @format */

import { useEffect, useMemo, useRef, useState } from "react";
import SpriteSheetDog from "@/components/dog/SpriteSheetDog.jsx";

function clamp(n, lo, hi) {
  const x = Number(n);
  if (!Number.isFinite(x)) return lo;
  return Math.max(lo, Math.min(hi, x));
}

function randBetween(min, max) {
  return min + Math.random() * (max - min);
}

function pickNextTarget(bounds, padding) {
  const x = randBetween(padding, Math.max(padding, bounds.width - padding));
  const y = randBetween(padding, Math.max(padding, bounds.height - padding));
  return { x, y };
}

export default function DogPixiView({
  stage = "PUPPY",
  condition = "clean",
  anim = "idle",
  width,
  height,
  scale = 2.25,
  dogIsSleeping = false,
}) {
  const containerRef = useRef(null);
  const rafRef = useRef(0);
  const lastTsRef = useRef(0);

  const [bounds, setBounds] = useState({ width: 0, height: 0 });
  const viewportWidth = bounds.width;
  const viewportHeight = bounds.height;
  const [pos, setPos] = useState({ x: 0, y: 0, facing: 1, moving: false });

  const motionRef = useRef({
    target: { x: 0, y: 0 },
    moving: false,
    pauseUntil: 0,
    speed: 32,
  });

  const size = useMemo(() => {
    const base =
      Math.min(bounds.width || 0, bounds.height || 0) ||
      Math.min(Number(width) || 320, Number(height) || 320);
    const scaleFactor = Number.isFinite(scale)
      ? clamp(scale / 2.25, 0.6, 2)
      : 1;
    return clamp(Math.round(base * 0.7 * scaleFactor), 96, 512);
  }, [bounds.height, bounds.width, height, scale, width]);

  useEffect(() => {
    if (!containerRef.current) return undefined;
    const el = containerRef.current;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setBounds({ width: rect.width, height: rect.height });
    };
    update();

    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(update);
      ro.observe(el);
    }

    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
      if (ro) ro.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!viewportWidth || !viewportHeight) return;
    const padding = Math.max(24, size * 0.45);
    const target = pickNextTarget(
      { width: viewportWidth, height: viewportHeight },
      padding
    );
    motionRef.current.target = target;
    setPos({
      x: clamp(viewportWidth / 2, padding, viewportWidth - padding),
      y: clamp(viewportHeight / 2, padding, viewportHeight - padding),
      facing: 1,
      moving: false,
    });
  }, [viewportHeight, viewportWidth, size]);

  useEffect(() => {
    const tick = (ts) => {
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = Math.min(0.05, (ts - lastTsRef.current) / 1000);
      lastTsRef.current = ts;

      if (!viewportWidth || !viewportHeight || dogIsSleeping) {
        setPos((prev) => ({ ...prev, moving: false }));
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const padding = Math.max(24, size * 0.45);
      const state = motionRef.current;
      const now = ts;

      if (!state.moving && now >= state.pauseUntil) {
        state.target = pickNextTarget(
          { width: viewportWidth, height: viewportHeight },
          padding
        );
        state.moving = true;
        state.speed = randBetween(18, 42);
      }

      setPos((prev) => {
        if (!state.moving) return { ...prev, moving: false };

        const dx = state.target.x - prev.x;
        const dy = state.target.y - prev.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 4) {
          state.moving = false;
          state.pauseUntil = now + randBetween(800, 2000);
          return { ...prev, moving: false };
        }

        const step = Math.min(dist, state.speed * dt);
        const nx = prev.x + (dx / dist) * step;
        const ny = prev.y + (dy / dist) * step;
        const facing = dx < -0.5 ? -1 : dx > 0.5 ? 1 : prev.facing;

        return {
          x: clamp(nx, padding, viewportWidth - padding),
          y: clamp(ny, padding, viewportHeight - padding),
          facing,
          moving: true,
        };
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      lastTsRef.current = 0;
    };
  }, [dogIsSleeping, size, viewportHeight, viewportWidth]);

  const animLower = String(anim || "idle")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_");
  const autoAnim = pos.moving ? "walk" : "idle";
  const effectiveAnim =
    animLower && animLower !== "idle" ? animLower : autoAnim;

  const style = {
    width: Number.isFinite(Number(width)) ? Number(width) : "100%",
    height: Number.isFinite(Number(height)) ? Number(height) : "100%",
  };

  return (
    <div ref={containerRef} className="relative" style={style}>
      <div
        style={{
          position: "absolute",
          left: pos.x,
          top: pos.y,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      >
        <SpriteSheetDog
          stage={stage}
          condition={condition}
          anim={effectiveAnim}
          facing={pos.facing}
          size={size}
        />
      </div>
    </div>
  );
}
