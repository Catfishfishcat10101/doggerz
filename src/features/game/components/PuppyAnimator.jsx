/** @format */
// src/features/game/components/PuppyAnimator.jsx
// Simple, reliable spritesheet animator (one sheet per action, 1 row, frames left->right)

import * as React from "react";

function clampInt(n, min, max) {
  return Math.max(min, Math.min(max, n | 0));
}

const FALLBACK_ACTIONS = Object.freeze([
  "idle",
  "walk",
  "bark",
  "sit",
  "sleep",
]);

function normalizePuppyAction(action) {
  const a = String(action || "idle")
    .trim()
    .toLowerCase();
  if (!a) return "idle";

  // Common synonyms / cross-system names.
  if (a === "rest" || a === "lay") return "sleep";
  if (a === "run") return "walk";
  if (a === "howl") return "bark";
  if (a === "stay") return "sit";
  if (
    a === "roll" ||
    a === "rollover" ||
    a === "roll_over" ||
    a === "rollover"
  ) {
    return "walk";
  }

  return a;
}

export default function PuppyAnimator({
  action = "idle",
  size = 256, // rendered size in px
  className = "",
  style,
  debug = false,
}) {
  const [meta, setMeta] = React.useState(null);
  const [err, setErr] = React.useState(null);
  const [frame, setFrame] = React.useState(0);

  // Load meta once
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/sprites/puppy/puppy.meta.json", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`Failed to load meta: ${res.status}`);
        const json = await res.json();
        if (alive) setMeta(json);
      } catch (e) {
        if (alive) setErr(e?.message || String(e));
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const frameSize = meta?.frameSize ?? 256;
  const availableActions = React.useMemo(() => {
    const keys =
      meta?.actions && typeof meta.actions === "object"
        ? Object.keys(meta.actions)
        : null;
    return new Set(keys && keys.length ? keys : FALLBACK_ACTIONS);
  }, [meta]);

  const requestedAction = normalizePuppyAction(action);
  const safeAction = availableActions.has(requestedAction)
    ? requestedAction
    : availableActions.has("idle")
      ? "idle"
      : FALLBACK_ACTIONS[0];

  const actionDef = meta?.actions?.[safeAction] ?? null;
  const frames = actionDef?.frames ?? 1;
  const fps = actionDef?.fps ?? meta?.defaultFps ?? 8;

  // Reset frame whenever action changes
  React.useEffect(() => {
    setFrame(0);
  }, [action]);

  // Ticker
  React.useEffect(() => {
    if (!meta) return;
    const safeFps = Math.max(1, Number(fps) || 8);
    const intervalMs = Math.round(1000 / safeFps);

    const id = setInterval(() => {
      setFrame((f) => (f + 1) % Math.max(1, frames));
    }, intervalMs);

    return () => clearInterval(id);
  }, [meta, fps, frames]);

  if (err) {
    return (
      <div
        className={className}
        style={{ ...style, width: size, height: size }}
      >
        <div style={{ fontSize: 12, opacity: 0.9 }}>
          Sprite meta load error: {err}
        </div>
      </div>
    );
  }

  // Even with placeholder PNGs, you'll still see the box; real art will animate.
  const src = `/sprites/puppy/actions/${safeAction}.png`;

  // One-row sheet: x offset is frame * frameSize
  const x = clampInt(frame, 0, Math.max(0, frames - 1)) * frameSize;

  const containerStyle = {
    width: size,
    height: size,
    backgroundImage: `url("${src}")`,
    backgroundRepeat: "no-repeat",
    // Scale the *whole sheet* so a single frame appears at requested size
    backgroundSize: `${frames * size}px ${size}px`,
    backgroundPosition: `${-x * (size / frameSize)}px 0px`,
    imageRendering: "pixelated", // safe default; remove later if your art is non-pixel
    ...style,
  };

  return (
    <div className={className} style={containerStyle}>
      {debug ? (
        <div
          style={{
            position: "relative",
            top: 0,
            left: 0,
            fontSize: 12,
            background: "rgba(0,0,0,0.5)",
            padding: "4px 6px",
            display: "inline-block",
          }}
        >
          {safeAction}
          {requestedAction !== safeAction ? ` (req: ${requestedAction})` : ""} •
          frame {frame + 1}/{frames} • {fps} fps
        </div>
      ) : null}
    </div>
  );
}
