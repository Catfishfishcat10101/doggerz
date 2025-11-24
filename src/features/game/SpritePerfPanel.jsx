// src/features/game/SpritePerfPanel.jsx
// Dev-only perf panel showing animation fps & dropped frames.
// Appears when dog.debug is true (toggle via Redux) and in DEV builds.

import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectDog, toggleDebug } from "@/redux/dogSlice.js";

export default function SpritePerfPanel() {
  const dog = useSelector(selectDog);
  const dispatch = useDispatch();
  const [fps, setFps] = useState(0);
  const [dropped, setDropped] = useState(0);
  const [animation, setAnimation] = useState("-");
  const framesRef = useRef([]);
  const lastTsRef = useRef(null);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    function onFrame(e) {
      const { ts, animation: anim } = e.detail;
      setAnimation(anim);
      const last = lastTsRef.current;
      if (last != null) {
        const dt = ts - last;
        // Expect ~100-200ms depending on animation; treat >250ms as dropped
        if (dt > 250) setDropped((d) => d + 1);
      }
      lastTsRef.current = ts;
      framesRef.current.push(ts);
    }
    window.addEventListener("doggerz:spriteFrame", onFrame);
    return () => window.removeEventListener("doggerz:spriteFrame", onFrame);
  }, []);

  // Compute FPS every second
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const id = setInterval(() => {
      const now = performance.now();
      framesRef.current = framesRef.current.filter((t) => now - t < 1000);
      setFps(framesRef.current.length);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  if (!import.meta.env.DEV || !dog?.debug) return null;

  return (
    <div className="fixed bottom-2 left-2 z-50 rounded-lg border border-emerald-600/40 bg-zinc-900/90 px-3 py-2 text-[10px] font-mono text-emerald-200 shadow-md shadow-emerald-900/50">
      <div className="flex items-center justify-between gap-4 mb-1">
        <span className="font-semibold">Sprite Perf</span>
        <button
          onClick={() => dispatch(toggleDebug())}
          className="text-[10px] px-2 py-[2px] rounded bg-emerald-700/40 hover:bg-emerald-600/60"
        >
          Close
        </button>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        <span>Anim:</span><span className="truncate max-w-[120px]">{animation}</span>
        <span>FPS:</span><span>{fps}</span>
        <span>Dropped:</span><span>{dropped}</span>
        <span>Tier:</span><span>{dog.cleanlinessTier}</span>
        <span>Override:</span><span>{dog.animationOverride?.name || "none"}</span>
      </div>
      <p className="mt-1 text-[9px] text-emerald-300/70">Press Shift+D to toggle.</p>
    </div>
  );
}