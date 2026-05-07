//src/features/game/rendering/DogRenderer.jsx
import { useEffect, useMemo, useRef, useState } from "react";

import Dog3D from "@/components/dog/Dog3D.jsx";

function clamp(value, min, max) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return min;
  return Math.max(min, Math.min(max, numeric));
}

function isBackdropWhite(data, offset) {
  const r = data[offset];
  const g = data[offset + 1];
  const b = data[offset + 2];
  const a = data[offset + 3];
  if (a < 8) return false;
  return (
    r >= 245 &&
    g >= 245 &&
    b >= 245 &&
    Math.max(r, g, b) - Math.min(r, g, b) <= 10
  );
}

function clearConnectedWhiteBackdrop(imageData) {
  const { data, width, height } = imageData;
  const visited = new Uint8Array(width * height);
  const stack = [];

  const enqueue = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const index = y * width + x;
    if (visited[index]) return;
    const offset = index * 4;
    if (!isBackdropWhite(data, offset)) return;
    visited[index] = 1;
    stack.push(index);
  };

  for (let x = 0; x < width; x += 1) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }
  for (let y = 1; y < height - 1; y += 1) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }

  while (stack.length) {
    const index = stack.pop();
    const offset = index * 4;
    data[offset + 3] = 0;
    const x = index % width;
    const y = Math.floor(index / width);
    enqueue(x + 1, y);
    enqueue(x - 1, y);
    enqueue(x, y + 1);
    enqueue(x, y - 1);
  }
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
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const clipKey = animationClip?.key || "preview";
  const config = animationCatalog?.[clipKey] || animationCatalog?.preview || {};
  const src = String(config?.src || fallbackSrc || "").trim();
  const frameCount = Math.max(1, Number(config?.frameCount || 1));
  const requestedColumns = Math.max(
    1,
    Number(config?.columns || frameCount || 1)
  );
  const requestedRows = Math.max(1, Number(config?.rows || 1));
  const frameWidth = Math.max(0, Number(config?.frameWidth || 0));
  const frameHeight = Math.max(0, Number(config?.frameHeight || 0));
  const fps = Math.max(1, Number(animationClip?.fps || config?.fps || 8));
  const loop = animationClip?.loop !== false && config?.loop !== false;
  const [naturalSize, setNaturalSize] = useState(null);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    setFrame(0);
  }, [clipKey, src]);

  useEffect(() => {
    if (!src) {
      imageRef.current = null;
      setNaturalSize(null);
      return undefined;
    }

    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      imageRef.current = img;
      setNaturalSize({
        width: Math.max(1, Number(img.naturalWidth || img.width || 0)),
        height: Math.max(1, Number(img.naturalHeight || img.height || 0)),
      });
    };
    img.onerror = () => {
      imageRef.current = null;
      if (!cancelled) setNaturalSize(null);
    };
    img.src = src;

    return () => {
      cancelled = true;
    };
  }, [frameHeight, frameWidth, src]);

  const derivedColumns =
    naturalSize?.width && frameWidth
      ? Math.max(1, Math.floor(naturalSize.width / frameWidth))
      : 0;
  const derivedRows =
    naturalSize?.height && frameHeight
      ? Math.max(1, Math.floor(naturalSize.height / frameHeight))
      : 0;
  const columns = derivedColumns || requestedColumns;
  const rows = derivedRows || requestedRows;

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
  const isLeft = String(facing || "").toLowerCase() === "left";

  useEffect(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !src) return;

    const targetWidth = Math.max(1, Math.round(layout.spriteWidth));
    const targetHeight = Math.max(1, Math.round(layout.spriteHeight));
    if (canvas.width !== targetWidth) canvas.width = targetWidth;
    if (canvas.height !== targetHeight) canvas.height = targetHeight;

    const sourceFrameWidth =
      frameWidth ||
      Math.max(
        1,
        Math.floor(
          (naturalSize?.width || image.naturalWidth || image.width) / columns
        )
      );
    const sourceFrameHeight =
      frameHeight ||
      Math.max(
        1,
        Math.floor(
          (naturalSize?.height || image.naturalHeight || image.height) / rows
        )
      );
    const sourceX = Math.min(
      Math.max(0, col * sourceFrameWidth),
      Math.max(
        0,
        (naturalSize?.width || image.naturalWidth || image.width) -
          sourceFrameWidth
      )
    );
    const sourceY = Math.min(
      Math.max(0, row * sourceFrameHeight),
      Math.max(
        0,
        (naturalSize?.height || image.naturalHeight || image.height) -
          sourceFrameHeight
      )
    );

    const context = canvas.getContext("2d");
    if (!context) return;
    context.clearRect(0, 0, targetWidth, targetHeight);
    context.drawImage(
      image,
      sourceX,
      sourceY,
      sourceFrameWidth,
      sourceFrameHeight,
      0,
      0,
      targetWidth,
      targetHeight
    );

    try {
      const imageData = context.getImageData(0, 0, targetWidth, targetHeight);
      clearConnectedWhiteBackdrop(imageData);
      context.putImageData(imageData, 0, 0);
    } catch {
      // If canvas pixel access is blocked, keep the correctly cropped frame.
    }
  }, [
    col,
    columns,
    frameHeight,
    frameWidth,
    layout.spriteHeight,
    layout.spriteWidth,
    naturalSize,
    row,
    rows,
    src,
  ]);

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
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          style={{
            position: "absolute",
            left: layout.left,
            top: layout.top,
            width: layout.spriteWidth,
            height: layout.spriteHeight,
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
