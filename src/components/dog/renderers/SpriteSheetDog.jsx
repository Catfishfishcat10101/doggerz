import { memo, useEffect, useMemo } from "react";

import { DOGS } from "@/app/config/assets.js";
import { getManifestAnimMeta } from "@/components/dog/dogAnimationEngine.js";
import DogRenderer from "@/features/game/rendering/DogRenderer.jsx";
import {
  DEFAULT_DOG_ACTION,
  DOG_ANIMATION_MAP,
} from "@/features/game/rendering/dogAnimationMap.js";
import {
  resolveDogAnimationSrc,
  resolveDogRendererFallbackSrc,
} from "@/features/game/rendering/dogAssets.js";

function clamp(value, min, max) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return min;
  return Math.max(min, Math.min(max, numeric));
}

function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function resolveFacingLabel(facing) {
  return Number(facing) < 0 || String(facing || "").toLowerCase() === "left"
    ? "left"
    : "right";
}

function resolvePreviewConfig({
  stage,
  anim,
  speedMultiplier,
  src,
  frameWidth,
  frameHeight,
  columns,
  rows,
  totalFrames,
  fps,
  loop,
  currentAnimationState,
  animationState,
}) {
  const resolvedState = normalizeKey(
    currentAnimationState || animationState || anim
  );

  if (String(src || "").trim()) {
    return {
      sourceAction: resolvedState || DEFAULT_DOG_ACTION,
      src: String(src || "").trim(),
      frameWidth:
        Number.isFinite(Number(frameWidth)) && Number(frameWidth) > 0
          ? Number(frameWidth)
          : undefined,
      frameHeight:
        Number.isFinite(Number(frameHeight)) && Number(frameHeight) > 0
          ? Number(frameHeight)
          : undefined,
      columns: Math.max(1, Number(columns || 4)),
      rows: Math.max(1, Number(rows || 4)),
      frameCount: Math.max(1, Number(totalFrames || 16)),
      fps: Math.max(1, Number(fps || 6)),
      loop: loop !== false,
    };
  }

  const manifestMeta = getManifestAnimMeta(anim);
  const sourceAction = manifestMeta?.key || anim || "idle";
  const baseConfig =
    DOG_ANIMATION_MAP[sourceAction] || DOG_ANIMATION_MAP[DEFAULT_DOG_ACTION];

  return {
    sourceAction,
    src: baseConfig?.src || resolveDogAnimationSrc(sourceAction, { stage }),
    frameWidth: baseConfig?.frameWidth,
    frameHeight: baseConfig?.frameHeight,
    columns: Number(baseConfig?.columns || 4) || 4,
    rows: Number(baseConfig?.rows || 4) || 4,
    frameCount: Number(baseConfig?.frameCount || 16) || 16,
    fps: Math.max(
      1,
      Math.round(Number(baseConfig?.fps || 8) * clamp(speedMultiplier, 0.2, 2))
    ),
    loop: Boolean(baseConfig?.loop !== false),
  };
}

function SpriteSheetDog({
  stage,
  anim,
  facing,
  size = 128,
  reduceMotion = false,
  speedMultiplier = 1,
  fallbackSrc,
  className = "",
  src,
  frameWidth,
  frameHeight,
  columns,
  rows,
  totalFrames,
  fps,
  loop,
  currentAnimationState,
  animationState,
  groundYNorm,
  maxWidthRatio,
  maxHeightRatio,
  scaleBias,
  xNorm,
  onDebug,
  condition,
}) {
  const boxSize = clamp(size, 64, 1024);
  const resolvedFacing = resolveFacingLabel(facing);
  const previewLayout = useMemo(() => {
    if (boxSize <= 96) {
      return Object.freeze({
        groundYNorm: 0.66,
        maxWidthRatio: 0.82,
        maxHeightRatio: 0.78,
      });
    }

    if (boxSize <= 220) {
      return Object.freeze({
        groundYNorm: 0.67,
        maxWidthRatio: 0.78,
        maxHeightRatio: 0.76,
      });
    }

    return Object.freeze({
      groundYNorm: 0.74,
      maxWidthRatio: 0.72,
      maxHeightRatio: 0.66,
    });
  }, [boxSize]);
  const resolvedGroundYNorm = Number.isFinite(Number(groundYNorm))
    ? clamp(Number(groundYNorm), 0.4, 0.95)
    : previewLayout.groundYNorm;
  const resolvedMaxWidthRatio = Number.isFinite(Number(maxWidthRatio))
    ? clamp(Number(maxWidthRatio), 0.2, 0.95)
    : previewLayout.maxWidthRatio;
  const resolvedMaxHeightRatio = Number.isFinite(Number(maxHeightRatio))
    ? clamp(Number(maxHeightRatio), 0.2, 0.95)
    : previewLayout.maxHeightRatio;
  const resolvedScaleBias = Number.isFinite(Number(scaleBias))
    ? clamp(Number(scaleBias), 0.5, 1.5)
    : 1;
  const resolvedXNorm = Number.isFinite(Number(xNorm))
    ? clamp(Number(xNorm), 0.02, 0.98)
    : 0.5;
  const previewConfig = useMemo(
    () =>
      resolvePreviewConfig({
        stage,
        anim,
        speedMultiplier,
        src,
        frameWidth,
        frameHeight,
        columns,
        rows,
        totalFrames,
        fps,
        loop,
        currentAnimationState,
        animationState,
      }),
    [
      anim,
      animationState,
      columns,
      currentAnimationState,
      fps,
      frameHeight,
      frameWidth,
      loop,
      rows,
      speedMultiplier,
      src,
      stage,
      totalFrames,
    ]
  );
  const resolvedFallbackSrc = useMemo(
    () =>
      resolveDogRendererFallbackSrc({
        stage,
        staticSpriteUrl: fallbackSrc,
      }) || DOGS.staticFallback,
    [fallbackSrc, stage]
  );
  const animationCatalog = useMemo(
    () =>
      Object.freeze({
        preview: Object.freeze({
          src: previewConfig.src,
          frameWidth: previewConfig.frameWidth,
          frameHeight: previewConfig.frameHeight,
          columns: previewConfig.columns,
          rows: previewConfig.rows,
          frameCount: previewConfig.frameCount,
          fps: previewConfig.fps,
          loop: previewConfig.loop,
          anchorX: 0.5,
          anchorY: 0.98,
          scaleMultiplier: 1,
          groundOffsetPx: 0,
        }),
      }),
    [
      previewConfig.columns,
      previewConfig.fps,
      previewConfig.frameCount,
      previewConfig.frameHeight,
      previewConfig.frameWidth,
      previewConfig.loop,
      previewConfig.rows,
      previewConfig.src,
    ]
  );
  const animationClip = useMemo(
    () =>
      Object.freeze({
        key: "preview",
        playToken: previewConfig.loop ? "loop:preview" : "shot:preview",
        loop: previewConfig.loop,
        fps: previewConfig.fps,
        frameCount: previewConfig.frameCount,
      }),
    [previewConfig.fps, previewConfig.frameCount, previewConfig.loop]
  );

  useEffect(() => {
    if (!onDebug) return;

    onDebug({
      stage,
      condition,
      anim,
      currentAnimationState: currentAnimationState || animationState || anim,
      src: previewConfig.src,
      frameWidth: previewConfig.frameWidth ?? null,
      frameHeight: previewConfig.frameHeight ?? null,
      columns: previewConfig.columns,
      rows: previewConfig.rows,
      totalFrames: previewConfig.frameCount,
      fps: previewConfig.fps,
      loop: previewConfig.loop,
      reduceMotion: Boolean(reduceMotion),
      facing: resolvedFacing,
      renderMode: "dog-renderer-preview",
    });
  }, [
    anim,
    animationState,
    condition,
    currentAnimationState,
    onDebug,
    previewConfig.columns,
    previewConfig.fps,
    previewConfig.frameCount,
    previewConfig.frameHeight,
    previewConfig.frameWidth,
    previewConfig.loop,
    previewConfig.rows,
    previewConfig.src,
    reduceMotion,
    resolvedFacing,
    stage,
  ]);

  return (
    <div
      className={className}
      data-dog-container="true"
      role="img"
      aria-label="Dog"
      style={{
        width: boxSize,
        height: boxSize,
        position: "relative",
        pointerEvents: "none",
        overflow: "visible",
      }}
    >
      <DogRenderer
        width={boxSize}
        height={boxSize}
        minHeight={boxSize}
        animationCatalog={animationCatalog}
        animationClip={animationClip}
        action="preview"
        facing={resolvedFacing}
        xNorm={resolvedXNorm}
        groundYNorm={resolvedGroundYNorm}
        maxWidthRatio={resolvedMaxWidthRatio}
        maxHeightRatio={resolvedMaxHeightRatio}
        scaleBias={resolvedScaleBias}
        reduceMotion={reduceMotion}
        fallbackSrc={resolvedFallbackSrc}
        className=""
      />
    </div>
  );
}

function arePropsEqual(prev, next) {
  return (
    prev.stage === next.stage &&
    prev.anim === next.anim &&
    prev.facing === next.facing &&
    prev.size === next.size &&
    prev.reduceMotion === next.reduceMotion &&
    prev.speedMultiplier === next.speedMultiplier &&
    prev.smoothing === next.smoothing &&
    prev.fallbackSrc === next.fallbackSrc &&
    prev.className === next.className &&
    prev.src === next.src &&
    prev.frameWidth === next.frameWidth &&
    prev.frameHeight === next.frameHeight &&
    prev.columns === next.columns &&
    prev.rows === next.rows &&
    prev.totalFrames === next.totalFrames &&
    prev.fps === next.fps &&
    prev.loop === next.loop &&
    prev.currentAnimationState === next.currentAnimationState &&
    prev.animationState === next.animationState &&
    prev.groundYNorm === next.groundYNorm &&
    prev.maxWidthRatio === next.maxWidthRatio &&
    prev.maxHeightRatio === next.maxHeightRatio &&
    prev.scaleBias === next.scaleBias &&
    prev.xNorm === next.xNorm &&
    prev.onDebug === next.onDebug
  );
}

export default memo(SpriteSheetDog, arePropsEqual);
