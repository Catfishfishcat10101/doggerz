// src/components/YardBackground.jsx
import React from "react";
import useYardBackground from "@/hooks/useYardBackground.js";

export default function YardBackground() {
  const { isNight, urls, tick } = useYardBackground();
  const day = urls?.day;
  const night = urls?.night;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        key={`day-${tick}`}
        className="absolute inset-0 bg-center bg-cover transition-opacity duration-700 ease-out"
        style={{
          backgroundImage: day ? `url(${day})` : "none",
          opacity: isNight ? 0 : 1,
          filter: "saturate(1) brightness(0.95)",
        }}
      />
      <div
        key={`night-${tick}`}
        className="absolute inset-0 bg-center bg-cover transition-opacity duration-700 ease-out"
        style={{
          backgroundImage: night ? `url(${night})` : "none",
          opacity: isNight ? 1 : 0,
          filter: "saturate(1) brightness(0.85)",
        }}
      />

      {/* Low-glare overlay */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />
    </div>
  );
}
