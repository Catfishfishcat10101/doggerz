import React, { useMemo } from "react";
import "./BackgroundScene.css";

/**
 * BackgroundScene
 * - Visual shell with parallax + ground strip.
 * - The actual gameplay (DogStage) goes in {children}.
 *
 * Props:
 *  - skin: "default" | "lawn" | "sunset" | "night" | "neon" | "winter"
 *  - accent: CSS color for accent-driven skins (e.g., "#10b981" or "hsl(142 76% 36%)")
 *  - backImage / midImage / frontImage: optional URLs (module imports or /public paths)
 *  - className: extra classes for the outer wrapper
 */
export default function BackgroundScene({
  skin = "default",
  accent = "#10b981",
  backImage,
  midImage,
  frontImage,
  className = "",
  children,
}) {
  // Compose CSS vars for optional images + accent
  const layerStyle = useMemo(
    () => ({
      // accent for color-mix in certain skins (sunset/neon)
      ["--scene-accent"]: accent,
      // layer images (if provided)
      ...(backImage ? { ["--back-image"]: `url(${backImage})` } : null),
      ...(midImage ? { ["--mid-image"]: `url(${midImage})` } : null),
      ...(frontImage ? { ["--front-image"]: `url(${frontImage})` } : null),
    }),
    [accent, backImage, midImage, frontImage]
  );

  return (
    <section
      className={`bg-yard skin-${skin} ${className}`}
      style={layerStyle}
      aria-label={`Background scene (${skin})`}
    >
      {/* Parallax layers (purely decorative) */}
      <div className="parallax layer back" aria-hidden="true" />
      <div className="parallax layer mid" aria-hidden="true" />
      <div className="parallax layer front" aria-hidden="true" />

      {/* Playfield (your game) */}
      <div className="scene-stage">{children}</div>

      {/* Ground strip */}
      <div className="scene-ground" aria-hidden="true" />
    </section>
  );
}
