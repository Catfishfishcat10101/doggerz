// src/features/game/components/SpriteSheetDog.jsx
// STUB: Sprite assets have been removed. This component now returns a simple fallback.
// @ts-nocheck

import * as React from "react";

import { withBaseUrl } from "@/utils/assetUrl.js";

/**
 * Stub component that returns a simple fallback icon.
 * Sprite sheets have been removed from the repository.
 */
export default function SpriteSheetDog({
  stage = "PUPPY", // eslint-disable-line no-unused-vars
  anim = "idle", // eslint-disable-line no-unused-vars
  facing = 1,
  size = 320,
  reduceMotion = false, // eslint-disable-line no-unused-vars
  fallbackSrc,
  className = "",
  onDebug, // eslint-disable-line no-unused-vars
}) {
  const [fallbackIndex, setFallbackIndex] = React.useState(0);

  // Use provided fallback or app icon
  const fallbackCandidates = React.useMemo(() => {
    const src = String(fallbackSrc || '').trim();
    const out = src ? [src] : [];
    // Always provide app icon as final fallback
    out.push(withBaseUrl('/icons/doggerz-192.png'));
    return out;
  }, [fallbackSrc]);

  const effectiveFallbackSrc = fallbackCandidates[Math.min(fallbackIndex, Math.max(0, fallbackCandidates.length - 1))] || null;

  return effectiveFallbackSrc ? (
    <img
      src={effectiveFallbackSrc}
      alt=""
      draggable={false}
      className={className}
      onError={() => {
        setFallbackIndex((i) => i + 1);
      }}
      style={{
        width: size,
        height: size,
        maxWidth: "none",
        maxHeight: "none",
        display: "block",
        objectFit: "contain",
        objectPosition: "50% 60%",
        transform: `scaleX(${facing})`,
        transformOrigin: "50% 100%",
      }}
    />
  ) : null;
}
