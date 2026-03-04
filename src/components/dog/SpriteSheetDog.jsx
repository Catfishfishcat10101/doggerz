// src/components/dog/SpriteSheetDog.jsx
// Lightweight sprite-strip renderer with resilient fallback chain.

import { useEffect, useMemo, useRef, useState } from "react";

import jrManifest from "@/components/dog/jrManifest.json";
import {
  getDogAnimSpriteUrl,
  getDogPixiSheetUrl,
  normalizeDogConditionId,
  normalizeDogStageShort,
} from "@/utils/dogSpritePaths.js";

const DEFAULT_COLUMNS = Math.max(1, Number(jrManifest?.columns || 8));
const DEFAULT_ANIM = String(jrManifest?.defaultAnim || "idle").toLowerCase();
const DEFAULT_FPS = Math.max(1, Number(jrManifest?.defaultFps || 8));
const ANIM_ROWS = Array.isArray(jrManifest?.rows) ? jrManifest.rows : [];
const ANIM_ALIASES =
  jrManifest?.aliases && typeof jrManifest.aliases === "object"
    ? jrManifest.aliases
    : {};
const DEFAULT_FRAME = jrManifest?.frame || {};
const DEFAULT_FRAME_WIDTH = Math.max(1, Number(DEFAULT_FRAME.width || 128));
const DEFAULT_FRAME_HEIGHT = Math.max(1, Number(DEFAULT_FRAME.height || 128));

function clamp(n, lo, hi) {
  const x = Number(n);
  if (!Number.isFinite(x)) return lo;
  return Math.max(lo, Math.min(hi, x));
}

function normalizeAnim(anim) {
  const key = String(anim || DEFAULT_ANIM)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_");

  if (!key) return DEFAULT_ANIM;

  const rowHit = ANIM_ROWS.find(
    (row) =>
      String(row?.anim || "")
        .trim()
        .toLowerCase() === key
  );
  if (rowHit) return key;

  const alias = String(ANIM_ALIASES[key] || "")
    .trim()
    .toLowerCase();
  if (!alias) return DEFAULT_ANIM;

  const aliasHit = ANIM_ROWS.find(
    (row) =>
      String(row?.anim || "")
        .trim()
        .toLowerCase() === alias
  );
  return aliasHit ? alias : DEFAULT_ANIM;
}

function getAnimMeta(anim) {
  const key = normalizeAnim(anim);
  const rowIndex = Math.max(
    0,
    ANIM_ROWS.findIndex(
      (row) =>
        String(row?.anim || "")
          .trim()
          .toLowerCase() === key
    )
  );
  const row = ANIM_ROWS[rowIndex] || null;
  const frames = Math.max(1, Number(row?.frames || DEFAULT_COLUMNS));
  const columns = Math.max(1, Number(row?.columns || DEFAULT_COLUMNS));
  const fps = Math.max(1, Number(row?.fps || DEFAULT_FPS));
  return { key, rowIndex, frames, columns, fps };
}

function getSheetCandidates(stage, condition, anim) {
  const s = normalizeDogStageShort(stage);
  const c = normalizeDogConditionId(condition);
  const animSpecific = getDogAnimSpriteUrl(s, anim);
  const requested = getDogPixiSheetUrl(s, c);
  const cleanSameStage = getDogPixiSheetUrl(s, "clean");
  const cleanPup = getDogPixiSheetUrl("pup", "clean");

  return [...new Set([animSpecific, requested, cleanSameStage, cleanPup])];
}

export default function SpriteSheetDog({
  stage = "PUPPY",
  condition = "clean",
  anim = "idle",
  facing = 1,
  size = 320,
  reduceMotion = false,
  speedMultiplier = 1,
  fallbackSrc = "/assets/sprites/jr/pup_clean.png",
  className = "",
  onDebug,
}) {
  const animMeta = useMemo(() => getAnimMeta(anim), [anim]);
  const candidates = useMemo(
    () => getSheetCandidates(stage, condition, animMeta.key),
    [animMeta.key, condition, stage]
  );

  const [sourceIndex, setSourceIndex] = useState(0);
  const [sheetLoaded, setSheetLoaded] = useState(false);
  const [sheetFailed, setSheetFailed] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);
  const [sheetMeta, setSheetMeta] = useState(null);

  const rafRef = useRef(0);
  const frameStartRef = useRef(0);

  const currentSrc = candidates[sourceIndex] || null;
  const totalRows = Math.max(1, ANIM_ROWS.length || 1);
  const boxSize = clamp(size, 64, 1024);
  const effectiveSpeedMultiplier = clamp(speedMultiplier, 0.2, 2);
  const effectiveFps = Math.max(1, animMeta.fps * effectiveSpeedMultiplier);
  const msPerFrame = Math.max(16, Math.round(1000 / effectiveFps));

  useEffect(() => {
    setSourceIndex(0);
    setSheetLoaded(false);
    setSheetFailed(false);
    setFrameIndex(0);
    setSheetMeta(null);
  }, [stage, condition]);

  useEffect(() => {
    setFrameIndex(0);
  }, [animMeta.key]);

  useEffect(() => {
    if (!sheetLoaded || reduceMotion || animMeta.frames <= 1) return undefined;

    const tick = (ts) => {
      if (!frameStartRef.current) frameStartRef.current = ts;
      const elapsed = ts - frameStartRef.current;
      if (elapsed >= msPerFrame) {
        frameStartRef.current = ts;
        setFrameIndex((prev) => (prev + 1) % animMeta.frames);
      }
      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      frameStartRef.current = 0;
    };
  }, [animMeta.frames, msPerFrame, reduceMotion, sheetLoaded]);

  useEffect(() => {
    if (!onDebug) return;
    onDebug({
      stage,
      condition,
      anim,
      resolvedAnim: animMeta.key,
      row: animMeta.rowIndex,
      frame: frameIndex,
      frames: animMeta.frames,
      fps: animMeta.fps,
      effectiveFps,
      speedMultiplier: effectiveSpeedMultiplier,
      src: currentSrc,
      fallbackSrc,
      candidateCount: candidates.length,
      sourceIndex,
      sheetLoaded,
      sheetFailed,
      reduceMotion: Boolean(reduceMotion),
    });
  }, [
    anim,
    animMeta.fps,
    animMeta.frames,
    animMeta.key,
    animMeta.rowIndex,
    candidates.length,
    condition,
    currentSrc,
    fallbackSrc,
    frameIndex,
    onDebug,
    reduceMotion,
    sheetFailed,
    sheetLoaded,
    sourceIndex,
    effectiveFps,
    effectiveSpeedMultiplier,
    stage,
  ]);

  const wrapperStyle = {
    width: boxSize,
    height: boxSize,
    transform: Number(facing) < 0 ? "scaleX(-1)" : undefined,
    transformOrigin: "center",
  };

  if (!currentSrc || sheetFailed) {
    return (
      <img
        src={fallbackSrc}
        alt="Dog"
        width={boxSize}
        height={boxSize}
        className={className}
        style={{
          ...wrapperStyle,
          objectFit: "contain",
          imageRendering: "auto",
        }}
      />
    );
  }

  const handleSheetLoad = (event) => {
    setSheetLoaded(true);
    setSheetFailed(false);
    const img = event?.currentTarget;
    if (img && img.naturalWidth && img.naturalHeight) {
      const columns = Math.max(
        1,
        Math.round(img.naturalWidth / DEFAULT_FRAME_WIDTH)
      );
      const rows = Math.max(
        1,
        Math.round(img.naturalHeight / DEFAULT_FRAME_HEIGHT)
      );
      setSheetMeta({ columns, rows });
    } else {
      setSheetMeta(null);
    }
  };

  const handleSheetError = () => {
    if (sourceIndex < candidates.length - 1) {
      setSourceIndex((i) => i + 1);
      return;
    }
    setSheetLoaded(false);
    setSheetFailed(true);
  };

  const effectiveColumns =
    animMeta.columns || sheetMeta?.columns || DEFAULT_COLUMNS;
  const isAnimSpecific = Boolean(
    currentSrc && currentSrc === getDogAnimSpriteUrl(stage, animMeta.key)
  );
  const effectiveRows = isAnimSpecific
    ? Math.max(1, Math.ceil(animMeta.frames / effectiveColumns))
    : sheetMeta?.rows || totalRows;
  const bgSizeX = effectiveColumns * boxSize;
  const bgSizeY = effectiveRows * boxSize;
  const frameCol = frameIndex % effectiveColumns;
  const frameRowOffset = Math.floor(frameIndex / effectiveColumns);
  const posX = -frameCol * boxSize;
  const posY = isAnimSpecific
    ? -frameRowOffset * boxSize
    : -(animMeta.rowIndex + frameRowOffset) * boxSize;

  return (
    <div className={className} style={wrapperStyle}>
      <img
        src={currentSrc}
        alt=""
        aria-hidden="true"
        className="hidden"
        onLoad={handleSheetLoad}
        onError={handleSheetError}
      />

      {sheetLoaded ? (
        <div
          role="img"
          aria-label="Dog"
          style={{
            width: "100%",
            height: "100%",
            backgroundImage: `url("${currentSrc}")`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${bgSizeX}px ${bgSizeY}px`,
            backgroundPosition: `${posX}px ${posY}px`,
            imageRendering: "auto",
          }}
        />
      ) : (
        <img
          src={fallbackSrc}
          alt="Dog"
          width={boxSize}
          height={boxSize}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      )}
    </div>
  );
}
