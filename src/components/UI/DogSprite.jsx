import React from "react";

/**
 * Simple sprite with built-in fallback:
 * - If you have a sheet later, replace the inner <div> with <img src={...} />
 */
export default function DogSprite({ x = 0, y = 0, dir = "right", reduced = false }) {
  const bob = reduced ? "animate-none" : "motion-safe:animate-[dogbob_1.6s_ease-in-out_infinite]";
  const flip = dir === "left" ? "-scale-x-100" : "";
  return (
    <div
      className={`absolute pointer-events-none select-none ${bob}`}
      style={{ transform: `translate(${x}px, ${y}px)` }}
      aria-label="Your dog"
    >
      <div
        className={`h-16 w-16 rounded-full ${flip} grid place-items-center bg-gradient-to-br from-amber-300 to-pink-400 shadow-lg`}
        role="img"
      >
        <span className="text-2xl">🐶</span>
      </div>
    </div>
  );
}

/* Tailwind keyframes (add once globally if you want, or inline via plugin):
@layer utilities {
  @keyframes dogbob {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
  }
}
*/