/** @format */
// src/features/game/components/PuppyAnimator.jsx
// Thin wrapper around SpriteSheetDog using the placeholder atlas.

import * as React from "react";

import SpriteSheetDog from "@/components/SpriteSheetDog.jsx";

export default function PuppyAnimator({
  action = "idle",
  size = 256, // rendered size in px
  className = "",
  style,
  debug = false,
  reduceMotion = false,
}) {
  const [debugInfo, setDebugInfo] = React.useState(null);

  return (
    <div
      className={className}
      style={{ ...style, width: size, height: size, position: "relative" }}
    >
      <SpriteSheetDog
        stage="PUPPY"
        anim={action}
        size={size}
        reduceMotion={reduceMotion}
        className="block"
        onDebug={debug ? setDebugInfo : undefined}
      />

      {debug && debugInfo ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            fontSize: 12,
            background: "rgba(0,0,0,0.5)",
            padding: "4px 6px",
            display: "inline-block",
          }}
        >
          {String(debugInfo.resolvedAnim || debugInfo.requestedAnim || "idle")}{" "}
          - frame {Number(debugInfo.frameIndex || 0) + 1} /{" "}
          {Number(debugInfo.frames || 1)} - {Number(debugInfo.fps || 0)} fps
        </div>
      ) : null}
    </div>
  );
}
