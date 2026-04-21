import AnimatedDog from "./AnimatedDog.jsx";
import DogMoodFxLayer from "./DogMoodFxLayer.jsx";

export default function DogMobileCanvas({
  dog,
  renderModel,
  brainState,
  requestedAction = "",
  sceneLayout,
  reduceMotion = false,
  dogScaleBias = 0.95,
  dogSleepingInDoghouse = false,
  idleAnimationIntensity = "calm",
  animationSpeedMultiplier = 1,
  rendererClassName = "",
  rendererMinHeight = undefined,
  className = "",
}) {
  const resolvedClassName =
    className || "pointer-events-none absolute inset-0 z-[22]";

  return (
    <div
      className={resolvedClassName}
      data-dog-canvas="mobile-first"
      style={{
        touchAction: "none",
      }}
      aria-hidden="true"
    >
      <AnimatedDog
        dog={dog}
        brainState={brainState}
        renderModel={renderModel}
        requestedAction={requestedAction}
        sceneLayout={sceneLayout}
        dogScaleBias={dogScaleBias}
        dogSleepingInDoghouse={dogSleepingInDoghouse}
        idleAnimationIntensity={idleAnimationIntensity}
        animationSpeedMultiplier={animationSpeedMultiplier}
        fallbackImageSrc={renderModel?.staticSpriteUrl || ""}
        className={rendererClassName}
        minHeight={rendererMinHeight}
      />

      <DogMoodFxLayer
        dog={dog}
        renderModel={renderModel}
        brainState={brainState}
        sceneLayout={sceneLayout}
        reduceMotion={reduceMotion}
      />
    </div>
  );
}
