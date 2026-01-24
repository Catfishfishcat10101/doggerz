// src/components/DogPixiView.jsx
// @ts-nocheck

import { useEffect, useMemo, useState } from "react";
import { Stage, Container, AnimatedSprite } from "@pixi/react";
import { Assets, Rectangle, Texture, SCALE_MODES } from "pixi.js";
import { getDogPixiSheetUrl } from "@/utils/dogSpritePaths.js";
import jrManifest from "@/features/game/sprites/jrManifest.json";

const FRAME_W = Number(jrManifest?.frame?.width || 128);
const FRAME_H = Number(jrManifest?.frame?.height || 128);
const DEFAULT_ANIM = String(jrManifest?.defaultAnim || "idle");
const DEFAULT_FPS = Number(jrManifest?.defaultFps || 8);
const COLUMNS = Number(jrManifest?.columns || 0);

const ROW_BY_ANIM = Object.create(null);
const FRAMES_BY_ANIM = Object.create(null);
const FPS_BY_ANIM = Object.create(null);
const ALIASES =
  jrManifest?.aliases && typeof jrManifest.aliases === "object"
    ? jrManifest.aliases
    : {};

if (Array.isArray(jrManifest?.rows)) {
  jrManifest.rows.forEach((row, index) => {
    if (!row?.anim) return;
    const key = String(row.anim).trim().toLowerCase();
    if (!key) return;
    ROW_BY_ANIM[key] = index;
    const frames = Number(row.frames || 0);
    FRAMES_BY_ANIM[key] = frames > 0 ? frames : COLUMNS || 1;
    const fps = Number(row.fps || 0);
    FPS_BY_ANIM[key] = fps > 0 ? fps : DEFAULT_FPS;
  });
}

function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_");
}

function resolveAnim(requested) {
  const key = normalizeKey(requested);
  if (Object.prototype.hasOwnProperty.call(ROW_BY_ANIM, key)) return key;
  const alias = normalizeKey(ALIASES[key]);
  if (alias && Object.prototype.hasOwnProperty.call(ROW_BY_ANIM, alias)) {
    return alias;
  }
  if (Object.prototype.hasOwnProperty.call(ROW_BY_ANIM, DEFAULT_ANIM)) {
    return DEFAULT_ANIM;
  }
  return key || DEFAULT_ANIM;
}

function sheetPath(stage, condition) {
  return getDogPixiSheetUrl(stage, condition);
}

function applyNearestScaleMode(maybeTexture) {
  const nearest = SCALE_MODES?.NEAREST ?? 0;
  const candidates = [
    maybeTexture,
    maybeTexture?.baseTexture,
    maybeTexture?.source,
    maybeTexture?.baseTexture?.source,
  ].filter(Boolean);

  for (const c of candidates) {
    try {
      if ("scaleMode" in c) c.scaleMode = nearest;
    } catch {
      // ignore
    }
    try {
      if (c?.source && "scaleMode" in c.source) c.source.scaleMode = nearest;
    } catch {
      // ignore
    }
    try {
      if ("mipmap" in c) c.mipmap = "off";
    } catch {
      // ignore
    }
  }
}

function sliceRowTextures(baseTexture, rowIndex, frameCount) {
  const textures = [];
  for (let col = 0; col < frameCount; col++) {
    const rect = new Rectangle(
      col * FRAME_W,
      rowIndex * FRAME_H,
      FRAME_W,
      FRAME_H
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
  onStatusChange,
}) {
  const [baseTexture, setBaseTexture] = useState(null);
  const emitStatus = onStatusChange || onStatus;

  useEffect(() => {
    let alive = true;

    // Reset so callers don't briefly see the previous sheet while we load.
    setBaseTexture(null);
    emitStatus?.("loading");

    async function load() {
      const path = sheetPath(stage, condition);

      try {
        // Load the png; Assets.load returns a Texture for images
        const tex = await Assets.load(path);
        const bt = tex?.baseTexture ?? tex;
        applyNearestScaleMode(tex);
        applyNearestScaleMode(bt);
        if (alive) {
          setBaseTexture(bt);
          emitStatus?.("ready");
        }
      } catch (err) {
        // Missing sprite sheets should not crash the whole game.
        // Try falling back to clean, since the placeholder pipeline always generates *_clean.png.
        const fallback = sheetPath(stage, "clean");
        if (fallback !== path) {
          try {
            const tex = await Assets.load(fallback);
            const bt = tex?.baseTexture ?? tex;
            applyNearestScaleMode(tex);
            applyNearestScaleMode(bt);
            if (alive) {
              setBaseTexture(bt);
              emitStatus?.("ready");
            }
            return;
          } catch (fallbackErr) {
            console.warn(
              "[Doggerz] Failed to load sprite sheet + fallback:",
              path,
              fallback,
              fallbackErr
            );
          }
        }

        console.warn("[Doggerz] Failed to load sprite sheet:", path, err);
        if (alive) {
          setBaseTexture(null);
          emitStatus?.("error");
        }
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [condition, emitStatus, stage]);

  const textures = useMemo(() => {
    if (!baseTexture) return [];
    const resolved = resolveAnim(anim);
    const row = ROW_BY_ANIM[resolved] ?? 0;
    const count = FRAMES_BY_ANIM[resolved] ?? (COLUMNS || 1);
    return sliceRowTextures(baseTexture, row, count);
  }, [baseTexture, anim]);

  const animationSpeed = useMemo(() => {
    const resolved = resolveAnim(anim);
    const fps = FPS_BY_ANIM[resolved] ?? DEFAULT_FPS;
    const speed = Number(fps) > 0 ? Number(fps) / 60 : 0.12;
    return Math.max(0.02, speed);
  }, [anim]);

  const canAnimate = textures.length > 0;

  return (
    <Stage
      width={width}
      height={height}
      options={{
        backgroundAlpha: 0,
        antialias: false,
        autoDensity: true,
        roundPixels: true,
        resolution: window.devicePixelRatio || 1,
      }}
    >
      <Container x={width / 2} y={height / 2}>
        {canAnimate ? (
          <AnimatedSprite
            textures={textures}
            isPlaying
            initialFrame={0}
            animationSpeed={animationSpeed}
            anchor={0.5}
            scale={scale}
          />
        ) : null}
      </Container>
    </Stage>
  );
}
