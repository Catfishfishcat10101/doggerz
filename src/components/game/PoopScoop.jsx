// src/components/game/PoopScoop.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

export default function PoopScoop({
  poopCount = 0,
  onScoop = () => {}, // called once per scoop
  onScoopAll, // optional: if provided, used when holding to drain faster
  className = "",
  optimistic = true, // optimistic decrement for instant feedback
}) {
  // Local optimistic counter (snaps to prop when it changes)
  const [localCount, setLocalCount] = useState(poopCount);
  useEffect(() => setLocalCount(poopCount), [poopCount]);

  const [flash, setFlash] = useState(0); // increments to retrigger +1 badge
  const liveRef = useRef(null);
  const holdTimer = useRef(null);
  const startupTimer = useRef(null);
  const running = useRef(false);

  const plural = useMemo(
    () => (localCount === 1 ? "1 pile" : `${localCount} piles`),
    [localCount],
  );

  const doHaptic = () => {
    try {
      "vibrate" in navigator && navigator.vibrate?.(8);
    } catch {}
  };

  const announce = (msg) => {
    const el = liveRef.current;
    if (el) el.textContent = msg;
  };

  const performScoop = () => {
    if (localCount <= 0) return;
    // Optimistic UI first
    if (optimistic) setLocalCount((c) => Math.max(0, c - 1));
    setFlash((n) => n + 1);
    doHaptic();
    onScoop(); // delegate real state change to parent/Redux
    announce(`Scoop! ${Math.max(0, localCount - 1)} remaining`);
  };

  const startHold = () => {
    if (running.current || localCount <= 0) return;
    running.current = true;

    // Immediate scoop for responsiveness
    performScoop();

    // After a short delay, begin repeat scoops
    startupTimer.current = setTimeout(() => {
      // If parent provides a bulk handler, we can drain faster
      if (onScoopAll && localCount > 0) {
        // Call in small bursts to keep UI lively
        holdTimer.current = setInterval(() => {
          const burst = Math.min(3, localCount); // scoop up to 3 per tick
          if (burst <= 0) return stopHold();
          if (optimistic) setLocalCount((c) => Math.max(0, c - burst));
          setFlash((n) => n + burst);
          doHaptic();
          onScoopAll?.(burst);
          announce(`Scooping… ${Math.max(0, localCount - burst)} remaining`);
          if (localCount - burst <= 0) stopHold();
        }, 140);
      } else {
        // Default: scoop one per tick
        holdTimer.current = setInterval(() => {
          if (localCount <= 0) return stopHold();
          performScoop();
          if (localCount - 1 <= 0) stopHold();
        }, 140);
      }
    }, 220);
  };

  const stopHold = () => {
    running.current = false;
    if (startupTimer.current) {
      clearTimeout(startupTimer.current);
      startupTimer.current = null;
    }
    if (holdTimer.current) {
      clearInterval(holdTimer.current);
      holdTimer.current = null;
    }
  };

  useEffect(() => () => stopHold(), []); // cleanup on unmount

  const canScoop = localCount > 0;

  return (
    <div
      className={[
        "rounded-2xl border border-black/5 dark:border-white/10",
        "bg-white dark:bg-slate-900 p-4 flex items-center justify-between gap-3",
        className,
      ].join(" ")}
    >
      <div className="min-w-0">
        <h3 className="font-semibold">Cleanup</h3>
        <p className="text-sm opacity-70">{plural} on the floor</p>
      </div>

      <div className="relative">
        <button
          type="button"
          disabled={!canScoop}
          aria-disabled={!canScoop}
          aria-live="polite"
          className={[
            "text-sm rounded-xl px-4 py-2 font-semibold transition",
            canScoop
              ? "bg-slate-900 text-white hover:brightness-110 active:scale-95 dark:bg-slate-700"
              : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400 cursor-not-allowed",
          ].join(" ")}
          onClick={performScoop}
          onPointerDown={(e) => {
            e.preventDefault();
            startHold();
          }}
          onPointerUp={stopHold}
          onPointerLeave={stopHold}
          onPointerCancel={stopHold}
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              performScoop();
            }
          }}
          title={canScoop ? "Click or press-and-hold to scoop" : "All clean!"}
        >
          🧹 Scoop
        </button>

        {/* Floating +1 badge; re-triggers on `flash` changes */}
        <ScoopBadge key={flash} />
      </div>

      {/* SR-only live region for announcements */}
      <span ref={liveRef} className="sr-only" aria-live="polite" />
    </div>
  );
}

/* Lightweight floating badge animation */
function ScoopBadge() {
  return (
    <span
      className="pointer-events-none absolute -top-3 -right-2 text-xs font-bold text-emerald-500 animate-[rise_800ms_ease-out_forwards]"
      aria-hidden
    >
      +1
      <style>
        {`
          @keyframes rise {
            0%   { transform: translateY(6px); opacity: 0; }
            30%  { transform: translateY(0);   opacity: 1; }
            100% { transform: translateY(-10px); opacity: 0; }
          }
        `}
      </style>
    </span>
  );
}
