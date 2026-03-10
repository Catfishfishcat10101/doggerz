/** @format */

import { useEffect, useMemo, useRef, useState } from "react";
import DogCosmeticsOverlay from "@/components/dog/DogCosmeticsOverlay.jsx";
import SpriteSheetDog from "@/components/dog/SpriteSheetDog.jsx";
import {
  DOG_WORLD_HEIGHT,
  DOG_WORLD_WIDTH,
} from "@/engine/DogWanderBehavior.js";

function clamp(n, lo, hi) {
  const x = Number(n);
  if (!Number.isFinite(x)) return lo;
  return Math.max(lo, Math.min(hi, x));
}

function getRoamBounds(bounds, size) {
  const width = Math.max(0, Number(bounds?.width || 0));
  const height = Math.max(0, Number(bounds?.height || 0));
  const sidePadding = Math.max(24, size * 0.18);
  const topFloor = Math.max(18, height * 0.56);
  const bottomPadding = Math.max(20, size * 0.08);

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
  dogIsSleeping = false,
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
    return clamp(Math.round(base * 0.7 * scaleFactor), 96, 512);
  }, [bounds.height, bounds.width, height, scale, width]);

  const renderPos = useMemo(() => {
    if (!viewportWidth || !viewportHeight) {
      return {
        x: 0,
        y: 0,
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

    return {
      x: clamp(
        (worldX / DOG_WORLD_WIDTH) * viewportWidth,
        roamBounds.minX,
        roamBounds.maxX
      ),
      y: clamp(
        (worldY / DOG_WORLD_HEIGHT) * viewportHeight,
        roamBounds.minY,
        roamBounds.maxY
      ),
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

  const animLower = String(anim || "idle")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_");
  const resolveDirectionalWalk = () => {
    if (!renderPos.moving || dogIsSleeping) return "idle";
    // Always use the canonical walk sheet and let facing handle mirroring.
    // Direction-specific sheets were producing a frozen-paw moonwalk look.
    return "walk";
  };

  const autoAnim = resolveDirectionalWalk();
  const effectiveAnim = (() => {
    if (!animLower || animLower === "idle") return autoAnim;
    if (animLower === "walk") return resolveDirectionalWalk();
    return animLower;
  })();
  const depthRatio =
    viewportHeight > 0 ? clamp(renderPos.y / viewportHeight, 0, 1) : 0.5;
  const depthScale = clamp(0.95 + depthRatio * 0.55, 0.9, 1.5);
  const depthZIndex = Math.max(6, Math.round(8 + depthRatio * 24));
  const shadowWidth = Math.round(size * (0.34 + depthRatio * 0.14));
  const shadowHeight = Math.max(
    10,
    Math.round(size * (0.075 + depthRatio * 0.03))
  );

  const style = {
    width: Number.isFinite(Number(width)) ? Number(width) : "100%",
    height: Number.isFinite(Number(height)) ? Number(height) : "100%",
  };
  const dogTapHitboxSize = Math.max(80, Math.round(size * 0.72));
  const dogTapHitboxHeight = Math.max(88, Math.round(size * 0.82));

  return (
    <div ref={containerRef} className="relative" style={style}>
      <div
        style={{
          position: "absolute",
          left: renderPos.x,
          top: renderPos.y,
          transform: `translate(-50%, ${dogIsSleeping ? "-68%" : "-76%"}) scale(${depthScale})`,
          transformOrigin: "50% 100%",
          transition: renderPos.moving
            ? "left 0.92s linear, top 0.92s linear, transform 0.2s ease"
            : "transform 0.2s ease",
          zIndex: depthZIndex,
          pointerEvents: "none",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "50%",
            top: `${Math.round(size * 0.82)}px`,
            width: `${shadowWidth}px`,
            height: `${shadowHeight}px`,
            transform: "translate(-50%, -50%)",
            borderRadius: "999px",
            background:
              "radial-gradient(ellipse at center, rgba(2,6,23,0.42) 0%, rgba(2,6,23,0.08) 70%, transparent 100%)",
            filter: "blur(1.5px)",
          }}
        />
        <SpriteSheetDog
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
          showLabels={false}
          showPreviewTags={false}
        />
      </div>
      {typeof onDogTap === "function" ? (
        <button
          type="button"
          aria-label="Interact with dog"
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
          onClick={(event) => {
            event.stopPropagation();
            onDogTap();
          }}
          className="absolute rounded-full bg-transparent"
          style={{
            left: renderPos.x,
            top: renderPos.y - Math.round(size * 0.16),
            width: dogTapHitboxSize,
            height: dogTapHitboxHeight,
            transform: "translate(-50%, -50%)",
            zIndex: depthZIndex + 1,
            border: 0,
            padding: 0,
            pointerEvents: "auto",
            touchAction: "manipulation",
          }}
        />
      ) : null}
    </div>
  );
}
