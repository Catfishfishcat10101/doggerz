import { useCallback, useEffect, useMemo, useRef } from "react";
import { Application, AnimatedSprite, Container } from "pixi.js";
import {
  DEFAULT_ANIMATION,
  DOG_ANIMATIONS,
  resolveDogAnimationKey,
} from "./animationMap.js";
import { sanitizeAnimationRequest } from "./animationPolicy.js";
import { preloadGridAnimations } from "./spriteSheetUtils.js";

const FALLBACK_RENDER_MIN_HEIGHT = 420;
const ONE_SHOT_RETRIGGER_COOLDOWN_MS = 1200;
const ONE_SHOT_ACTIONS = new Set(["bark", "beg", "dig"]);
const IDLE_ACTION_KEYS = new Set([
  "idle",
  "idle_resting",
  "idle_sleepy",
  "idle_calm",
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
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_");
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

export default function DogRenderer({
  width = 960,
  height = 540,
  minHeight = height,
  desiredAction = "idle",
  overrideAction = null,
  facing = "right",
  isSleeping = false,
  isDirty = false,
  isBarking = false,
  xNorm = 0.5,
  groundYNorm = 0.8,
  maxWidthRatio = 0.26,
  maxHeightRatio = 0.44,
  scaleBias = 1,
  idleIntensity = "calm",
  className = "",
}) {
  const hostRef = useRef(null);
  const appRef = useRef(null);
  const dogLayerRef = useRef(null);
  const dogSpriteRef = useRef(null);
  const animationsRef = useRef({});
  const currentAnimationKeyRef = useRef(null);
  const mountedRef = useRef(false);
  const lastConsumedOverrideActionRef = useRef(null);
  const lastOneShotPlayRef = useRef({ key: null, at: 0 });
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
    desiredAction,
    overrideAction,
    isSleeping,
    isDirty,
    isBarking,
  });
  const scenePropsRef = useRef({
    facing,
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

  const getAnimationSpeed = useCallback(
    (config, key) => {
      const baseSpeed = (Number(config?.fps || 8) || 8) / 60;
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
    [idleIntensity]
  );

  const getResolvedAnimationKey = useCallback((input) => {
    const safeInput = sanitizeAnimationRequest(input);
    let effectiveOverrideAction = null;
    const normalizedOverrideAction = normalizeAction(safeInput.overrideAction);
    const now = Date.now();
    const oneShotRecentlyPlayed =
      ONE_SHOT_ACTIONS.has(normalizedOverrideAction) &&
      lastOneShotPlayRef.current.key === normalizedOverrideAction &&
      now - Number(lastOneShotPlayRef.current.at || 0) <
        ONE_SHOT_RETRIGGER_COOLDOWN_MS;

    if (
      normalizedOverrideAction &&
      normalizedOverrideAction !== lastConsumedOverrideActionRef.current &&
      !oneShotRecentlyPlayed
    ) {
      effectiveOverrideAction = normalizedOverrideAction;
      lastConsumedOverrideActionRef.current = normalizedOverrideAction;
    } else if (!normalizedOverrideAction) {
      lastConsumedOverrideActionRef.current = null;
    }

    return resolveDogAnimationKey({
      desiredAction: safeInput.desiredAction,
      overrideAction: effectiveOverrideAction,
      isSleeping: safeInput.isSleeping,
      isDirty: safeInput.isDirty,
      isBarking: safeInput.isBarking,
    });
  }, []);

  const layoutDog = useCallback(() => {
    const app = appRef.current;
    const dog = dogSpriteRef.current;
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
      stageWidth * clamp(scenePropsRef.current.maxWidthRatio, 0.12, 0.4);
    const maxDogHeight =
      stageHeight * clamp(scenePropsRef.current.maxHeightRatio, 0.18, 0.7);
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
      resolvedScale * (scenePropsRef.current.facing === "left" ? -1 : 1),
      resolvedScale
    );
  }, []);

  const destroyCurrentDog = useCallback(() => {
    const currentDog = dogSpriteRef.current;
    const dogLayer = dogLayerRef.current;

    if (currentDog && dogLayer) {
      dogLayer.removeChild(currentDog);
      currentDog.stop();
      currentDog.destroy();
    }

    dogSpriteRef.current = null;
  }, []);

  const playAnimation = useCallback(
    (nextKey) => {
      const dogLayer = dogLayerRef.current;
      const animations = animationsRef.current;
      if (!dogLayer || !animations) return;

      const resolvedKey = animations[nextKey] ? nextKey : DEFAULT_ANIMATION;
      if (
        currentAnimationKeyRef.current === resolvedKey &&
        dogSpriteRef.current
      ) {
        const existingConfig = animations[resolvedKey];
        dogSpriteRef.current.animationSpeed = getAnimationSpeed(
          existingConfig,
          resolvedKey
        );
        layoutDog();
        return;
      }

      const config = animations[resolvedKey];
      if (!config?.textures?.length) return;

      destroyCurrentDog();

      const dog = new AnimatedSprite(config.textures);
      animationLayoutRef.current = getStableAnimationLayout(config, dog);
      dog.anchor.set(
        clamp(Number(animationLayoutRef.current.anchorX || 0.5), 0, 1),
        clamp(Number(animationLayoutRef.current.anchorY || 0.98), 0, 1)
      );
      dog.loop = Boolean(config.loop);
      dog.animationSpeed = getAnimationSpeed(config, resolvedKey);
      dog.roundPixels = true;
      if (!config.loop) {
        lastOneShotPlayRef.current = { key: resolvedKey, at: Date.now() };
      }

      if (!config.loop) {
        dog.onComplete = () => {
          if (!mountedRef.current) return;
          playAnimation(DEFAULT_ANIMATION);
        };
      }

      dog.play();
      dogLayer.addChild(dog);
      dogSpriteRef.current = dog;
      currentAnimationKeyRef.current = resolvedKey;
      layoutDog();
    },
    [destroyCurrentDog, getAnimationSpeed, layoutDog]
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
      appRef.current = app;

      const dogLayer = new Container();
      app.stage.addChild(dogLayer);
      dogLayerRef.current = dogLayer;

      try {
        animationsRef.current = await preloadGridAnimations(DOG_ANIMATIONS);
      } catch (error) {
        console.error("[DogRenderer] Failed to preload animations:", error);
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

      const initialKey = getResolvedAnimationKey({
        desiredAction: initialConfig.desiredAction,
        overrideAction: initialConfig.overrideAction,
        isSleeping: initialConfig.isSleeping,
        isDirty: initialConfig.isDirty,
        isBarking: initialConfig.isBarking,
      });

      playAnimation(initialKey);

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
      currentAnimationKeyRef.current = null;
    };
  }, [
    destroyCurrentDog,
    getResolvedAnimationKey,
    layoutDog,
    playAnimation,
    resolvedMinHeight,
  ]);

  useEffect(() => {
    scenePropsRef.current = {
      facing,
      xNorm,
      groundYNorm,
      maxWidthRatio,
      maxHeightRatio,
      scaleBias,
    };
    layoutDog();
  }, [
    facing,
    groundYNorm,
    layoutDog,
    maxHeightRatio,
    maxWidthRatio,
    scaleBias,
    xNorm,
  ]);

  useEffect(() => {
    const nextKey = getResolvedAnimationKey({
      desiredAction,
      overrideAction,
      isSleeping,
      isDirty,
      isBarking,
    });

    playAnimation(nextKey);
  }, [
    desiredAction,
    getResolvedAnimationKey,
    isBarking,
    isDirty,
    isSleeping,
    overrideAction,
    playAnimation,
  ]);

  return (
    <div
      className={className}
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
