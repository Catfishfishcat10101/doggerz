import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Sprite animator for sheet with frames horizontally, directions vertically.
 * @param {{isPlaying?:boolean, frameCount?:number, frameRate?:number, idleFrame?:number}} opts
 */
export default function useSpriteAnimator({ isPlaying = false, frameCount = 4, frameRate = 8, idleFrame = 0 } = {}) {
  const [frame, setFrame] = useState(idleFrame);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isPlaying) { setFrame(idleFrame); return; }
    const ms = Math.max(30, 1000 / Math.max(1, frameRate));
    timerRef.current = setInterval(() => {
      setFrame((f) => (f + 1) % frameCount);
    }, ms);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, frameCount, frameRate, idleFrame]);

  const getBackgroundPosition = useCallback(
    ({ frameWidth, frameHeight, directionRow = 0 }) => ({
      backgroundPosition: `-${frame * frameWidth}px -${directionRow * frameHeight}px`,
      width: `${frameWidth}px`,
      height: `${frameHeight}px`,
    }),
    [frame]
  );

  return { frame, getBackgroundPosition };
}
