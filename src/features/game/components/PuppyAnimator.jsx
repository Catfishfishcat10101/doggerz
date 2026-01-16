/** @format */
// src/features/game/components/PuppyAnimator.jsx
// Simple, reliable spritesheet animator (placeholder atlas-backed)

import * as React from "react";
import { withBaseUrl } from "@/utils/assetUrl.js";

function clampInt(n, min, max) {
  return Math.max(min, Math.min(max, n | 0));
}

const ATLAS_META_URL = "/sprites/puppy/jrt_puppy_placeholder_sheet.json";
const ATLAS_IMAGE_URL = "/sprites/puppy/jrt_puppy_placeholder_sheet.png";

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

function resolveAtlasAction(requested, available) {
  const mapped =
    {
      walk: "chase",
      run: "chase",
      play: "wag",
      fetch: "chase",
      rest: "lay",
      sleep: "sleep",
      sit: "sit",
      stay: "sit",
      bark: "bark",
      howl: "howl",
      idle: "idle",
    }[requested] || requested;

  if (available.has(mapped)) return mapped;
  if (available.has("idle")) return "idle";
  return available.values().next().value || "idle";
}

export default function PuppyAnimator({
  action = "idle",
  size = 256, // rendered size in px
  className = "",
  style,
  debug = false,
  fallbackSrc,
}) {
  const [atlas, setAtlas] = React.useState(null);
  const [err, setErr] = React.useState(null);
  const [frame, setFrame] = React.useState(0);
  const [fallbackIndex, setFallbackIndex] = React.useState(0);

  const fallbackCandidates = React.useMemo(() => {
    const src = String(fallbackSrc || "").trim();
    const out = src ? [src] : [];
    out.push(withBaseUrl("/icons/doggerz-192.png"));
    return out;
  }, [fallbackSrc]);

  React.useEffect(() => {
    setFallbackIndex(0);
  }, [fallbackSrc]);

  // Load atlas once (placeholder sheet bundled in public/)
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(withBaseUrl(ATLAS_META_URL), {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`Failed to load meta: ${res.status}`);
        const json = await res.json();
        if (alive) setAtlas(json);
      } catch (e) {
        if (alive) setErr(e?.message || String(e));
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const requestedAction = normalizePuppyAction(action);
  const atlasData = React.useMemo(() => {
    if (!atlas || typeof atlas !== "object") return null;
    const animations = atlas.animations;
    const frames = atlas.frames;
    if (!animations || typeof animations !== "object") return null;
    if (!frames || typeof frames !== "object") return null;

    const available = new Set(Object.keys(animations));
    if (!available.size) return null;

    const resolved = resolveAtlasAction(requestedAction, available);
    const ids = Array.isArray(animations[resolved]) ? animations[resolved] : [];
    const fallbackAction = available.has("idle")
      ? "idle"
      : available.values().next().value || "idle";
    const frameIds = ids.length
      ? ids
      : Array.isArray(animations[fallbackAction])
        ? animations[fallbackAction]
        : [];

    return {
      action: ids.length ? resolved : fallbackAction,
      frameIds,
      frames,
      sheetSize: atlas?.meta?.size || null,
    };
  }, [atlas, requestedAction]);

  const frameCount = atlasData?.frameIds?.length || 0;

  // Reset frame whenever action changes
  React.useEffect(() => {
    setFrame(0);
  }, [atlasData?.action, requestedAction]);

  React.useEffect(() => {
    if (!frameCount) return;
    const frameId = atlasData.frameIds[frame % frameCount];
    const duration = Math.max(
      60,
      Number(atlasData.frames?.[frameId]?.duration) || 100
    );
    const id = setTimeout(() => {
      setFrame((f) => (f + 1) % frameCount);
    }, duration);
    return () => clearTimeout(id);
  }, [atlasData, frame, frameCount]);

  if (!atlasData || !frameCount || err) {
    const fallback =
      fallbackCandidates[
        Math.min(fallbackIndex, Math.max(0, fallbackCandidates.length - 1))
      ] || null;

    return fallback ? (
      <img
        src={fallback}
        alt=""
        draggable={false}
        className={className}
        onError={() => setFallbackIndex((i) => i + 1)}
        style={{
          width: size,
          height: size,
          maxWidth: "none",
          maxHeight: "none",
          display: "block",
          objectFit: "contain",
          objectPosition: "50% 60%",
          ...style,
        }}
      />
    ) : null;
  }

  const frameId = atlasData.frameIds[frame % frameCount];
  const frameDef = atlasData.frames?.[frameId];
  const rect = frameDef?.frame || { x: 0, y: 0, w: size, h: size };
  const frameW = rect.w || size;
  const frameH = rect.h || size;
  const scale = size / Math.max(frameW, frameH);
  const sheetW = atlasData.sheetSize?.w || frameW;
  const sheetH = atlasData.sheetSize?.h || frameH;

  const containerStyle = {
    width: size,
    height: size,
    backgroundImage: `url("${withBaseUrl(ATLAS_IMAGE_URL)}")`,
    backgroundRepeat: "no-repeat",
    backgroundSize: `${sheetW * scale}px ${sheetH * scale}px`,
    backgroundPosition: `${-rect.x * scale}px ${-rect.y * scale}px`,
    imageRendering: "pixelated",
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
          {atlasData.action}
          {requestedAction !== atlasData.action
            ? ` (req: ${requestedAction})`
            : ""}{" "}
          | frame {clampInt(frame, 0, frameCount - 1) + 1}/{frameCount}
        </div>
      ) : null}
    </div>
  );
}
