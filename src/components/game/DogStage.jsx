// src/components/game/DogStage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import DogSprite from "@/components/UI/DogSprite.jsx";
import { selectDog } from "@/redux/dogSlice";

/**
 * DogStage — View-only renderer.
 * - No keyboard bindings.
 * - Reads position/direction/moving from Redux (driven by DogAIEngine).
 * - Converts top-left px (redux) → bottom % for the sprite container.
 * - Clamps sprite into stage bounds and adapts visuals for perf/motion flags.
 */
export default function DogStage() {
  const stageRef = useRef(null);
  const dogState = useSelector(selectDog);

  // Safe dog snapshot with defaults (avoid crashes if slice is momentarily null)
  const dog = dogState ?? {
    pos: { x: 24, y: 24 },
    direction: "right",
    moving: false,
  };

  // Stage size (to convert y px -> bottom %) — measured with ResizeObserver
  const [rect, setRect] = useState({ w: 800, h: 420 });
  useEffect(() => {
    if (!stageRef.current) return;

    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const el = stageRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        // round to avoid churning on subpixel changes
        setRect({ w: Math.round(r.width), h: Math.round(r.height) });
      });
    };

    const ro = new ResizeObserver(measure);
    ro.observe(stageRef.current);
    // First measure
    measure();

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, []);

  // Sprite metrics
  const DOG_W = 96;
  const DOG_H = 96;

  // Clamp dog position to stage interior (leaves a tiny inset so borders don't clip)
  const inset = 6;
  const clamped = useMemo(() => {
    const maxX = Math.max(inset, rect.w - DOG_W - inset);
    const maxY = Math.max(inset, rect.h - DOG_H - inset);
    const x = clamp(dog.pos?.x ?? 0, inset, maxX);
    const y = clamp(dog.pos?.y ?? 0, inset, maxY);
    return { x, y };
  }, [dog.pos?.x, dog.pos?.y, rect.w, rect.h]);

  // Convert top-origin y px to bottom-origin percent for DogSprite
  const worldBottomPct = useMemo(() => {
    if (rect.h <= 0) return 0;
    const bottomPx = rect.h - clamped.y - DOG_H;
    return clamp((bottomPx / rect.h) * 100, 0, 100);
  }, [rect.h, clamped.y]);

  // Visual rails (right-side yard)
  const yardFraction = 0.18;
  const yardStyle = useMemo(
    () => ({ width: `${Math.round(yardFraction * 100)}%` }),
    [],
  );

  // Perf/motion toggles from <html data-*>, set by SettingsModal
  const docEl =
    typeof document !== "undefined" ? document.documentElement : null;
  const perfMode = docEl?.dataset?.dzPerfMode === "true";
  const reduceMotion = docEl?.dataset?.dzReduceMotion === "true";

  // Optional debug overlay (grid + coordinates)
  const debug = readLocal("doggerz:debugStage", false);

  // Subtle perspective scale: slightly bigger toward camera (bottom of stage)
  // Keeps it conservative so it won't fight your sprite art; disable in perf mode.
  const scale = perfMode ? 1 : lerp(0.94, 1.06, 1 - worldBottomPct / 100);

  // Dog animation speed (a little faster when moving)
  const speedMs = dog.moving ? 1200 : 1600;

  // Shadow intensity scales with proximity to the “ground plane”
  const shadowOpacity = perfMode
    ? 0.12
    : 0.18 + (1 - worldBottomPct / 100) * 0.12;

  return (
    <div
      ref={stageRef}
      className={[
        "relative rounded-3xl border border-white/15 bg-neutral-900/40",
        "backdrop-blur h-[58dvh] min-h-[360px] overflow-hidden",
      ].join(" ")}
      aria-label="Doggerz play area (autonomous)"
    >
      {/* right-side yard rail (visual only) */}
      <div
        className="absolute top-0 right-0 h-full border-l border-white/10 bg-emerald-800/25 text-white/80 flex items-center justify-center rotate-180 [writing-mode:vertical-rl] rounded-tr-3xl rounded-br-3xl"
        style={yardStyle}
        aria-hidden="true"
      >
        Yard
      </div>

      {/* ground plane glow (toned down in perf mode) */}
      <div
        className={[
          "absolute inset-x-6 bottom-4 h-24 rounded-full pointer-events-none",
          perfMode ? "bg-white/[0.03] blur-md" : "bg-white/[0.06] blur-2xl",
        ].join(" ")}
        aria-hidden="true"
      />

      {/* optional debug grid / crosshair */}
      {debug && <DebugOverlay rect={rect} x={clamped.x} y={clamped.y} />}

      {/* Dog sprite (driven entirely by redux + AI engine) */}
      <DogSprite
        // horizontal from left in px
        x={clamped.x}
        // vertical from bottom in %
        worldBottomPct={worldBottomPct}
        // sprite frame box
        w={DOG_W}
        h={DOG_H}
        // light perspective scale
        scale={scale}
        frames={6}
        row={0}
        speedMs={speedMs}
        playing={!!dog.moving}
        faceLeft={dog.direction === "left"}
        shadow={{ opacity: shadowOpacity }}
        interactive={false}
        title="Pup"
        // consider using reduceMotion to disable micro-jiggles in your DogSprite
        reduceMotion={reduceMotion}
      />
    </div>
  );
}

/* --------------------------------- helpers -------------------------------- */

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}
function lerp(a, b, t) {
  return a + (b - a) * clamp(t, 0, 1);
}
function readLocal(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v == null ? fallback : JSON.parse(v);
  } catch {
    return fallback;
  }
}

/* ------------------------------ debug overlay ----------------------------- */

function DebugOverlay({ rect, x, y }) {
  const cell = 40; // px grid
  const cols = Math.max(1, Math.floor(rect.w / cell));
  const rows = Math.max(1, Math.floor(rect.h / cell));
  return (
    <div className="absolute inset-0 pointer-events-none select-none">
      {/* grid */}
      <svg width="100%" height="100%" aria-hidden="true">
        <defs>
          <pattern
            id="dz-grid"
            width={cell}
            height={cell}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${cell} 0 L 0 0 0 ${cell}`}
              fill="none"
              stroke="rgba(255,255,255,.06)"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dz-grid)" />
      </svg>

      {/* crosshair + coords */}
      <div
        className="absolute rounded bg-black/60 text-white text-[11px] px-2 py-1 border border-white/10"
        style={{
          left: clamp(x + 10, 6, rect.w - 110),
          top: clamp(y + 10, 6, rect.h - 28),
        }}
      >
        x:{Math.round(x)} y:{Math.round(y)} • {cols}×{rows}
      </div>
      <div
        className="absolute"
        style={{ left: x + 48, top: y + 48, transform: "translate(-50%,-50%)" }}
        aria-hidden="true"
      >
        <div className="h-8 w-8 rounded-full border border-white/30" />
      </div>
    </div>
  );
}
