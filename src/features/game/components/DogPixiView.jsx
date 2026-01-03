// src/features/game/components/DogPixiView.jsx
// @ts-nocheck

import { useEffect, useMemo, useState } from "react";
import { Stage, Container, AnimatedSprite } from "@pixi/react";
import { Assets, Rectangle, Texture } from "pixi.js";
import { getDogPixiSheetUrl } from "@/utils/dogSpritePaths.js";

// IMPORTANT: set these to match your sheet
const FRAME_W = 128;
const FRAME_H = 128;

// Fixed row order in the sheet
const ROW_BY_ANIM = {
  idle: 0,
  walk: 1,
  sleep: 2,
  bark: 3,
  scratch: 4,
};

// Frames per row (columns used from the left)
const FRAMES_BY_ANIM = {
  idle: 6,
  walk: 8,
  sleep: 6,
  bark: 4,
  scratch: 6,
};

function sheetPath(stage, condition) {
  return getDogPixiSheetUrl(stage, condition);
}

function sliceRowTextures(baseTexture, rowIndex, frameCount) {
  const textures = [];
  for (let col = 0; col < frameCount; col++) {
    const rect = new Rectangle(
      col * FRAME_W,
      rowIndex * FRAME_H,
      FRAME_W,
      FRAME_H,
    );
    textures.push(new Texture(baseTexture, rect));
  }
  return textures;
}

export default function DogPixiView({
  stage = "pup",
  condition = "clean",
  anim = "idle",
  width = 420,
  height = 300,
  scale = 2.2,
  onStatus,
}) {
  const [baseTexture, setBaseTexture] = useState(null);

  useEffect(() => {
    let alive = true;

    // Reset so callers don't briefly see the previous sheet while we load.
    setBaseTexture(null);
    onStatus?.("loading");

    async function load() {
      const path = sheetPath(stage, condition);

      try {
        // Load the png; Assets.load returns a Texture for images
        const tex = await Assets.load(path);
        const bt = tex?.baseTexture ?? tex;
        if (alive) {
          setBaseTexture(bt);
          onStatus?.("ready");
        }
      } catch (err) {
        // Missing sprite sheets should not crash the whole game.
        // Try falling back to clean, since the placeholder pipeline always generates *_clean.png.
        const fallback = sheetPath(stage, "clean");
        if (fallback !== path) {
          try {
            const tex = await Assets.load(fallback);
            const bt = tex?.baseTexture ?? tex;
            if (alive) {
              setBaseTexture(bt);
              onStatus?.("ready");
            }
            return;
          } catch (fallbackErr) {
            console.warn(
              "[Doggerz] Failed to load sprite sheet + fallback:",
              path,
              fallback,
              fallbackErr,
            );
          }
        }

        console.warn("[Doggerz] Failed to load sprite sheet:", path, err);
        if (alive) {
          setBaseTexture(null);
          onStatus?.("error");
        }
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [condition, onStatus, stage]);

  const textures = useMemo(() => {
    if (!baseTexture) return [];
    const row = ROW_BY_ANIM[anim] ?? 0;
    const count = FRAMES_BY_ANIM[anim] ?? 1;
    return sliceRowTextures(baseTexture, row, count);
  }, [baseTexture, anim]);

  const canAnimate = textures.length > 0;

  return (
    <Stage
      width={width}
      height={height}
      options={{
        backgroundAlpha: 0,
        antialias: false,
        autoDensity: true,
        resolution: window.devicePixelRatio || 1,
      }}
    >
      <Container x={width / 2} y={height / 2}>
        {canAnimate ? (
          <AnimatedSprite
            textures={textures}
            isPlaying
            initialFrame={0}
            animationSpeed={0.12}
            anchor={0.5}
            scale={scale}
          />
        ) : null}
      </Container>
    </Stage>
  );
}
