// src/features/game/scene/Scene.jsx
import React from "react";
import BackgroundScene from "./BackgroundScene.jsx";

export default function Scene({ children }) {
  // One abstraction for “the play yard”
  return <BackgroundScene>{children}</BackgroundScene>;
}
