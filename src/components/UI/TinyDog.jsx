// src/components/UI/TinyDog.jsx
import React from "react";

/**
 * TinyDog
 * - Renders a dog emoji (or your sprite) at a given size.
 * - Optional label and shadow. Accessible by default.
 *
 * Props:
 *  - size: number (px font-size)            default 96
 *  - label: string (aria-label + caption)   default "Dog"
 *  - showShadow: boolean                     default true
 *  - className: string                       extra classes
 *  - as: "emoji" | "svg"                     emoji by default
 */
export default function TinyDog({
  size = 96,
  label = "Dog",
  showShadow = true,
  className = "",
  as = "emoji",
}) {
  const style = { fontSize: size, lineHeight: 1 };

  return (
    <figure
      className={`inline-flex flex-col items-center ${className}`}
      aria-label={label}
      role="img"
    >
      <div className="relative grid place-items-center">
        {as === "emoji" ? (
          <span style={style}>🐶</span>
        ) : (
          <DogSVG size={size} />
        )}
        {showShadow && (
          <span
            aria-hidden
            className="absolute -bottom-2 w-3/4 h-2 rounded-full"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(0,0,0,.35), rgba(0,0,0,0))",
              filter: "blur(1px)",
            }}
          />
        )}
      </div>
      <figcaption className="mt-2 text-xs text-slate-500">{label}</figcaption>
    </figure>
  );
}

function DogSVG({ size = 96 }) {
  const s = Math.max(24, size);
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 64 64"
      className="drop-shadow"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#f472b6" />
          <stop offset="1" stopColor="#ef4444" />
        </linearGradient>
      </defs>
      <g fill="url(#g)" stroke="rgba(255,255,255,.2)" strokeWidth="1">
        <rect x="14" y="18" rx="8" ry="8" width="36" height="28" />
        <circle cx="24" cy="20" r="6" />
        <circle cx="40" cy="20" r="6" />
      </g>
      <g fill="#111827">
        <circle cx="28" cy="30" r="2.5" />
        <circle cx="36" cy="30" r="2.5" />
        <rect x="30" y="36" width="4" height="2" rx="1" />
      </g>
    </svg>
  );
}
