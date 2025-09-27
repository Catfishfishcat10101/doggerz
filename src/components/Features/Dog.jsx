// src/components/Features/Dog.jsx
import React, { useEffect, useRef, useState } from "react";

/**
 * Minimal-but-handy dog sprite placeholder.
 * Props:
 *  - x, y: numbers (position in px, relative to a positioned parent)
 *  - dir: "up" | "down" | "left" | "right"
 *  - moving: boolean (animates when true)
 *  - size: number (box size in px, default 28)
 *  - className: extra classes (e.g., "sprite-shadow")
 *
 * Replace the colored box with your sprite sheet later (see bgImage lines).
 */
export default function Dog({
  x = 0,
  y = 0,
  dir = "down",
  moving = false,
  size = 28,
  className = "",
}) {
  const [frame, setFrame] = useState(0);
  const raf = useRef(0);
  const last = useRef(performance.now());

  // Tiny walk animation loop (2 frames)
  useEffect(() => {
    if (!moving) {
      setFrame(0);
      cancelAnimationFrame(raf.current);
      return;
    }
    const loop = (now) => {
      const dt = now - last.current;
      if (dt > 140) {
        setFrame((f) => (f ^ 1)); // toggle 0/1
        last.current = now;
      }
      raf.current = requestAnimationFrame(loop);
    };
    last.current = performance.now();
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [moving]);

  // Simple facing transform (flip for left)
  const flip = dir === "left" ? "scaleX(-1)" : "none";

  // Placeholder visual: rounded gradient box
  // Swap to your sprite sheet by uncommenting bgImage and setting backgroundPosition by dir/frame.
  const style = {
    position: "absolute",
    left: x - size / 2,
    top: y - size / 2,
    width: size,
    height: size,
    transform: flip,
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,.15)",
    background:
      frame === 0
        ? "linear-gradient(180deg,#f472b6,#ef4444)"
        : "linear-gradient(180deg,#fca5a5,#ef4444)",
    // Example for a spritesheet later:
    // backgroundImage: "url(/assets/sprites/dog.png)",
    // backgroundSize: "cover",
    // backgroundPosition: getSpritePos(dir, frame),
  };

  return <div className={`sprite ${className}`} style={style} aria-label="Dog sprite" />;
}

// If you switch to a sprite sheet, map (dir, frame) -> backgroundPosition here.
// function getSpritePos(dir, frame) { ... }
