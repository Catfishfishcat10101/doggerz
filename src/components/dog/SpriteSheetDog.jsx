// src/components/dog/SpriteSheetDog.jsx
// Pixi-backed grid spritesheet renderer with resilient fallback chain.

import { useEffect, useMemo, useRef, useState } from "react";
import * as PIXI from "pixi.js";

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
const SPRITE_DEFAULT_FACING = -1; // Source art faces left by default.

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
  const fallbackStage = s === "senior" ? "adult" : "pup";

  const animSpecific = getDogAnimSpriteUrl(s, anim);
  const animFallback = getDogAnimSpriteUrl(fallbackStage, anim);
  const requested = getDogPixiSheetUrl(s, c);
  const cleanSameStage = getDogPixiSheetUrl(s, "clean");
  const cleanFallbackStage = getDogPixiSheetUrl(fallbackStage, "clean");
  const cleanPup = getDogPixiSheetUrl("pup", "clean");

  const ordered = [
    animSpecific,
    animFallback,
    requested,
    cleanSameStage,
    cleanFallbackStage,
    cleanPup,
  ];
  const withNoQueryFallbacks = ordered.flatMap((url) => {
    const raw = String(url || "");
    const plain = raw.split("?")[0];
    return plain && plain !== raw ? [raw, plain] : [raw];
  });
  return [...new Set(withNoQueryFallbacks)];
}

function clearPixi(appRef, spriteRef) {
  const app = appRef.current;
  if (!app) return;
  try {
    if (spriteRef.current) {
      app.stage.removeChild(spriteRef.current);
      spriteRef.current.destroy();
      spriteRef.current = null;
    }
    app.destroy(true, { children: true, texture: true, baseTexture: true });
  } catch {
    // best-effort cleanup
  } finally {
    appRef.current = null;
  }
}

async function loadFirstAvailableTexture(candidates) {
  for (const src of candidates) {
    try {
      const texture = await PIXI.Assets.load(src);
      if (texture) return { src, texture };
    } catch {
      // try next candidate
    }
  }
  return null;
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
  fallbackSrc = "/assets/sprites/jr/pup_clean.png",
  className = "",
  onDebug,
}) {
  const animMeta = useMemo(() => getAnimMeta(anim), [anim]);
  const candidates = useMemo(
    () => getSheetCandidates(stage, condition, animMeta.key),
    [animMeta.key, condition, stage]
  );

  const hostRef = useRef(null);
  const appRef = useRef(null);
  const spriteRef = useRef(null);
  const [activeSrc, setActiveSrc] = useState(null);
  const [sheetFailed, setSheetFailed] = useState(false);

  const boxSize = clamp(size, 64, 1024);
  const effectiveSpeedMultiplier = clamp(speedMultiplier, 0.2, 2);
  const effectiveFps = Math.max(1, animMeta.fps * effectiveSpeedMultiplier);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const host = hostRef.current;
      if (!host) return;

      setSheetFailed(false);
      setActiveSrc(null);
      clearPixi(appRef, spriteRef);

      const loaded = await loadFirstAvailableTexture(candidates);
      if (!loaded || cancelled) {
        setSheetFailed(true);
        return;
      }

      const { src, texture } = loaded;
      const app = new PIXI.Application({
        width: boxSize,
        height: boxSize,
        backgroundAlpha: 0,
        antialias: true,
        autoDensity: true,
        resolution: Math.max(1, window.devicePixelRatio || 1),
      });
      if (cancelled) {
        app.destroy(true);
        return;
      }

      host.innerHTML = "";
      host.appendChild(app.view);
      appRef.current = app;
      setActiveSrc(src);

      const baseTexture = texture.baseTexture;
      baseTexture.scaleMode = smoothing
        ? PIXI.SCALE_MODES.LINEAR
        : PIXI.SCALE_MODES.NEAREST;
      baseTexture.update();

      const sheetColumns = Math.max(
        1,
        Math.floor((texture.width || DEFAULT_FRAME_WIDTH) / DEFAULT_FRAME_WIDTH)
      );
      const sheetRows = Math.max(
        1,
        Math.floor(
          (texture.height || DEFAULT_FRAME_HEIGHT) / DEFAULT_FRAME_HEIGHT
        )
      );
      const sheetCapacity = Math.max(1, sheetColumns * sheetRows);
      const atlasStartFrame = Math.max(0, animMeta.rowIndex * DEFAULT_COLUMNS);
      const canUseAtlasOffset =
        sheetCapacity >= atlasStartFrame + Math.max(1, animMeta.frames);
      const startFrame = canUseAtlasOffset ? atlasStartFrame : 0;
      const requestedFrames = Math.max(1, Number(animMeta.frames || 1));
      const safeFrames = Math.max(
        1,
        Math.min(requestedFrames, sheetCapacity - startFrame)
      );

      const textures = [];
      for (let i = 0; i < safeFrames; i += 1) {
        const frameIndex = startFrame + i;
        const x = (frameIndex % sheetColumns) * DEFAULT_FRAME_WIDTH;
        const y = Math.floor(frameIndex / sheetColumns) * DEFAULT_FRAME_HEIGHT;
        const frame = new PIXI.Rectangle(
          x,
          y,
          DEFAULT_FRAME_WIDTH,
          DEFAULT_FRAME_HEIGHT
        );
        textures.push(new PIXI.Texture(baseTexture, frame));
      }

      if (!textures.length) {
        setSheetFailed(true);
        clearPixi(appRef, spriteRef);
        return;
      }

      const dog = new PIXI.AnimatedSprite(textures);
      dog.anchor.set(0.5, 1);
      dog.x = boxSize / 2;
      dog.y = boxSize * 0.93;

      const displayScale = boxSize / DEFAULT_FRAME_HEIGHT;
      const facingSign = Number(facing) < 0 ? 1 : -1;
      dog.scale.set(
        displayScale * facingSign * SPRITE_DEFAULT_FACING,
        displayScale
      );
      dog.animationSpeed = Math.max(0.01, effectiveFps / 60);
      dog.loop = true;
      dog.autoUpdate = true;

      if (reduceMotion || safeFrames <= 1) {
        dog.gotoAndStop(0);
      } else {
        dog.play();
      }

      const groundShadow = new PIXI.Graphics();
      groundShadow.beginFill(0x020617, 0.32);
      groundShadow.drawEllipse(
        boxSize / 2,
        boxSize * 0.94,
        boxSize * 0.2,
        boxSize * 0.05
      );
      groundShadow.endFill();
      app.stage.addChild(groundShadow);
      app.stage.addChild(dog);
      spriteRef.current = dog;
      app.ticker.start();
    }

    boot();
    return () => {
      cancelled = true;
      clearPixi(appRef, spriteRef);
    };
  }, [
    animMeta.columns,
    animMeta.frames,
    animMeta.rowIndex,
    boxSize,
    candidates,
    effectiveFps,
    facing,
    reduceMotion,
    smoothing,
  ]);

  useEffect(() => {
    const dog = spriteRef.current;
    if (!dog) return;
    const displayScale = boxSize / DEFAULT_FRAME_HEIGHT;
    const facingSign = Number(facing) < 0 ? 1 : -1;
    dog.scale.set(
      displayScale * facingSign * SPRITE_DEFAULT_FACING,
      displayScale
    );
  }, [boxSize, facing]);

  useEffect(() => {
    const dog = spriteRef.current;
    if (!dog) return;
    dog.animationSpeed = Math.max(0.01, effectiveFps / 60);
    if (reduceMotion) {
      dog.gotoAndStop(0);
      return;
    }
    if (!dog.playing) dog.play();
  }, [effectiveFps, reduceMotion]);

  useEffect(() => {
    if (!onDebug) return;
    onDebug({
      stage,
      condition,
      anim,
      resolvedAnim: animMeta.key,
      row: animMeta.rowIndex,
      frames: animMeta.frames,
      fps: animMeta.fps,
      effectiveFps,
      speedMultiplier: effectiveSpeedMultiplier,
      src: activeSrc,
      fallbackSrc,
      candidateCount: candidates.length,
      sheetLoaded: Boolean(activeSrc) && !sheetFailed,
      sheetFailed,
      reduceMotion: Boolean(reduceMotion),
    });
  }, [
    activeSrc,
    anim,
    animMeta.fps,
    animMeta.frames,
    animMeta.key,
    animMeta.rowIndex,
    candidates.length,
    condition,
    effectiveFps,
    effectiveSpeedMultiplier,
    fallbackSrc,
    onDebug,
    reduceMotion,
    sheetFailed,
    stage,
  ]);

  const cssSheetSrc = String(activeSrc || candidates[0] || fallbackSrc || "");
  const cssFrameCount = Math.max(1, Number(animMeta.frames || 1));
  const cssDurationSeconds = Math.max(
    0.35,
    cssFrameCount / Math.max(1, effectiveFps)
  );
  const cssRowOffset =
    Math.max(0, Number(animMeta.rowIndex || 0)) * DEFAULT_FRAME_HEIGHT;
  const cssScale = boxSize / DEFAULT_FRAME_HEIGHT;
  const cssFacing = Number(facing) < 0 ? -1 : 1;
  const cssShouldAnimate = !reduceMotion && cssFrameCount > 1;

  if (sheetFailed) {
    return (
      <div
        className={`dog-css-container ${className}`}
        data-dog-container="true"
        role="img"
        aria-label="Dog"
        style={{
          width: boxSize,
          height: boxSize,
          pointerEvents: "none",
        }}
      >
        <style>
          {`@keyframes dgPlay8Frames {
  from { background-position: 0px var(--dog-row-offset); }
  to { background-position: calc(var(--dog-frame-width) * var(--dog-frames) * -1) var(--dog-row-offset); }
}`}
        </style>
        <div
          className={`dog-css-sprite state-${animMeta.key}`}
          data-dog-sprite="true"
          style={{
            width: `${DEFAULT_FRAME_WIDTH}px`,
            height: `${DEFAULT_FRAME_HEIGHT}px`,
            position: "absolute",
            left: "50%",
            top: "100%",
            transform: `translate(-50%, -100%) scaleX(${cssFacing}) scale(${cssScale})`,
            transformOrigin: "50% 100%",
            backgroundImage: `url('${cssSheetSrc}')`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: `0px -${cssRowOffset}px`,
            imageRendering: smoothing ? "auto" : "pixelated",
            transition: "transform 0.1s ease-in-out",
            animation: cssShouldAnimate
              ? `dgPlay8Frames ${cssDurationSeconds.toFixed(3)}s steps(${cssFrameCount}) infinite`
              : "none",
            "--dog-frame-width": `${DEFAULT_FRAME_WIDTH}px`,
            "--dog-frames": String(cssFrameCount),
            "--dog-row-offset": `-${cssRowOffset}px`,
          }}
        />
      </div>
    );
  }

  return (
    <div
      ref={hostRef}
      className={className}
      role="img"
      aria-label="Dog"
      style={{
        width: boxSize,
        height: boxSize,
        pointerEvents: "none",
      }}
    />
  );
}
