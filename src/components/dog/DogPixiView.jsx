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
import { Assets, MIPMAP_MODES, Rectangle, SCALE_MODES, Texture } from "pixi.js";
import {
  getDogAnimSpriteUrl,
  getDogPixiSheetUrl,
} from "@/utils/dogSpritePaths.js";
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
const WALK_BOUNDS = Object.freeze({
  minX: 0.08,
  maxX: 0.92,
  minY: 0.48,
  maxY: 0.94,
});
const DEPTH_SCALE = Object.freeze({
  min: 0.66,
  max: 1.2,
});

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

function clamp(n, lo, hi) {
  const x = Number(n);
  if (!Number.isFinite(x)) return lo;
  return Math.max(lo, Math.min(hi, x));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
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

function resolveAnimIfPresent(requested) {
  const key = normalizeKey(requested);
  if (hasAnimKey(key)) return key;

  const alias = normalizeKey(ALIASES[key]);
  if (hasAnimKey(alias)) return alias;

  return null;
}

function sheetPath(stage, condition) {
  return getDogPixiSheetUrl(stage, condition);
}

function sheetCandidates(stage, condition, animKey) {
  const customAnimUrl = getDogAnimSpriteUrl(stage, animKey);
  const primary = sheetPath(stage, condition);
  const cleanFallback = sheetPath(stage, "clean");
  const pupCleanFallback = sheetPath("pup", "clean");
  return [
    ...new Set([customAnimUrl, primary, cleanFallback, pupCleanFallback]),
  ];
}

function looksLikeBaseTexture(value) {
  if (!value || typeof value !== "object") return false;
  if (typeof value.setStyle === "function") return true;
  if (value?.constructor?.name === "BaseTexture") return true;
  if (value?.resource && typeof value.resource === "object") return true;
  return false;
}

function getBaseTexture(asset, url) {
  if (asset instanceof Texture && asset.baseTexture) {
    return asset.baseTexture;
  }

  if (asset?.baseTexture && looksLikeBaseTexture(asset.baseTexture)) {
    return asset.baseTexture;
  }

  if (looksLikeBaseTexture(asset)) {
    return asset;
  }

  try {
    const fromCache = Texture.from(url);
    if (fromCache?.baseTexture && looksLikeBaseTexture(fromCache.baseTexture)) {
      return fromCache.baseTexture;
    }
  } catch {
    // ignore
  }

  return null;
}

function setNearestOnBaseTexture(baseTexture) {
  if (!baseTexture) return;

  try {
    if ("scaleMode" in baseTexture) {
      baseTexture.scaleMode = SCALE_MODES?.NEAREST ?? baseTexture.scaleMode;
    }
  } catch {
    // ignore
  }

  try {
    if ("mipmap" in baseTexture) {
      baseTexture.mipmap = MIPMAP_MODES?.OFF ?? baseTexture.mipmap;
    }
  } catch {
    // ignore
  }

  try {
    if (typeof baseTexture.update === "function") {
      baseTexture.update();
    }
  } catch {
    // ignore
  }
}

function makeFrameTexture(baseTexture, frame) {
  if (!baseTexture) return null;

  try {
    return new Texture(baseTexture, frame);
  } catch {
    // ignore
  }

  try {
    const source =
      baseTexture?.source ||
      baseTexture?.resource?.source ||
      baseTexture?.sourceDeprecated ||
      null;
    if (!source) return null;
    return new Texture({ source, frame });
  } catch {
    return null;
  }
}

function sliceRowTextures(baseTexture, rowIndex, frameCount) {
  const textures = [];
  for (let col = 0; col < frameCount; col++) {
    const frame = new Rectangle(
      col * FRAME_W,
      rowIndex * FRAME_H,
      FRAME_W,
      FRAME_H
    );
    const t = makeFrameTexture(baseTexture, frame);
    if (t) textures.push(t);
  }
  return textures;
}

function estimateGrid(baseTexture) {
  const w = Number(baseTexture?.width || 0);
  const h = Number(baseTexture?.height || 0);
  if (!w || !h) return { cols: 1, rows: 1 };

  let best = { cols: 1, rows: 1, score: Number.POSITIVE_INFINITY };
  for (let cols = 3; cols <= 12; cols++) {
    for (let rows = 3; rows <= 12; rows++) {
      const cellW = w / cols;
      const cellH = h / rows;
      if (cellW < 48 || cellH < 48) continue;
      const aspectPenalty = Math.abs(cellW - cellH);
      const intPenalty =
        Math.abs(cellW - Math.round(cellW)) +
        Math.abs(cellH - Math.round(cellH));
      const frameBonus = cols * rows * 0.03;
      const score = aspectPenalty + intPenalty - frameBonus;
      if (score < best.score) best = { cols, rows, score };
    }
  }
  return { cols: best.cols, rows: best.rows };
}

function sliceAllGridTextures(baseTexture) {
  const { cols, rows } = estimateGrid(baseTexture);
  const w = Number(baseTexture?.width || 0);
  const h = Number(baseTexture?.height || 0);
  if (!w || !h || !cols || !rows) return [];

  const frameW = Math.floor(w / cols);
  const frameH = Math.floor(h / rows);
  const textures = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const frame = new Rectangle(col * frameW, row * frameH, frameW, frameH);
      const t = makeFrameTexture(baseTexture, frame);
      if (t) textures.push(t);
    }
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
  attentionTarget = null,
  bondValue = 0,
  dogIsSleeping = false,
}) {
  const dispatch = useDispatch();
  const settings = useSelector(selectSettings);
  const [sheetBaseTexture, setSheetBaseTexture] = useState(null);
  const [sheetSourceUrl, setSheetSourceUrl] = useState("");
  const [showOptions, setShowOptions] = useState(false);

  const emitStatus = onStatusChange || onStatus;
  const lastStatusRef = useRef(null);
  const hasErroredRef = useRef(false);
  const spriteRef = useRef(null);
  const menuRef = useRef(null);
  const [dogWorldNorm, setDogWorldNorm] = useState({
    x: 0.5,
    y: WALK_BOUNDS.maxY * 0.9,
  });
  const [dogRenderState, setDogRenderState] = useState({
    x: width / 2,
    y: height * 0.82,
    scale: 1,
    zIndex: 500,
  });
  const [displayAnim, setDisplayAnim] = useState(anim);
  const [isOneShot, setIsOneShot] = useState(false);
  const activeReactionTokenRef = useRef(0);
  const reactionQueueRef = useRef([]);
  const reactionTimerRef = useRef(0);
  const moveRafRef = useRef(0);
  const sequenceActiveRef = useRef(false);
  const pendingAnimRef = useRef(anim);
  const lastAttentionAtRef = useRef(0);
  const lastCompletionTokenRef = useRef(0);
  const dogRenderRef = useRef(dogRenderState);
  const resolvedAnimKey = useMemo(
    () => resolveAnim(displayAnim),
    [displayAnim]
  );

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

  const stageResolution = useMemo(() => {
    if (typeof window === "undefined") return 1;
    return Math.min(window.devicePixelRatio || 1, resolutionCap);
  }, [resolutionCap]);

  const stageOptions = useMemo(
    () => ({
      backgroundAlpha: 0,
      antialias: false,
      autoDensity: true,
      roundPixels: true,
      resolution: stageResolution,
    }),
    [stageResolution]
  );

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

  useEffect(() => {
    pendingAnimRef.current = anim;
    if (!sequenceActiveRef.current) {
      setDisplayAnim(anim);
    }
  }, [anim]);

  useEffect(() => {
    dogRenderRef.current = dogRenderState;
  }, [dogRenderState]);

  useEffect(() => {
    return () => {
      if (reactionTimerRef.current) {
        window.clearTimeout(reactionTimerRef.current);
      }
      if (moveRafRef.current) {
        window.cancelAnimationFrame(moveRafRef.current);
      }
    };
  }, []);

  const alertAnimKey = useMemo(
    () =>
      resolveAnimIfPresent("alert") ||
      resolveAnimIfPresent("sit") ||
      resolveAnimIfPresent("bark") ||
      resolveAnimIfPresent("wag") ||
      resolveAnim("idle"),
    []
  );

  const clearReactionTimer = useCallback(() => {
    if (!reactionTimerRef.current) return;
    window.clearTimeout(reactionTimerRef.current);
    reactionTimerRef.current = 0;
  }, []);

  const estimateOneShotDurationMs = useCallback((animKey) => {
    const key = resolveAnim(animKey);
    const frames = Math.max(1, Number(FRAMES_BY_ANIM[key] || 1));
    const fps = Math.max(1, Number(FPS_BY_ANIM[key] || DEFAULT_FPS));
    // pad slightly so we do not cut off the last frame
    return Math.round((frames / fps) * 1000 + 50);
  }, []);

  const finalizeReaction = useCallback(() => {
    sequenceActiveRef.current = false;
    reactionQueueRef.current = [];
    clearReactionTimer();
    setIsOneShot(false);
    setDisplayAnim(pendingAnimRef.current || anim || "idle");
  }, [anim, clearReactionTimer]);

  const runNextReactionStep = useCallback(
    (token) => {
      if (token !== activeReactionTokenRef.current) return;
      const step = reactionQueueRef.current.shift();
      if (!step) {
        finalizeReaction();
        return;
      }

      setDisplayAnim(step.anim);
      setIsOneShot(Boolean(step.oneShot));

      clearReactionTimer();

      // Use timer fallback so one-shots still complete when motion is disabled.
      const ms = step.oneShot
        ? motionEnabled
          ? estimateOneShotDurationMs(step.anim)
          : 40
        : Math.max(0, Number(step.holdMs || 0));

      if (ms > 0) {
        reactionTimerRef.current = window.setTimeout(() => {
          runNextReactionStep(token);
        }, ms);
      }
    },
    [
      clearReactionTimer,
      estimateOneShotDurationMs,
      finalizeReaction,
      motionEnabled,
    ]
  );

  const startReactionSequence = useCallback(
    (steps) => {
      sequenceActiveRef.current = true;
      activeReactionTokenRef.current += 1;
      const token = activeReactionTokenRef.current;
      lastCompletionTokenRef.current = 0;
      reactionQueueRef.current = Array.isArray(steps) ? [...steps] : [];
      runNextReactionStep(token);
    },
    [runNextReactionStep]
  );

  const handleOneShotComplete = useCallback(() => {
    if (!sequenceActiveRef.current || !isOneShot) return;
    const token = activeReactionTokenRef.current;
    if (lastCompletionTokenRef.current === token) return;
    lastCompletionTokenRef.current = token;
    clearReactionTimer();
    runNextReactionStep(token);
  }, [clearReactionTimer, isOneShot, runNextReactionStep]);

  useEffect(() => {
    const at = Number(attentionTarget?.at);
    if (!Number.isFinite(at) || at <= lastAttentionAtRef.current) return;
    lastAttentionAtRef.current = at;

    const walkAnim = resolveAnim("walk");
    const isCurrentlyWalking = resolveAnim(displayAnim) === walkAnim;
    const sleepingNow = Boolean(dogIsSleeping);

    // If already walking, keep it seamless; no wake sequence needed.
    if (isCurrentlyWalking && !sleepingNow) return;

    if (sleepingNow) {
      startReactionSequence([
        { anim: alertAnimKey, oneShot: true },
        { anim: walkAnim, oneShot: false, holdMs: 900 },
      ]);
      return;
    }

    startReactionSequence([{ anim: walkAnim, oneShot: false, holdMs: 750 }]);
  }, [
    attentionTarget?.at,
    alertAnimKey,
    displayAnim,
    dogIsSleeping,
    startReactionSequence,
  ]);

  useEffect(() => {
    const xNorm = Number(attentionTarget?.xNorm);
    const yNorm = Number(attentionTarget?.yNorm);
    if (!Number.isFinite(xNorm) || !Number.isFinite(yNorm)) return;

    const nx = clamp(xNorm, 0, 1);
    const ny = clamp(yNorm, 0, 1);
    const next = {
      x: lerp(WALK_BOUNDS.minX, WALK_BOUNDS.maxX, nx),
      y: lerp(WALK_BOUNDS.minY, WALK_BOUNDS.maxY, ny),
    };

    const bond = Math.max(0, Math.min(100, Number(bondValue) || 0));
    // Lower bond => brief hesitation. Higher bond => near-instant reaction.
    const responseDelayMs = Math.round(260 - (bond / 100) * 240);
    const startId = window.setTimeout(() => {
      setDogWorldNorm(next);
    }, responseDelayMs);

    return () => {
      window.clearTimeout(startId);
    };
  }, [
    attentionTarget?.at,
    attentionTarget?.xNorm,
    attentionTarget?.yNorm,
    bondValue,
  ]);

  const dogDepthTarget = useMemo(() => {
    const nx = clamp(dogWorldNorm?.x, WALK_BOUNDS.minX, WALK_BOUNDS.maxX);
    const ny = clamp(dogWorldNorm?.y, WALK_BOUNDS.minY, WALK_BOUNDS.maxY);
    const depthPct = clamp(
      (ny - WALK_BOUNDS.minY) / (WALK_BOUNDS.maxY - WALK_BOUNDS.minY),
      0,
      1
    );

    return {
      x: nx * width,
      y: ny * height,
      scale: lerp(DEPTH_SCALE.min, DEPTH_SCALE.max, depthPct),
      zIndex: Math.round(100 + depthPct * 900),
    };
  }, [dogWorldNorm?.x, dogWorldNorm?.y, height, width]);

  useEffect(() => {
    if (moveRafRef.current) {
      window.cancelAnimationFrame(moveRafRef.current);
      moveRafRef.current = 0;
    }

    const start = dogRenderRef.current;
    const target = dogDepthTarget;
    const dx = target.x - start.x;
    const dy = target.y - start.y;
    const dist = Math.hypot(dx, dy);
    const durationMs = motionEnabled
      ? Math.max(150, Math.min(860, (dist / 100) * 420))
      : 0;

    if (durationMs <= 0 || dist < 1) {
      setDogRenderState(target);
      return;
    }

    const startedAt = performance.now();
    const tick = (now) => {
      const t = clamp((now - startedAt) / durationMs, 0, 1);
      const eased = 1 - Math.pow(1 - t, 2);
      const next = {
        x: lerp(start.x, target.x, eased),
        y: lerp(start.y, target.y, eased),
        scale: lerp(start.scale, target.scale, eased),
        zIndex: Math.round(lerp(start.zIndex, target.zIndex, eased)),
      };
      setDogRenderState(next);
      if (t < 1) {
        moveRafRef.current = window.requestAnimationFrame(tick);
      } else {
        moveRafRef.current = 0;
      }
    };

    moveRafRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (moveRafRef.current) {
        window.cancelAnimationFrame(moveRafRef.current);
        moveRafRef.current = 0;
      }
    };
  }, [dogDepthTarget, motionEnabled]);

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

    setSheetBaseTexture(null);
    setSheetSourceUrl("");
    lastStatusRef.current = null;
    hasErroredRef.current = false;
    sendStatus("loading");

    async function load() {
      const candidates = sheetCandidates(stage, condition, resolvedAnimKey);
      for (const candidate of candidates) {
        try {
          const asset = await Assets.load(candidate);
          const baseTexture = getBaseTexture(asset, candidate);
          if (!baseTexture) {
            throw new Error("No base texture resolved from loaded asset");
          }
          setNearestOnBaseTexture(baseTexture);
          if (!baseTexture.valid) {
            throw new Error("Resolved base texture is invalid");
          }

          if (alive) {
            setSheetBaseTexture(baseTexture);
            setSheetSourceUrl(candidate);
          }
          return;
        } catch {
          // keep trying candidates
        }
      }

      console.error("[Doggerz] CRITICAL: No dog sprite candidate loaded:", {
        stage,
        condition,
        anim: resolvedAnimKey,
      });
      if (alive) {
        setSheetBaseTexture(null);
        setSheetSourceUrl("");
        sendStatus("error");
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [condition, resolvedAnimKey, sendStatus, stage]);

  const textureCompute = useMemo(() => {
    if (!sheetBaseTexture) {
      return { textures: [], missingAnim: false, computeError: null };
    }

    try {
      const usesCustomAnimSheet =
        typeof sheetSourceUrl === "string" &&
        /\/assets\/sprites\/jr\/(puppy-|adult-)/.test(sheetSourceUrl);

      const textures = usesCustomAnimSheet
        ? sliceAllGridTextures(sheetBaseTexture)
        : (() => {
            const row = ROW_BY_ANIM[resolvedAnimKey];
            if (typeof row !== "number") return [];
            const count = FRAMES_BY_ANIM[resolvedAnimKey] ?? (COLUMNS || 1);
            const safeCount = Number.isFinite(count) && count > 0 ? count : 0;
            if (!safeCount) return [];
            return sliceRowTextures(sheetBaseTexture, row, safeCount);
          })();

      const safe = textures.filter((t) => t instanceof Texture);

      return {
        textures: safe,
        missingAnim: safe.length === 0,
        computeError: null,
      };
    } catch (err) {
      return { textures: [], missingAnim: true, computeError: err };
    }
  }, [sheetBaseTexture, resolvedAnimKey, sheetSourceUrl]);

  const textures = textureCompute.textures;

  const animationSpeed = useMemo(() => {
    const fps = FPS_BY_ANIM[resolvedAnimKey] ?? DEFAULT_FPS;
    const speed = Number(fps) > 0 ? Number(fps) / 60 : 0.12;
    return Math.max(0.02, speed * fpsMultiplier);
  }, [fpsMultiplier, resolvedAnimKey]);

  const canAnimate = textures.length > 0;
  const resetKey = `${stage}-${condition}-${resolvedAnimKey}`;

  useEffect(() => {
    if (!sheetBaseTexture) return;
    if (textureCompute.computeError || textureCompute.missingAnim) {
      sendStatus("error");
    }
  }, [
    sheetBaseTexture,
    sendStatus,
    textureCompute.computeError,
    textureCompute.missingAnim,
  ]);

  useEffect(() => {
    if (!canAnimate) return;
    if (!sheetBaseTexture) return;
    if (textureCompute.computeError || textureCompute.missingAnim) return;
    if (hasErroredRef.current) return;
    sendStatus("ready");
  }, [
    sheetBaseTexture,
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
          key={`stage-${stageResolution}`}
          width={width}
          height={height}
          options={stageOptions}
        >
          <Container sortableChildren={true}>
            <Container
              x={dogRenderState.x}
              y={dogRenderState.y}
              zIndex={dogRenderState.zIndex}
            >
              {canAnimate ? (
                <AnimatedSprite
                  key={resetKey}
                  ref={spriteRef}
                  textures={textures}
                  isPlaying={motionEnabled}
                  initialFrame={0}
                  animationSpeed={animationSpeed}
                  loop={!isOneShot}
                  onComplete={handleOneShotComplete}
                  anchor={[0.5, 1]}
                  scale={effectiveScale * dogRenderState.scale}
                />
              ) : null}
            </Container>
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
