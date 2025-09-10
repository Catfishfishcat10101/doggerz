// src/hooks/useSpriteAnimator.js
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Sprite-sheet animator:
 * - Drives frame index 0..frameCount-1 at a given frameRate while playing.
 * - When not playing, holds idleFrame.
 * - Optional ping-pong mode.
 * - Optionally compute backgroundPosition given frameWidth/height + directionRow.
 *
 * Example:
 *   const { frame, getBackgroundPosition } = useSpriteAnimator({
 *     isPlaying: isWalking,
 *     frameCount: 4,
 *     frameRate: 8,     // fps
 *     idleFrame: 0,
 *     pingPong: false,
 *   });
 *
 *   const style = getBackgroundPosition({ frameWidth: 64, frameHeight: 64, directionRow: 2 });
 *   <div className="dog" style={{ width:64, height:64, backgroundImage: `url(${sprite})`, ...style }} />
 */
export default function useSpriteAnimator({
  isPlaying = false,
  frameCount = 4,
  frameRate = 8,
  idleFrame = 0,
  pingPong = false,
  onFrame,
} = {}) {
  const safeCount = Math.max(1, Math.floor(frameCount));
  const [frame, setFrame] = useState(idleFrame % safeCount);

  const playingRef = useRef(isPlaying);
  const fpsRef = useRef(Math.max(1, Math.floor(frameRate)));
  const dirRef = useRef(1); // for ping-pong: 1 forward, -1 backward
  const rafRef = useRef(null);
  const lastAtRef = useRef(0);
  const accRef = useRef(0);

  const stepForward = useCallback(() => {
    setFrame((f) => {
      const next = f + 1;
      return next >= safeCount ? 0 : next;
    });
  }, [safeCount]);

  const stepBackward = useCallback(() => {
    setFrame((f) => {
      const next = f - 1;
      return next < 0 ? safeCount - 1 : next;
    });
  }, [safeCount]);

  const tick = useCallback((ts) => {
    if (!playingRef.current) return;

    if (!lastAtRef.current) lastAtRef.current = ts;
    const delta = ts - lastAtRef.current;
    lastAtRef.current = ts;

    accRef.current += delta;
    const frameMs = 1000 / fpsRef.current;

    while (accRef.current >= frameMs) {
      accRef.current -= frameMs;

      if (pingPong) {
        setFrame((f) => {
          let next = f + dirRef.current;
          if (next >= safeCount || next < 0) {
            dirRef.current *= -1;
            next = f + dirRef.current;
          }
          onFrame?.(next);
          return next;
        });
      } else {
        setFrame((f) => {
          const next = (f + 1) % safeCount;
          onFrame?.(next);
          return next;
        });
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [pingPong, safeCount, onFrame]);

  const start = useCallback(() => {
    playingRef.current = true;
    lastAtRef.current = 0;
    accRef.current = 0;
    if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const stop = useCallback(() => {
    playingRef.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setFrame((idleFrame % safeCount + safeCount) % safeCount);
  }, [idleFrame, safeCount]);

  // respond to props
  useEffect(() => {
    fpsRef.current = Math.max(1, Math.floor(frameRate));
  }, [frameRate]);

  useEffect(() => {
    if (isPlaying) start();
    else stop();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  const getBackgroundPosition = useCallback(
    ({ frameWidth, frameHeight, directionRow = 0 } = {}) => {
      if (!Number.isFinite(frameWidth) || !Number.isFinite(frameHeight)) return {};
      const x = -frame * frameWidth;
      const y = -(directionRow * frameHeight);
      return { backgroundPosition: `${x}px ${y}px` };
    },
    [frame]
  );

  return {
    frame,                 // current column index
    setFrame,
    start,
    stop,
    stepForward,
    stepBackward,
    getBackgroundPosition, // helper to compute CSS background-position
    isPlaying: playingRef.current,
  };
}
