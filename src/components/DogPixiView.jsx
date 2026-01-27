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
import { Assets, Rectangle, Texture, TextureStyle } from "pixi.js";
import { getDogPixiSheetUrl } from "@/utils/dogSpritePaths.js";
import jrManifest from "@/features/game/jrManifest.json";

TextureStyle.defaultOptions.scaleMode = "nearest";

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

  if (hasAnimKey(FALLBACK_ANIM)) return FALLBACK_ANIM;
  if (hasAnimKey(DEFAULT_ANIM)) return DEFAULT_ANIM;

  return key || FALLBACK_ANIM;
}

function sheetPath(stage, condition) {
  return getDogPixiSheetUrl(stage, condition);
}

function getTextureSource(asset) {
  // Assets.load(image) usually returns a Texture in Pixi v8
  return (
    asset?.source ||
    asset?.sourceDeprecated ||
    asset?.baseTexture?.source ||
    asset?.baseTexture?.sourceDeprecated ||
    null
  );
}

function setNearestOnSource(source) {
  try {
    if (source && "scaleMode" in source) source.scaleMode = "nearest";
  } catch {
    // ignore
  }
  try {
    if (source && "mipmap" in source) source.mipmap = "off";
  } catch {
    // ignore
  }
}

function makeFrameTexture(source, frame) {
  // Pixi v8 prefers options-object construction.
  try {
    return new Texture({ source, frame });
  } catch {
    // Fallback for environments still accepting the old signature.
    try {
      return new Texture(source, frame);
    } catch {
      return null;
    }
  }
}

function sliceRowTextures(source, rowIndex, frameCount) {
  const textures = [];
  for (let col = 0; col < frameCount; col++) {
    const frame = new Rectangle(
      col * FRAME_W,
      rowIndex * FRAME_H,
      FRAME_W,
      FRAME_H
    );
    const t = makeFrameTexture(source, frame);
    if (t) textures.push(t);
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
  const [sheetSource, setSheetSource] = useState(null);

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

    setSheetSource(null);
    lastStatusRef.current = null;
    hasErroredRef.current = false;
    sendStatus("loading");

    async function load() {
      const path = sheetPath(stage, condition);

      try {
        const asset = await Assets.load(path);
        const source = getTextureSource(asset);
        if (!source) throw new Error("No texture source from Assets.load()");
        setNearestOnSource(source);

        if (alive) {
          setSheetSource(source);
        }
      } catch (err) {
        const fallback = sheetPath(stage, "clean");
        if (fallback !== path) {
          try {
            const asset = await Assets.load(fallback);
            const source = getTextureSource(asset);
            if (!source) throw new Error("No texture source from fallback");
            setNearestOnSource(source);

            if (alive) {
              setSheetSource(source);
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
          setSheetSource(null);
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
    if (!sheetSource) {
      return { textures: [], missingAnim: false, computeError: null };
    }

    const row = ROW_BY_ANIM[resolvedAnimKey];
    if (typeof row !== "number") {
      return { textures: [], missingAnim: true, computeError: null };
    }

    const count = FRAMES_BY_ANIM[resolvedAnimKey] ?? (COLUMNS || 1);
    const safeCount = Number.isFinite(count) && count > 0 ? count : 0;
    if (!safeCount) {
      return { textures: [], missingAnim: true, computeError: null };
    }

    try {
      const textures = sliceRowTextures(sheetSource, row, safeCount).filter(
        (t) => t && typeof t === "object"
      );

      // Safety: AnimatedSprite MUST receive actual Texture instances.
      const safe = textures.filter((t) => t instanceof Texture);

      return {
        textures: safe,
        missingAnim: safe.length === 0,
        computeError: null,
      };
    } catch (err) {
      return { textures: [], missingAnim: true, computeError: err };
    }
  }, [sheetSource, resolvedAnimKey]);

  const textures = textureCompute.textures;

  const animationSpeed = useMemo(() => {
    const fps = FPS_BY_ANIM[resolvedAnimKey] ?? DEFAULT_FPS;
    const speed = Number(fps) > 0 ? Number(fps) / 60 : 0.12;
    return Math.max(0.02, speed);
  }, [resolvedAnimKey]);

  const canAnimate = textures.length > 0;
  const resetKey = `${stage}-${condition}-${resolvedAnimKey}`;

  useEffect(() => {
    if (!sheetSource) return;
    if (textureCompute.computeError || textureCompute.missingAnim) {
      sendStatus("error");
    }
  }, [
    sheetSource,
    sendStatus,
    textureCompute.computeError,
    textureCompute.missingAnim,
  ]);

  useEffect(() => {
    if (!canAnimate) return;
    if (!sheetSource) return;
    if (textureCompute.computeError || textureCompute.missingAnim) return;
    if (hasErroredRef.current) return;
    sendStatus("ready");
  }, [
    sheetSource,
    canAnimate,
    sendStatus,
    textureCompute.computeError,
    textureCompute.missingAnim,
  ]);

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
              key={resetKey}
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
