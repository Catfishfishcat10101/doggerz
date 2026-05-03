<<<<<<< HEAD
import { useMemo, useRef } from "react";
import DogRenderer from "./DogRenderer.jsx";
import { getDogAnimationCatalog } from "./dogAnimationMap.js";
import { useDogAnimationController } from "./useDogAnimationController.js";
import { useDogMotionController } from "./useDogMotionController.js";

function resolveDirectionalFacing(actionLike, fallbackFacing = "right") {
  const normalized = String(actionLike || "")
    .trim()
    .toLowerCase();

  if (normalized.includes("left")) return "left";
  if (normalized.includes("right")) return "right";
  return fallbackFacing === "left" ? "left" : "right";
}

export default function AnimatedDog({
  dog,
  brainState,
  renderModel,
  requestedAction = "",
  sceneLayout,
  dogScaleBias = 0.95,
  dogSleepingInDoghouse = false,
  idleAnimationIntensity = "calm",
  animationSpeedMultiplier = 1,
  className = "",
  minHeight,
}) {
  const stableFacingRef = useRef("right");

  const motion = useDogMotionController({
    brainState,
    sceneLayout,
    dogScaleBias,
    dogSleepingInDoghouse,
  });
  const animationCatalog = useMemo(
    () => getDogAnimationCatalog(renderModel?.stage || "PUPPY"),
    [renderModel?.stage]
  );

  const { animationClip, resolvedAction, preferredFacing } =
    useDogAnimationController({
      dog,
      brainState,
      renderModel,
      requestedAction,
    });

  const resolvedFacing = useMemo(() => {
    const loopAction = String(resolvedAction || "")
      .trim()
      .toLowerCase();
    const motionFacing = resolveDirectionalFacing(
      requestedAction,
      motion.facing || motion.orientation
    );

    let nextFacing = stableFacingRef.current || motionFacing || "right";
    if (preferredFacing) {
      nextFacing = preferredFacing;
    } else if (loopAction === "walk") {
      nextFacing = motionFacing;
    }

    stableFacingRef.current = nextFacing;
    return nextFacing;
  }, [
    motion.facing,
    motion.orientation,
    preferredFacing,
    requestedAction,
    resolvedAction,
=======
// src/features/game/rendering/AnimatedDog.jsx
import { useMemo } from "react";
import DogRenderer from "./DogRenderer.jsx";
import { useDogAnimationController } from "./useDogAnimationController.js";

const MODEL_CLIP_BY_ACTION = Object.freeze({
  idle: "Idle",
  idle_resting: "Idle",
  puppy_idle_pack: "Idle",
  golden_years_idle: "Idle",
  sit: "Sit",
  gate_watch: "Sit",
  walk: "Walk",
  walk_left: "Walk",
  walk_right: "Walk",
  turn_walk_left: "Walk",
  turn_walk_right: "Walk",
  bark: "Bark",
  sleep: "Sleep",
  light_sleep: "Sleep",
  deep_rem_sleep: "Sleep",
  puppy_sleeping_pack: "Sleep",
  golden_years_sleeping: "Sleep",
  lethargic_lay: "Sleep",
  wag: "Wag",
  paw: "Wag",
  eat: "Wag",
  drink: "Wag",
  scratch: "Wag",
  sniff: "Idle",
  dig: "Wag",
});

function normalizeScale(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return 1;
  return Math.max(0.72, Math.min(1.28, numeric));
}

function resolveFacingRotation(facing = "") {
  const key = String(facing || "")
    .trim()
    .toLowerCase();
  if (key === "left") return [0, Math.PI * -0.16, 0];
  if (key === "right") return [0, Math.PI * 0.16, 0];
  return [0, Math.PI * 0.15, 0];
}

export default function AnimatedDog({
  scene = null,
  dog = null,
  brainState = null,
  renderModel = null,
  requestedAction = "",
  requestedFacing = "",
  paused = false,
  reduceMotion = false,
  scale = 1,
  position,
  ghost = false,
}) {
  const animation = useDogAnimationController({
    dog,
    brainState,
    renderModel,
    requestedAction,
    requestedFacing,
  });

  const resolved = useMemo(() => {
    const actionKey = String(animation?.resolvedAction || "idle")
      .trim()
      .toLowerCase();
    const clip = MODEL_CLIP_BY_ACTION[actionKey] || "Idle";
    const facing =
      animation?.preferredFacing ||
      requestedFacing ||
      brainState?.facing ||
      dog?.facing ||
      renderModel?.facing ||
      "";

    return {
      action: actionKey,
      clip,
      facing,
      rotation: resolveFacingRotation(facing),
      scale: normalizeScale(scale || renderModel?.scaleMultiplier),
      animationClip: animation?.animationClip || null,
      resolution: animation?.resolution || null,
    };
  }, [
    animation?.animationClip,
    animation?.preferredFacing,
    animation?.resolution,
    animation?.resolvedAction,
    brainState?.facing,
    dog?.facing,
    renderModel?.facing,
    renderModel?.scaleMultiplier,
    requestedFacing,
    scale,
>>>>>>> 0a405bd4 (Fix Doggerz index boot markup)
  ]);

  return (
    <DogRenderer
<<<<<<< HEAD
      animationCatalog={animationCatalog}
      action={resolvedAction || animationClip?.key || "idle"}
      mood={brainState?.primarySignal || renderModel?.anim || ""}
      animationClip={animationClip}
      facing={resolvedFacing}
      xNorm={motion.xNorm}
      groundYNorm={motion.groundYNorm}
      maxWidthRatio={motion.maxWidthRatio}
      maxHeightRatio={motion.maxHeightRatio}
      scaleBias={motion.scaleBias}
      idleIntensity={idleAnimationIntensity}
      speedMultiplier={
        animationSpeedMultiplier || renderModel?.animationSpeedMultiplier || 1
      }
      className={className}
      minHeight={minHeight}
=======
      scene={scene}
      dog={dog}
      action={resolved.action}
      clip={resolved.clip}
      facing={resolved.facing}
      animationClip={resolved.animationClip}
      resolution={resolved.resolution}
      position={position}
      rotation={resolved.rotation}
      scale={resolved.scale}
      paused={paused}
      reduceMotion={reduceMotion}
      ghost={ghost}
>>>>>>> 0a405bd4 (Fix Doggerz index boot markup)
    />
  );
}
