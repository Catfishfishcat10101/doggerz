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

function pickNextTarget(bounds, padding, from = null, minDistance = 0) {
  const minX = padding;
  const maxX = Math.max(padding, bounds.width - padding);
  const minY = padding;
  const maxY = Math.max(padding, bounds.height - padding);

  for (let i = 0; i < 10; i += 1) {
    const candidate = {
      x: randBetween(minX, maxX),
      y: randBetween(minY, maxY),
    };
    if (!from || minDistance <= 0) return candidate;
    if (Math.hypot(candidate.x - from.x, candidate.y - from.y) >= minDistance) {
      return candidate;
    }
  }

  if (!from) {
    return { x: randBetween(minX, maxX), y: randBetween(minY, maxY) };
  }

  return {
    x: from.x < (minX + maxX) / 2 ? maxX : minX,
    y: randBetween(minY, maxY),
  };
}

export default function DogPixiView({
  stage = "PUPPY",
  condition = "clean",
  anim = "idle",
  width,
  height,
  scale = 2.25,
  dogIsSleeping = false,
  animSpeedMultiplier = 1,
  attentionTarget = null,
  sleepSpot = null,
  movementLocked = false,
  onPositionChange = null,
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
    const padding = Math.max(16, size * 0.25);
    const center = {
      x: clamp(viewportWidth / 2, padding, viewportWidth - padding),
      y: clamp(viewportHeight / 2, padding, viewportHeight - padding),
    };
    const target = pickNextTarget(
      { width: viewportWidth, height: viewportHeight },
      padding,
      center,
      Math.max(36, size * 0.3)
    );
    motionRef.current.target = target;
    setPos({
      x: center.x,
      y: center.y,
      facing: 1,
      moving: false,
    });
  }, [viewportHeight, viewportWidth, size]);

  useEffect(() => {
    if (!dogIsSleeping) return;
    if (!viewportWidth || !viewportHeight) return;
    if (!sleepSpot || typeof sleepSpot !== "object") return;

    const xNorm = Number(sleepSpot.xNorm);
    const yNorm = Number(sleepSpot.yNorm);
    if (!Number.isFinite(xNorm) || !Number.isFinite(yNorm)) return;

    const padding = Math.max(16, size * 0.25);
    const next = {
      x: clamp(xNorm * viewportWidth, padding, viewportWidth - padding),
      y: clamp(yNorm * viewportHeight, padding, viewportHeight - padding),
      moving: false,
      facing: 1,
    };
    motionRef.current.target = { x: next.x, y: next.y };
    motionRef.current.moving = false;
    motionRef.current.pauseUntil = Number.MAX_SAFE_INTEGER;
    setPos((prev) => ({ ...prev, ...next }));
  }, [dogIsSleeping, size, sleepSpot, viewportHeight, viewportWidth]);

  useEffect(() => {
    if (dogIsSleeping) return;
    motionRef.current.pauseUntil = 0;
  }, [dogIsSleeping]);

  useEffect(() => {
    const stationaryByAnim =
      /(sleep|lay_down|play_dead|stay|sit|idle_resting)/.test(
        String(anim || "")
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "_")
          .replace(/-+/g, "_")
      );
    const shouldFreezeMovement =
      dogIsSleeping || stationaryByAnim || movementLocked;

    const tick = (ts) => {
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = Math.min(0.05, (ts - lastTsRef.current) / 1000);
      lastTsRef.current = ts;

      if (!viewportWidth || !viewportHeight || shouldFreezeMovement) {
        setPos((prev) => ({ ...prev, moving: false }));
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const padding = Math.max(16, size * 0.25);
      const state = motionRef.current;
      const now = ts;

      setPos((prev) => {
        if (!state.moving && now >= state.pauseUntil) {
          const minTravel = Math.max(48, size * 0.35);
          state.target = pickNextTarget(
            { width: viewportWidth, height: viewportHeight },
            padding,
            prev,
            minTravel
          );
          state.moving = true;
          const speedMult = clamp(Number(animSpeedMultiplier), 0.2, 2);
          state.speed = randBetween(24, 52) * speedMult;
        }

        if (!state.moving) {
          return { ...prev, moving: false };
        }

        const dx = state.target.x - prev.x;
        const dy = state.target.y - prev.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 10) {
          state.moving = false;
          state.pauseUntil = now + randBetween(1200, 2800);
          return { ...prev, moving: false };
        }

        const step = Math.min(dist, state.speed * dt);
        const nx = prev.x + (dx / dist) * step;
        const ny = prev.y + (dy / dist) * step;
        const facing = dx < -1 ? -1 : dx > 1 ? 1 : prev.facing;

        const next = {
          x: clamp(nx, padding, viewportWidth - padding),
          y: clamp(ny, padding, viewportHeight - padding),
          facing,
          moving: true,
        };

        return next;
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      lastTsRef.current = 0;
    };
  }, [
    anim,
    animSpeedMultiplier,
    attentionTarget,
    dogIsSleeping,
    movementLocked,
    onPositionChange,
    size,
    viewportHeight,
    viewportWidth,
  ]);

  useEffect(() => {
    if (typeof onPositionChange !== "function") return;
    onPositionChange(pos);
  }, [onPositionChange, pos]);

  useEffect(() => {
    if (!viewportWidth || !viewportHeight) return;
    if (!attentionTarget || typeof attentionTarget !== "object") return;

    const xNorm = Number(attentionTarget.xNorm);
    const yNorm = Number(attentionTarget.yNorm);
    if (!Number.isFinite(xNorm) || !Number.isFinite(yNorm)) return;

    const padding = Math.max(16, size * 0.25);
    motionRef.current.target = {
      x: clamp(xNorm * viewportWidth, padding, viewportWidth - padding),
      y: clamp(yNorm * viewportHeight, padding, viewportHeight - padding),
    };
    motionRef.current.moving = true;
    motionRef.current.pauseUntil = 0;
  }, [attentionTarget, size, viewportHeight, viewportWidth]);

  const animLower = String(anim || "idle")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_");
  const resolveDirectionalWalk = () => {
    if (!pos.moving || dogIsSleeping) return "idle";
    // Always use the canonical walk sheet and let facing handle mirroring.
    // Direction-specific sheets were producing a frozen-paw moonwalk look.
    return "walk";
  };

  const autoAnim = resolveDirectionalWalk();
  const effectiveAnim = (() => {
    if (!animLower || animLower === "idle") return autoAnim;
    if (animLower === "walk") return resolveDirectionalWalk();
    return animLower;
  })();
  const depthRatio =
    viewportHeight > 0 ? clamp(pos.y / viewportHeight, 0, 1) : 0.5;
  const depthScale = clamp(0.95 + depthRatio * 0.55, 0.9, 1.5);
  const depthZIndex = Math.max(6, Math.round(8 + depthRatio * 24));
  const shadowWidth = Math.round(size * (0.34 + depthRatio * 0.14));
  const shadowHeight = Math.max(
    10,
    Math.round(size * (0.075 + depthRatio * 0.03))
  );

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
          transform: `translate(-50%, ${dogIsSleeping ? "-68%" : "-76%"}) scale(${depthScale})`,
          transformOrigin: "50% 100%",
          zIndex: depthZIndex,
          pointerEvents: "none",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "50%",
            top: `${Math.round(size * 0.82)}px`,
            width: `${shadowWidth}px`,
            height: `${shadowHeight}px`,
            transform: "translate(-50%, -50%)",
            borderRadius: "999px",
            background:
              "radial-gradient(ellipse at center, rgba(2,6,23,0.42) 0%, rgba(2,6,23,0.08) 70%, transparent 100%)",
            filter: "blur(1.5px)",
          }}
        />
        <SpriteSheetDog
          stage={stage}
          condition={condition}
          anim={effectiveAnim}
          facing={pos.facing}
          size={size}
          speedMultiplier={animSpeedMultiplier}
        />
      </div>
    </div>
  );
}
