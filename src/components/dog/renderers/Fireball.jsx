<<<<<<< HEAD
=======
// src/components/dog/renderers/Fireball.jsx
>>>>>>> 0a405bd4 (Fix Doggerz index boot markup)
// Developer demo-only renderer. Not used by Landing, Adopt, Game, or Store.
import { useEffect, useMemo, useRef, useState } from "react";

import { normalizeJrLifeStage } from "@/components/dog/manifests/jrManifest.js";
import HeroDog from "@/components/dog/renderers/HeroDog.jsx";
import "./Fireball.css";

const DEFAULTS = Object.freeze({
  renderSize: 96,
  speed: 2,
  padding: 56,
  minIdleMs: 2000,
  maxIdleMs: 5000,
  lifeStage: "PUPPY",
  idleAction: "idle",
  walkAction: "walk",
  interactAction: "bark",
});

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function getViewportBounds() {
  if (typeof window === "undefined") {
    return { width: 0, height: 0 };
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

function readBounds(boundsRef) {
  const rect = boundsRef?.current?.getBoundingClientRect?.();
  if (rect && rect.width > 0 && rect.height > 0) {
    return { width: rect.width, height: rect.height };
  }
  return getViewportBounds();
}

export default function Fireball({
  boundsRef = null,
  className = "",
  lifeStage = DEFAULTS.lifeStage,
  idleAction = DEFAULTS.idleAction,
  walkAction = DEFAULTS.walkAction,
  interactAction = DEFAULTS.interactAction,
  renderSize = DEFAULTS.renderSize,
  speed = DEFAULTS.speed,
  padding = DEFAULTS.padding,
  minIdleMs = DEFAULTS.minIdleMs,
  maxIdleMs = DEFAULTS.maxIdleMs,
  reduceMotion = false,
  paused = false,
  zIndex = 30,
  onInteract,
  interactDurationMs = 1200,
}) {
  const containerRef = useRef(null);
  const spriteRef = useRef(null);
  const onInteractRef = useRef(onInteract);
  const brain = useRef({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    speed,
    currentState: "idle",
    idleTimer: null,
    frameId: null,
    lastFrameTime: 0,
  });

  const [animState, setAnimState] = useState("idle");
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    onInteractRef.current = onInteract;
  }, [onInteract]);

  const resolvedLifeStage = useMemo(
    () => normalizeJrLifeStage(lifeStage, "pup"),
    [lifeStage]
  );

  const currentAction =
    animState === "walk"
      ? walkAction
      : animState === "interact"
        ? interactAction
        : idleAction;
  const safeRenderSize = useMemo(
    () => Math.max(24, Number(renderSize) || DEFAULTS.renderSize),
    [renderSize]
  );
  const fireballStage = useMemo(
    () => String(resolvedLifeStage || "pup").toUpperCase(),
    [resolvedLifeStage]
  );

  useEffect(() => {
    brain.current.speed = Number(speed) || DEFAULTS.speed;
  }, [speed]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return undefined;
    const brainState = brain.current;

    const clearIdleTimer = () => {
      if (brainState.idleTimer) {
        window.clearTimeout(brainState.idleTimer);
        brainState.idleTimer = null;
      }
    };

    const syncDomPosition = () => {
      if (!containerRef.current) return;
      containerRef.current.style.transform = `translate3d(${brainState.x}px, ${brainState.y}px, 0)`;
    };

    const clampPointToBounds = (x, y) => {
      const { width, height } = readBounds(boundsRef);
      const inset = Math.max(0, Number(padding) || 0);
      const minX = Math.min(inset, Math.max(0, width / 2));
      const minY = Math.min(inset, Math.max(0, height / 2));
      const maxX = Math.max(minX, width - inset);
      const maxY = Math.max(minY, height - inset);
      return {
        x: clamp(x, minX, maxX),
        y: clamp(y, minY, maxY),
      };
    };

    const setVisualState = (nextState) => {
      setAnimState((current) => (current === nextState ? current : nextState));
    };

    const setFacingLeft = (nextIsFlipped) => {
      setIsFlipped((current) =>
        current === nextIsFlipped ? current : nextIsFlipped
      );
    };

    const pickNewDestination = () => {
      if (paused || reduceMotion) {
        return;
      }

      const { width, height } = readBounds(boundsRef);
      if (width <= 0 || height <= 0) {
        return;
      }

      const inset = Math.max(0, Number(padding) || 0);
      const minX = Math.min(inset, Math.max(0, width / 2));
      const minY = Math.min(inset, Math.max(0, height / 2));
      const maxX = Math.max(minX, width - inset);
      const maxY = Math.max(minY, height - inset);

      brain.current.targetX = randomBetween(minX, maxX);
      brain.current.targetY = randomBetween(minY, maxY);
      setFacingLeft(brainState.targetX < brainState.x);
      brainState.currentState = "walk";
      setVisualState("walk");
    };

    const changeState = (nextState) => {
      brainState.currentState = nextState;
      clearIdleTimer();

      if (nextState === "idle") {
        setVisualState("idle");

        if (!paused && !reduceMotion) {
          const idleWindowMin = Math.max(
            100,
            Number(minIdleMs) || DEFAULTS.minIdleMs
          );
          const idleWindowMax = Math.max(
            idleWindowMin,
            Number(maxIdleMs) || DEFAULTS.maxIdleMs
          );
          const idleDuration = randomBetween(idleWindowMin, idleWindowMax);
          brainState.idleTimer = window.setTimeout(
            pickNewDestination,
            idleDuration
          );
        }
        return;
      }

      if (nextState === "walk") {
        setVisualState("walk");
        return;
      }

      if (nextState === "interact") {
        setVisualState("interact");
      }
    };

    const handleInteract = (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (brainState.currentState === "interact") return;

      clearIdleTimer();
      brainState.targetX = brainState.x;
      brainState.targetY = brainState.y;
      changeState("interact");
      onInteractRef.current?.();

      brainState.idleTimer = window.setTimeout(
        () => {
          changeState("idle");
        },
        Math.max(250, Number(interactDurationMs) || 1200)
      );
    };

    const handleKeyDown = (event) => {
      if (event.key === "Enter" || event.key === " ") {
        handleInteract(event);
      }
    };

    const centerSprite = () => {
      const { width, height } = readBounds(boundsRef);
      const centered = clampPointToBounds(width / 2, height / 2);
      brainState.x = centered.x;
      brainState.y = centered.y;
      brainState.targetX = centered.x;
      brainState.targetY = centered.y;
      syncDomPosition();
    };

    const handleResize = () => {
      const clamped = clampPointToBounds(brainState.x, brainState.y);
      const clampedTarget = clampPointToBounds(
        brainState.targetX,
        brainState.targetY
      );
      brainState.x = clamped.x;
      brainState.y = clamped.y;
      brainState.targetX = clampedTarget.x;
      brainState.targetY = clampedTarget.y;
      syncDomPosition();
    };

    const gameLoop = (timestamp) => {
      const last = brainState.lastFrameTime || timestamp;
      const deltaMs = Math.min(48, Math.max(0, timestamp - last));
      const deltaFrames = deltaMs / (1000 / 60);
      const step = brainState.speed * (deltaFrames || 1);
      brainState.lastFrameTime = timestamp;

      if (
        !paused &&
        !reduceMotion &&
        brainState.currentState === "walk" &&
        containerRef.current
      ) {
        const dx = brainState.targetX - brainState.x;
        const dy = brainState.targetY - brainState.y;
        const distance = Math.hypot(dx, dy);

        if (distance <= step || distance === 0) {
          brainState.x = brainState.targetX;
          brainState.y = brainState.targetY;
          syncDomPosition();
          changeState("idle");
        } else {
          brainState.x += (dx / distance) * step;
          brainState.y += (dy / distance) * step;
          syncDomPosition();
        }
      }

      brainState.frameId = window.requestAnimationFrame(gameLoop);
    };

    centerSprite();
    changeState("idle");
    brainState.lastFrameTime = 0;
    brainState.frameId = window.requestAnimationFrame(gameLoop);
    node.addEventListener("pointerdown", handleInteract);
    node.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      clearIdleTimer();
      node.removeEventListener("pointerdown", handleInteract);
      node.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
      if (brainState.frameId) {
        window.cancelAnimationFrame(brainState.frameId);
        brainState.frameId = null;
      }
    };
  }, [
    boundsRef,
    interactDurationMs,
    maxIdleMs,
    minIdleMs,
    padding,
    paused,
    reduceMotion,
    speed,
  ]);

  return (
    <div
      ref={containerRef}
      className={`fireball-container ${className}`.trim()}
      style={{
        width: `${safeRenderSize}px`,
        height: `${safeRenderSize}px`,
        zIndex,
      }}
      aria-label="Interactive dog sprite"
      role="button"
      tabIndex={0}
    >
      <div
        ref={spriteRef}
        className={[
          "fireball-sprite",
          (paused || reduceMotion) && animState !== "interact"
            ? "fireball-paused"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <HeroDog
          stage={fireballStage}
          anim={currentAction}
          facing={isFlipped ? -1 : 1}
          size={safeRenderSize}
          reduceMotion={(paused || reduceMotion) && animState !== "interact"}
          className="fireball-sprite-renderer"
        />
      </div>
    </div>
  );
}
