import React from "react";

// Simple scene switcher; swap the image srcs as you add more scenes
const SCENES = {
  yard_day: "/backgrounds/yard_day.png",
  // yard_night: "/backgrounds/yard_night.png",
  // beach: "/backgrounds/beach.png",
};

export default function BackgroundScene({ scene = "yard_day", className = "" }) {
  const src = SCENES[scene] ?? SCENES.yard_day;

  return (
    <div className={`w-full max-w-xl mx-auto`}>
      <div
        className={`rounded-2xl shadow-lg overflow-hidden h-80 bg-cover bg-center ${className}`}
        style={{ backgroundImage: `url(${src})` }}
        role="img"
        aria-label={`Background scene: ${scene}`}
      />
      <div className="text-center mt-3 text-sm text-gray-600">
        Scene: <span className="font-semibold">{scene}</span>
      </div>
    </div>
  );
}
