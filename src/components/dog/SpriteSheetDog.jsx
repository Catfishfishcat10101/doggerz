// src/components/dog/SpriteSheetDog.jsx
// Pixi-backed grid spritesheet renderer with resilient fallback chain.

import { useEffect, useMemo, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";

import jrManifest from "@/components/dog/jrManifest.json";
import { DOGS } from "@/config/assets.js";
import {
  getDogAnimSpriteUrl,
  getDogPixiSheetUrl,
  normalizeDogConditionId,
  normalizeDogStageShort,
} from "@/utils/dogSpritePaths.js";
import { getManifestAnimMeta } from "@/components/dog/dogAnimationEngine.js";

const DEFAULT_COLUMNS = Math.max(1, Number(jrManifest?.columns || 8));
const DEFAULT_FRAME = jrManifest?.frame || {};
const DEFAULT_FRAME_WIDTH = Math.max(1, Number(DEFAULT_FRAME.width || 128));
const DEFAULT_FRAME_HEIGHT = Math.max(1, Number(DEFAULT_FRAME.height || 128));
const SPRITE_DEFAULT_FACING = -1; // Source art faces left by default.
const HARD_TEXTURE_FALLBACK_SRC = DOGS.staticFallback;
let pixiModulePromise = null;

function clamp(n, lo, hi) {
  const x = Number(n);
  if (!Number.isFinite(x)) return lo;
  return Math.max(lo, Math.min(hi, x));
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
      spriteRef.current.destroy({
        children: true,
        texture: false,
        baseTexture: false,
      });
      spriteRef.current = null;
    }
    // Loaded textures come from PIXI.Assets cache and are reused across anim swaps.
    // Destroying shared textures here makes later idle/walk loads come back blank.
    app.destroy(true, { children: true, texture: false, baseTexture: false });
  } catch {
    // best-effort cleanup
  } finally {
    appRef.current = null;
  }
}

async function loadPixiModule() {
  if (!pixiModulePromise) {
    pixiModulePromise = import("pixi.js");
  }
  return pixiModulePromise;
}

async function loadFirstAvailableTexture(candidates, fallbackSrc) {
  const PIXI = await loadPixiModule();
  for (const src of candidates) {
    try {
      const texture = await PIXI.Assets.load(src);
      if (texture) return { src, texture };
    } catch (error) {
      console.error("[Doggerz] Failed to load Pixi texture:", src, error);
    }
  }

  const fallbackPath = String(fallbackSrc || HARD_TEXTURE_FALLBACK_SRC || "");
  if (!fallbackPath) return null;

  try {
    const texture = await PIXI.Assets.load(fallbackPath);
    if (texture) return { src: fallbackPath, texture };
  } catch (error) {
    console.error(
      "[Doggerz] Failed to load Pixi fallback texture:",
      fallbackPath,
      error
    );
  }

  return null;
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
  preferCssAnimation = undefined,
}) {
  const animMeta = useMemo(() => getManifestAnimMeta(anim), [anim]);
  const candidates = useMemo(
    () => getSheetCandidates(stage, condition, animMeta.key),
    [animMeta.key, condition, stage]
  );

  const hostRef = useRef(null);
  const appRef = useRef(null);
  const spriteRef = useRef(null);
  const [activeSrc, setActiveSrc] = useState(null);
  const [sheetFailed, setSheetFailed] = useState(false);
  const preferCssSprite = useMemo(() => {
    if (typeof preferCssAnimation === "boolean") {
      return preferCssAnimation;
    }
    try {
      return typeof Capacitor?.isNativePlatform === "function"
        ? Capacitor.isNativePlatform()
        : Capacitor?.getPlatform?.() !== "web";
    } catch {
      return false;
    }
  }, [preferCssAnimation]);

  const boxSize = clamp(size, 64, 1024);
  const effectiveSpeedMultiplier = clamp(speedMultiplier, 0.2, 2);
  const effectiveFps = Math.max(1, animMeta.fps * effectiveSpeedMultiplier);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const host = hostRef.current;
      if (!host && !preferCssSprite) return;

      setSheetFailed(false);
      setActiveSrc(null);
      clearPixi(appRef, spriteRef);

      if (preferCssSprite) {
        const resolvedSrc = await loadFirstAvailableImageSource(
          candidates,
          fallbackSrc
        );
        if (cancelled) return;
        if (!resolvedSrc) {
          setSheetFailed(true);
          return;
        }
        setActiveSrc(resolvedSrc);
        return;
      }

      const loaded = await loadFirstAvailableTexture(candidates, fallbackSrc);
      if (!loaded || cancelled) {
        setSheetFailed(true);
        return;
      }

      const { src, texture } = loaded;
      const PIXI = await loadPixiModule();
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
    fallbackSrc,
    preferCssSprite,
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
      renderMode: preferCssSprite || sheetFailed ? "css" : "pixi",
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
    preferCssSprite,
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

  if (preferCssSprite || sheetFailed) {
    return (
      <div
        className={`dog-css-container ${className}`}
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
        <style>
          {`@keyframes dgPlay8Frames {
  from { background-position: 0px var(--dog-row-offset); }
          to { background-position: calc(var(--dog-frame-width) * var(--dog-frames) * -1) var(--dog-row-offset); }
}`}
        </style>
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "50%",
            top: `${Math.round(boxSize * 0.94)}px`,
            width: `${Math.round(boxSize * 0.2)}px`,
            height: `${Math.round(boxSize * 0.05)}px`,
            transform: "translate(-50%, -50%)",
            borderRadius: "999px",
            background:
              "radial-gradient(ellipse at center, rgba(2,6,23,0.32) 0%, rgba(2,6,23,0.08) 70%, transparent 100%)",
            filter: "blur(1.5px)",
          }}
        />
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
