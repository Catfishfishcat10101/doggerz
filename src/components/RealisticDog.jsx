// src/components/RealisticDog.jsx
// @ts-nocheck

import * as React from "react";
import { withBaseUrl } from "@/utils/assetUrl.js";

const STAGE_DIRS = Object.freeze({
  pup: "/assets/loose",
  adult: "/assets/loose/adult",
  senior: "/assets/loose/senior",
});

const SHEET_DEFS = Object.freeze({
  idle: {
    file: "idle.png",
    sheetW: 609,
    sheetH: 1001,
    cols: 7,
    rows: 11,
    frames: 77,
    fps: 10,
  },
  excited: {
    file: "excited.png",
    sheetW: 1070,
    sheetH: 1520,
    cols: 5,
    rows: 5,
    frames: 25,
    fps: 12,
  },
  sleep: {
    file: "sleep.png",
    sheetW: 1405,
    sheetH: 1535,
    cols: 5,
    rows: 5,
    frames: 25,
    fps: 8,
  },
  walk_left: {
    file: "walk-left.png",
    sheetW: 680,
    sheetH: 540,
    cols: 5,
    rows: 5,
    frames: 25,
    fps: 12,
  },
  walk_left_alt: {
    file: "walk-left-2.png",
    sheetW: 745,
    sheetH: 625,
    cols: 5,
    rows: 5,
    frames: 25,
    fps: 12,
  },
  turn_walk_right: {
    file: "turn-walk-right.png",
    sheetW: 695,
    sheetH: 525,
    cols: 5,
    rows: 5,
    frames: 25,
    fps: 12,
  },
  run_right: {
    file: "run-right.png",
    sheetW: 1024,
    sheetH: 1024,
    cols: 4,
    rows: 4,
    frames: 16,
    fps: 14,
  },
  walk_right_jump: {
    file: "walk-right-jump.png",
    sheetW: 775,
    sheetH: 805,
    cols: 5,
    rows: 5,
    frames: 25,
    fps: 12,
  },
  front_flip: {
    file: "front-flip.png",
    sheetW: 1845,
    sheetH: 1795,
    cols: 5,
    rows: 5,
    frames: 25,
    fps: 12,
  },
});

const ANIM_ALIASES = Object.freeze({
  wag: "excited",
  bark: "excited",
  eat: "excited",
  happy: "excited",
  nap: "sleep",
  rest: "sleep",
  trick: "front_flip",
  flip: "front_flip",
  jump: "walk_right_jump",
  scratch: "idle",
});

const CONDITION_PREFIXES = ["stray_", "tired_"];

const imageCache = new Map();

function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_");
}

function normalizeStage(stage) {
  const s = String(stage || "pup")
    .trim()
    .toLowerCase();
  if (s.startsWith("adult")) return "adult";
  if (s.startsWith("sen")) return "senior";
  return "pup";
}

function stripConditionPrefix(key) {
  for (const prefix of CONDITION_PREFIXES) {
    if (key.startsWith(prefix)) return key.slice(prefix.length);
  }
  return key;
}

function resolveSheetKey(anim, energy) {
  const base = stripConditionPrefix(normalizeKey(anim));
  const alias = ANIM_ALIASES[base] || base;

  if (alias === "turn_walk_right") return "turn_walk_right";
  if (alias === "front_flip") return "front_flip";
  if (alias === "walk_right_jump") return "walk_right_jump";

  if (alias === "walk" || alias === "walk_left" || alias === "walk_right") {
    const e = Number(energy ?? 50);
    if (Number.isFinite(e) && e >= 82) return "run_right";
    if (Number.isFinite(e) && e <= 35) return "walk_left_alt";
    return "walk_left";
  }

  if (alias === "run" || alias === "run_right") return "run_right";

  if (alias === "sleep") return "sleep";
  if (alias === "excited") return "excited";

  return SHEET_DEFS[alias] ? alias : "idle";
}

function buildSheet(stageKey, def) {
  const dir = STAGE_DIRS[stageKey] || STAGE_DIRS.pup;
  const primary = withBaseUrl(`${dir}/${def.file}`);
  const fallback = withBaseUrl(`${STAGE_DIRS.pup}/${def.file}`);
  return {
    ...def,
    src: primary,
    fallbackSrc: fallback,
  };
}

function getSheet(stageKey, key) {
  const def = SHEET_DEFS[key] || SHEET_DEFS.idle;
  return buildSheet(stageKey, def);
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

function useAnimatedFrame({ frames, fps, playing }) {
  const [frame, setFrame] = React.useState(0);
  const frameRef = React.useRef(0);

  React.useEffect(() => {
    frameRef.current = 0;
    setFrame(0);
  }, [frames, fps, playing]);

  React.useEffect(() => {
    if (!playing || !frames || frames <= 1 || !fps) return;
    const interval = Math.max(40, Math.round(1000 / fps));
    const id = window.setInterval(() => {
      frameRef.current = (frameRef.current + 1) % frames;
      setFrame(frameRef.current);
    }, interval);
    return () => window.clearInterval(id);
  }, [frames, fps, playing]);

  return frame;
}

export default function RealisticDog({
  anim = "idle",
  stage = "pup",
  facing = 1,
  size = 320,
  reduceMotion = false,
  energy = null,
  className = "",
  onDebug,
}) {
  const stageKey = normalizeStage(stage);
  const sheetKey = resolveSheetKey(anim, energy);
  const sheet = React.useMemo(
    () => getSheet(stageKey, sheetKey),
    [stageKey, sheetKey]
  );
  const frameCount = sheet.frames || sheet.cols * sheet.rows;

  const frame = useAnimatedFrame({
    frames: frameCount,
    fps: sheet.fps,
    playing: !reduceMotion,
  });

  const [imgSize, setImgSize] = React.useState({
    width: sheet.sheetW,
    height: sheet.sheetH,
  });

  const sheetW = imgSize?.width || sheet.sheetW;
  const sheetH = imgSize?.height || sheet.sheetH;
  const cellW = sheetW / sheet.cols;
  const cellH = sheetH / sheet.rows;
  const targetHeight =
    Number.isFinite(Number(size)) && Number(size) > 0 ? Number(size) : 320;
  const scale = targetHeight / cellH;

  const displayW = Math.round(cellW * scale);
  const displayH = Math.round(cellH * scale);
  const bgW = Math.round(sheetW * scale);
  const bgH = Math.round(sheetH * scale);
  const col = frame % sheet.cols;
  const row = Math.floor(frame / sheet.cols);
  const bgX = Math.round(col * cellW * scale);
  const bgY = Math.round(row * cellH * scale);

  const flip = facing < 0 ? -1 : 1;

  const [ready, setReady] = React.useState(true);
  const [imgSrc, setImgSrc] = React.useState(sheet.src);
  React.useEffect(() => {
    let cancelled = false;
    setReady(true);
    setImgSrc(sheet.src);
    setImgSize({ width: sheet.sheetW, height: sheet.sheetH });
    loadImage(sheet.src)
      .then((entry) => {
        if (!cancelled) {
          setImgSize({
            width: entry?.width || sheet.sheetW,
            height: entry?.height || sheet.sheetH,
          });
          setReady(true);
        }
      })
      .catch(() => {
        if (cancelled) return;
        if (sheet.fallbackSrc && sheet.fallbackSrc !== sheet.src) {
          loadImage(sheet.fallbackSrc)
            .then((entry) => {
              if (!cancelled) {
                setImgSrc(sheet.fallbackSrc);
                setImgSize({
                  width: entry?.width || sheet.sheetW,
                  height: entry?.height || sheet.sheetH,
                });
                setReady(true);
              }
            })
            .catch(() => {
              if (!cancelled) setReady(false);
            });
          return;
        }
        setReady(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sheet.src, sheet.fallbackSrc, sheet.sheetH, sheet.sheetW]);

  React.useEffect(() => {
    if (typeof onDebug !== "function") return;
    onDebug({
      anim,
      resolved: sheetKey,
      frame,
      frames: frameCount,
    });
  }, [anim, sheetKey, frame, frameCount, onDebug]);

  return (
    <div
      className={`dog-realistic-root relative ${className}`.trim()}
      style={{
        width: displayW,
        height: displayH,
        transform: `scaleX(${flip})`,
        transformOrigin: "center",
      }}
    >
      <div
        className="dog-shadow absolute left-1/2 bottom-[6%]"
        aria-hidden="true"
      />
      <div
        className="dog-realistic-img"
        aria-hidden="true"
        style={{
          width: displayW,
          height: displayH,
          backgroundImage: ready ? `url('${imgSrc}')` : "none",
          backgroundRepeat: "no-repeat",
          backgroundSize: `${bgW}px ${bgH}px`,
          backgroundPosition: `-${bgX}px -${bgY}px`,
        }}
      />
    </div>
  );
}
