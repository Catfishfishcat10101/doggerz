// src/components/DogPixiView.jsx
// @ts-nocheck

import {
  Component,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Stage, Container, AnimatedSprite } from "@pixi/react";
import { Assets, Rectangle, Texture } from "pixi.js";
import { getDogPixiSheetUrl } from "@/utils/dogSpritePaths.js";
import jrManifest from "@/features/game/jrManifest.json";

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

const FALLBACK_ANIM = "idle";

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

function hasAnimKey(key) {
  return (
    !!key && Object.prototype.hasOwnProperty.call(ROW_BY_ANIM, String(key))
  );
}

function resolveAnim(requested) {
  const key = normalizeKey(requested);
  if (hasAnimKey(key)) return key;

  const alias = normalizeKey(ALIASES[key]);
  if (hasAnimKey(alias)) return alias;

  // Explicit fallback per requirements.
  if (hasAnimKey(FALLBACK_ANIM)) return FALLBACK_ANIM;

  // Keep existing manifest default behavior as a last resort.
  if (hasAnimKey(DEFAULT_ANIM)) return DEFAULT_ANIM;

  return key || FALLBACK_ANIM;
}

function sheetPath(stage, condition) {
  return getDogPixiSheetUrl(stage, condition);
}

function applyNearestScaleMode(maybeTexture) {
  const nearest = "nearest";
  const candidates = [
    maybeTexture,
    maybeTexture?.sourceDeprecated ?? maybeTexture?.source,
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
    // PixiJS v8: Texture now expects sourceDeprecated/source
    textures.push(
      new Texture(
        baseTexture?.sourceDeprecated ?? baseTexture?.source ?? baseTexture,
        rect
      )
    );
  }
  return textures;
}

class DogPixiErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(err) {
    // Catch runtime errors in Stage/@pixi/react reconciliation.
    this.props.onError?.(err);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
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
  const lastStatusRef = useRef(null);
  const hasErroredRef = useRef(false);
  const spriteRef = useRef(null);
  const resolvedAnimKey = useMemo(() => resolveAnim(anim), [anim]);

  const sendStatus = useCallback(
    (next) => {
      if (!emitStatus) return;
      if (lastStatusRef.current === next) return;
      lastStatusRef.current = next;
      if (next === "error") hasErroredRef.current = true;
      emitStatus(next);
    },
    [emitStatus]
  );

  useEffect(() => {
    let alive = true;

    // Reset so callers don't briefly see the previous sheet while we load.
    setBaseTexture(null);
    lastStatusRef.current = null;
    hasErroredRef.current = false;
    sendStatus("loading");

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
          // "ready" is emitted after the sprite actually mounts.
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
              // "ready" is emitted after the sprite actually mounts.
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
          sendStatus("error");
        }
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [condition, sendStatus, stage]);

  const textureCompute = useMemo(() => {
    if (!baseTexture) {
      return { textures: [], missingAnim: false, computeError: null };
    }

    const row = ROW_BY_ANIM[resolvedAnimKey];
    if (typeof row !== "number") {
      // Missing requested + fallback anim. Don't throw; let callers fall back.
      return { textures: [], missingAnim: true, computeError: null };
    }

    const count = FRAMES_BY_ANIM[resolvedAnimKey] ?? (COLUMNS || 1);
    const safeCount = Number.isFinite(count) && count > 0 ? count : 0;
    if (!safeCount) {
      return { textures: [], missingAnim: true, computeError: null };
    }

    try {
      const textures = sliceRowTextures(baseTexture, row, safeCount);
      return {
        textures,
        missingAnim: textures.length === 0,
        computeError: null,
      };
    } catch (err) {
      return { textures: [], missingAnim: true, computeError: err };
    }
  }, [baseTexture, resolvedAnimKey]);

  const textures = textureCompute.textures;

  const animationSpeed = useMemo(() => {
    const fps = FPS_BY_ANIM[resolvedAnimKey] ?? DEFAULT_FPS;
    const speed = Number(fps) > 0 ? Number(fps) / 60 : 0.12;
    return Math.max(0.02, speed);
  }, [resolvedAnimKey]);

  const canAnimate = textures.length > 0;

  useEffect(() => {
    if (!baseTexture) return;
    if (textureCompute.computeError || textureCompute.missingAnim) {
      sendStatus("error");
    }
  }, [
    baseTexture,
    sendStatus,
    textureCompute.computeError,
    textureCompute.missingAnim,
  ]);

  useEffect(() => {
    // Emit "ready" only after the AnimatedSprite actually mounts.
    if (!canAnimate) return;
    if (!baseTexture) return;
    if (textureCompute.computeError || textureCompute.missingAnim) return;
    if (hasErroredRef.current) return;
    sendStatus("ready");
  }, [
    baseTexture,
    canAnimate,
    sendStatus,
    textureCompute.computeError,
    textureCompute.missingAnim,
  ]);

  const resetKey = `${stage}-${condition}-${resolvedAnimKey}`;

  return (
    <DogPixiErrorBoundary
      resetKey={resetKey}
      onError={() => sendStatus("error")}
    >
      <Stage
        width={width}
        height={height}
        options={{
          backgroundAlpha: 0,
          antialias: false,
          autoDensity: true,
          roundPixels: true,
          resolution:
            typeof window === "undefined" ? 1 : window.devicePixelRatio || 1,
        }}
      >
        <Container x={width / 2} y={height / 2}>
          {canAnimate ? (
            <AnimatedSprite
              ref={spriteRef}
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
    </DogPixiErrorBoundary>
  );
}
