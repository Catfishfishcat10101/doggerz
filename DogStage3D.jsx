//DogStage3D.jsx
import React, { useRef, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, Environment } from '@react-three/drei';
import { useSelector } from 'react-redux';
import * as THREE from 'three'; // Import THREE for constants like Math.PI

// Integrate day/night environmental data
import useDayNight from '@/hooks/environment/useDayNightBackground.js';

// Re-use the motion reduction logic from HeroDog.jsx to maintain consistency
import { resolveShouldReduceMotion } from '@/components/dog/renderers/HeroDog.jsx';

// Canonical asset path for the Jack Russell GLB model, as per asset spec
const DOG_GLB_PATH = '/assets/models/dog/jackrussell-doggerz.glb';

// Visual configuration for different dog moods/states to drive procedural animation
const MOOD_CONFIGS = {
  happy: {
    breathingSpeed: 2.2,
    breathingAmp: 0.007,
    headBobSpeed: 2.5,
    headBobAmp: 0.01,
    headRotationOffset: -0.1, // Lifted nose/head
    tailWagSpeed: 12.0,
    tailWagAmp: 0.25,
    yBase: -0.7,
  },
  sleepy: {
    breathingSpeed: 0.8,
    breathingAmp: 0.002,
    headBobSpeed: 0.5,
    headBobAmp: 0.002,
    headRotationOffset: 0.15, // Lowered/heavy head
    tailWagSpeed: 1.5,
    tailWagAmp: 0.04,
    yBase: -0.72, // Slightly lower posture
  },
  neutral: {
    breathingSpeed: 1.5,
    breathingAmp: 0.004,
    headBobSpeed: 1.5,
    headBobAmp: 0.005,
    headRotationOffset: 0,
    tailWagSpeed: 6.0,
    tailWagAmp: 0.12,
    yBase: -0.7,
  },
  alert: {
    breathingSpeed: 2.5,
    breathingAmp: 0.008,
    headBobSpeed: 3.5,
    headBobAmp: 0.012,
    headRotationOffset: -0.2, // Lifted nose for barking/alert
    tailWagSpeed: 9.0,
    tailWagAmp: 0.2,
    yBase: -0.7,
  },
  focused: {
    breathingSpeed: 1.2,
    breathingAmp: 0.003,
    headBobSpeed: 4.5, // Faster twitch for sniffing
    headBobAmp: 0.008,
    headRotationOffset: 0.35, // Nose to the ground
    tailWagSpeed: 2.0,
    tailWagAmp: 0.05,
    yBase: -0.71,
    sniffHeadTurnAmp: 0.2, // Max yaw angle in radians
    sniffHeadTurnSpeed: 3, // Lerp speed for the turn
    sniffHeadTurnInterval: 2, // Base interval in seconds before choosing a new target
    sniffHeadTurnIntervalRandom: 3, // Random additional interval
  },
  digging: {
    breathingSpeed: 2.5,
    breathingAmp: 0.006,
    headBobSpeed: 5.0,
    headBobAmp: 0.015,
    headRotationOffset: 0.45, // Nose deep in dirt
    tailWagSpeed: 10.0,
    tailWagAmp: 0.2,
    yBase: -0.7,
  }
};

// Internal component for the digging dirt effect
function DigParticles({ active }) {
  const pointsRef = useRef();
  const particleCount = 24;

  // Initialize positions and velocities for dirt particles
  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3 + 1] = -2; // Hide initially below ground
    }
    return [pos, vel];
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const attr = pointsRef.current.geometry.attributes.position;

    for (let i = 0; i < particleCount; i++) {
      if (active) {
        // If particle is below ground, reset it to the "digging" point (front paws area)
        if (attr.array[i * 3 + 1] < -0.7) {
          attr.array[i * 3] = (Math.random() - 0.5) * 0.15; // X spread
          attr.array[i * 3 + 1] = -0.68; // Start just above ground
          attr.array[i * 3 + 2] = 0.3; // Positioned in front of dog center

          // Burst backwards (positive Z) and upwards (positive Y)
          velocities[i * 3] = (Math.random() - 0.5) * 0.1;
          velocities[i * 3 + 1] = 0.08 + Math.random() * 0.15;
          velocities[i * 3 + 2] = 0.05 + Math.random() * 0.15;
        }

        // Apply physics
        attr.array[i * 3] += velocities[i * 3];
        attr.array[i * 3 + 1] += velocities[i * 3 + 1];
        attr.array[i * 3 + 2] += velocities[i * 3 + 2];

        // Gravity simulation
        velocities[i * 3 + 1] -= delta * 1.2;
      } else {
        // Slowly hide particles when inactive
        if (attr.array[i * 3 + 1] > -2) attr.array[i * 3 + 1] -= delta * 5;
      }
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#5d4037" size={0.05} sizeAttenuation={true} transparent opacity={0.7} />
    </points>
  );
}

// Internal component for the night fireflies effect
function Fireflies({ active }) {
  const pointsRef = useRef();
  const particleCount = 20;

  const [positions, phases] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const ph = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8; // X spread
      pos[i * 3 + 1] = -0.5 + Math.random() * 2; // Y height
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8; // Z spread
      ph[i] = Math.random() * Math.PI * 2;
    }
    return [pos, ph];
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.elapsedTime;
    const attr = pointsRef.current.geometry.attributes.position;

    for (let i = 0; i < particleCount; i++) {
      // Drifting motion
      attr.array[i * 3] += Math.sin(t * 0.5 + phases[i]) * 0.003;
      attr.array[i * 3 + 1] += Math.cos(t * 0.8 + phases[i]) * 0.002;
      attr.array[i * 3 + 2] += Math.sin(t * 0.3 + phases[i]) * 0.003;
    }
    attr.needsUpdate = true;

    // Pulse opacity globally for simple lightweight performance
    const pulse = (Math.sin(t * 2) * 0.4 + 0.6);
    pointsRef.current.material.opacity = active ? pulse : 0;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        color="#A3E635"
        size={0.12}
        sizeAttenuation={true}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// New Yard component: Builds a cozy, mobile-first Doggerz yard with primitive shapes.
function Yard({ isNight = false, timeOfDayBucket = 'afternoon' }) {
  const treeLeavesRef = useRef();
  const bushRef = useRef();

  // Dynamic colors based on time of day for that "Doggerz" cozy feel
  const grassColor = isNight ? '#1a241a' : '#5ba344';
  const fenceColor = isNight ? '#3d2b1f' : '#8B4513';
  const doghouseBodyColor = isNight ? '#4a2d1e' : '#A0522D';
  const doghouseRoofColor = isNight ? '#2a1a0a' : '#654321';
  const treeTrunkColor = isNight ? '#3d2516' : '#8B4513';
  const treeLeavesColor = isNight ? '#0d1a0d' : '#228B22';
  const hillColor = isNight ? '#0a100d' : '#457a33';
  const skyColor = isNight ? '#020617' : (timeOfDayBucket === 'dusk' || timeOfDayBucket === 'dawn' ? '#fb923c' : '#38bdf8');

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (treeLeavesRef.current) {
      // Gentle sway for the tree canopy
      treeLeavesRef.current.rotation.z = Math.sin(t * 0.8) * 0.03;
      treeLeavesRef.current.rotation.x = Math.sin(t * 0.5) * 0.02;
    }

    if (bushRef.current) {
      // Subtle "rustle" for the bush
      bushRef.current.rotation.z = Math.sin(t * 2) * 0.02;
      bushRef.current.scale.y = 1 + Math.sin(t * 1.5) * 0.01;
    }
  });

  return (
    <group>
      {/* Dynamic Sky Background */}
      <color attach="background" args={[skyColor]} />

      {/* Ground: A large, flat plane for the grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.7, 0]} receiveShadow>
        <planeGeometry args={[15, 15]} /> {/* Generous size to frame the dog and yard */}
        <meshStandardMaterial color={grassColor} />
      </mesh>

      {/* Stylized Far Hills: Frames the background nicely */}
      <group position={[0, -0.7, -7]}>
        <mesh position={[-6, 0.5, 0]} rotation={[0, 0.5, 0]}>
          <sphereGeometry args={[10, 16, 16]} />
          <meshStandardMaterial color={hillColor} />
        </mesh>
        <mesh position={[8, 0, -3]} rotation={[0, -0.3, 0]}>
          <sphereGeometry args={[12, 16, 16]} />
          <meshStandardMaterial color={hillColor} />
        </mesh>
      </group>

      {/* Fence: Simplified back section to frame the scene, not a full perimeter */}
      <group position={[0, -0.7 + 0.5, -3]}> {/* Positioned behind the dog */}
        {/* Horizontal rails */}
        <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
          <boxGeometry args={[8, 0.1, 0.1]} />
          <meshStandardMaterial color={fenceColor} />
        </mesh>
        <mesh position={[0, -0.25, 0]} castShadow receiveShadow>
          <boxGeometry args={[8, 0.1, 0.1]} />
          <meshStandardMaterial color={fenceColor} />
        </mesh>
        {/* Vertical posts */}
        {[...Array(6)].map((_, i) => (
          <mesh key={`fence-post-back-${i}`} position={[-3.5 + i * 1.4, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.1, 1, 0.1]} />
            <meshStandardMaterial color={fenceColor} />
          </mesh>
        ))}
      </group>

      {/* Doghouse: Positioned to the side/back, not covering the dog */}
      <group position={[2.5, -0.7, -1.5]}>
        {/* Body */}
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 1, 1.5]} />
          <meshStandardMaterial color={doghouseBodyColor} />
        </mesh>
        {/* Roof - two slanted boxes for a classic look */}
        <mesh position={[0, 1.25, 0.4]} rotation={[Math.PI / 10, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.8, 0.2, 1.8]} />
          <meshStandardMaterial color={doghouseRoofColor} />
        </mesh>
        <mesh position={[0, 1.25, -0.4]} rotation={[-Math.PI / 10, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.8, 0.2, 1.8]} />
          <meshStandardMaterial color={doghouseRoofColor} />
        </mesh>
      </group>

      {/* Simple Tree: Positioned in a corner, not huge */}
      <group position={[-3.5, -0.7, -2.5]}>
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.2, 0.2, 1, 8]} /> {/* Trunk */}
          <meshStandardMaterial color={treeTrunkColor} />
        </mesh>
        <mesh ref={treeLeavesRef} position={[0, 1.5, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.8, 16, 16]} /> {/* Leaves */}
          <meshStandardMaterial color={treeLeavesColor} />
        </mesh>
      </group>

      {/* Small Bush: Another simple prop for visual interest */}
      <group position={[3.5, -0.7, 1.5]}>
        <mesh ref={bushRef} position={[0, 0.2, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.4, 8, 8]} />
          <meshStandardMaterial color={treeLeavesColor} />
        </mesh>
      </group>

      {/* Night-only fireflies effect */}
      <Fireflies active={isNight} />
    </group>
  );
}

// Component to render the 3D dog model and handle its animations
function DogModel({ animationName = 'Idle', mood = 'neutral', reduceMotion = false, dogRef }) {
  const group = dogRef || useRef(); // Ref to the entire loaded GLB group
  const nodes = useRef({ head: null, tail: null, ears: null });
  // Persistent refs to smooth transitions between moods for a "living" feel
  const smoothed = useRef({
    yBase: MOOD_CONFIGS.neutral.yBase,
    breathingSpeed: MOOD_CONFIGS.neutral.breathingSpeed,
    breathingAmp: MOOD_CONFIGS.neutral.breathingAmp,
    headBobAmp: MOOD_CONFIGS.neutral.headBobAmp,
    headRotation: 0,
    tailWagSpeed: MOOD_CONFIGS.neutral.tailWagSpeed,
    tailWagAmp: MOOD_CONFIGS.neutral.tailWagAmp,
  });
  // Refs for sniffing head turn
  const sniffHeadTargetYaw = useRef(0);
  const lastSniffTurnTime = useRef(0);

  const { scene, animations } = useGLTF(DOG_GLB_PATH); // Load the GLB model and its animations
  const { actions } = useAnimations(animations, group); // Get animation actions from the GLB

  // Setup materials and find specific parts for the JRT look
  useMemo(() => {
    scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;

        if (obj.material) {
          // Clone to prevent cross-contamination if the scene is reused
          obj.material = obj.material.clone();
          obj.material.roughness = 0.85; // Fur-like matte finish
          obj.material.metalness = 0;

          const name = obj.name.toLowerCase();

          // JRT Coloration: Tan/brown ears and face patches, white body
          if (name.includes('ear') || name.includes('patch') || name.includes('spot')) {
            obj.material.color.set('#8B4513'); // Rich brown for patches
          } else {
            obj.material.color.set('#FFFFFF'); // Canonical white coat
          }

          // Identify specific features by name to ensure "black nose" and "dark eyes"
          if (name.includes('nose') || name.includes('eye')) {
            obj.material = obj.material.clone(); // Ensure unique material for gloss
            obj.material.roughness = 0.2; // Slight gloss for eyes/nose
            obj.material.color.set(name.includes('nose') ? '#111111' : '#050505');
          }
        }
      }

      // Cache bones for high-performance animation access
      const boneName = obj.name.toLowerCase();
      if (boneName.includes('head')) nodes.current.head = obj;
      if (boneName.includes('neck')) nodes.current.neck = obj;
      if (boneName.includes('tail')) nodes.current.tail = obj;
      if (boneName.includes('ear_l')) nodes.current.earL = obj;
      if (boneName.includes('ear_r')) nodes.current.earR = obj;

      // Intentional JRT Proportions: Wider skull, shorter muzzle, larger paws
      if (boneName.includes('head')) obj.scale.set(1.1, 1.0, 1.0);
      if (boneName.includes('muzzle')) obj.scale.set(0.9, 0.9, 0.85);
      if (boneName.includes('paw') || boneName.includes('foot')) obj.scale.multiplyScalar(1.2);

      // NEW: Short strong neck and compact body
      if (boneName.includes('neck')) obj.scale.set(1.1, 0.8, 1.1);
      if (boneName.includes('spine') || boneName.includes('body')) {
        obj.scale.set(1.0, 1.0, 0.85); // Shorter length for compact terrier look
      }
    });

    // Slight Ear Asymmetry for character
    if (nodes.current.earR) nodes.current.earR.rotation.z += 0.1;
  }, [scene]);

  // Play the specified animation clip from the GLB
  useEffect(() => {
    const action = actions[animationName];
    if (action) {
      // Ensure consistent playback speed across clips
      action.reset().fadeIn(0.5).play();
      return () => {
        action.fadeOut(0.5);
      };
    }
    console.warn(`Animation clip "${animationName}" not found in GLB.`);
    return undefined;
  }, [animationName, actions]);

  useFrame((state, delta) => {
    if (reduceMotion || !group.current) return;

    const t = state.clock.elapsedTime;
    const { head, tail, earL } = nodes.current;
    const config = MOOD_CONFIGS[mood] || MOOD_CONFIGS.neutral;

    // Interpolate config values to prevent visual snapping when mood changes
    const lerpFactor = Math.min(delta * 4, 1); // Smoothing factor for physical state
    smoothed.current.yBase = THREE.MathUtils.lerp(smoothed.current.yBase, config.yBase, lerpFactor);
    smoothed.current.breathingSpeed = THREE.MathUtils.lerp(smoothed.current.breathingSpeed, config.breathingSpeed, lerpFactor);
    smoothed.current.breathingAmp = THREE.MathUtils.lerp(smoothed.current.breathingAmp, config.breathingAmp, lerpFactor);
    smoothed.current.headBobAmp = THREE.MathUtils.lerp(smoothed.current.headBobAmp, config.headBobAmp, lerpFactor);
    smoothed.current.tailWagAmp = THREE.MathUtils.lerp(smoothed.current.tailWagAmp, config.tailWagAmp, lerpFactor);
    smoothed.current.tailWagSpeed = THREE.MathUtils.lerp(smoothed.current.tailWagSpeed, config.tailWagSpeed, lerpFactor);

    // Head rotation stays slightly snappier for alertness
    smoothed.current.headRotation = THREE.MathUtils.lerp(
      smoothed.current.headRotation,
      config.headRotationOffset,
      Math.min(delta * 6, 1)
    );

    // 1. Breathing / Body Bounce: Vertical movement + "Chest Expansion"
    const breathing = Math.sin(t * smoothed.current.breathingSpeed) * smoothed.current.breathingAmp;
    group.current.position.y = smoothed.current.yBase + breathing;

    // Scale non-uniformly to simulate rib expansion (production-safe weight)
    const scaleFactor = 0.5 + breathing * 0.05;
    group.current.scale.set(scaleFactor, 0.5 + breathing * 0.02, scaleFactor);

    // 2. Head Bob / Posture: Rhythmic bob for character life
    if (head) {
      // Apply the smoothed base offset + a sine wave for the bob
      head.rotation.x = smoothed.current.headRotation + Math.sin(t * config.headBobSpeed + 0.5) * smoothed.current.headBobAmp;
    }

    // 3. Tail Wag: Speed and intensity determined by mood
    if (tail) {
      tail.rotation.y = Math.sin(t * smoothed.current.tailWagSpeed) * smoothed.current.tailWagAmp;
      tail.rotation.z = Math.cos(t * smoothed.current.tailWagSpeed * 0.5) * 0.05;
    }


    // NEW: Sniffing head turn (yaw)
    if (mood === 'focused') {
      // Occasionally set a new target yaw
      if (t - lastSniffTurnTime.current > (config.sniffHeadTurnInterval || 2) + Math.random() * (config.sniffHeadTurnIntervalRandom || 3)) {
        sniffHeadTargetYaw.current = (Math.random() * 2 - 1) * (config.sniffHeadTurnAmp || 0.2); // -amp to +amp
        lastSniffTurnTime.current = t;
      }
      // Smoothly lerp towards the target yaw
      head.rotation.y = THREE.MathUtils.lerp(
        head.rotation.y,
        sniffHeadTargetYaw.current,
        Math.min(delta * (config.sniffHeadTurnSpeed || 3), 1)
      );
    } else {
      // When not focused, smoothly return head to center yaw
      head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, 0, Math.min(delta * 2, 1));
      lastSniffTurnTime.current = t; // Reset for immediate turn when re-entering focused
    }

    // 4. Ear Twitch: Randomized micro-movements for a "thinking" feel
    // Optimized: Use a sin wave modulated by time to ensure framerate independence
    const twitchChance = mood === 'sleepy' ? 0.05 : 0.2;
    if (earL && Math.sin(t * 10) > 0.98) {
      // Organic micro-twitch (low frequency amplitude for realism)
      const jitter = (Math.sin(t * 50) * 0.05) * twitchChance;
      earL.rotation.x += jitter;
    }
  });

  return (
    <group ref={group} dispose={null} position={[0, -0.7, 0]}>
      {/* The primitive object is the loaded GLB scene */}
      <primitive object={scene} />
    </group>
  );
}

/**
 * CameraRig component: Adds cinematic breathing and handheld motion.
 * Operates around the base camera position [0, 0.8, 2.2].
 */
function CameraRig({ reduceMotion, dogRef }) {
  const lookAtTarget = useRef(new THREE.Vector3(0, -0.4, 0));

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // 1. Slow Breathing: Vertical and depth oscillation (Applied to camera POSITION)
    if (!reduceMotion) {
      state.camera.position.y = 0.8 + Math.sin(t * 0.5) * 0.015;
      state.camera.position.z = 2.2 + Math.cos(t * 0.3) * 0.02;
      state.camera.position.x = Math.sin(t * 0.7) * 0.02;
    }

    // 2. Tracking Logic: Rotate camera to follow the dog
    if (dogRef.current) {
      const worldPos = new THREE.Vector3();
      dogRef.current.getWorldPosition(worldPos);

      // Target a point slightly above the dog's origin (chest level focus)
      const target = worldPos.clone().add(new THREE.Vector3(0, 0.4, 0));

      // Smoothly move the camera's focus point toward the target
      lookAtTarget.current.lerp(target, Math.min(delta * 2, 1));
      state.camera.lookAt(lookAtTarget.current);
    }

    // 3. Handheld Float: Micro-roll (Applied AFTER lookAt)
    if (!reduceMotion) {
      state.camera.rotation.z += Math.sin(t * 1.1) * 0.002;
    }
  });

  return null;
}

/**
 * HUD Sub-components for a clean mobile-first layout
 */
const NeedStat = ({ label, value = 0, colorClass }) => (
  <div className="flex flex-col items-center gap-1">
    <div className="w-10 h-1 bg-white/10 rounded-full overflow-hidden">
      <div
        className={`h-full ${colorClass} transition-all duration-700 ease-out`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
    <span className="text-[9px] uppercase font-bold tracking-tighter text-zinc-500">{label}</span>
  </div>
);

const ActionBtn = ({ label, icon, onClick, active = false }) => (
  <button
    onClick={onClick}
    className={`
      flex flex-col items-center justify-center w-14 h-14 rounded-2xl
      bg-black/40 backdrop-blur-xl border transition-all duration-200
      active:scale-90 group pointer-events-auto
      ${active ? 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'border-white/10 hover:border-white/20'}
    `}
  >
    <span className="text-xl mb-0.5 group-hover:scale-110 transition-transform select-none">
      {icon}
    </span>
    <span className={`text-[9px] font-black uppercase tracking-tight ${active ? 'text-emerald-400' : 'text-zinc-500'}`}>
      {label}
    </span>
  </button>
);

/**
 * Renders a 3D Jack Russell Terrier model with animations within a React Three Fiber canvas.
 * This component is intended for the main game screen or other 3D contexts where the dog
 * needs to be displayed as a game character.
 *
 * @param {object} props - Component props.
 * @param {string} [props.animation='Idle'] - The name of the animation clip to play (e.g., 'Idle', 'Walk').
 * @param {string} [props.className=''] - Additional CSS classes for the canvas container.
 */
export default function DogStage3D({
  animation = 'Idle',
  className = '',
}) {
  // Connect to Redux to observe live dog needs and state
  const settings = useSelector((state) => state.settings || {});
  const dog = useSelector((state) => state.dog || {});
  const dogRef = useRef();

  // Resolve environmental state (is it night? what's the time bucket?)
  const { isNight, timeOfDayBucket } = useDayNight({
    enableImages: false // We use 3D primitives instead of SVG images here
  });

  const reduceMotion = useMemo(
    () => resolveShouldReduceMotion(settings.reduceMotion, settings),
    [settings]
  );

  // Deterministic Action Resolver: Maps game state to animations and procedural mood factors
  const { resolvedAction, resolvedMood } = useMemo(() => {
    // Priority 1: Explicit game action passed via props (e.g. Barking, Digging)
    if (animation !== 'Idle') {
      const moodMap = { 'Dig': 'digging', 'Bark': 'alert', 'Sniff': 'focused' };
      return { resolvedAction: animation, resolvedMood: moodMap[animation] || 'neutral' };
    }

    // Priority 2: Biological needs (Sleeping takes precedence over environment)
    if (dog.sleeping || dog.energy < 20) return { resolvedAction: 'Sleep', resolvedMood: 'sleepy' };

    // Priority 3: Environmental/Behavioral triggers (New: Barking and Sniffing)
    if (dog.isBarking || dog.behavior === 'barking') return { resolvedAction: 'Bark', resolvedMood: 'alert' };
    if (dog.isSniffing || dog.behavior === 'sniffing') return { resolvedAction: 'Sniff', resolvedMood: 'focused' };

    // Priority 4: Emotional state
    if (dog.happiness > 80) return { resolvedAction: 'Idle', resolvedMood: 'happy' };

    // Default fallback: Standard neutral idle
    return { resolvedAction: 'Idle', resolvedMood: 'neutral' };
  }, [animation, dog.energy, dog.happiness, dog.sleeping, dog.isBarking, dog.isSniffing, dog.behavior]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <Canvas
        shadows // Enable shadows in the scene for more realistic rendering
        camera={{ position: [0, 0.8, 2.2], fov: 45 }} // Pulled back slightly for better yard framing
        gl={{ antialias: true }} // Enable anti-aliasing for smoother edges
      >
        {/* Cinematic Camera Rig */}
        <CameraRig reduceMotion={reduceMotion} dogRef={dogRef} />

        {/* Environment-aware lighting */}
        <ambientLight
          intensity={isNight ? 0.25 : 0.6}
          color={isNight ? '#4c51bf' : '#ffffff'}
        />
        {/* Key Light for depth and chest shadows */}
        <spotLight
          position={[5, 10, 5]}
          angle={0.3}
          penumbra={1}
          intensity={isNight ? 0.4 : 1.2}
          color={isNight ? '#718096' : '#fff9e6'}
          castShadow
          shadow-mapSize={[1024, 1024]} // Cleaner shadows for mobile
        />
        {/* Fill Light for coat detail */}
        <pointLight position={[-5, 2, 2]} intensity={0.5} />

        {/* The 3D dog model component */}
        <Suspense fallback={null}>
          <DogModel animationName={resolvedAction} mood={resolvedMood} reduceMotion={reduceMotion} dogRef={dogRef} />
        </Suspense>

        {/* Procedural ground effects for specific actions */}
        <DigParticles active={resolvedAction === 'Dig' && !reduceMotion} />

        {/* The new Doggerz Yard environment, replacing the placeholder ground */}
        <Yard isNight={isNight} timeOfDayBucket={timeOfDayBucket} />

        {/* Environment for realistic background and reflections, enhancing visual quality */}
        <Environment preset={isNight ? "night" : "sunset"} blur={0.5} />

        {/* OrbitControls for development/debugging. Uncomment to enable camera controls in dev. */}
        {/* <OrbitControls /> */}
      </Canvas>

      {/* Top HUD: Compact & Premium */}
      <div className="absolute inset-x-0 top-0 p-5 pointer-events-none flex justify-between items-start z-10">
        <div className="bg-black/30 backdrop-blur-md border border-white/5 rounded-2xl p-3 px-4 pointer-events-auto shadow-2xl">
          <h2 className="text-[13px] font-black text-white leading-none tracking-tight">
            {dog.name || 'Your Pup'}
          </h2>
          <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-[0.2em] mt-1.5 opacity-80">
            {dog.stage || 'Puppy'}
          </p>
        </div>

        <div className="flex gap-4 bg-black/30 backdrop-blur-md border border-white/5 rounded-2xl p-3 px-4 pointer-events-auto shadow-2xl">
          <NeedStat label="NRG" value={dog.energy} colorClass="bg-amber-400" />
          <NeedStat label="HAP" value={dog.happiness} colorClass="bg-emerald-400" />
          <NeedStat label="FUL" value={100 - (dog.hunger || 0)} colorClass="bg-sky-400" />
        </div>
      </div>

      {/* Bottom Action Dock: Thumb-Friendly */}
      <div className="absolute inset-x-0 bottom-8 flex justify-center pointer-events-none z-10">
        <div className="flex gap-2.5 p-2 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl shadow-black/50">
          <ActionBtn label="Feed" icon="🍖" onClick={() => { }} />
          <ActionBtn label="Water" icon="💧" onClick={() => { }} />
          <ActionBtn label="Pet" icon="✋" onClick={() => { }} />
          <ActionBtn
            label="Play"
            icon="🎾"
            onClick={() => { }}
            active={resolvedAction === 'Dig' || resolvedAction === 'Fetch'}
          />
        </div>
      </div>
    </div>
  );
}