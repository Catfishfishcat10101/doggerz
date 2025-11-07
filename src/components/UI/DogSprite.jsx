import React from "react";

export default function DogSprite({ stage = "puppy", className = "" }) {
  return (
    <div className={`inline-flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2 ${className}`}>
      <span role="img" aria-label="dog">í°¶</span>
      <span className="text-xs opacity-70">stage: {stage}</span>
    </div>
  );
}
