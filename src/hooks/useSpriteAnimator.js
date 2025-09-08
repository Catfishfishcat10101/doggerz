// src/hooks/useSpriteAnimator.js
import { useEffect, useRef, useState } from "react";

/**
 * Time-based sprite frame animator using rAF.
 * @param {Object} opts
 * @param {number} opts.fps - frames per second
 * @param {number} opts.frames - total frames in the row
 * @param {boolean} opts.playing - run/pause the animation
 * @returns {number} current frame index [0..frames-1]
 */
export default function useSpriteAnimator({ fps = 8, frames = 4, playing = true }) {
  const [frame, setFrame] = useState(0);
  const rafRef = useRef(null);
  const prevRef = useRef(null);
  const accRef = useRef(0);

  useEffect(() => {
    if (!playing || frames <= 1 || fps <= 0) return;

    const frameDur = 1000 / fps;

    const tick = (ts) => {
      if (prevRef.current == null) prevRef.current = ts;
      const dt = ts - prevRef.current;
      prevRef.current = ts;

      accRef.current += dt;
      while (accRef.current >= frameDur) {
        setFrame((f) => (f + 1) % frames);
        accRef.current -= frameDur;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      prevRef.current = null;
      accRef.current = 0;
    };
  }, [playing, fps, frames]);

  // reset to first frame when pausing (optional)
  useEffect(() => {
    if (!playing) setFrame(0);
  }, [playing]);

  return frame;
}
