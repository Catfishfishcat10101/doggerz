/* src/hooks/useSpriteAnimator.js */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Time-based sprite sheet animator (frames laid out horizontally; rows = directions/variants).
 *
 * Options:
 * - isPlaying:           boolean (default false)
 * - frameCount:          number of frames in the active row (default 4)
 * - frameRate:           frames per second (default 8)
 * - idleFrame:           frame to snap to when paused (default 0)
 * - initialRow:          starting row index (0-based)
 * - pauseWhenHidden:     auto-pause when tab not visible (default true)
 * - respectReducedMotion:pause if user prefers reduced motion (default true)
 * - loop:                loop playback (default true)
 * - pingPong:            bounce back-and-forth instead of wrapping (default false)
 * - speed:               multiplier (0.5 = slower, 2 = faster) (default 1)
 * - onLoop:              cb(loopCount) fired when wrapping/ponging
 * - onFrame:             cb(frameIndex) fired when frame changes
 */
export default function useSpriteAnimator(opts = {}) {
  const {
    isPlaying: isPlayingProp = false,
    frameCount = 4,
    frameRate = 8,
    idleFrame = 0,
    initialRow = 0,
    pauseWhenHidden = true,
    respectReducedMotion = true,
    loop = true,
    pingPong = false,
    speed = 1,
    onLoop,
    onFrame,
  } = opts;

  const prefersReducedMotion =
    respectReducedMotion &&
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  const [isPlaying, setIsPlaying] = useState(Boolean(isPlayingProp && !prefersReducedMotion));
  const [frame, setFrame] = useState(idleFrame);
  const [row, setRow] = useState(initialRow);
  const loopCount = useRef(0);

  // rAF timing
  const rafRef = useRef(0);
  const lastTsRef = useRef(0);
  const accumRef = useRef(0);
  const directionRef = useRef(1); // used when pingPong=true

  const frameDuration = useMemo(() => {
    const fps = Math.max(1, Number(frameRate));
    return 1000 / fps;
  }, [frameRate]);

  const visibleRef = useRef(true);
  useEffect(() => {
    if (!pauseWhenHidden) return;
    const onVis = () => {
      visibleRef.current = document.visibilityState !== "hidden";
      // if we become visible, reset timing so we don't "catch up" a flood of frames
      if (visibleRef.current) {
        lastTsRef.current = performance.now();
        accumRef.current = 0;
      }
    };
    document.addEventListener("visibilitychange", onVis);
    onVis();
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [pauseWhenHidden]);

  // If the controlled prop changes, reflect it (unless reduced motion says "nope")
  useEffect(() => {
    setIsPlaying(Boolean(isPlayingProp && !prefersReducedMotion));
  }, [isPlayingProp, prefersReducedMotion]);

  // Reset animation state when key params change
  useEffect(() => {
    loopCount.current = 0;
    directionRef.current = 1;
    accumRef.current = 0;
    lastTsRef.current = performance.now();
    // snap to idle if we’re not playing
    if (!isPlaying) setFrame(idleFrame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameCount, frameRate, idleFrame, row, pingPong, loop, speed]);

  const step = useCallback(
    (ts) => {
      // bail conditions
      if (!isPlaying || prefersReducedMotion) return;

      // visibility gating
      if (pauseWhenHidden && !visibleRef.current) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }

      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = ts - lastTsRef.current;
      lastTsRef.current = ts;

      // accumulate elapsed time, scaled by speed
      accumRef.current += dt * Math.max(0.001, speed);

      // advance frames when we’ve banked >= frameDuration
      while (accumRef.current >= frameDuration) {
        accumRef.current -= frameDuration;

        setFrame((f) => {
          let next = f;

          if (pingPong) {
            // bounce between 0 and frameCount-1
            const dir = directionRef.current || 1;
            next = f + dir;
            if (next >= frameCount || next < 0) {
              // flip direction and step back inside bounds
              directionRef.current = -dir;
              next = f + directionRef.current;
              loopCount.current += 1;
              onLoop?.(loopCount.current);
            }
          } else {
            // wrap
            next = f + 1;
            if (next >= frameCount) {
              loopCount.current += 1;
              onLoop?.(loopCount.current);
              next = loop ? 0 : frameCount - 1; // clamp at last frame if no loop
              if (!loop) setIsPlaying(false);
            }
          }

          if (next !== f) onFrame?.(next);
          return next;
        });
      }

      rafRef.current = requestAnimationFrame(step);
    },
    [isPlaying, prefersReducedMotion, pauseWhenHidden, frameDuration, frameCount, loop, pingPong, speed, onLoop, onFrame]
  );

  useEffect(() => {
    if (!isPlaying || prefersReducedMotion) return; // don’t animate if paused/reduced
    lastTsRef.current = performance.now();
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, prefersReducedMotion, step]);

  // Imperative controls (for game logic)
  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => {
    setIsPlaying(false);
    setFrame(idleFrame);
  }, [idleFrame]);
  const toggle = useCallback(() => setIsPlaying((p) => !p), []);
  const next = useCallback(() => setFrame((f) => (f + 1) % frameCount), [frameCount]);
  const prev = useCallback(() => setFrame((f) => (f - 1 + frameCount) % frameCount), [frameCount]);
  const goTo = useCallback((n) => setFrame(Math.max(0, Math.min(frameCount - 1, n | 0))), [frameCount]);
  const setDirectionRow = useCallback((r) => setRow(Math.max(0, r | 0)), []);

  /**
   * getStyle: inline style for a background-sprite
   * Pass the *frame* tile width/height and optional row override.
   *
   * Example usage:
   *   <div className="sprite" style={{
   *     backgroundImage: 'url(/sprites/dog.png)',
   *     ...getStyle({ frameWidth: 48, frameHeight: 48 }) // row uses current `row`
   *   }} />
   */
  const getStyle = useCallback(
    ({ frameWidth, frameHeight, row: rowOverride } = {}) => {
      const r = Number.isFinite(rowOverride) ? rowOverride : row;
      return {
        width: `${frameWidth}px`,
        height: `${frameHeight}px`,
        backgroundPosition: `-${frame * frameWidth}px -${r * frameHeight}px`,
        imageRendering: "pixelated", // crisp sprites
        willChange: "background-position",
      };
    },
    [frame, row]
  );

  return {
    // state
    frame,
    row,
    isPlaying,

    // style helper
    getStyle,

    // controls
    play,
    pause,
    toggle,
    next,
    prev,
    goTo,
    setRow: setDirectionRow,
  };
}
