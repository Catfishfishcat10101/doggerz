// src/components/UI/DogSprite.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * DogSprite
 * - Reads a sprite sheet from /public/sprites/dog_walk.png at runtime.
 * - If the image is missing, swaps to an inline SVG fallback, so builds never fail.
 * - Uses CSS sprite animation (steps) for buttery-smooth walking.
 *
 * Props:
 *   size       number   CSS pixels for a single frame (square). Default: 96
 *   frames     number   Frame count in the sheet. Default: 8
 *   fps        number   Animation speed. Default: 8
 *   facing     "right" | "left"  Flip horizontally. Default: "right"
 *   playing    boolean  Run/pause the animation. Default: true
 *   src        string   Override URL. Default: "/sprites/dog_walk.png"
 */
export default function DogSprite({
  size = 96,
  frames = 8,
  fps = 8,
  facing = "right",
  playing = true,
  src = "/sprites/dog_walk.png",
  className = "",
}) {
  const [imgUrl, setImgUrl] = useState(null);
  const [isFallback, setIsFallback] = useState(false);
  const intervalRef = useRef(null);
  const [frame, setFrame] = useState(0);

  // Lightweight inline fallback so we never block builds or show broken imgs
  const FALLBACK_DATA_URL = useMemo(() => {
    const svg = encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
         <rect width="100%" height="100%" fill="#111827"/>
         <g fill="none" stroke="#94a3b8" stroke-width="2">
           <rect x="4" y="4" width="${size - 8}" height="${size - 8}" rx="10" />
           <path d="M ${size*0.2} ${size*0.6} Q ${size*0.5} ${size*0.3} ${size*0.8} ${size*0.6}" />
           <circle cx="${size*0.35}" cy="${size*0.45}" r="3" fill="#e2e8f0"/>
         </g>
         <text x="50%" y="${size - 10}" fill="#94a3b8" font-size="10" text-anchor="middle" font-family="system-ui,Segoe UI,Roboto">Doggerz</text>
       </svg>`
    );
    return `data:image/svg+xml;charset=utf-8,${svg}`;
  }, [size]);

  // Preload the runtime sprite from /public; if 404, fall back
  useEffect(() => {
    let active = true;
    const img = new Image();
    img.onload = () => {
      if (!active) return;
      setImgUrl(src);
      setIsFallback(false);
    };
    img.onerror = () => {
      if (!active) return;
      setImgUrl(FALLBACK_DATA_URL);
      setIsFallback(true);
    };
    img.src = src;
    return () => {
      active = false;
    };
  }, [src, FALLBACK_DATA_URL]);

  // Drive the frame index via JS (works for PNG sprite or fallback “fake” sprite)
  useEffect(() => {
    if (!playing) {
      clearInterval(intervalRef.current);
      return;
    }
    const ms = Math.max(1, Math.round(1000 / fps));
    intervalRef.current = setInterval(() => {
      setFrame((f) => (f + 1) % frames);
    }, ms);
    return () => clearInterval(intervalRef.current);
  }, [playing, fps, frames]);

  // Background position for the sprite sheet (frame index)
  const bgX = -(frame * size);

  return (
    <div
      aria-label={isFallback ? "Dog sprite placeholder" : "Dog sprite"}
      className={[
        "relative select-none will-change-transform",
        facing === "left" ? "scale-x-[-1]" : "",
        className,
      ].join(" ")}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        imageRendering: "pixelated",
        backgroundImage: `url("${imgUrl ?? FALLBACK_DATA_URL}")`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${size * frames}px ${size}px`,
        backgroundPosition: `${bgX}px 0px`,
        // small glow so it reads on dark/bright backgrounds (colorblind-safe)
        filter: "drop-shadow(0 0 6px rgba(0,0,0,0.35))",
      }}
    />
  );
}
