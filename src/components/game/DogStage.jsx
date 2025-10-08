import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import DogSprite from "@/components/UI/DogSprite.jsx";
import { selectDog } from "@/redux/dogSlice";

/**
 * DogStage — View-only renderer.
 * - No keyboard bindings.
 * - Reads position/direction/moving from Redux (driven by DogAIEngine).
 * - Converts top-left px (redux) → bottom % for the sprite container.
 */
export default function DogStage() {
  const stageRef = useRef(null);
  const dog = useSelector(selectDog);

  // Stage size (to convert y px -> bottom %)
  const [rect, setRect] = useState({ w: 800, h: 420 });
  useEffect(() => {
    const measure = () => {
      const el = stageRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setRect({ w: r.width, h: r.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    stageRef.current && ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, []);

  // Convert top-origin y px to bottom-origin percent for DogSprite
  const DOG_H = 96; // match sprite frame height
  const worldBottomPct = useMemo(() => {
    if (rect.h <= 0) return 0;
    const bottomPx = rect.h - dog.pos.y - DOG_H;
    return clamp((bottomPx / rect.h) * 100, 0, 100);
  }, [rect.h, dog.pos.y]);

  const yardFraction = 0.18;
  const yardStyle = { width: `${Math.round(yardFraction * 100)}%` };

  return (
    <div
      ref={stageRef}
      className="relative rounded-3xl border border-white/15 bg-neutral-900/40 backdrop-blur h-[58dvh] min-h-[360px]"
      aria-label="Doggerz play area (autonomous)"
    >
      {/* yard rail (visual only) */}
      <div
        className="absolute top-0 right-0 h-full border-l border-white/10 bg-emerald-800/25 text-white/80 flex items-center justify-center rotate-180 [writing-mode:vertical-rl] rounded-tr-3xl rounded-br-3xl"
        style={yardStyle}
        aria-hidden="true"
      >
        Yard
      </div>

      {/* stage floor glow */}
      <div className="absolute inset-x-6 bottom-4 h-24 rounded-full bg-white/5 blur-2xl pointer-events-none" aria-hidden="true" />

      {/* dog sprite (driven entirely by redux + AI engine) */}
      <DogSprite
        x={dog.pos.x}
        worldBottomPct={worldBottomPct}
        w={DOG_H}
        h={DOG_H}
        scale={1}
        frames={6}
        row={0}
        speedMs={dog.moving ? 1200 : 1600} // slower when idle-ish
        playing={dog.moving}
        faceLeft={dog.direction === "left"}
        shadow
        interactive={false}
        title="Pup"
      />
    </div>
  );
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
