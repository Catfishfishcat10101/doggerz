import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Application,
  AnimatedSprite,
  Assets,
  Container,
  Sprite,
} from "pixi.js";
import {
  DEFAULT_DOG_ACTION,
  DOG_ANIMATION_MAP,
  isContractOneShot,
  resolveContractClipKey,
  resolveDogAnimationContract,
} from "./dogAnimationMap.js";
import { resolveDogRendererFallbackSrc } from "./dogAssets.js";
import { loadAtlasFrames, preloadGridAnimations } from "./spriteSheetUtils.js";

const FALLBACK_RENDER_MIN_HEIGHT = 420;
const IDLE_ACTION_KEYS = new Set([
  DEFAULT_DOG_ACTION,
  "idle_resting",
  "wag",
  "sniff",
  "light_sleep",
  "deep_rem_sleep",
  "sleep",
  "puppy_idle_pack",
  "puppy_sleeping_pack",
  "golden_years_idle",
  "golden_years_sleeping",
  "lethargic_lay",
  "limping",
]);

function clamp(value, min, max) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return min;
  return Math.max(min, Math.min(max, numeric));
}

function getDogLocalSize(dog) {
  if (!dog) return { width: 0, height: 0 };

  try {
    const bounds = dog.getLocalBounds();
    return {
      width: Number(bounds?.width || 0),
      height: Number(bounds?.height || 0),
    };
  } catch {
    return { width: 0, height: 0 };
  }
}

function normalizeAction(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function resolveIdleAnimationSpeedMultiplier(intensity = "calm") {
  const key = String(intensity || "calm")
    .trim()
    .toLowerCase();
  if (key === "minimal") return 0.82;
  if (key === "standard") return 1;
  if (key === "lively") return 1.08;
  return 0.9;
}

function getStableAnimationLayout(config = {}, sprite = null) {
  const firstFrame = config?.textures?.[0] || sprite?.texture || null;
  const frameWidth = Number(firstFrame?.width || 0);
  const frameHeight = Number(firstFrame?.height || 0);
  const rawAnchorX = Number(config?.anchorX);
  const rawAnchorY = Number(config?.anchorY);
  const rawScaleMultiplier = Number(config?.scaleMultiplier);
  return {
    frameWidth: Math.max(1, frameWidth || 256),
    frameHeight: Math.max(1, frameHeight || 256),
    anchorX: clamp(Number.isFinite(rawAnchorX) ? rawAnchorX : 0.5, 0, 1),
    anchorY: clamp(Number.isFinite(rawAnchorY) ? rawAnchorY : 0.98, 0, 1),
    scaleMultiplier: clamp(
      Number.isFinite(rawScaleMultiplier) ? rawScaleMultiplier : 1,
      0.7,
      1.3
    ),
    groundOffsetPx: Number(config?.groundOffsetPx || 0),
  };
}

function looksLikeSpriteAtlas(src = "") {
  const fileName = String(src || "")
    .split("/")
    .pop()
    ?.split("?")[0]
    ?.toLowerCase();

  if (!fileName) return false;
  if (/_clean\.png$/i.test(fileName)) return false;
  return /^(pup|adult|senior)_.+\.png$/i.test(fileName);
}

export default function DogRenderer({
  width = 960,
  height = 540,
  minHeight = height,
  animationCatalog = DOG_ANIMATION_MAP,
  animationClip = null,
  action = "",
  actionPlayToken = "",
  facing = "",
  x = undefined,
  y = undefined,
  scale = undefined,
  mood = "",
  orientation = "right",
  xNorm = 0.5,
  groundYNorm = 0.8,
  maxWidthRatio = 0.26,
  maxHeightRatio = 0.44,
  scaleBias = 1,
  idleIntensity = "calm",
  speedMultiplier = 1,
  reduceMotion = false,
  className = "",
  fallbackSrc = "",
  onFallbackChange = undefined,
}) {
  const resolvedAnimationCatalog = useMemo(
    () =>
      animationCatalog && typeof animationCatalog === "object"
        ? animationCatalog
        : DOG_ANIMATION_MAP,
    [animationCatalog]
  );
  const catalogFallbackKey = useMemo(
    () => Object.keys(resolvedAnimationCatalog)[0] || DEFAULT_DOG_ACTION,
    [resolvedAnimationCatalog]
  );
  const hostRef = useRef(null);
  const appRef = useRef(null);
  const dogLayerRef = useRef(null);
  const dogSpriteRef = useRef(null);
  const fallbackSpriteRef = useRef(null);
  const animationsRef = useRef({});
  const currentPlaybackRef = useRef({ key: null, token: null });
  const mountedRef = useRef(false);
  const [useStaticFallback, setUseStaticFallback] = useState(false);
  const [fallbackReason, setFallbackReason] = useState("");
  const animationLayoutRef = useRef({
    frameWidth: 256,
    frameHeight: 256,
    anchorX: 0.5,
    anchorY: 0.98,
    scaleMultiplier: 1,
    groundOffsetPx: 0,
  });
  const initialConfigRef = useRef({
    width,
    height,
    animationClip,
  });
  const scenePropsRef = useRef({
    orientation,
    xNorm,
    groundYNorm,
    maxWidthRatio,
    maxHeightRatio,
    scaleBias,
  });

  const resolvedMinHeight = useMemo(() => {
    const explicit = Number(minHeight);
    if (Number.isFinite(explicit) && explicit > 0) {
      return Math.max(240, Math.round(explicit));
    }
    return FALLBACK_RENDER_MIN_HEIGHT;
  }, [minHeight]);

  const resolvedOrientation = useMemo(() => {
    const explicit = String(facing || "")
      .trim()
      .toLowerCase();
    if (explicit === "left" || explicit === "right") return explicit;
    return String(orientation || "right")
      .trim()
      .toLowerCase() === "left"
      ? "left"
      : "right";
  }, [facing, orientation]);

  const resolvedXNorm = useMemo(() => {
    const explicitX = Number(x);
    if (Number.isFinite(explicitX)) {
      if (explicitX >= 0 && explicitX <= 1) return clamp(explicitX, 0.02, 0.98);
      return clamp(explicitX / Math.max(1, Number(width || 1)), 0.02, 0.98);
    }
    return clamp(Number(xNorm || 0.5), 0.02, 0.98);
  }, [width, x, xNorm]);

  const resolvedGroundYNorm = useMemo(() => {
    const explicitY = Number(y);
    if (Number.isFinite(explicitY)) {
      if (explicitY >= 0 && explicitY <= 1) return clamp(explicitY, 0.55, 0.95);
      return clamp(explicitY / Math.max(1, Number(height || 1)), 0.55, 0.95);
    }
    return clamp(Number(groundYNorm || 0.8), 0.55, 0.95);
  }, [groundYNorm, height, y]);

  const resolvedScaleBias = useMemo(() => {
    const explicitScale = Number(scale);
    if (Number.isFinite(explicitScale)) {
      return clamp(explicitScale, 0.5, 1.5);
    }
    return clamp(Number(scaleBias || 1), 0.5, 1.5);
  }, [scale, scaleBias]);

  const resolvedAnimationClip = useMemo(() => {
    if (animationClip && typeof animationClip === "object")
      return animationClip;

    const normalizedAction = normalizeAction(action);
    if (!normalizedAction) return { key: catalogFallbackKey };

    const clipKey = resolveContractClipKey(normalizedAction);
    const config =
      resolvedAnimationCatalog[clipKey] ||
      resolveDogAnimationContract(clipKey) ||
      resolvedAnimationCatalog[catalogFallbackKey] ||
      DOG_ANIMATION_MAP[DEFAULT_DOG_ACTION];
    const oneShot = isContractOneShot(normalizedAction);
    const resolvedPlayToken = oneShot
      ? `shot:${clipKey}:${String(actionPlayToken || mood || "default")}`
      : `loop:${clipKey}`;

    return {
      key: resolvedAnimationCatalog[clipKey] ? clipKey : catalogFallbackKey,
      playToken: resolvedPlayToken,
      loop: oneShot ? false : Boolean(config?.loop !== false),
      fps: Number(config?.fps || 8) || 8,
      frameCount: Number(config?.frameCount || 1) || 1,
    };
  }, [
    action,
    actionPlayToken,
    animationClip,
    catalogFallbackKey,
    mood,
    resolvedAnimationCatalog,
  ]);
  const resolvedFallbackSrc = useMemo(
    () => resolveDogRendererFallbackSrc({ staticSpriteUrl: fallbackSrc }),
    [fallbackSrc]
  );

  const getAnimationSpeed = useCallback(
    (config, key) => {
      const baseSpeed =
        ((Number(config?.fps || 8) || 8) / 60) *
        clamp(Number(speedMultiplier || 1), 0.35, 1.85);
      if (
        !IDLE_ACTION_KEYS.has(
          String(key || "")
            .trim()
            .toLowerCase()
        )
      ) {
        return baseSpeed;
      }
      return baseSpeed * resolveIdleAnimationSpeedMultiplier(idleIntensity);
    },
    [idleIntensity, speedMultiplier]
  );

  const layoutDog = useCallback(() => {
    const app = appRef.current;
    const dog = dogSpriteRef.current || fallbackSpriteRef.current;
    if (!app || !dog) return;

    const stageWidth = Number(app.screen?.width || app.renderer?.width || 0);
    const stageHeight = Number(app.screen?.height || app.renderer?.height || 0);
    const currentXNorm = clamp(scenePropsRef.current.xNorm, 0.02, 0.98);
    const currentGroundYNorm = clamp(
      scenePropsRef.current.groundYNorm,
      0.55,
      0.95
    );
    const animationLayout = animationLayoutRef.current || {};
    const naturalSize = getDogLocalSize(dog);
    const stableWidth = Math.max(
      1,
      Number(animationLayout.frameWidth || naturalSize.width || 256)
    );
    const stableHeight = Math.max(
      1,
      Number(animationLayout.frameHeight || naturalSize.height || 256)
    );
    const maxDogWidth =
      stageWidth * clamp(scenePropsRef.current.maxWidthRatio, 0.12, 0.95);
    const maxDogHeight =
      stageHeight * clamp(scenePropsRef.current.maxHeightRatio, 0.18, 0.95);
    const fitScale = Math.min(
      maxDogWidth / stableWidth,
      maxDogHeight / stableHeight
    );
    const resolvedScale = clamp(
      fitScale *
        clamp(scenePropsRef.current.scaleBias, 0.5, 1.5) *
        0.9 *
        clamp(Number(animationLayout.scaleMultiplier || 1), 0.7, 1.3),
      0.18,
      4
    );
    const groundOffsetPx =
      Number(animationLayout.groundOffsetPx || 0) * resolvedScale;

    dog.anchor.set(
      clamp(Number(animationLayout.anchorX || 0.5), 0, 1),
      clamp(Number(animationLayout.anchorY || 0.98), 0, 1)
    );
    dog.position.set(
      stageWidth * currentXNorm,
      stageHeight * currentGroundYNorm + groundOffsetPx
    );
    dog.scale.set(
      resolvedScale * (scenePropsRef.current.orientation === "left" ? -1 : 1),
      resolvedScale
    );
  }, []);

  const destroyCurrentDog = useCallback(() => {
    const currentDog = dogSpriteRef.current || fallbackSpriteRef.current;
    const dogLayer = dogLayerRef.current;

    if (currentDog && dogLayer) {
      dogLayer.removeChild(currentDog);
      if (typeof currentDog.stop === "function") {
        currentDog.stop();
      }
      currentDog.destroy();
    }

    dogSpriteRef.current = null;
    fallbackSpriteRef.current = null;
  }, []);

  const renderFallbackSprite = useCallback(
    async (reason = "fallback", requestedKey = catalogFallbackKey) => {
      const dogLayer = dogLayerRef.current;
      if (!dogLayer || !resolvedFallbackSrc) return;

      try {
        const fallbackConfig =
          resolvedAnimationCatalog[requestedKey] ||
          resolvedAnimationCatalog[catalogFallbackKey] ||
          DOG_ANIMATION_MAP[DEFAULT_DOG_ACTION];

        let texture = null;

        if (fallbackConfig?.src) {
          const fallbackFrames = await loadAtlasFrames({
            src: fallbackConfig.src,
            frameWidth: fallbackConfig.frameWidth,
            frameHeight: fallbackConfig.frameHeight,
            columns: fallbackConfig.columns,
            rows: fallbackConfig.rows,
            totalFrames: 1,
          });
          texture = fallbackFrames?.[0] || null;
        }

        if (!texture) {
          if (looksLikeSpriteAtlas(resolvedFallbackSrc)) {
            const fallbackFrames = await loadAtlasFrames({
              src: resolvedFallbackSrc,
              columns: 4,
              rows: 4,
              totalFrames: 1,
            });
            texture = fallbackFrames?.[0] || null;
          } else {
            texture = await Assets.load(resolvedFallbackSrc);
          }
        }

        if (!mountedRef.current || !texture) return;

        destroyCurrentDog();

        const dog = new Sprite(texture);
        animationLayoutRef.current = getStableAnimationLayout(
          {
            textures: [texture],
            anchorX: 0.5,
            anchorY: 0.98,
            scaleMultiplier: 0.95,
            groundOffsetPx: 0,
          },
          dog
        );
        dog.roundPixels = true;
        dogLayer.addChild(dog);
        fallbackSpriteRef.current = dog;
        setUseStaticFallback(true);
        setFallbackReason(reason);
        currentPlaybackRef.current = {
          key: `fallback:${reason}`,
          token: `fallback:${reason}`,
        };
        layoutDog();
      } catch {
        if (mountedRef.current) {
          setUseStaticFallback(true);
          setFallbackReason(reason);
        }
      }
    },
    [
      catalogFallbackKey,
      destroyCurrentDog,
      layoutDog,
      resolvedAnimationCatalog,
      resolvedFallbackSrc,
    ]
  );

  const playAnimation = useCallback(
    (nextClip) => {
      const dogLayer = dogLayerRef.current;
      const animations = animationsRef.current;
      if (!dogLayer || !animations) return;
      const fallbackKey = Object.keys(animations)[0] || DEFAULT_DOG_ACTION;

      const requestedKey = normalizeAction(nextClip?.key) || DEFAULT_DOG_ACTION;
      const resolvedKey = animations[requestedKey] ? requestedKey : fallbackKey;
      const playbackToken = nextClip?.playToken || `loop:${resolvedKey}`;

      if (
        currentPlaybackRef.current.key === resolvedKey &&
        currentPlaybackRef.current.token === playbackToken &&
        dogSpriteRef.current
      ) {
        const existingConfig = animations[resolvedKey];
        dogSpriteRef.current.animationSpeed = getAnimationSpeed(
          existingConfig,
          resolvedKey
        );
        if (
          reduceMotion ||
          Number(dogSpriteRef.current.totalFrames || 0) <= 1
        ) {
          dogSpriteRef.current.gotoAndStop(0);
        } else if (!dogSpriteRef.current.playing) {
          dogSpriteRef.current.gotoAndPlay(0);
        }
        layoutDog();
        return;
      }

      const config = animations[resolvedKey];
      if (!config?.textures?.length) {
        void renderFallbackSprite(`missing_clip:${resolvedKey}`, resolvedKey);
        return;
      }

      destroyCurrentDog();

      const dog = new AnimatedSprite(config.textures);
      animationLayoutRef.current = getStableAnimationLayout(config, dog);
      dog.anchor.set(
        clamp(Number(animationLayoutRef.current.anchorX || 0.5), 0, 1),
        clamp(Number(animationLayoutRef.current.anchorY || 0.98), 0, 1)
      );
      dog.loop = Boolean(nextClip?.loop ?? config.loop);
      dog.animationSpeed = getAnimationSpeed(
        nextClip ? { ...config, fps: nextClip.fps } : config,
        resolvedKey
      );
      dog.roundPixels = true;

      if (!dog.loop) {
        dog.onComplete = () => {
          if (!mountedRef.current || typeof dog.gotoAndStop !== "function") {
            return;
          }
          dog.gotoAndStop(Math.max(0, dog.totalFrames - 1));
        };
      }

      if (reduceMotion || Number(dog.totalFrames || 0) <= 1) {
        dog.gotoAndStop(0);
      } else {
        dog.play();
      }

      dogLayer.addChild(dog);
      dogSpriteRef.current = dog;
      if (mountedRef.current) {
        setUseStaticFallback(false);
        setFallbackReason("");
      }
      currentPlaybackRef.current = {
        key: resolvedKey,
        token: playbackToken,
      };
      layoutDog();
    },
    [
      destroyCurrentDog,
      getAnimationSpeed,
      layoutDog,
      reduceMotion,
      renderFallbackSprite,
    ]
  );

  useEffect(() => {
    let cancelled = false;
    let resizeObserver = null;

    mountedRef.current = true;

    async function boot() {
      const host = hostRef.current;
      if (!host) return;
      const initialConfig = initialConfigRef.current;

      const app = new Application({
        width: initialConfig.width,
        height: initialConfig.height,
        backgroundAlpha: 0,
        antialias: false,
        autoDensity: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
      });

      if (cancelled) {
        app.destroy(true);
        return;
      }

      host.innerHTML = "";
      host.appendChild(app.view);
      app.view.style.pointerEvents = "none";
      app.view.style.display = "block";
      app.view.style.width = "100%";
      app.view.style.height = "100%";
      appRef.current = app;

      const dogLayer = new Container();
      app.stage.addChild(dogLayer);
      dogLayerRef.current = dogLayer;

      try {
        animationsRef.current = await preloadGridAnimations(
          resolvedAnimationCatalog
        );
      } catch (error) {
        console.error("[DogRenderer] Failed to preload animations:", error);
        if (!cancelled && mountedRef.current) {
          void renderFallbackSprite("sheet_preload_failed", catalogFallbackKey);
        }
        return;
      }

      if (!Object.keys(animationsRef.current || {}).length) {
        if (!cancelled && mountedRef.current) {
          void renderFallbackSprite("sheet_catalog_empty", catalogFallbackKey);
        }
        return;
      }

      if (cancelled || !mountedRef.current || !hostRef.current) {
        return;
      }

      const resize = () => {
        const rect = host.getBoundingClientRect();
        const nextWidth = Math.max(
          1,
          Math.round(rect.width || host.clientWidth || initialConfig.width)
        );
        const nextHeight = Math.max(
          1,
          Math.round(
            rect.height ||
              host.clientHeight ||
              resolvedMinHeight ||
              initialConfig.height
          )
        );
        app.renderer.resize(nextWidth, nextHeight);
        layoutDog();
      };

      resize();

      if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(host);
      }

      if (typeof window !== "undefined") {
        window.addEventListener("resize", resize);
      }

      const initialClip = {
        key: initialConfig.animationClip?.key || catalogFallbackKey,
        playToken:
          initialConfig.animationClip?.playToken ||
          `loop:${initialConfig.animationClip?.key || catalogFallbackKey}`,
        loop: initialConfig.animationClip?.loop,
        fps: initialConfig.animationClip?.fps,
      };

      playAnimation(initialClip);

      return () => {
        if (typeof window !== "undefined") {
          window.removeEventListener("resize", resize);
        }
        if (resizeObserver) {
          resizeObserver.disconnect();
        }
      };
    }

    let cleanupResize;

    boot().then((cleanup) => {
      cleanupResize = cleanup;
    });

    return () => {
      cancelled = true;
      mountedRef.current = false;

      if (cleanupResize) {
        cleanupResize();
      }

      destroyCurrentDog();

      if (appRef.current) {
        appRef.current.destroy(true, {
          children: true,
          texture: false,
          baseTexture: false,
        });
      }

      appRef.current = null;
      dogLayerRef.current = null;
      animationsRef.current = {};
      currentPlaybackRef.current = { key: null, token: null };
    };
  }, [
    catalogFallbackKey,
    destroyCurrentDog,
    layoutDog,
    playAnimation,
    renderFallbackSprite,
    resolvedAnimationCatalog,
    resolvedMinHeight,
  ]);

  useEffect(() => {
    scenePropsRef.current = {
      orientation: resolvedOrientation,
      xNorm: resolvedXNorm,
      groundYNorm: resolvedGroundYNorm,
      maxWidthRatio,
      maxHeightRatio,
      scaleBias: resolvedScaleBias,
    };
    layoutDog();
  }, [
    layoutDog,
    maxHeightRatio,
    maxWidthRatio,
    resolvedGroundYNorm,
    resolvedOrientation,
    resolvedScaleBias,
    resolvedXNorm,
  ]);

  useEffect(() => {
    playAnimation(resolvedAnimationClip || { key: DEFAULT_DOG_ACTION });
  }, [playAnimation, resolvedAnimationClip]);

  useEffect(() => {
    const dog = dogSpriteRef.current;
    if (!dog) return;

    if (reduceMotion || Number(dog.totalFrames || 0) <= 1) {
      dog.gotoAndStop(0);
      return;
    }

    if (!dog.playing) {
      dog.gotoAndPlay(0);
    }
  }, [reduceMotion]);

  useEffect(() => {
    if (typeof onFallbackChange !== "function") return;
    onFallbackChange({
      active: useStaticFallback,
      reason: useStaticFallback ? fallbackReason || "active" : "",
    });
  }, [fallbackReason, onFallbackChange, useStaticFallback]);

  return (
    <div
      className={className}
      data-dog-renderer-fallback={
        useStaticFallback ? fallbackReason || "active" : ""
      }
      style={{
        width: "100%",
        height: "100%",
        minHeight: `${resolvedMinHeight}px`,
        position: "relative",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <div
        ref={hostRef}
        style={{
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
