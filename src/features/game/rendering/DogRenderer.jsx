//src/features/game/rendering/DogRenderer.jsx
import { useEffect, useMemo, useState } from "react";

import Dog3D from "@/components/dog/Dog3D.jsx";

function clamp(value, min, max) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return min;
  return Math.max(min, Math.min(max, numeric));
}

function PreviewDogRenderer({
  width = 128,
  height = 128,
  minHeight,
  animationCatalog = null,
  animationClip = null,
  reduceMotion = false,
  fallbackSrc = "",
  className = "",
  facing = "",
  groundYNorm = 0.7,
  maxWidthRatio = 0.75,
  maxHeightRatio = 0.75,
  scaleBias = 1,
  xNorm = 0.5,
}) {
  const clipKey = animationClip?.key || "preview";
  const config = animationCatalog?.[clipKey] || animationCatalog?.preview || {};
  const src = String(config?.src || fallbackSrc || "").trim();
  const frameCount = Math.max(1, Number(config?.frameCount || 1));
  const columns = Math.max(1, Number(config?.columns || frameCount || 1));
  const rows = Math.max(1, Number(config?.rows || 1));
  const fps = Math.max(1, Number(animationClip?.fps || config?.fps || 8));
  const loop = animationClip?.loop !== false && config?.loop !== false;
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    setFrame(0);
  }, [clipKey, src]);

  useEffect(() => {
    if (reduceMotion || frameCount <= 1) return undefined;

    const intervalId = window.setInterval(
      () => {
        setFrame((current) => {
          const next = current + 1;
          if (next < frameCount) return next;
          return loop ? 0 : current;
        });
      },
      Math.round(1000 / fps)
    );

    return () => window.clearInterval(intervalId);
  }, [fps, frameCount, loop, reduceMotion]);

  const layout = useMemo(() => {
    const boxWidth = Math.max(1, Number(width || 128));
    const boxHeight = Math.max(1, Number(height || minHeight || width || 128));
    const spriteWidth = boxWidth * clamp(maxWidthRatio, 0.2, 1.2);
    const spriteHeight = boxHeight * clamp(maxHeightRatio, 0.2, 1.2);
    const left = boxWidth * clamp(xNorm, 0, 1) - spriteWidth / 2;
    const top = boxHeight * clamp(groundYNorm, 0, 1) - spriteHeight;

    return {
      boxWidth,
      boxHeight,
      spriteWidth: spriteWidth * clamp(scaleBias, 0.4, 1.8),
      spriteHeight: spriteHeight * clamp(scaleBias, 0.4, 1.8),
      left,
      top,
    };
  }, [
    groundYNorm,
    height,
    maxHeightRatio,
    maxWidthRatio,
    minHeight,
    scaleBias,
    width,
    xNorm,
  ]);

  const col = frame % columns;
  const row = Math.floor(frame / columns);
  const xPct = columns <= 1 ? 0 : (col / (columns - 1)) * 100;
  const yPct = rows <= 1 ? 0 : (row / (rows - 1)) * 100;
  const isLeft = String(facing || "").toLowerCase() === "left";

  return (
    <div
      className={className}
      data-dog-renderer="preview"
      style={{
        position: "relative",
        width: layout.boxWidth,
        height: layout.boxHeight,
        minHeight: minHeight || layout.boxHeight,
        overflow: "visible",
        pointerEvents: "none",
      }}
    >
      {src ? (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: layout.left,
            top: layout.top,
            width: layout.spriteWidth,
            height: layout.spriteHeight,
            backgroundImage: `url("${src}")`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${columns * 100}% ${rows * 100}%`,
            backgroundPosition: `${xPct}% ${yPct}%`,
            imageRendering: "auto",
            transform: isLeft ? "scaleX(-1)" : "none",
            transformOrigin: "center bottom",
          }}
        />
      ) : null}
    </div>
  );
}

export default function DogRenderer({
  scene = null,
  dog = null,
  action = "",
  clip = "Idle",
  facing = "",
  animationClip = null,
  resolution = null,
  position = [0, -1, 0],
  rotation = [0, Math.PI * 0.15, 0],
  scale = 1,
  paused = false,
  reduceMotion = false,
  ghost = false,
  width,
  height,
  minHeight,
  animationCatalog = null,
  fallbackSrc = "",
  className = "",
  groundYNorm,
  maxWidthRatio,
  maxHeightRatio,
  scaleBias,
  xNorm,
}) {
  if (animationCatalog || Number.isFinite(Number(width))) {
    return (
      <PreviewDogRenderer
        width={width}
        height={height}
        minHeight={minHeight}
        animationCatalog={animationCatalog}
        animationClip={animationClip}
        reduceMotion={reduceMotion}
        fallbackSrc={fallbackSrc}
        className={className}
        facing={facing}
        groundYNorm={groundYNorm}
        maxWidthRatio={maxWidthRatio}
        maxHeightRatio={maxHeightRatio}
        scaleBias={scaleBias}
        xNorm={xNorm}
      />
    );
  }

  return (
    <Dog3D
      scene={scene}
      dog={dog}
      action={action}
      facing={facing}
      animationClip={animationClip}
      resolution={resolution}
      desiredClip={clip}
      position={position}
      rotation={rotation}
      scale={scale}
      paused={paused}
      reduceMotion={reduceMotion}
      ghost={ghost}
    />
  );
}
