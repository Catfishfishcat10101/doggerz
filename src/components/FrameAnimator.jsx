// src/components/FrameAnimator.jsx
// Minimal frame-based animator for public/ sprites.
// Usage: <FrameAnimator baseUrl="/sprites/jrt/puppy/idle" />

import React from "react";

async function fetchJson(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json();
}

export default function FrameAnimator({
  baseUrl,
  className = "",
  style = {},
  paused = false,
  fallbackFps = 12,
  pixelated = false,
}) {
  const [meta, setMeta] = React.useState(null);
  const [frameIdx, setFrameIdx] = React.useState(0);
  const rafRef = React.useRef(0);
  const lastRef = React.useRef(0);

  React.useEffect(() => {
    let alive = true;

    (async () => {
      const m = await fetchJson(`${baseUrl}/meta.json`);
      if (!alive) return;
      setMeta(m);
      setFrameIdx(0);

      // Preload images (best effort)
      for (let i = 1; i <= m.frames; i++) {
        const n = String(i).padStart(4, "0");
        const img = new Image();
        img.src = `${baseUrl}/frame_${n}.webp`;
      }
    })().catch((e) => {
      console.error(e);
      setMeta(null);
    });

    return () => {
      alive = false;
    };
  }, [baseUrl]);

  React.useEffect(() => {
    if (!meta) return;
    if (paused) return;

    const fps = Number(meta.fps || fallbackFps);
    const frameMs = 1000 / Math.max(1, fps);

    const tick = (t) => {
      if (!lastRef.current) lastRef.current = t;
      const dt = t - lastRef.current;

      if (dt >= frameMs) {
        lastRef.current = t;
        setFrameIdx((i) => (i + 1) % meta.frames);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [meta, paused, fallbackFps]);

  if (!meta) {
    return (
      <div className={`rounded-lg border border-white/10 p-3 text-sm text-white/70 ${className}`}>
        Missing or invalid meta.json at: <code>{baseUrl}/meta.json</code>
      </div>
    );
  }

  const n = String(frameIdx + 1).padStart(4, "0");
  const src = `${baseUrl}/frame_${n}.webp`;

  return (
    <div
      className={className}
      style={{
        ...style,
        width: meta.frameSize,
        height: meta.frameSize,
      }}
    >
      <img
        src={src}
        alt={`${meta.stage}-${meta.action}`}
        draggable={false}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          imageRendering: pixelated ? "pixelated" : "auto",
          userSelect: "none",
          WebkitUserDrag: "none",
        }}
      />
    </div>
  );
}
