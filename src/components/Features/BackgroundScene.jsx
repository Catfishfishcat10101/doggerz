// src/components/Features/BackgroundScene.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * BackgroundScene
 * - Auto day/night variant (override with `variant`)
 * - Optional parallax (CSS transform; respects reduced motion)
 * - DPR-aware asset pick (looks for @2x if present, falls back to 1x)
 * - Preloads the target image to avoid flash-of-unstyled background
 *
 * Usage:
 *   <BackgroundScene scene="yard" variant="auto" parallax />
 *
 * Assets expected in /public/backgrounds:
 *   yard_day.png, yard_night.png (optionally yard_day@2x.png, yard_night@2x.png)
 */

const SCENES = /** @type {const} */ (["yard", /* "beach", "forest", ... */]);
const VARIANTS = /** @type {const} */ (["day", "night"]);

export default function BackgroundScene({
  scene = "yard",
  variant = "auto",          // "auto" | "day" | "night"
  height = 320,              // px; matches your GameScreen WORLD_H (360-ish)
  radius = "1.0rem",         // border radius
  parallax = false,
  className = "",
  overlay = true,            // vignette/gradient polish
  children,                  // optional: overlay UI (labels, buttons)
}) {
  const clampedScene = SCENES.includes(scene) ? scene : "yard";
  const effectiveVariant = useMemo(() => {
    if (variant === "auto") {
      const hour = new Date().getHours();
      return hour >= 6 && hour < 18 ? "day" : "night";
    }
    return VARIANTS.includes(variant) ? variant : "day";
  }, [variant]);

  // Device pixel ratio aware filename
  const src1x = `/backgrounds/${clampedScene}_${effectiveVariant}.png`;
  const src2x = `/backgrounds/${clampedScene}_${effectiveVariant}@2x.png`;

  const [src, setSrc] = useState(src1x);
  const [loaded, setLoaded] = useState(false);
  const parallaxRef = useRef(null);

  // Try preloading @2x -> fallback to 1x
  useEffect(() => {
    let cancelled = false;
    setLoaded(false);

    const want2x = (typeof window !== "undefined" && window.devicePixelRatio >= 1.5);
    const candidate = want2x ? src2x : src1x;

    const img = new Image();
    img.onload = () => {
      if (!cancelled) {
        setSrc(candidate);
        setLoaded(true);
      }
    };
    img.onerror = () => {
      // Fallback to 1x if 2x missing
      if (candidate !== src1x) {
        const img1 = new Image();
        img1.onload = () => {
          if (!cancelled) {
            setSrc(src1x);
            setLoaded(true);
          }
        };
        img1.onerror = () => !cancelled && setLoaded(true); // give up but render
        img1.src = src1x;
      } else {
        setLoaded(true);
      }
    };
    img.src = candidate;

    return () => {
      cancelled = true;
    };
  }, [clampedScene, effectiveVariant, src1x, src2x]);

  // Lightweight parallax (respects reduced motion)
  useEffect(() => {
    if (!parallax) return;
    const el = parallaxRef.current;
    if (!el) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) return;

    const onMove = (e) => {
      // Support mouse or device tilt
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      const cx = e.tiltX ?? e.gamma ?? (e.clientX ?? w / 2);
      const cy = e.tiltY ?? e.beta ?? (e.clientY ?? h / 2);

      const nx = typeof cx === "number" ? (cx / w) * 2 - 1 : 0; // [-1,1]
      const ny = typeof cy === "number" ? (cy / h) * 2 - 1 : 0;

      // Small offset to keep it classy, not carnival
      const dx = nx * 6; // px
      const dy = ny * 4;

      el.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(1.03)`;
    };

    const onLeave = () => {
      el.style.transform = "translate3d(0,0,0) scale(1.0)";
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("deviceorientation", onMove, { passive: true });
    window.addEventListener("mouseout", onLeave, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("deviceorientation", onMove);
      window.removeEventListener("mouseout", onLeave);
    };
  }, [parallax]);

  return (
    <div className={`w-full max-w-xl mx-auto ${className}`}>
      <div
        className="relative overflow-hidden shadow-lg"
        style={{
          height,
          borderRadius: radius,
          backgroundColor: loaded ? "transparent" : "rgba(16,185,129,0.06)", // soft emerald while loading
        }}
        aria-label={`Background scene: ${clampedScene} (${effectiveVariant})`}
        role="img"
      >
        {/* Image layer */}
        <div
          ref={parallaxRef}
          className="absolute inset-0 bg-cover bg-center will-change-transform transition-transform duration-150"
          style={{ backgroundImage: `url(${src})` }}
        />

        {/* Vignette / gradient polish */}
        {overlay && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 100% at 50% -10%, rgba(255,255,255,0.25) 0%, rgba(0,0,0,0.10) 60%, rgba(0,0,0,0.20) 100%)",
            }}
          />
        )}

        {/* Optional top overlay content */}
        {children && (
          <div className="absolute inset-0 p-2 sm:p-3 pointer-events-none">{children}</div>
        )}
      </div>

      <div className="text-center mt-3 text-sm text-emerald-900/70">
        Scene: <span className="font-semibold">{clampedScene}</span>{" "}
        <span className="opacity-60">({effectiveVariant})</span>
      </div>
    </div>
  );
}
