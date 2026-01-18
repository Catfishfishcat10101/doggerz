// src/components/SpriteSheetDog.jsx
// @ts-nocheck

import * as React from "react";

import { withBaseUrl } from "@/utils/assetUrl.js";

const DEFAULT_ANIM = "idle";
const DEFAULT_FRAME_DURATION = 120;

const STAGE_MANIFESTS = Object.freeze({
  PUPPY: "/sprites/puppy/jrt_puppy_placeholder_sheet.json",
  ADULT: "/sprites/puppy/jrt_puppy_placeholder_sheet.json",
  SENIOR: "/sprites/puppy/jrt_puppy_placeholder_sheet.json",
});

const ANIM_ALIASES = Object.freeze({
  rest: "lay",
  lay: "lay",
  sleep: "sleep",
  sleepy: "sleep",
  eat: "eat",
  drink: "eat",
  wag: "wag",
  bark: "bark",
  howl: "howl",
  whine: "whine",
  look: "look",
  sniff: "look",
  walk: "chase",
  run: "chase",
  play: "chase",
  fetch: "chase",
  chase: "chase",
  zoomies: "chase",
  potty: "look",
  poop: "look",
  pee: "look",
  scratch: "wag",
  shake: "wag",
  lick: "wag",
  pant: "wag",
  yawn: "tired",
  stretch: "tired",
  tired: "tired",
  hungry: "hungry",
  sad: "sad",
  mad: "mad",
  scared: "scared",
  celebrate: "wag",
  beg: "sit",
  bow: "sit",
  sit: "sit",
  stay: "sit",
  sit_pretty: "sit",
  play_dead: "lay",
  playdead: "lay",
  roll: "wag",
  rollover: "wag",
  roll_over: "wag",
  spin: "chase",
  jump: "chase",
  paw: "sit",
  surprised: "look",
});

const manifestCache = new Map();
const imageCache = new Map();

function normalizeStage(stage) {
  const s = String(stage || "PUPPY")
    .trim()
    .toUpperCase();
  if (s.startsWith("ADULT")) return "ADULT";
  if (s.startsWith("SEN")) return "SENIOR";
  return "PUPPY";
}

function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_");
}

function resolveAnim(requested, available) {
  const key = normalizeKey(requested);
  if (available && available.has(key)) return key;
  const alias = ANIM_ALIASES[key];
  if (alias && available && available.has(alias)) return alias;
  if (available && available.has(DEFAULT_ANIM)) return DEFAULT_ANIM;
  return key || DEFAULT_ANIM;
}

function resolveSheetSrc(manifest, manifestUrl) {
  const raw = String(manifest?.meta?.image || "").trim();
  if (!raw) return null;
  if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(raw)) return raw;

  const base = String(manifestUrl || "");
  const stripped = base.split("?")[0].split("#")[0];
  const idx = stripped.lastIndexOf("/");
  const dir = idx >= 0 ? stripped.slice(0, idx) : "";
  const file = raw.replace(/^\/+/, "");
  if (dir) return `${dir}/${file}`;
  return withBaseUrl(file);
}

async function loadManifest(url) {
  if (!url) throw new Error("Missing manifest url");
  const cached = manifestCache.get(url);
  if (cached?.data) return cached.data;
  if (cached?.promise) return cached.promise;

  const promise = fetch(url, { cache: "no-store" })
    .then((res) => {
      if (!res.ok) throw new Error(`Manifest load failed: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      manifestCache.set(url, { data });
      return data;
    })
    .catch((err) => {
      manifestCache.delete(url);
      throw err;
    });

  manifestCache.set(url, { promise });
  return promise;
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
  anim = "idle",
  facing = 1,
  size = 320,
  reduceMotion = false,
  fallbackSrc,
  className = "",
  onDebug,
}) {
  const [fallbackIndex, setFallbackIndex] = React.useState(0);
  const [manifest, setManifest] = React.useState(null);
  const [manifestErr, setManifestErr] = React.useState(null);
  const [sheetLoaded, setSheetLoaded] = React.useState(false);
  const [sheetFailed, setSheetFailed] = React.useState(false);
  const [sheetSize, setSheetSize] = React.useState(null);
  const [frameIndex, setFrameIndex] = React.useState(0);

  const stageId = normalizeStage(stage);
  const manifestUrl = withBaseUrl(
    STAGE_MANIFESTS[stageId] || STAGE_MANIFESTS.PUPPY
  );

  const fallbackCandidates = React.useMemo(() => {
    const src = String(fallbackSrc || "").trim();
    const out = src ? [src] : [];
    out.push(withBaseUrl("/icons/doggerz-192.png"));
    return out;
  }, [fallbackSrc]);

  const effectiveFallbackSrc =
    fallbackCandidates[
      Math.min(fallbackIndex, Math.max(0, fallbackCandidates.length - 1))
    ] || null;

  React.useEffect(() => {
    let alive = true;
    setManifest(null);
    setManifestErr(null);
    loadManifest(manifestUrl)
      .then((data) => {
        if (alive) setManifest(data);
      })
      .catch((err) => {
        if (alive) setManifestErr(err);
      });

    return () => {
      alive = false;
    };
  }, [manifestUrl]);

  const sheetSrc = React.useMemo(
    () => (manifest ? resolveSheetSrc(manifest, manifestUrl) : null),
    [manifest, manifestUrl]
  );

  React.useEffect(() => {
    let alive = true;
    setSheetLoaded(false);
    setSheetFailed(false);
    setSheetSize(null);

    if (!sheetSrc) return undefined;

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

  const availableAnims = React.useMemo(() => {
    const keys =
      manifest?.animations && typeof manifest.animations === "object"
        ? Object.keys(manifest.animations)
        : [];
    return new Set(keys);
  }, [manifest]);

  const resolvedAnim = React.useMemo(
    () => resolveAnim(anim, availableAnims),
    [anim, availableAnims]
  );

  const frames = React.useMemo(() => {
    if (!manifest?.animations || !resolvedAnim) return [];
    const keys = Array.isArray(manifest.animations[resolvedAnim])
      ? manifest.animations[resolvedAnim]
      : [];
    const list = [];
    for (const key of keys) {
      const def = manifest.frames?.[key];
      if (!def?.frame) continue;
      list.push({
        name: key,
        x: def.frame.x,
        y: def.frame.y,
        w: def.frame.w,
        h: def.frame.h,
        duration:
          Number(def.duration) > 0
            ? Number(def.duration)
            : DEFAULT_FRAME_DURATION,
      });
    }
    return list;
  }, [manifest, resolvedAnim]);

  const avgDuration = React.useMemo(() => {
    if (!frames.length) return DEFAULT_FRAME_DURATION;
    const total = frames.reduce(
      (sum, frame) => sum + (Number(frame.duration) || DEFAULT_FRAME_DURATION),
      0
    );
    return Math.max(40, Math.round(total / frames.length));
  }, [frames]);

  const fps = Math.round(1000 / Math.max(1, avgDuration));

  React.useEffect(() => {
    setFrameIndex(0);
  }, [resolvedAnim, frames.length]);

  React.useEffect(() => {
    if (reduceMotion || frames.length <= 1 || !sheetLoaded) {
      setFrameIndex(0);
      return undefined;
    }

    const id = window.setInterval(() => {
      setFrameIndex((f) => (f + 1) % frames.length);
    }, avgDuration);

    return () => {
      window.clearInterval(id);
    };
  }, [avgDuration, frames.length, reduceMotion, sheetLoaded]);

  const frame = frames[Math.min(frameIndex, Math.max(0, frames.length - 1))];

  const frameW = Number(frame?.w || 0);
  const frameH = Number(frame?.h || 0);
  const safeSize = Number(size) || 320;
  const scale = frameW > 0 ? Math.max(0.01, safeSize / frameW) : 1;

  const sheetW = Number(manifest?.meta?.size?.w || sheetSize?.width || 0);
  const sheetH = Number(manifest?.meta?.size?.h || sheetSize?.height || 0);

  const canRenderSprite =
    !!frame &&
    !!sheetSrc &&
    sheetLoaded &&
    !sheetFailed &&
    Number.isFinite(frameW) &&
    frameW > 0;

  React.useEffect(() => {
    if (typeof onDebug !== "function") return;

    onDebug({
      stage: stageId,
      requestedAnim: anim,
      resolvedAnim,
      sheetSrc,
      sheetLoaded,
      sheetFailed,
      frames: frames.length,
      fps,
      frameIndex,
      manifestUrl,
      manifestError: manifestErr
        ? String(manifestErr.message || manifestErr)
        : null,
      effectiveFallbackSrc,
    });
  }, [
    anim,
    effectiveFallbackSrc,
    fps,
    frameIndex,
    frames.length,
    manifestErr,
    manifestUrl,
    onDebug,
    resolvedAnim,
    sheetFailed,
    sheetLoaded,
    sheetSrc,
    stageId,
  ]);

  if (!canRenderSprite) {
    return effectiveFallbackSrc ? (
      <img
        src={effectiveFallbackSrc}
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
        }}
      />
    ) : null;
  }

  const resolvedSheetW = sheetW || frameW;
  const resolvedSheetH = sheetH || frameH || frameW;
  const backgroundSize = `${resolvedSheetW * scale}px ${resolvedSheetH * scale}px`;
  const backgroundPosition = `${-frame.x * scale}px ${-frame.y * scale}px`;

  return (
    <div
      className={className}
      style={{
        width: safeSize,
        height: safeSize,
        backgroundImage: `url("${sheetSrc}")`,
        backgroundRepeat: "no-repeat",
        backgroundSize,
        backgroundPosition,
        imageRendering: "auto",
        transform: `scaleX(${facing})`,
        transformOrigin: "50% 100%",
        willChange: reduceMotion ? "auto" : "background-position",
      }}
    />
  );
}
