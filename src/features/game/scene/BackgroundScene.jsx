// src/features/game/scene/BackgroundScene.jsx
import React from "react";
import "./BackgroundScene.css";

export default function BackgroundScene({ children }) {
  return (
    <div className="background-scene">
      <div className="background-scene__inner">
        <div className="background-scene__layer background-scene__sky" />
        <div className="background-scene__layer">
          <div className="background-scene__sun" />
          <div className="background-scene__cloud background-scene__cloud--left" />
          <div className="background-scene__cloud background-scene__cloud--right" />
        </div>

        <div className="background-scene__layer background-scene__ground" />
        <div className="background-scene__layer">
          <div className="background-scene__fence-row">
            <div className="background-scene__fence-rail" />
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="background-scene__fence-post" />
            ))}
          </div>

          <div className="background-scene__tree-cluster">
            <div className="background-scene__tree">
              <div className="background-scene__tree-trunk" />
              <div className="background-scene__tree-foliage" />
            </div>
            <div className="background-scene__tree">
              <div className="background-scene__tree-trunk" />
              <div className="background-scene__tree-foliage" />
            </div>
          </div>

          <div className="background-scene__bush-row">
            <div className="background-scene__bush" />
            <div className="background-scene__bush" />
          </div>
        </div>

        <div className="background-scene__layer background-scene__vignette" />

        <div className="background-scene__dog-slot">{children}</div>
      </div>
    </div>
  );
}
