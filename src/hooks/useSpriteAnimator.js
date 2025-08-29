// src/hooks/useSpriteAnimator.js
import { useEffect, useRef, useState } from "react";

/**
 * Returns the current frame index while playing.
 * @param {object} opts
 * @param {number} opts.fps  - frames per second
 * @param {number} opts.frames - how many columns (frames) in the row
 * @param {boolean} opts.playing - true to animate, false to hold on frame 0
 */
export default function useSpriteAnimator({ fps = 8, frames = 4, playing = false }) {
  const [frame, setFrame] = useState(0);
  const raf = useRef(null);
  const last = useRef(0);

  useEffect(() => {
    if (!playing) {
      setFrame(0);
      return;
    }
    const step = (ts) => {
      if (!last.current) last.current = ts;
      const interval = 1000 / fps;
      if (ts - last.current >= interval) {
        setFrame((f) => (f + 1) % frames);
        last.current = ts;
      }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [fps, frames, playing]);

  return frame;
}
