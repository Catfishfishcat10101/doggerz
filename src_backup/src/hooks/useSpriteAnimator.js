import { useEffect, useState } from "react";

export default function useSpriteAnimator({ isPlaying, frameCount, frameRate = 8, idleIndex = 0 }) {
  const [frame, setFrame] = useState(idleIndex);
  useEffect(() => {
    if (!isPlaying) { setFrame(idleIndex); return; }
    const ms = Math.max(1, Math.floor(1000 / frameRate));
    const id = setInterval(() => setFrame((f) => (f + 1) % Math.max(1, frameCount)), ms);
    return () => clearInterval(id);
  }, [isPlaying, frameCount, frameRate, idleIndex]);
  return frame;
}
