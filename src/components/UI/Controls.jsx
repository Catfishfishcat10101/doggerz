// src/components/UI/Controls.jsx
import React from "react";

export default function Controls() {
  return (
    <div className="w-full max-w-3xl mx-auto bg-white/70 backdrop-blur rounded-2xl shadow p-4 text-sm text-emerald-900">
      <div className="font-semibold mb-2">Controls</div>
      <ul className="list-disc pl-6 space-y-1">
        <li>Move: Arrow Keys or WASD</li>
        <li>Bark: <span className="font-mono">B</span></li>
        <li>Time Speed: <span className="font-mono">.</span> (normal), <span className="font-mono">Shift + .</span> (fast)</li>
        <li>Hold the <em>Pet</em> button to earn XP and boost happiness</li>
      </ul>
    </div>
  );
}
