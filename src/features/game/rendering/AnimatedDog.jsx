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
  ]);

  return (
    <DogRenderer
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
    />
  );
}
