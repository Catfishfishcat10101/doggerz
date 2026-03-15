// src/components/dog/SpriteSheetDog.jsx
// Pixi-backed grid spritesheet renderer with resilient fallback chain.

import { useEffect, useMemo, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";

import jrManifest from "@/components/dog/manifests/jrManifest.json";
import { DOGS } from "@/app/config/assets.js";
import {
  findJrSpriteSheetBySrc,
  getJrSpriteFramePosition,
  normalizeJrLifeStage,
} from "@/components/dog/manifests/jrManifest.js";
import {
  getDogAnimSpriteUrl,
  getDogPixiSheetUrl,
  normalizeDogConditionId,
  normalizeDogStageShort,
} from "@/utils/dogSpritePaths.js";
import { getManifestAnimMeta } from "@/components/dog/dogAnimationEngine.js";
import "./SpriteSheetDog.css";

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
  const cssAnimationRef = useRef({
    frameIndex: 0,
    lastTick: 0,
    rafId: 0,
  });
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
  const defaultFrameWidth = Math.max(
    1,
    Number(animMeta.frameWidth || DEFAULT_FRAME_WIDTH)
  );
  const defaultFrameHeight = Math.max(
    1,
    Number(animMeta.frameHeight || DEFAULT_FRAME_HEIGHT)
  );

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
      const loadedEntry = findJrSpriteSheetBySrc(
        src,
        normalizeJrLifeStage(stage, "pup"),
        animMeta.key
      );
      const frameWidth = Math.max(
        1,
        Number(loadedEntry?.frameWidth || defaultFrameWidth)
      );
      const frameHeight = Math.max(
        1,
        Number(loadedEntry?.frameHeight || defaultFrameHeight)
      );
      const entryFrames = Math.max(
        1,
        Number(loadedEntry?.frames || animMeta.frames)
      );
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
        Math.floor((texture.width || frameWidth) / frameWidth)
      );
      const sheetRows = Math.max(
        1,
        Math.floor((texture.height || frameHeight) / frameHeight)
      );
      const sheetCapacity = Math.max(1, sheetColumns * sheetRows);
      const atlasStartFrame = Math.max(0, animMeta.rowIndex * DEFAULT_COLUMNS);
      const canUseAtlasOffset =
        sheetCapacity >= atlasStartFrame + Math.max(1, entryFrames);
      const startFrame = canUseAtlasOffset ? atlasStartFrame : 0;
      const requestedFrames = Math.max(1, Number(entryFrames || 1));
      const safeFrames = Math.max(
        1,
        Math.min(requestedFrames, sheetCapacity - startFrame)
      );

      const textures = [];
      for (let i = 0; i < safeFrames; i += 1) {
        const frameIndex = startFrame + i;
        const x = (frameIndex % sheetColumns) * frameWidth;
        const y = Math.floor(frameIndex / sheetColumns) * frameHeight;
        const frame = new PIXI.Rectangle(x, y, frameWidth, frameHeight);
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

      const displayScale = boxSize / frameHeight;
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
    animMeta.key,
    animMeta.rowIndex,
    boxSize,
    candidates,
    defaultFrameHeight,
    defaultFrameWidth,
    effectiveFps,
    facing,
    fallbackSrc,
    preferCssSprite,
    reduceMotion,
    smoothing,
    stage,
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
  const cssStage = normalizeJrLifeStage(stage, "pup");
  const cssEntry = useMemo(
    () => findJrSpriteSheetBySrc(cssSheetSrc, cssStage, animMeta.key),
    [animMeta.key, cssSheetSrc, cssStage]
  );
  const cssScale = boxSize / cssEntry.frameHeight;
  const cssFacing = Number(facing) < 0 ? -1 : 1;
  const cssShouldAnimate = !reduceMotion && cssEntry.frames > 1;

  useEffect(() => {
    if (!preferCssSprite && !sheetFailed) return undefined;

    const node = spriteRef.current;
    const animState = cssAnimationRef.current;
    animState.frameIndex = 0;
    animState.lastTick = 0;

    const applyFrame = (frameIndex) => {
      if (!node) return;
      const position = getJrSpriteFramePosition(cssEntry, frameIndex);
      node.style.backgroundPosition = `${position.x}px ${position.y}px`;
    };

    applyFrame(0);

    if (!cssShouldAnimate) {
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
        animState.frameIndex = (animState.frameIndex + 1) % cssEntry.frames;
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
  }, [cssEntry, cssShouldAnimate, effectiveFps, preferCssSprite, sheetFailed]);

  if (preferCssSprite || sheetFailed) {
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
          ref={spriteRef}
          className="dog-sprite-layer"
          data-dog-sprite="true"
          style={{
            "--dog-frame-width": `${cssEntry.frameWidth}px`,
            "--dog-frame-height": `${cssEntry.frameHeight}px`,
            "--dog-sheet-width": `${cssEntry.sheetWidth}px`,
            "--dog-sheet-height": `${cssEntry.sheetHeight}px`,
            "--dog-sprite-url": `url('${cssEntry.url}')`,
            "--dog-facing": String(cssFacing),
            "--dog-scale": String(cssScale),
            "--dog-image-rendering": smoothing ? "auto" : "pixelated",
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
