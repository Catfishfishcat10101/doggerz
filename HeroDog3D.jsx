import React, { Suspense, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, useAnimations, OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { useSelector } from 'react-redux';
import { selectWeatherCondition } from '@/store/weatherSlice.js';
import { selectUserZip } from '@/store/userSlice.js';
import { useDayNight } from '@/hooks/useDayNight.js';

/**
 * HeroDog3D - Phase 2 Premium Brand Component
 * Replaces legacy 2D HeroDog.jsx to unify landing/adopt with game visuals.
 */

const MODEL_PATH = '/assets/models/dog/jackrussell-doggerz.glb';

function DogModel({ animationName = 'Idle', mood = 'neutral', isSleeping = false, stage = 'ADULT', actionOverride = null, happiness = 50 }) {
  const { scene, animations } = useGLTF(MODEL_PATH);
  const { actions } = useAnimations(animations, scene);

  // Determine active clip based on state priority
  const activeClip = actionOverride
    ? actionOverride
    : isSleeping
      ? (happiness < 30 ? 'Deep_Rem_Sleep' : 'Sleep') // Deeper sleep if very unhappy
      : (mood === 'happy' ? 'Wag' : (mood === 'sad' ? 'Idle_Resting' : (mood === 'sick' ? 'Lethargic_Lay' : animationName)));

  // Handle scale for lifecycle progression
  const isPuppy = stage === 'PUPPY';
  const modelScale = isPuppy ? 1.2 : 1.8;
  const modelY = isPuppy ? -0.5 : -0.8;

  useEffect(() => {
    // Play the designated state animation
    const action = actions[activeClip] || actions['Idle'];
    if (action) {
      action.reset().fadeIn(0.5).play();
      return () => action.fadeOut(0.5);
    }
  }, [actions, activeClip]);

  return (
    <primitive
      object={scene}
      scale={modelScale}
      position={[0, modelY, 0]}
      rotation={[0, -0.4, 0]}
    />
  );
}

const HeroDog3D = ({
  className = "",
  mood = "neutral",
  isSleeping = false,
  stage = "ADULT",
  weather: propWeather,
  timeOfDay: propTimeOfDay,
  actionOverride = null
}) => {
  // Pull real-time environmental state from Redux
  const reduxWeather = useSelector(selectWeatherCondition);
  const zip = useSelector(selectUserZip);
  const { timeOfDayBucket } = useDayNight({ zip });

  // Favor props if explicitly provided (e.g., for specific UI demos),
  // otherwise fall back to real yard conditions.
  const weather = propWeather || reduxWeather || "sunny";
  const timeOfDay = propTimeOfDay || timeOfDayBucket || "day";

  // Map environment props to R3F lighting/environment presets
  const isNight = timeOfDay === 'night';
  const isSunset = timeOfDay === 'sunset';
  const isRainy = weather === 'rainy';
  const isCloudy = weather === 'cloudy';
  const isOvercast = isRainy || isCloudy;

  let envPreset = 'neutral';
  if (isNight) envPreset = 'night';
  else if (isSunset) envPreset = 'sunset';
  else if (isRainy) envPreset = 'warehouse'; // Cooler, more desaturated industrial light for rain
  else if (isCloudy) envPreset = 'city';

  const ambientColor = isNight ? "#202040" : (isSunset ? "#ffaa88" : (isRainy ? "#94a3b8" : "#ffffff"));
  const ambientIntensity = isNight ? 0.2 : (isRainy ? 0.35 : (isCloudy ? 0.5 : 0.8));
  const modelY = stage === 'PUPPY' ? -0.5 : -0.8;

  return (
    <div className={`relative w-full aspect-square max-w-sm mx-auto pointer-events-none sm:pointer-events-auto ${className}`}>
      <Canvas
        shadows
        camera={{ position: [0, 1, 4], fov: 35 }}
        dpr={[1, 2]} // Performance optimized for mobile
      >
        <ambientLight intensity={ambientIntensity} color={ambientColor} />
        <spotLight
          position={[5, 5, 5]}
          angle={0.15}
          penumbra={1}
          intensity={isNight ? 0.5 : (isRainy ? 0.6 : 1)}
          castShadow
        />

        <Suspense fallback={null}>
          <DogModel mood={mood} isSleeping={isSleeping} stage={stage} actionOverride={actionOverride} />
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
      {/* Subtle brand glow backdrop */}
      <div className="absolute inset-0 bg-radial-gradient from-brand-primary/10 to-transparent -z-10 rounded-full blur-3xl" />
    </div>
  );
};

export default HeroDog3D;