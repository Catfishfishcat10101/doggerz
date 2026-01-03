// src/components/ui/LottieBurst.jsx
// @ts-nocheck

import { useMemo } from "react";
import Lottie from "lottie-react";

/**
 * LottieBurst
 * UI-only micro animation helper.
 *
 * - To replay, change `playKey` (it remounts the Lottie instance).
 * - Keep `loop={false}` for short bursts (rewards, action feedback).
 */
export default function LottieBurst({
  playKey,
  animationData,
  size = 220,
  className = "",
  style,
  speed = 1,
}) {
  const mergedStyle = useMemo(
    () => ({
      width: size,
      height: size,
      pointerEvents: "none",
      ...style,
    }),
    [size, style],
  );

  if (!animationData) return null;

  return (
    <div className={className} style={mergedStyle} aria-hidden>
      <Lottie
        key={String(playKey || "")}
        animationData={animationData}
        autoplay
        loop={false}
        rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
        style={{ width: "100%", height: "100%" }}
        speed={speed}
      />
    </div>
  );
}
