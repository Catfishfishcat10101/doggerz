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
import { useDispatch, useSelector } from "react-redux";
import { Stage, Container, AnimatedSprite } from "@pixi/react";
import { Assets, Rectangle, Texture } from "pixi.js";
import { getDogPixiSheetUrl } from "@/utils/dogSpritePaths.js";
import {
  selectSettings,
  setDogPixiMotion,
  setDogPixiQuality,
  setDogPixiScale,
} from "@/redux/settingsSlice.js";
import jrManifest from "@/features/game/jrManifest.json";

try {
  if (Texture?.defaultOptions && "scaleMode" in Texture.defaultOptions) {
    Texture.defaultOptions.scaleMode = "nearest";
  }
} catch {
  // ignore (older Pixi versions may not expose defaultOptions)
}

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
  const dispatch = useDispatch();
  const settings = useSelector(selectSettings);
  const [sheetSource, setSheetSource] = useState(null);
  const [showOptions, setShowOptions] = useState(false);

  const emitStatus = onStatusChange || onStatus;
  const lastStatusRef = useRef(null);
  const hasErroredRef = useRef(false);
  const spriteRef = useRef(null);
  const menuRef = useRef(null);

  const resolvedAnimKey = useMemo(() => resolveAnim(anim), [anim]);

  const reduceMotionSetting = settings?.reduceMotion || "system";
  const prefersReducedMotion = useMemo(() => {
    try {
      return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    } catch {
      return false;
    }
  }, []);
  const reduceMotion =
    reduceMotionSetting === "on" ||
    (reduceMotionSetting !== "off" && prefersReducedMotion);

  const perfMode = settings?.perfMode || "auto";
  const batterySaver = Boolean(settings?.batterySaver);

  const motionEnabled = settings?.dogPixiMotion !== false && !reduceMotion;
  const qualitySetting = settings?.dogPixiQuality || "auto";
  const quality =
    qualitySetting === "auto"
      ? perfMode === "on" || batterySaver || reduceMotion
        ? "low"
        : "high"
      : qualitySetting;
  const resolutionCap = quality === "low" ? 1 : 2;
  const fpsMultiplier = quality === "low" ? 0.75 : 1;

  const scaleSetting = settings?.dogPixiScale || "normal";
  const scaleMultiplier =
    scaleSetting === "small" ? 0.85 : scaleSetting === "large" ? 1.15 : 1;
  const effectiveScale = scale * scaleMultiplier;

  useEffect(() => {
    if (!showOptions) return;
    const onPointerDown = (event) => {
      const el = menuRef.current;
      if (!el || el.contains(event.target)) return;
      setShowOptions(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setShowOptions(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [showOptions]);

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
    return Math.max(0.02, speed * fpsMultiplier);
  }, [fpsMultiplier, resolvedAnimKey]);

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
      <div className="group relative" style={{ width, height }}>
        <Stage
          width={width}
          height={height}
          options={{
            backgroundAlpha: 0,
            antialias: false,
            autoDensity: true,
            roundPixels: true,
            resolution:
              typeof window === "undefined"
                ? 1
                : Math.min(window.devicePixelRatio || 1, resolutionCap),
          }}
        >
          <Container x={width / 2} y={height / 2}>
            {canAnimate ? (
              <AnimatedSprite
                key={resetKey}
                ref={spriteRef}
                textures={textures}
                isPlaying={motionEnabled}
                initialFrame={0}
                animationSpeed={animationSpeed}
                anchor={0.5}
                scale={effectiveScale}
              />
            ) : null}
          </Container>
        </Stage>

        <div className="absolute right-2 top-2" ref={menuRef}>
          <button
            type="button"
            onClick={() => setShowOptions((v) => !v)}
            className="rounded-full border border-white/10 bg-black/50 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/70 opacity-0 transition group-hover:opacity-100"
          >
            View
          </button>
          {showOptions ? (
            <div className="absolute right-0 mt-2 w-56 space-y-2 rounded-2xl border border-white/10 bg-black/90 p-3 text-[11px] text-zinc-200 shadow-[0_16px_45px_rgba(0,0,0,0.45)]">
              <ToggleRow
                label="Animate"
                checked={motionEnabled}
                onChange={(v) => dispatch(setDogPixiMotion(v))}
              />
              <div className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <span>Quality</span>
                <select
                  value={qualitySetting}
                  onChange={(e) => dispatch(setDogPixiQuality(e.target.value))}
                  className="rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-[11px] text-zinc-200"
                >
                  <option value="auto">Auto</option>
                  <option value="low">Low</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <span>Size</span>
                <select
                  value={scaleSetting}
                  onChange={(e) => dispatch(setDogPixiScale(e.target.value))}
                  className="rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-[11px] text-zinc-200"
                >
                  <option value="small">Small</option>
                  <option value="normal">Normal</option>
                  <option value="large">Large</option>
                </select>
              </div>
              {(perfMode === "on" || batterySaver || reduceMotion) && (
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] text-zinc-400">
                  Performance mode active: auto quality reduced.
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </DogPixiErrorBoundary>
  );
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(Boolean(e.target.checked))}
        className="h-4 w-4 accent-emerald-400"
      />
    </label>
  );
}
