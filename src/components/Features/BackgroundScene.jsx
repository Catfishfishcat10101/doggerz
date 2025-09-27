// src/components/Features/BackgroundScene.jsx
import React from "react";
import "./BackgroundScene.css";

/**
 * Props:
 * - skin: "default" | "lawn" | "sunset" | "night" | "neon" | "winter"
 * - accent: CSS color string (optional; tints mid-layer)
 * - className: extra classes
 * - children: your game stage (canvas, dog sprite, etc.)
 */
export default function BackgroundScene({
  skin = "default",
  accent,
  className = "",
  children,
}) {
  const style = accent ? { ["--scene-accent"]: accent } : undefined;
  return (
    <div
      className={`bg-yard skin-${skin} ${className}`}
      style={style}
    >
      {/* Parallax layers */}
      <div className="parallax layer back" />
      <div className="parallax layer mid" />
      <div className="parallax layer front" />

      {/* Your stage goes here */}
      <div className="scene-stage">{children}</div>

      {/* Ground */}
      <div className="scene-ground" />
    </div>
  );
}
