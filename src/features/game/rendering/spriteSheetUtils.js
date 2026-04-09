// src/features/game/rendering/spriteSheetUtils.js

import { Assets, Rectangle, Texture } from "pixi.js";
import { withBaseUrl } from "@/utils/assetUtils.js";

const GRID_TEXTURE_PROMISE_CACHE = new Map();
const GRID_ANIMATION_MAP_PROMISE_CACHE = new WeakMap();

function removeEdgeConnectedWhiteBackground(texture) {
  if (typeof document === "undefined") {
    return texture;
  }

  const source =
    texture?.baseTexture?.resource?.source ||
    texture?.baseTexture?.source ||
    texture?.source ||
    null;

  if (!source) {
    return texture;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Number(texture?.width || source.width || 0));
  canvas.height = Math.max(1, Number(texture?.height || source.height || 0));

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    return texture;
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(source, 0, 0, canvas.width, canvas.height);

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = imageData;
  const width = canvas.width;
  const height = canvas.height;
  const visited = new Uint8Array(width * height);
  const queue = [];

  const isNearWhite = (x, y) => {
    const offset = (y * width + x) * 4;
    return (
      data[offset + 3] > 0 &&
      data[offset] >= 250 &&
      data[offset + 1] >= 250 &&
      data[offset + 2] >= 250
    );
  };

  const enqueue = (x, y) => {
    const index = y * width + x;
    if (visited[index]) return;
    visited[index] = 1;
    queue.push(index);
  };

  for (let x = 0; x < width; x += 1) {
    if (isNearWhite(x, 0)) enqueue(x, 0);
    if (isNearWhite(x, height - 1)) enqueue(x, height - 1);
  }

  for (let y = 0; y < height; y += 1) {
    if (isNearWhite(0, y)) enqueue(0, y);
    if (isNearWhite(width - 1, y)) enqueue(width - 1, y);
  }

  while (queue.length > 0) {
    const index = queue.pop();
    const x = index % width;
    const y = Math.floor(index / width);
    const offset = index * 4;

    data[offset + 3] = 0;

    if (x > 0 && isNearWhite(x - 1, y)) enqueue(x - 1, y);
    if (x + 1 < width && isNearWhite(x + 1, y)) enqueue(x + 1, y);
    if (y > 0 && isNearWhite(x, y - 1)) enqueue(x, y - 1);
    if (y + 1 < height && isNearWhite(x, y + 1)) enqueue(x, y + 1);
  }

  context.putImageData(imageData, 0, 0);

  return Texture.from(canvas);
}

export async function loadAtlasFrames({
  src,
  frameWidth = undefined,
  frameHeight = undefined,
  columns = 4,
  rows = 4,
  totalFrames = 16,
}) {
  const safeColumns = Math.max(1, Number(columns || 1));
  const safeRows = Math.max(1, Number(rows || 1));
  const safeFrameWidth = Math.max(0, Number(frameWidth || 0));
  const safeFrameHeight = Math.max(0, Number(frameHeight || 0));
  const safeTotalFrames = Math.max(1, Number(totalFrames || 1));
  const key = `${withBaseUrl(src)}|${safeFrameWidth}|${safeFrameHeight}|${safeColumns}|${safeRows}|${safeTotalFrames}`;
  if (GRID_TEXTURE_PROMISE_CACHE.has(key)) {
    return GRID_TEXTURE_PROMISE_CACHE.get(key);
  }

  const texturePromise = (async () => {
    const loadedTexture = await Assets.load(withBaseUrl(src));
    const texture = removeEdgeConnectedWhiteBackground(loadedTexture);
    const totalWidth = Number(texture?.width || loadedTexture?.width || 0);
    const totalHeight = Number(texture?.height || loadedTexture?.height || 0);

    if (!totalWidth || !totalHeight) {
      throw new Error(`[DogRenderer] Failed to load texture size for ${src}`);
    }

    const resolvedFrameWidth =
      safeFrameWidth || Math.floor(totalWidth / safeColumns);
    const resolvedFrameHeight =
      safeFrameHeight || Math.floor(totalHeight / safeRows);

    if (!resolvedFrameWidth || !resolvedFrameHeight) {
      throw new Error(`[DogRenderer] Invalid grid dimensions for ${src}`);
    }

    const textures = [];
    const maxFrames = Math.min(safeTotalFrames, safeColumns * safeRows);

    for (let i = 0; i < maxFrames; i += 1) {
      const col = i % safeColumns;
      const row = Math.floor(i / safeColumns);
      const frame = new Rectangle(
        col * resolvedFrameWidth,
        row * resolvedFrameHeight,
        resolvedFrameWidth,
        resolvedFrameHeight
      );

      textures.push(new Texture(texture.baseTexture, frame));
    }

    return textures;
  })();

  GRID_TEXTURE_PROMISE_CACHE.set(key, texturePromise);
  return texturePromise;
}

export async function loadGridAnimation({
  src,
  columns = 4,
  rows = 4,
  frameCount = 16,
}) {
  return loadAtlasFrames({
    src,
    columns,
    rows,
    totalFrames: frameCount,
  });
}

export async function preloadGridAnimations(animationMap = {}) {
  if (!animationMap || typeof animationMap !== "object") return {};
  if (GRID_ANIMATION_MAP_PROMISE_CACHE.has(animationMap)) {
    return GRID_ANIMATION_MAP_PROMISE_CACHE.get(animationMap);
  }

  const preloadPromise = (async () => {
    const entries = await Promise.all(
      Object.entries(animationMap).map(async ([key, config]) => {
        try {
          const textures = await loadAtlasFrames({
            src: config?.src,
            frameWidth: config?.frameWidth,
            frameHeight: config?.frameHeight,
            columns: config?.columns,
            rows: config?.rows,
            totalFrames: config?.frameCount,
          });
          return [key, { ...config, textures }];
        } catch (error) {
          console.warn(
            `[DogRenderer] Skipping animation "${key}" because it failed to load.`,
            error
          );
          return null;
        }
      })
    );

    return Object.fromEntries(entries.filter(Boolean));
  })();

  GRID_ANIMATION_MAP_PROMISE_CACHE.set(animationMap, preloadPromise);
  return preloadPromise;
}
