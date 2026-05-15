/* eslint-disable react/no-unknown-property */
// src/components/brand/HeroDog3D.jsx

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  useAnimations,
  useGLTF,
} from "@react-three/drei";
import { useSelector } from "react-redux";
import { Box3, Vector3 } from "three";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";

import { useDayNight } from "@/hooks/useDayNight.js";

/*
  LEARNING MODE

  This file controls the small marketing/landing-page 3D dog.

  Important:
  This is not the main yard dog renderer.
  This is the "first impression" dog shown on landing/adopt style screens.

  The old version had the dog too zoomed/cropped.
  This version:
  1. Fits the model into the camera using its bounding box.
  2. Keeps the dog centered.
  3. Stops auto-rotation so the dog does not randomly face away.
  4. Uses softer lighting.
  5. Makes the preview look intentional instead of like a raw 3D test.
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

function normalizeClipName(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, "_");
}

function resolveActiveClip({
  animationName,
  mood,
  isSleeping,
  actionOverride,
  happiness,
}) {
  const override = normalizeClipName(actionOverride);
  if (override) return override;

  if (isSleeping) {
    return happiness < 30 ? "Deep_Rem_Sleep" : "Sleep";
  }

  const moodKey = String(mood || "")
    .trim()
    .toLowerCase();

  if (moodKey === "happy") return "Wag";
  if (moodKey === "sad") return "Idle_Resting";
  if (moodKey === "sick") return "Lethargic_Lay";

  return normalizeClipName(animationName) || "Idle";
}

function getModelFit(object, stage) {
  try {
    const box = new Box3().setFromObject(object);
    const size = new Vector3();
    const center = new Vector3();

    box.getSize(size);
    box.getCenter(center);

    const height = Math.max(0.0001, Number(size.y || 0.0001));
    const stageKey = String(stage || "ADULT").toUpperCase();

    /*
      The target height is the visual height inside the hero card.
      Smaller target = dog fits better and does not crop.
    */
    const targetHeight =
      stageKey === "PUPPY" ? 1.55 : stageKey === "SENIOR" ? 1.62 : 1.68;

    return {
      scale: targetHeight / height,
      offset: [-center.x, -box.min.y, -center.z],
    };
  } catch {
    return {
      scale: 1,
      offset: [0, 0, 0],
    };
  }
}

function getAvailableClip(actions, requestedClip) {
  const actionNames = Object.keys(actions || {});
  if (!actionNames.length) return null;

  if (requestedClip && actionNames.includes(requestedClip)) {
    return requestedClip;
  }

  if (actionNames.includes("Idle")) return "Idle";
  return actionNames[0];
}

function DogModel({
  animationName = "Idle",
  mood = "neutral",
  isSleeping = false,
  stage = "ADULT",
  actionOverride = null,
  happiness = 50,
}) {
  const groupRef = useRef(null);
  const { scene, animations } = useGLTF(MODEL_PATH);

  const clonedScene = useMemo(() => cloneSkeleton(scene), [scene]);
  const fit = useMemo(
    () => getModelFit(clonedScene, stage),
    [clonedScene, stage]
  );
  const { actions } = useAnimations(animations, groupRef);

  const requestedClip = resolveActiveClip({
    animationName,
    mood,
    isSleeping,
    actionOverride,
    happiness,
  });

  useEffect(() => {
    const clipName = getAvailableClip(actions, requestedClip);
    if (!clipName) return undefined;

    const nextAction = actions?.[clipName];
    if (!nextAction) return undefined;

    Object.values(actions || {}).forEach((existingAction) => {
      if (existingAction && existingAction !== nextAction) {
        existingAction.fadeOut(0.2);
      }
    });

    nextAction.reset().fadeIn(0.25).play();

    return () => {
      nextAction.fadeOut(0.2);
    };
  }, [actions, requestedClip]);

  return (
    <group
      ref={groupRef}
      position={[0, -1.18, 0]}
      rotation={[0, 0.22, 0]}
      scale={fit.scale}
      dispose={null}
    >
      <group position={fit.offset}>
        <primitive object={clonedScene} />
      </group>
    </group>
  );
}

function HeroFallback() {
  return (
    <div className="grid h-full w-full place-items-center">
      <div className="h-24 w-36 rounded-[50%] bg-emerald-300/15 blur-2xl" />
    </div>
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

  const envPreset = isNight
    ? "night"
    : isSunset
      ? "sunset"
      : isRainy
        ? "warehouse"
        : isCloudy
          ? "city"
          : "studio";

  const ambientColor = isNight
    ? "#dbeafe"
    : isSunset
      ? "#fff1d6"
      : isRainy
        ? "#e2e8f0"
        : "#ffffff";

  const ambientIntensity = isNight ? 0.65 : isRainy ? 0.72 : 0.88;

  return (
    <div
      className={`relative h-full w-full overflow-hidden pointer-events-none ${className}`}
      data-doggerz-hero-dog="3d"
    >
      <Canvas
        shadows
        camera={{ position: [0, 0.82, 4.9], fov: 38 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={ambientIntensity} color={ambientColor} />

        <directionalLight
          position={[3.5, 4.5, 4]}
          intensity={isNight ? 1.2 : 1.75}
          color={isSunset ? "#fff0d6" : "#ffffff"}
          castShadow
        />

        <pointLight
          position={[-2.4, 1.4, 2.8]}
          intensity={isNight ? 1.2 : 0.7}
          color={isNight ? "#93c5fd" : "#bbf7d0"}
        />

        <Suspense fallback={<HeroFallback />}>
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
            position={[0, -1.2, 0]}
            opacity={0.28}
            scale={5}
            blur={2.4}
            far={3.5}
          />
        </Suspense>
      </Canvas>

      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 50% 58%, rgba(134,239,172,0.16), transparent 42%), radial-gradient(circle at 28% 18%, rgba(56,189,248,0.12), transparent 35%)",
        }}
      />
    </div>
  );
}

useGLTF.preload(MODEL_PATH);
