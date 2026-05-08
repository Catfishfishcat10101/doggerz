import React, { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  OrbitControls,
  useAnimations,
  useGLTF,
} from "@react-three/drei";
import { useSelector } from "react-redux";
import { SkeletonUtils } from "three-stdlib";

import { useDayNight } from "@/hooks/useDayNight.js";

/**
 * HeroDog3D
 * Premium 3D Doggerz brand dog component for landing/adopt/marketing surfaces.
 */

const MODEL_PATH = "/assets/models/dog/jackrussell-doggerz.glb";

function selectWeatherConditionSafe(state) {
  return (
    state?.weather?.condition ||
    state?.weather?.current?.condition ||
    state?.environment?.weather ||
    state?.game?.weather ||
    "sunny"
  );
}

function selectUserZipSafe(state) {
  return (
    state?.user?.zip ||
    state?.user?.profile?.zip ||
    state?.settings?.zip ||
    state?.settings?.locationZip ||
    ""
  );
}

function resolveActiveClip({
  animationName,
  mood,
  isSleeping,
  actionOverride,
  happiness,
}) {
  if (actionOverride) return actionOverride;

  if (isSleeping) {
    return happiness < 30 ? "Deep_Rem_Sleep" : "Sleep";
  }

  if (mood === "happy") return "Wag";
  if (mood === "sad") return "Idle_Resting";
  if (mood === "sick") return "Lethargic_Lay";

  return animationName || "Idle";
}

function DogModel({
  animationName = "Idle",
  mood = "neutral",
  isSleeping = false,
  stage = "ADULT",
  actionOverride = null,
  happiness = 50,
}) {
  const group = useRef();
  const { scene, animations } = useGLTF(MODEL_PATH);

  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { actions } = useAnimations(animations, group);

  const activeClip = resolveActiveClip({
    animationName,
    mood,
    isSleeping,
    actionOverride,
    happiness,
  });

  const isPuppy = String(stage).toUpperCase() === "PUPPY";
  const modelScale = isPuppy ? 1.2 : 1.8;
  const modelY = isPuppy ? -0.5 : -0.8;

  useEffect(() => {
    const action = actions?.[activeClip] || actions?.Idle;

    if (!action) {
      console.warn(
        `[HeroDog3D] Animation clip "${activeClip}" was not found. Available clips:`,
        Object.keys(actions || {})
      );
      return undefined;
    }

    Object.values(actions || {}).forEach((existingAction) => {
      if (existingAction !== action) existingAction.fadeOut(0.25);
    });

    action.reset().fadeIn(0.35).play();

    return () => {
      action.fadeOut(0.25);
    };
  }, [actions, activeClip]);

  return (
    <group
      ref={group}
      scale={modelScale}
      position={[0, modelY, 0]}
      rotation={[0, -0.4, 0]}
      dispose={null}
    >
      <primitive object={clonedScene} />
    </group>
  );
}

export default function HeroDog3D({
  className = "",
  mood = "neutral",
  isSleeping = false,
  stage = "ADULT",
  weather: propWeather,
  timeOfDay: propTimeOfDay,
  actionOverride = null,
  animationName = "Idle",
  happiness = 50,
}) {
  const reduxWeather = useSelector(selectWeatherConditionSafe);
  const zip = useSelector(selectUserZipSafe);

  const { timeOfDayBucket } = useDayNight({ zip });

  const weather = propWeather || reduxWeather || "sunny";
  const timeOfDay = propTimeOfDay || timeOfDayBucket || "day";

  const normalizedWeather = String(weather).toLowerCase();
  const normalizedTime = String(timeOfDay).toLowerCase();

  const isNight = ["night", "late_night", "midnight"].includes(normalizedTime);
  const isSunset = ["sunset", "dusk", "dawn", "evening"].includes(
    normalizedTime
  );
  const isRainy = ["rain", "rainy", "storm", "stormy", "thunderstorm"].includes(
    normalizedWeather
  );
  const isCloudy = ["cloud", "cloudy", "overcast"].includes(normalizedWeather);

  let envPreset = "studio";

  if (isNight) envPreset = "night";
  else if (isSunset) envPreset = "sunset";
  else if (isRainy) envPreset = "warehouse";
  else if (isCloudy) envPreset = "city";

  const ambientColor = isNight
    ? "#202040"
    : isSunset
      ? "#ffaa88"
      : isRainy
        ? "#94a3b8"
        : "#ffffff";

  const ambientIntensity = isNight
    ? 0.2
    : isRainy
      ? 0.35
      : isCloudy
        ? 0.5
        : 0.8;

  const modelY = String(stage).toUpperCase() === "PUPPY" ? -0.5 : -0.8;

  return (
    <div
      className={`relative w-full aspect-square max-w-sm mx-auto pointer-events-none sm:pointer-events-auto ${className}`}
    >
      <Canvas
        shadows
        camera={{ position: [0, 1, 4], fov: 35 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={ambientIntensity} color={ambientColor} />

        <spotLight
          position={[5, 5, 5]}
          angle={0.15}
          penumbra={1}
          intensity={isNight ? 0.5 : isRainy ? 0.6 : 1}
          castShadow
        />

        <Suspense fallback={null}>
          <DogModel
            mood={mood}
            isSleeping={isSleeping}
            stage={stage}
            actionOverride={actionOverride}
            animationName={animationName}
            happiness={happiness}
          />

          <Environment preset={envPreset} />

          <ContactShadows
            position={[0, modelY, 0]}
            opacity={0.35}
            scale={8}
            blur={2}
            far={4}
          />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 2.2}
          maxPolarAngle={Math.PI / 2.2}
          autoRotate
          autoRotateSpeed={0.8}
          makeDefault
        />
      </Canvas>

      <div
        className="absolute inset-0 -z-10 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(16,185,129,0.16), transparent 65%)",
        }}
      />
    </div>
  );
}

useGLTF.preload(MODEL_PATH);
