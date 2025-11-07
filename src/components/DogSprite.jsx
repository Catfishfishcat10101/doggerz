import React from "react";

/**
 * DogSprite
 * - Safe image with pixelated rendering + fallback SVG.
 * - Accepts size, src, alt. Applies your CSS sprite helpers if you want.
 */
const FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' width='192' height='192' viewBox='0 0 192 192'>
  <rect width='100%' height='100%' fill='#0b1220'/>
  <g transform='translate(16,16)'>
    <circle cx='80' cy='80' r='60' fill='#fde68a'/>
    <circle cx='65' cy='80' r='8' fill='#111827'/>
    <circle cx='95' cy='80' r='8' fill='#111827'/>
    <circle cx='80' cy='102' r='6' fill='#7f1d1d'/>
  </g>
</svg>`);

export default function DogSprite({
  src = "/sprites/jackrussell/idle.svg",
  alt = "Dog",
  size = 96,
  playing = false,
  flip = false,
  className = "",
}) {
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      draggable={false}
      className={[
        "sprite select-none",
        playing ? "sprite--playing" : "",
        flip ? "sprite--flip" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ width: size, height: size }}
      onError={(e) => {
        if (e.currentTarget.src !== FALLBACK) e.currentTarget.src = FALLBACK;
      }}
    />
  );
}