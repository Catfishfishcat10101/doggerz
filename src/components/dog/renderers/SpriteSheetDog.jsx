// src/components/dog/renderers/SpriteSheetDog.jsx
// Direct CSS sprite renderer using a fixed 4x4 grid.

import { useEffect, useMemo, useRef, useState } from "react";

import { DOGS } from "@/app/config/assets.js";
import { getDogAnimSpriteUrl, normalizeDogStageShort } from "@/utils/dogSpritePaths.js";
import { getManifestAnimMeta } from "@/components/dog/dogAnimationEngine.js";
import "./SpriteSheetDog.css";

const HARD_TEXTURE_FALLBACK_SRC = DOGS.staticFallback;
const GRID_COLUMNS = 4;
const GRID_ROWS = 4;
const TOTAL_FRAMES = GRID_COLUMNS * GRID_ROWS;
const SPRITE_DEFAULT_FACING = -1;

const SPRITE_ACTION_META = Object.freeze({
  idle: Object.freeze({
    sheetAnim: "idle",
    fallbackAction: "idle_resting",
    currentFrameOffset: 0,
    frameCount: 4,
    fps: 5,
  }),
  walk: Object.freeze({
    sheetAnim: "walk",
    fallbackAction: "walk_right",
    currentFrameOffset: 0,
    frameCount: 8,
    fps: 9,
  }),
  walk_left: Object.freeze({
    sheetAnim: "walk_left",
    fallbackAction: "walk",
    currentFrameOffset: 0,
    frameCount: 8,
    fps: 9,
  }),
  walk_right: Object.freeze({
    sheetAnim: "walk_right",
    fallbackAction: "walk",
    currentFrameOffset: 0,
    frameCount: 8,
    fps: 9,
  }),
  turn_walk_left: Object.freeze({
    sheetAnim: "turn_walk_left",
    fallbackAction: "walk_left",
    currentFrameOffset: 0,
    frameCount: 8,
    fps: 8,
  }),
  turn_walk_right: Object.freeze({
    sheetAnim: "turn_walk_right",
    fallbackAction: "walk_right",
    currentFrameOffset: 0,
    frameCount: 8,
    fps: 8,
  }),
  bark: Object.freeze({
    sheetAnim: "bark",
    fallbackAction: "wag",
    currentFrameOffset: 0,
    frameCount: 4,
    fps: 6,
  }),
  scratch: Object.freeze({
    sheetAnim: "scratch",
    fallbackAction: "sniff",
    currentFrameOffset: 0,
    frameCount: 4,
    fps: 7,
  }),
  sleep: Object.freeze({
    sheetAnim: "sleep",
    fallbackAction: "light_sleep",
    currentFrameOffset: 0,
    frameCount: 4,
    fps: 3,
  }),
  sit: Object.freeze({
    sheetAnim: "sit",
    fallbackAction: "idle",
    currentFrameOffset: 0,
    frameCount: 4,
    fps: 4,
  }),
  wag: Object.freeze({
    sheetAnim: "wag",
    fallbackAction: "idle",
    currentFrameOffset: 0,
    frameCount: 4,
    fps: 6,
  }),
  eat: Object.freeze({
    sheetAnim: "eat",
    fallbackAction: "sniff",
    currentFrameOffset: 0,
    frameCount: 4,
    fps: 5,
  }),
  lay_down: Object.freeze({
    sheetAnim: "lay_down",
    fallbackAction: "idle_resting",
    currentFrameOffset: 0,
    frameCount: 4,
    fps: 4,
  }),
  jump: Object.freeze({
    sheetAnim: "jump",
    fallbackAction: "fetch",
    currentFrameOffset: 0,
    frameCount: 6,
    fps: 8,
  }),
  fetch: Object.freeze({
    sheetAnim: "fetch",
    fallbackAction: "walk",
    currentFrameOffset: 0,
    frameCount: 6,
    fps: 8,
  }),
  beg: Object.freeze({
    sheetAnim: "beg",
    fallbackAction: "sit",
    currentFrameOffset: 0,
    frameCount: 4,
    fps: 5,
  }),
  paw: Object.freeze({
    sheetAnim: "paw",
    fallbackAction: "beg",
    currentFrameOffset: 0,
    frameCount: 4,
    fps: 5,
  }),
  shake: Object.freeze({
    sheetAnim: "shake",
    fallbackAction: "wag",
    currentFrameOffset: 0,
    frameCount: 4,
    fps: 7,
  }),
  highfive: Object.freeze({
    sheetAnim: "highfive",
    fallbackAction: "paw",
    currentFrameOffset: 0,
    frameCount: 4,
    fps: 5,
  }),
  dance: Object.freeze({
    sheetAnim: "dance",
    fallbackAction: "wag",
    currentFrameOffset: 0,
    frameCount: 8,
    fps: 8,
  }),
  gate_watch: Object.freeze({
    sheetAnim: "gate_watch",
    fallbackAction: "idle_resting",
    currentFrameOffset: 0,
    frameCount: 4,
    fps: 4,
  }),
  idle_resting: Object.freeze({
    sheetAnim: "idle_resting",
    fallbackAction: "idle",
    currentFrameOffset: 0,
    frameCount: 4,
    fps: 4,
  }),
  light_sleep: Object.freeze({
    sheetAnim: "light_sleep",
    fallbackAction: "sleep",
    currentFrameOffset: 0,
    frameCount: 4,
    fps: 3,
  }),
  deep_rem_sleep: Object.freeze({
    sheetAnim: "deep_rem_sleep",
    fallbackAction: "light_sleep",
    currentFrameOffset: 0,
    frameCount: 4,
    fps: 3,
  }),
  drink: Object.freeze({
    sheetAnim: "drink",
    fallbackAction: "sniff",
    currentFrameOffset: 0,
    frameCount: 4,
    fps: 5,
  }),
  sniff: Object.freeze({
    sheetAnim: "sniff",
    fallbackAction: "idle",
    currentFrameOffset: 0,
    frameCount: 4,
    fps: 6,
  }),
  lethargic_lay: Object.freeze({
    sheetAnim: "lethargic_lay",
    fallbackAction: "idle_resting",
    currentFrameOffset: 0,
    frameCount: 4,
    fps: 3,
  }),
});

function clamp(n, lo, hi) {
  const x = Number(n);
  if (!Number.isFinite(x)) return lo;
  return Math.max(lo, Math.min(hi, x));
}

function buildFrameSequence(offset = 0, frameCount = 1) {
  const start = clamp(Number(offset || 0), 0, TOTAL_FRAMES - 1);
  const count = clamp(Number(frameCount || 1), 1, TOTAL_FRAMES);
  const lastFrame = Math.min(TOTAL_FRAMES, start + count);
  return Object.freeze(
    Array.from({ length: Math.max(1, lastFrame - start) }, (_, index) => {
      return start + index;
    })
  );
}

function getSheetCandidates(stage, actionMeta) {
  const s = normalizeDogStageShort(stage);
  const fallbackStage = s === "senior" ? "adult" : "pup";
  const primaryAnim = String(actionMeta?.sheetAnim || "idle");
  const fallbackAnim = String(actionMeta?.fallbackAction || "idle");
  const ordered = [
    getDogAnimSpriteUrl(s, primaryAnim),
    fallbackAnim !== primaryAnim ? getDogAnimSpriteUrl(s, fallbackAnim) : null,
    getDogAnimSpriteUrl(fallbackStage, primaryAnim),
    fallbackAnim !== primaryAnim
      ? getDogAnimSpriteUrl(fallbackStage, fallbackAnim)
      : null,
    getDogAnimSpriteUrl(s, "idle"),
    getDogAnimSpriteUrl(fallbackStage, "idle"),
  ];
  const withNoQueryFallbacks = ordered.flatMap((url) => {
    const raw = String(url || "");
    const plain = raw.split("?")[0];
    return plain && plain !== raw ? [raw, plain] : [raw];
  });
  return [...new Set(withNoQueryFallbacks.filter(Boolean))];
}

function loadImageSource(src) {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || typeof Image === "undefined") {
      resolve(String(src || ""));
      return;
    }

    const img = new Image();
    img.onload = () => resolve(String(src || ""));
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = String(src || "");
  });
}

async function loadFirstAvailableImageSource(candidates, fallbackSrc) {
  for (const src of candidates) {
    try {
      const loadedSrc = await loadImageSource(src);
      if (loadedSrc) return loadedSrc;
    } catch (error) {
      console.error("[Doggerz] Failed to load CSS sprite source:", src, error);
    }
  }

  const fallbackPath = String(fallbackSrc || HARD_TEXTURE_FALLBACK_SRC || "");
  if (!fallbackPath) return null;

  try {
    return await loadImageSource(fallbackPath);
  } catch (error) {
    console.error(
      "[Doggerz] Failed to load CSS sprite fallback:",
      fallbackPath,
      error
    );
  }

  return null;
}

function resolveSpriteSheetAction(anim) {
  const key = String(anim || "")
    .trim()
    .toLowerCase();

  if (SPRITE_ACTION_META[key]) return key;
  return "idle";
}

function getFramePosition(frameIndex) {
  const safeIndex = Math.max(0, Math.min(TOTAL_FRAMES - 1, frameIndex));
  const col = safeIndex % GRID_COLUMNS;
  const row = Math.floor(safeIndex / GRID_COLUMNS);
  const x = GRID_COLUMNS === 1 ? 0 : (col / (GRID_COLUMNS - 1)) * 100;
  const y = GRID_ROWS === 1 ? 0 : (row / (GRID_ROWS - 1)) * 100;

  return {
    col,
    row,
    x: `${x}%`,
    y: `${y}%`,
  };
}

export default function SpriteSheetDog({
  stage = "PUPPY",
  condition = "clean",
  anim = "idle",
  facing = 1,
  size = 320,
  reduceMotion = false,
  speedMultiplier = 1,
  smoothing = true,
  fallbackSrc = "/assets/sprites/jr/pup_idle.png",
  className = "",
  onDebug,
}) {
  const animMeta = useMemo(() => getManifestAnimMeta(anim), [anim]);
  const spriteAction = useMemo(
    () => resolveSpriteSheetAction(animMeta.key),
    [animMeta.key]
  );
  const actionMeta = SPRITE_ACTION_META[spriteAction] || SPRITE_ACTION_META.idle;
  const sequence = useMemo(
    () =>
      buildFrameSequence(
        actionMeta.currentFrameOffset,
        actionMeta.frameCount
      ),
    [actionMeta.currentFrameOffset, actionMeta.frameCount]
  );
  const candidates = useMemo(
    () => getSheetCandidates(stage, actionMeta),
    [actionMeta, stage]
  );
  const spriteRef = useRef(null);
  const animationRef = useRef({
    frameIndex: 0,
    lastTick: 0,
    rafId: 0,
  });
  const [activeSrc, setActiveSrc] = useState(null);
  const [sheetFailed, setSheetFailed] = useState(false);

  const boxSize = clamp(size, 64, 1024);
  const effectiveSpeedMultiplier = clamp(speedMultiplier, 0.2, 2);
  const effectiveFps = Math.max(
    1,
    Math.round(Number(actionMeta.fps || 5) * effectiveSpeedMultiplier)
  );
  const displayScale = 1;
  const spriteScale = boxSize / 256;
  const cssFacing = Number(facing) < 0 ? -1 : 1;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setSheetFailed(false);
      setActiveSrc(null);
      const resolvedSrc = await loadFirstAvailableImageSource(candidates, fallbackSrc);
      if (cancelled) return;
      if (!resolvedSrc) {
        setSheetFailed(true);
        return;
      }
      setActiveSrc(resolvedSrc);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [candidates, fallbackSrc]);

  useEffect(() => {
    const node = spriteRef.current;
    if (!node) return undefined;

    const animState = animationRef.current;
    animState.frameIndex = 0;
    animState.lastTick = 0;

    const applyFrame = (sequenceIndex) => {
      const safeSequenceIndex = Math.max(
        0,
        Math.min(sequence.length - 1, Number(sequenceIndex || 0))
      );
      const position = getFramePosition(sequence[safeSequenceIndex] || 0);
      node.style.backgroundPosition = `${position.x} ${position.y}`;
    };

    applyFrame(0);

    if (reduceMotion || sequence.length <= 1) {
      return () => {
        if (animState.rafId) {
          window.cancelAnimationFrame(animState.rafId);
          animState.rafId = 0;
        }
      };
    }

    const msPerFrame = 1000 / Math.max(1, effectiveFps);

    const tick = (timestamp) => {
      if (!animState.lastTick) {
        animState.lastTick = timestamp;
      }

      if (timestamp - animState.lastTick >= msPerFrame) {
        animState.frameIndex = (animState.frameIndex + 1) % sequence.length;
        animState.lastTick = timestamp;
        applyFrame(animState.frameIndex);
      }

      animState.rafId = window.requestAnimationFrame(tick);
    };

    animState.rafId = window.requestAnimationFrame(tick);

    return () => {
      if (animState.rafId) {
        window.cancelAnimationFrame(animState.rafId);
        animState.rafId = 0;
      }
      animState.lastTick = 0;
      animState.frameIndex = 0;
    };
  }, [effectiveFps, reduceMotion, sequence]);

  useEffect(() => {
    if (!onDebug) return;
    onDebug({
      stage,
      condition,
      anim,
      resolvedAnim: animMeta.key,
      spriteAction,
      sheetAnim: actionMeta.sheetAnim,
      currentFrameOffset: actionMeta.currentFrameOffset,
      frames: sequence,
      fps: effectiveFps,
      speedMultiplier: effectiveSpeedMultiplier,
      src: activeSrc,
      fallbackSrc,
      candidateCount: candidates.length,
      sheetLoaded: Boolean(activeSrc) && !sheetFailed,
      sheetFailed,
      renderMode: "css-4x4",
      reduceMotion: Boolean(reduceMotion),
    });
  }, [
    activeSrc,
    anim,
    animMeta.key,
    actionMeta.currentFrameOffset,
    actionMeta.sheetAnim,
    candidates.length,
    condition,
    effectiveFps,
    effectiveSpeedMultiplier,
    fallbackSrc,
    onDebug,
    reduceMotion,
    sequence,
    sheetFailed,
    spriteAction,
    stage,
  ]);

  const spriteUrl = String(activeSrc || fallbackSrc || HARD_TEXTURE_FALLBACK_SRC || "");
  const backgroundImageValue = spriteUrl
    ? `url("${String(spriteUrl).replace(/"/g, '\\"')}")`
    : "none";

  return (
    <div
      className={`dog-sprite-shell ${className}`}
      data-dog-container="true"
      role="img"
      aria-label="Dog"
      style={{
        width: boxSize,
        height: boxSize,
        position: "relative",
        pointerEvents: "none",
      }}
    >
      <div
        ref={spriteRef}
        className="dog-sprite-layer"
        data-dog-sprite="true"
        style={{
          "--dog-grid-columns": String(GRID_COLUMNS),
          "--dog-grid-rows": String(GRID_ROWS),
          "--dog-facing": String(cssFacing * SPRITE_DEFAULT_FACING),
          "--dog-scale": String(displayScale * spriteScale),
          "--dog-image-rendering": smoothing ? "auto" : "pixelated",
          backgroundImage: backgroundImageValue,
        }}
      />
    </div>
  );
}
