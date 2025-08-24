// src/components/UI/PoopRenderer.jsx
import React from "react";
import "./PoopRenderer.css";

export default function PoopRenderer({ poops = [] }) {
  if (!poops.length) return null; // don't render empty wrapper

  return (
    <>
      {poops.map((p) => (
        <div
          key={p.id}
          className="poop"
          style={{ left: p.x, top: p.y }}
          title="Your dog left a surprise 🐕💩"
        >
          💩
        </div>
      ))}
    </>
  );
}