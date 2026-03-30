/** @format */

import { useEffect, useMemo, useRef, useState } from "react";
import DogCosmeticsOverlay from "@/components/dog/DogCosmeticsOverlay.jsx";
import SpriteSheetDog from "@/components/dog/renderers/SpriteSheetDog.jsx";
import {
  DOG_WORLD_HEIGHT,
  DOG_WORLD_WIDTH,
} from "@/components/dog/simulation/DogWanderBehavior.js";
import { resolveViewportAnim } from "@/components/dog/dogAnimationEngine.js";

function clamp(n, lo, hi) {
  const x = Number(n);
  if (!Number.isFinite(x)) return lo;
  return Math.max(lo, Math.min(hi, x));
}

function getRoamBounds(bounds, size) {
  const width = Math.max(0, Number(bounds?.width || 0));
  const height = Math.max(0, Number(bounds?.height || 0));
  const sidePadding = Math.max(24, size * 0.18);
  const topFloor = Math.max(18, height * 0.68);
  const bottomPadding = Math.max(20, height * 0.08);

  return {
    minX: sidePadding,
    maxX: Math.max(sidePadding, width - sidePadding),
    minY: clamp(topFloor, 18, Math.max(18, height - bottomPadding)),
    maxY: Math.max(
      clamp(topFloor, 18, Math.max(18, height - bottomPadding)),
      height - bottomPadding
    ),
  };
}

export default function DogPixiView({
  stage = "PUPPY",
  condition = "clean",
  anim = "idle",
  behaviorState = "idle",
  position = null,
  facing = "right",
  equippedCosmetics = null,
  width,
  height,
  scale = 2.25,
  baseScale = 0.6,
  dogIsSleeping = false,
  insideShelter = false,
  animSpeedMultiplier = 1,
  onPositionChange = null,
  onDogTap = null,
}) {
  const containerRef = useRef(null);

  const [bounds, setBounds] = useState({ width: 0, height: 0 });
  const viewportWidth = bounds.width;
  const viewportHeight = bounds.height;

  const size = useMemo(() => {
    const base =
      Math.min(bounds.width || 0, bounds.height || 0) ||
      Math.min(Number(width) || 320, Number(height) || 320);
    const scaleFactor = Number.isFinite(scale)
      ? clamp(scale / 2.25, 0.6, 2)
      : 1;
    const lifeScale = clamp(baseScale, 0.4, 0.8);
    return clamp(
      Math.round(base * 0.52 * scaleFactor * (0.74 + lifeScale * 0.42)),
      72,
      420
    );
  }, [baseScale, bounds.height, bounds.width, height, scale, width]);

  const renderPos = useMemo(() => {
    if (!viewportWidth || !viewportHeight) {
      return {
        x: 0,
        y: 0,
        xPct: 0,
        yPct: 0,
        facing: facing === "left" ? -1 : 1,
        moving: false,
      };
    }

    const roamBounds = getRoamBounds(
      { width: viewportWidth, height: viewportHeight },
      size
    );
    const worldX = clamp(
      Number(position?.x ?? DOG_WORLD_WIDTH / 2),
      0,
      DOG_WORLD_WIDTH
    );
    const worldY = clamp(
      Number(position?.y ?? DOG_WORLD_HEIGHT * 0.72),
      0,
      DOG_WORLD_HEIGHT
    );

    const xPx = clamp(
      (worldX / DOG_WORLD_WIDTH) * viewportWidth,
      roamBounds.minX,
      roamBounds.maxX
    );
    const yPx = clamp(
      (worldY / DOG_WORLD_HEIGHT) * viewportHeight,
      roamBounds.minY,
      roamBounds.maxY
    );

    return {
      x: xPx,
      y: yPx,
      xPct: viewportWidth > 0 ? xPx / viewportWidth : 0,
      yPct: viewportHeight > 0 ? yPx / viewportHeight : 0,
      facing: facing === "left" ? -1 : 1,
      moving:
        String(behaviorState || "idle")
          .trim()
          .toLowerCase() === "walk",
    };
  }, [behaviorState, facing, position, size, viewportHeight, viewportWidth]);

  useEffect(() => {
    if (!containerRef.current) return undefined;
    const el = containerRef.current;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setBounds({ width: rect.width, height: rect.height });
    };
    update();

    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(update);
      ro.observe(el);
    }

    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
      if (ro) ro.disconnect();
    };
  }, []);

  useEffect(() => {
    if (typeof onPositionChange !== "function") return;
    onPositionChange(renderPos);
  }, [onPositionChange, renderPos]);

  const effectiveAnim = resolveViewportAnim({
    anim,
    behaviorState,
    dogIsSleeping,
  });
  const depthRatio =
    viewportHeight > 0 ? clamp(renderPos.yPct, 0, 1) : 0.5;
  const groundedDepth = clamp((depthRatio - 0.54) / 0.38, 0, 1);
  const perspectiveScale = 0.68 + Math.pow(depthRatio, 1.52) * 1.22;
  const baseDepthScale = clamp(perspectiveScale, 0.74, 1.7);
  const lifeScale = clamp(baseScale, 0.4, 0.8);
  const depthScale = clamp(
    baseDepthScale * (0.72 + lifeScale * 0.72) * (insideShelter ? 0.74 : 1),
    0.56,
    1.6
  );
  const depthZIndex = Math.max(8, Math.round(10 + depthRatio * 28));
  const shelterShadowMultiplier = insideShelter ? 0.55 : 1;
  const shadowWidth = Math.round(
    size * (0.28 + groundedDepth * 0.28) * shelterShadowMultiplier
  );
  const shadowHeight = Math.max(
    10,
    Math.round(
      size * (0.055 + groundedDepth * 0.055) * shelterShadowMultiplier
    )
  );
  const shadowTop = Math.round(
    size * (insideShelter ? 0.84 : dogIsSleeping ? 0.81 : 0.88)
  );
  const shadowOpacity = clamp(
    (0.2 + groundedDepth * 0.2) * (insideShelter ? 0.6 : 1),
    0.12,
    0.44
  );
  const contactShadowOpacity = clamp(
    (0.26 + groundedDepth * 0.28) * (insideShelter ? 0.52 : 1),
    0.14,
    0.56
  );
  const shadowBlur = roundPx(2 + groundedDepth * 4);
  const shadowOffsetX = Math.round(size * (insideShelter ? 0.008 : 0.016));
  const shadowSqueeze = clamp(1 - groundedDepth * 0.08, 0.9, 1);
  const lawnShadowOpacity = clamp(
    (0.08 + groundedDepth * 0.08) * (insideShelter ? 0.46 : 1),
    0.04,
    0.18
  );
  const interactionZIndex = Math.max(depthZIndex + 2, 28);
  const shelteredOpacity = insideShelter ? 0.58 : 1;
  const dogTranslateY = insideShelter
    ? "-49%"
    : dogIsSleeping
      ? "-64%"
      : "-73%";

  const style = {
    width: Number.isFinite(Number(width)) ? Number(width) : "100%",
    height: Number.isFinite(Number(height)) ? Number(height) : "100%",
  };
  const dogTapHitboxSize = Math.max(80, Math.round(size * 0.72));
  const dogTapHitboxHeight = Math.max(88, Math.round(size * 0.82));

  return (
    <div
      ref={containerRef}
      className="relative overflow-visible"
      style={style}
    >
      <div
        className="dog-sprite-container"
        style={{
          position: "absolute",
          left: `${renderPos.xPct * 100}%`,
          top: `${renderPos.yPct * 100}%`,
          transform: `translate(-50%, ${dogTranslateY}) scale(${depthScale})`,
          transformOrigin: "50% 100%",
          transition: renderPos.moving
            ? "left 0.92s linear, top 0.92s linear, transform 0.2s ease"
            : "transform 0.2s ease",
          zIndex: depthZIndex,
          pointerEvents: "none",
          willChange: "left, top, transform",
          opacity: shelteredOpacity,
          filter: insideShelter ? "saturate(0.88) brightness(0.9)" : undefined,
        }}
      >
        <span
          className="dog-sprite-shadow"
          aria-hidden="true"
          style={{
            position: "absolute",
            left: `calc(50% + ${shadowOffsetX}px)`,
            top: `${shadowTop}px`,
            width: `${shadowWidth}px`,
            height: `${shadowHeight}px`,
            transform: `translate(-50%, -50%) scaleX(${shadowSqueeze})`,
            borderRadius: "999px",
            background:
              `radial-gradient(ellipse at center, rgba(2,6,23,${contactShadowOpacity}) 0%, rgba(2,6,23,${shadowOpacity}) 56%, rgba(20,83,45,${lawnShadowOpacity}) 82%, transparent 100%)`,
            filter: `blur(${roundPx(shadowBlur + 1) }px)`,
          }}
        />
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            left: `calc(50% + ${Math.round(shadowOffsetX * 1.4)}px)`,
            top: `${shadowTop + Math.round(size * 0.01)}px`,
            width: `${Math.round(shadowWidth * 1.5)}px`,
            height: `${Math.round(shadowHeight * 1.8)}px`,
            transform: `translate(-50%, -50%) scaleX(${clamp(
              shadowSqueeze * 1.04,
              0.92,
              1.08
            )})`,
            borderRadius: "999px",
            background:
              `radial-gradient(ellipse at center, rgba(15,23,42,0.12) 0%, rgba(22,101,52,${roundPx(
                lawnShadowOpacity * 0.9
              )}) 34%, rgba(15,23,42,0.04) 56%, transparent 100%)`,
            filter: `blur(${roundPx(shadowBlur + 7)}px)`,
          }}
        />
        <DogCosmeticsOverlay
          equipped={equippedCosmetics}
          size={size}
          stage={stage}
          facing={renderPos.facing}
          layerMode="behind"
          showLabels={false}
          showPreviewTags={false}
        />
        <SpriteSheetDog
          className="dog-sprite-core"
          stage={stage}
          condition={condition}
          anim={effectiveAnim}
          facing={renderPos.facing}
          size={size}
          speedMultiplier={animSpeedMultiplier}
        />
        <DogCosmeticsOverlay
          equipped={equippedCosmetics}
          size={size}
          stage={stage}
          facing={renderPos.facing}
          layerMode="front"
          showLabels={false}
          showPreviewTags={false}
        />
      </div>
      {typeof onDogTap === "function" ? (
        <button
          type="button"
          aria-label="Interact with dog"
          data-dog-hitbox="true"
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
          onClick={(event) => {
            event.stopPropagation();
            onDogTap();
          }}
          className="absolute rounded-full bg-transparent"
          style={{
            left: `${renderPos.xPct * 100}%`,
            top: `calc(${renderPos.yPct * 100}% - ${Math.round(size * 0.16)}px)`,
            width: dogTapHitboxSize,
            height: dogTapHitboxHeight,
            transform: "translate(-50%, -50%)",
            border: 0,
            padding: 0,
            pointerEvents: "auto",
            touchAction: "manipulation",
            zIndex: interactionZIndex,
          }}
        />
      ) : null}
    </div>
  );
}

function roundPx(value) {
  return Number(Number(value || 0).toFixed(2));
}
