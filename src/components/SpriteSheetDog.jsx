// src/components/SpriteSheetDog.jsx
// @ts-nocheck

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";

import { withBaseUrl } from "@/utils/assetUrl.js";
import {
  getDogPixiSheetUrl,
  normalizeDogCondition,
} from "@/utils/dogSpritePaths.js";
import {
  selectSettings,
  setSpriteSheetMotion,
  setSpriteSheetSize,
  setSpriteSheetUsePixelated,
} from "@/redux/settingsSlice.js";
import jrManifest from "@/features/game/jrManifest.json";

const FRAME_W = Number(jrManifest?.frame?.width || 128);
const FRAME_H = Number(jrManifest?.frame?.height || 128);
const DEFAULT_ANIM = String(jrManifest?.defaultAnim || "idle");
const DEFAULT_FPS = Number(jrManifest?.defaultFps || 8);
const COLUMNS = Math.max(1, Math.round(Number(jrManifest?.columns || 12)));

const ROW_BY_ANIM = Object.create(null);
const FRAMES_BY_ANIM = Object.create(null);
const FPS_BY_ANIM = Object.create(null);
const ALIASES =
  jrManifest?.aliases && typeof jrManifest.aliases === "object"
    ? jrManifest.aliases
    : {};

if (Array.isArray(jrManifest?.rows)) {
  jrManifest.rows.forEach((row, index) => {
    if (!row?.anim) return;
    const key = String(row.anim).trim().toLowerCase();
    if (!key) return;
    ROW_BY_ANIM[key] = index;
    const frames = Number(row.frames || 0);
    FRAMES_BY_ANIM[key] = frames > 0 ? frames : COLUMNS || 1;
    const fps = Number(row.fps || 0);
    FPS_BY_ANIM[key] = fps > 0 ? fps : DEFAULT_FPS;
  });
}

const imageCache = new Map();

function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_");
}

function normalizeStage(stage) {
  const s = String(stage || "PUPPY")
    .trim()
    .toUpperCase();
  if (s.startsWith("ADULT")) return "adult";
  if (s.startsWith("SEN")) return "senior";
  return "pup";
}

function resolveAnim(requested) {
  const key = normalizeKey(requested);
  if (Object.prototype.hasOwnProperty.call(ROW_BY_ANIM, key)) return key;
  const alias = normalizeKey(ALIASES[key]);
  if (alias && Object.prototype.hasOwnProperty.call(ROW_BY_ANIM, alias)) {
    return alias;
  }
  if (Object.prototype.hasOwnProperty.call(ROW_BY_ANIM, DEFAULT_ANIM)) {
    return DEFAULT_ANIM;
  }
  return key || DEFAULT_ANIM;
}

function loadImage(src) {
  if (!src) return Promise.reject(new Error("Missing image src"));
  const cached = imageCache.get(src);
  if (cached?.status === "loaded") return Promise.resolve(cached);
  if (cached?.promise) return cached.promise;

  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  const img = new Image();
  img.onload = () => {
    const entry = {
      status: "loaded",
      width: img.naturalWidth || 0,
      height: img.naturalHeight || 0,
    };
    imageCache.set(src, entry);
    resolve(entry);
  };
  img.onerror = (err) => {
    imageCache.set(src, { status: "error" });
    reject(err);
  };
  img.src = src;

  imageCache.set(src, { status: "loading", promise });
  return promise;
}

export default function SpriteSheetDog({
  stage = "PUPPY",
  condition = "clean",
  anim = "idle",
  facing = 1,
  size = 320,
  reduceMotion = false,
  fallbackSrc,
  className = "",
  onDebug,
}) {
  const dispatch = useDispatch();
  const settings = useSelector(selectSettings);
  const [showOptions, setShowOptions] = React.useState(false);
  const menuRef = React.useRef(null);

  const reduceMotionSetting = settings?.reduceMotion || "system";
  const prefersReducedMotion = React.useMemo(() => {
    try {
      return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    } catch {
      return false;
    }
  }, []);
  const systemReduceMotion =
    reduceMotionSetting === "on" ||
    (reduceMotionSetting !== "off" && prefersReducedMotion);

  const motionEnabled =
    settings?.spriteSheetMotion !== false && !systemReduceMotion;
  const pixelated = Boolean(settings?.spriteSheetUsePixelated);
  const sizeSetting = settings?.spriteSheetSize || "normal";
  const sizeMultiplier =
    sizeSetting === "small" ? 0.85 : sizeSetting === "large" ? 1.15 : 1;

  const stageKey = normalizeStage(stage);
  const conditionKey = normalizeDogCondition(condition);
  const sheetSrc = getDogPixiSheetUrl(stageKey, conditionKey);

  const effectiveFallbackSrc = React.useMemo(() => {
    const candidates = [];
    if (fallbackSrc) candidates.push(String(fallbackSrc));
    candidates.push(withBaseUrl(`/sprites/jack_russell_${stageKey}.webp`));
    candidates.push(withBaseUrl("/sprites/jack_russell_puppy.webp"));
    return candidates.filter(Boolean);
  }, [fallbackSrc, stageKey]);

  const [fallbackIndex, setFallbackIndex] = React.useState(0);
  const [sheetLoaded, setSheetLoaded] = React.useState(false);
  const [sheetFailed, setSheetFailed] = React.useState(false);
  const [sheetSize, setSheetSize] = React.useState(null);
  const [frameIndex, setFrameIndex] = React.useState(0);

  React.useEffect(() => {
    let alive = true;
    setSheetLoaded(false);
    setSheetFailed(false);
    setSheetSize(null);

    loadImage(sheetSrc)
      .then((entry) => {
        if (!alive) return;
        setSheetLoaded(true);
        setSheetSize({ width: entry.width, height: entry.height });
      })
      .catch(() => {
        if (!alive) return;
        setSheetFailed(true);
      });

    return () => {
      alive = false;
    };
  }, [sheetSrc]);

  const resolvedAnim = React.useMemo(() => resolveAnim(anim), [anim]);

  const frames = React.useMemo(() => {
    const rowIndex =
      typeof ROW_BY_ANIM[resolvedAnim] === "number"
        ? ROW_BY_ANIM[resolvedAnim]
        : 0;
    const frameCount = Math.max(1, FRAMES_BY_ANIM[resolvedAnim] || COLUMNS);
    const fps = Math.max(1, FPS_BY_ANIM[resolvedAnim] || DEFAULT_FPS);
    const duration = Math.max(50, Math.round(1000 / fps));

    const list = [];
    for (let col = 0; col < frameCount; col++) {
      list.push({
        x: col * FRAME_W,
        y: rowIndex * FRAME_H,
        w: FRAME_W,
        h: FRAME_H,
        duration,
      });
    }
    return list;
  }, [resolvedAnim]);

  const avgDuration = React.useMemo(() => {
    if (!frames.length) return 120;
    const total = frames.reduce(
      (sum, f) => sum + (Number(f.duration) || 120),
      0
    );
    return Math.max(40, Math.round(total / frames.length));
  }, [frames]);

  const fps = Math.round(1000 / Math.max(1, avgDuration));

  React.useEffect(() => {
    setFrameIndex(0);
  }, [resolvedAnim, frames.length]);

  React.useEffect(() => {
    const motion = motionEnabled && !reduceMotion;
    if (!motion || frames.length <= 1 || !sheetLoaded) {
      setFrameIndex(0);
      return undefined;
    }
    const id = window.setInterval(() => {
      setFrameIndex((f) => (f + 1) % frames.length);
    }, avgDuration);
    return () => window.clearInterval(id);
  }, [avgDuration, frames.length, motionEnabled, reduceMotion, sheetLoaded]);

  const frame = frames[Math.min(frameIndex, Math.max(0, frames.length - 1))];

  const frameW = Number(frame?.w || 0);
  const safeSize = (Number(size) || 320) * sizeMultiplier;
  const scale = frameW > 0 ? Math.max(0.01, safeSize / frameW) : 1;

  const sheetW = Number(sheetSize?.width || 0);
  const sheetH = Number(sheetSize?.height || 0);

  const canRenderSprite =
    !!frame &&
    !!sheetSrc &&
    sheetLoaded &&
    !sheetFailed &&
    Number.isFinite(frameW) &&
    frameW > 0 &&
    sheetW > 0 &&
    sheetH > 0;

  React.useEffect(() => {
    if (typeof onDebug !== "function") return;
    onDebug({
      stage: stageKey,
      condition: conditionKey,
      requestedAnim: anim,
      resolvedAnim,
      sheetSrc,
      sheetLoaded,
      sheetFailed,
      frames: frames.length,
      fps,
      frameIndex,
      effectiveFallbackSrc: effectiveFallbackSrc[fallbackIndex] || null,
    });
  }, [
    anim,
    conditionKey,
    effectiveFallbackSrc,
    fallbackIndex,
    fps,
    frameIndex,
    frames.length,
    onDebug,
    resolvedAnim,
    sheetFailed,
    sheetLoaded,
    sheetSrc,
    stageKey,
  ]);

  if (!canRenderSprite) {
    const src =
      effectiveFallbackSrc[
        Math.min(fallbackIndex, effectiveFallbackSrc.length - 1)
      ];
    return src ? (
      <div className="group relative" style={{ width: safeSize, height: safeSize }}>
        <img
          src={src}
          alt=""
          draggable={false}
          className={className}
          onError={() => {
            setFallbackIndex((i) => i + 1);
          }}
          style={{
            width: safeSize,
            height: safeSize,
            maxWidth: "none",
            maxHeight: "none",
            display: "block",
            objectFit: "contain",
            objectPosition: "50% 60%",
            transform: `scaleX(${facing})`,
            transformOrigin: "50% 100%",
            imageRendering: pixelated ? "pixelated" : "auto",
          }}
        />
        <SpriteOptions
          show={showOptions}
          setShow={setShowOptions}
          menuRef={menuRef}
          pixelated={pixelated}
          motionEnabled={motionEnabled}
          sizeSetting={sizeSetting}
          dispatch={dispatch}
        />
      </div>
    ) : null;
  }

  const backgroundSize = `${sheetW * scale}px ${sheetH * scale}px`;
  const backgroundPosition = `${-frame.x * scale}px ${-frame.y * scale}px`;

  return (
    <div className="group relative" style={{ width: safeSize, height: safeSize }}>
      <div
        className={className}
        style={{
          width: safeSize,
          height: safeSize,
          backgroundImage: `url("${sheetSrc}")`,
          backgroundRepeat: "no-repeat",
          backgroundSize,
          backgroundPosition,
          imageRendering: pixelated ? "pixelated" : "auto",
          transform: `scaleX(${facing})`,
          transformOrigin: "50% 100%",
          willChange:
            reduceMotion || !motionEnabled ? "auto" : "background-position",
        }}
      />
      <SpriteOptions
        show={showOptions}
        setShow={setShowOptions}
        menuRef={menuRef}
        pixelated={pixelated}
        motionEnabled={motionEnabled}
        sizeSetting={sizeSetting}
        dispatch={dispatch}
      />
    </div>
  );
}

function SpriteOptions({
  show,
  setShow,
  menuRef,
  pixelated,
  motionEnabled,
  sizeSetting,
  dispatch,
}) {
  React.useEffect(() => {
    if (!show) return;
    const onPointerDown = (event) => {
      const el = menuRef?.current;
      if (!el || el.contains(event.target)) return;
      setShow(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setShow(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuRef, setShow, show]);

  return (
    <div className="absolute right-2 top-2" ref={menuRef}>
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="rounded-full border border-white/10 bg-black/50 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/70 opacity-0 transition group-hover:opacity-100"
      >
        View
      </button>
      {show ? (
        <div className="absolute right-0 mt-2 w-56 space-y-2 rounded-2xl border border-white/10 bg-black/90 p-3 text-[11px] text-zinc-200 shadow-[0_16px_45px_rgba(0,0,0,0.45)]">
          <ToggleRow
            label="Animate"
            checked={motionEnabled}
            onChange={(v) => dispatch(setSpriteSheetMotion(v))}
          />
          <ToggleRow
            label="Pixelated"
            checked={pixelated}
            onChange={(v) => dispatch(setSpriteSheetUsePixelated(v))}
          />
          <div className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <span>Size</span>
            <select
              value={sizeSetting}
              onChange={(e) => dispatch(setSpriteSheetSize(e.target.value))}
              className="rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-[11px] text-zinc-200"
            >
              <option value="small">Small</option>
              <option value="normal">Normal</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(Boolean(e.target.checked))}
        className="h-4 w-4 accent-emerald-400"
      />
    </label>
  );
}
