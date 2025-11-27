// src/components/JackRussellIdle.jsx
// @ts-nocheck

import React from "react";
import jackIdle from "@/assets/sprites/jackrussell/idle.svg";

export default function JackRussellIdle({ size = 192, className = "" }) {
  return (
    <img
      src={jackIdle}
      alt="Jack Russell idle"
      className={className}
      style={{
        width: size,
        height: size,
        imageRendering: "pixelated",
      }}
    />
  );
}
