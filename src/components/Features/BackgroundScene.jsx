// src/components/Features/BackgroundScene.jsx
import React from "react";
import useSessionStorage from "@/hooks/useSessionStorage";
import "./BackgroundScene.css";

/**
 * BackgroundScene
 * Wrap your game area with an ambient background.
 *
 * Props:
 * - skin?: "default" | "lawn" | "sunset" | "night" | "neon" | "winter"
 *   If omitted, uses sessionStorage("yardSkin") with fallback "default".
 * - tint?: CSS color string; applied as --scene-accent (lights, UI accents)
 * - className?: extra classes for .scene-stage
 */
export default function BackgroundScene({ children, skin, tint, className = "" }) {
  const [storedSkin] = useSessionStorage("yardSkin", "default");
  const activeSkin = (skin ?? storedSkin) || "default";

  return (
    <div
      className={`bg-yard skin-${activeSkin}`}
      style={tint ? { ["--scene-accent"]: tint } : undefined}
      data-skin={activeSkin}
    >
      {/* Parallax layers */}
      <div className="parallax layer back" aria-hidden />
      <div className="parallax layer mid" aria-hidden />
      <div className="parallax layer front" aria-hidden />

      {/* Main stage where your game renders */}
      <div className={`scene-stage ${className}`}>{children}</div>

      {/* Ground plane */}
      <div className="scene-ground" aria-hidden />
    </div>
  );
}
// src/components/Features/Accessories.jsx