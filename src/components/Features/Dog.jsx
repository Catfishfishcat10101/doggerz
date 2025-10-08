// src/components/Features/Dog.jsx
import React, { useEffect, useRef, useState } from "react";

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


  useEffect(() => {
    if (!moving) {
      setFrame(0);
      cancelAnimationFrame(raf.current);
      return;
    }
    const loop = (now) => {
      const dt = now - last.current;
      if (dt > 140) {
        setFrame((f) => (f ^ 1));
        last.current = now;
      }
      raf.current = requestAnimationFrame(loop);
    };
    last.current = performance.now();
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [moving]);

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
  };

  return <div className={`sprite ${className}`} style={style} aria-label="Dog sprite" />;
}
