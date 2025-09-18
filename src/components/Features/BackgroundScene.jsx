// src/components/Features/BackgroundScene.jsx
import React from "react";
import "./BackgroundScene.css";

/** Wrap your game area in a pretty background.
 *  It reads `yardSkin` from sessionStorage ("default" | "lawn" | "sunset").
 */
export default function BackgroundScene({ children }) {
  const skin = sessionStorage.getItem("yardSkin") || "default";

  return (
    <div className={`bg-yard skin-${skin}`}>
      <div className="scene-stage">{children}</div>
      <div className="scene-ground" />
    </div>
  );
}