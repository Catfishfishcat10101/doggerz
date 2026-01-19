/** @format */
// src/components/PawPrintsBackground.jsx

import * as React from "react";

/**
 * PawPrintsBackground
 * - Renders a subtle scattered paw-print layer behind content.
 * - Deterministic (seeded) so it will not change positions every render.
 */
export default function PawPrintsBackground({
  seed = "doggerz",
  count = 26,
  className = "",
  opacity = 0.1,
  blurMin = 0,
  blurMax = 1.8,
  scaleMin = 0.55,
  scaleMax = 1.15,
  rotateMin = -25,
  rotateMax = 25,
  color = "rgba(16,185,129,1)",
  fadeEdges = true,
}) {
  const pawprints = React.useMemo(() => {
    // Small deterministic PRNG (LCG) seeded from string.
    let s = 0;
    for (let i = 0; i < seed.length; i += 1) {
      s = (s * 31 + seed.charCodeAt(i)) >>> 0;
    }

    const rand = () => {
      s = (1664525 * s + 1013904223) >>> 0;
      return s / 4294967296;
    };

    const lerp = (a, b, t) => a + (b - a) * t;

    return Array.from({ length: count }).map((_, i) => {
      const x = lerp(5, 95, rand());
      const y = lerp(6, 94, rand());
      const r = lerp(rotateMin, rotateMax, rand());
      const sc = lerp(scaleMin, scaleMax, rand());
      const op = lerp(0.35, 1.0, rand());
      const bl = lerp(blurMin, blurMax, rand());
      const flip = rand() > 0.5 ? -1 : 1;
      const size = lerp(26, 44, rand());

      return {
        id: `${i}-${x}-${y}`,
        x,
        y,
        r,
        sc,
        op,
        bl,
        flip,
        size,
      };
    });
  }, [seed, count, blurMin, blurMax, scaleMin, scaleMax, rotateMin, rotateMax]);

  const maskStyle = fadeEdges
    ? {
        WebkitMaskImage:
          "radial-gradient(closest-side, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)",
        maskImage:
          "radial-gradient(closest-side, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)",
      }
    : null;

  return (
    <div
      aria-hidden="true"
      className={["pointer-events-none absolute inset-0 z-0", className].join(
        " "
      )}
      style={maskStyle || undefined}
    >
      {pawprints.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            transform: `translate(-50%, -50%) rotate(${p.r}deg) scale(${p.sc}) scaleX(${p.flip})`,
            opacity: Math.max(0, Math.min(1, opacity * p.op)),
            filter: p.bl ? `blur(${p.bl}px)` : undefined,
            color,
          }}
        >
          <PawIcon />
        </div>
      ))}
    </div>
  );
}

function PawIcon() {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%" fill="none">
      <g fill="currentColor">
        <ellipse cx="16" cy="24" rx="6" ry="8" />
        <ellipse cx="28" cy="16" rx="6" ry="8" />
        <ellipse cx="40" cy="16" rx="6" ry="8" />
        <ellipse cx="52" cy="24" rx="6" ry="8" />
        <path d="M32 30c-10 0-18 8-18 18 0 9 7 14 18 14s18-5 18-14c0-10-8-18-18-18z" />
      </g>
    </svg>
  );
}
