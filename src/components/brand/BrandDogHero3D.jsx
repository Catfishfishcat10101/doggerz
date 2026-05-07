//src/components/brand/BrandDogHero3D.jsx
/* eslint-disable react/no-unknown-property */
import PropTypes from "prop-types";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  PerspectiveCamera,
  useAnimations,
  useGLTF,
} from "@react-three/drei";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";

import {
  DOG_MODEL_GLTF_PATH,
  hasPlayableDogModelClips,
  resolveClipName,
} from "@/features/game/stage3d/dog/dogAnimationMap.js";

const HERO_PRESETS = Object.freeze({
  card: Object.freeze({
    shellClassName:
      "aspect-square w-24 rounded-[1.25rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,13,22,0.98),rgba(7,12,18,0.92))] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_16px_38px_rgba(0,0,0,0.34)]",
    glowClassName:
      "bg-[radial-gradient(circle_at_48%_30%,rgba(174,255,221,0.16),rgba(87,181,255,0.06)_34%,rgba(0,0,0,0)_72%)]",
    cameraPosition: [0, 0.66, 4.25],
    lookAt: [0, -0.35, 0],
    modelPosition: [0, -1.04, 0],
    modelRotation: [0, Math.PI * 0.14, 0],
    modelScale: 1.01,
    floorColor: "#5f7d63",
    skyTop: "#102038",
    skyBottom: "#7693b1",
    horizonColor: "#92a58d",
    envPreset: "night",
  }),
  promo: Object.freeze({
    shellClassName:
      "aspect-square w-40 rounded-[1.75rem] border border-emerald-300/18 bg-[linear-gradient(180deg,rgba(8,13,22,0.98),rgba(7,12,18,0.92))] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_24px_64px_rgba(0,0,0,0.38),0_0_56px_rgba(16,185,129,0.12)]",
    glowClassName:
      "bg-[radial-gradient(circle_at_48%_30%,rgba(174,255,221,0.18),rgba(87,181,255,0.07)_34%,rgba(0,0,0,0)_72%)]",
    cameraPosition: [0, 0.68, 4.4],
    lookAt: [0, -0.35, 0],
    modelPosition: [0, -1.03, 0],
    modelRotation: [0, Math.PI * 0.14, 0],
    modelScale: 1.03,
    floorColor: "#617f65",
    skyTop: "#0f2038",
    skyBottom: "#7592b1",
    horizonColor: "#8fa58d",
    envPreset: "night",
  }),
  landing: Object.freeze({
    shellClassName:
      "aspect-square w-[14.5rem] rounded-[2rem] border border-emerald-300/22 bg-[linear-gradient(180deg,rgba(8,13,22,0.98),rgba(7,12,18,0.92))] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_30px_90px_rgba(0,0,0,0.42),0_0_80px_rgba(16,185,129,0.16)]",
    glowClassName:
      "bg-[radial-gradient(circle_at_48%_30%,rgba(174,255,221,0.2),rgba(87,181,255,0.08)_34%,rgba(0,0,0,0)_72%)]",
    cameraPosition: [0, 0.7, 4.55],
    lookAt: [0, -0.34, 0],
    modelPosition: [0, -1.02, 0],
    modelRotation: [0, Math.PI * 0.14, 0],
    modelScale: 1.04,
    floorColor: "#5f7d63",
    skyTop: "#0e2038",
    skyBottom: "#6f8fb0",
    horizonColor: "#8da58d",
    envPreset: "night",
  }),
  adopt: Object.freeze({
    shellClassName:
      "aspect-[1.05/1] w-full rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,13,22,0.98),rgba(7,12,18,0.92))] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_30px_90px_rgba(0,0,0,0.42),0_0_80px_rgba(16,185,129,0.14)]",
    glowClassName:
      "bg-[radial-gradient(circle_at_50%_26%,rgba(255,232,176,0.16),rgba(100,205,182,0.12)_34%,rgba(0,0,0,0)_74%)]",
    cameraPosition: [0, 0.72, 4.7],
    lookAt: [0, -0.38, 0],
    modelPosition: [0, -1.02, 0],
    modelRotation: [0, Math.PI * 0.12, 0],
    modelScale: 1.06,
    floorColor: "#668360",
    skyTop: "#16263d",
    skyBottom: "#859dbe",
    horizonColor: "#92a88a",
    envPreset: "night",
  }),
  showcase: Object.freeze({
    shellClassName:
      "aspect-square w-[22.5rem] rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,13,22,0.98),rgba(7,12,18,0.92))] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_30px_90px_rgba(0,0,0,0.42),0_0_80px_rgba(16,185,129,0.12)]",
    glowClassName:
      "bg-[radial-gradient(circle_at_48%_28%,rgba(174,255,221,0.14),rgba(87,181,255,0.08)_34%,rgba(0,0,0,0)_72%)]",
    cameraPosition: [0, 0.72, 4.8],
    lookAt: [0, -0.38, 0],
    modelPosition: [0, -1.02, 0],
    modelRotation: [0, Math.PI * 0.12, 0],
    modelScale: 1.07,
    floorColor: "#648362",
    skyTop: "#13233d",
    skyBottom: "#88a0c0",
    horizonColor: "#93aa90",
    envPreset: "night",
  }),
});

function BrandDogHeroModel({
  anim = "Idle",
  position = [0, -1.02, 0],
  rotation = [0, Math.PI * 0.14, 0],
  scale = 1,
}) {
  const rootRef = useRef(null);
  const currentActionRef = useRef(null);
  const currentClipRef = useRef("");
  const { scene, animations } = useGLTF(DOG_MODEL_GLTF_PATH);
  const modelScene = useMemo(() => cloneSkeleton(scene), [scene]);
  const { actions } = useAnimations(animations, rootRef);
  const hasModelClips = useMemo(
    () => hasPlayableDogModelClips(actions),
    [actions]
  );

  useFrame((state) => {
    if (hasModelClips) return;

    const root = rootRef.current;
    if (!root) return;

    const t = state.clock.getElapsedTime();
    root.position.y = position[1] + Math.sin(t * 1.5) * 0.012;
    root.rotation.x = rotation[0] + Math.sin(t * 0.9) * 0.01;
    root.rotation.y = rotation[1] + Math.sin(t * 0.36) * 0.06;
    root.rotation.z = rotation[2] || 0;
  });

  useEffect(() => {
    modelScene.traverse((node) => {
      if (!node?.isMesh) return;
      node.castShadow = true;
      node.receiveShadow = true;
    });
  }, [modelScene]);

  useEffect(() => {
    if (!hasModelClips) return;

    const clipName = resolveClipName(anim, actions);
    if (!clipName || currentClipRef.current === clipName) return;

    const nextAction = actions?.[clipName];
    if (!nextAction) return;

    if (currentActionRef.current && currentActionRef.current !== nextAction) {
      currentActionRef.current.fadeOut(0.18);
    }

    nextAction.reset().fadeIn(0.18).play();
    currentActionRef.current = nextAction;
    currentClipRef.current = clipName;
  }, [actions, anim, hasModelClips]);

  useEffect(
    () => () => {
      if (currentActionRef.current?.stop) {
        currentActionRef.current.stop();
      }
      currentActionRef.current = null;
      currentClipRef.current = "";
    },
    []
  );

  return (
    <group ref={rootRef} position={position} rotation={rotation} scale={scale}>
      <primitive object={modelScene} />
    </group>
  );
}

BrandDogHeroModel.propTypes = {
  anim: PropTypes.string,
  position: PropTypes.arrayOf(PropTypes.number),
  rotation: PropTypes.arrayOf(PropTypes.number),
  scale: PropTypes.number,
};

function HeroCameraRig({ position, lookAt }) {
  const cameraRef = useRef(null);

  useEffect(() => {
    const camera = cameraRef.current;
    if (!camera) return;
    camera.position.set(...position);
    camera.lookAt(...lookAt);
  }, [position, lookAt]);

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={position}
      fov={34}
    />
  );
}

HeroCameraRig.propTypes = {
  lookAt: PropTypes.arrayOf(PropTypes.number).isRequired,
  position: PropTypes.arrayOf(PropTypes.number).isRequired,
};

function BrandDogHeroScene({ preset, anim }) {
  const cameraPosition = useMemo(() => preset.cameraPosition, [preset]);
  const lookAtTarget = useMemo(() => preset.lookAt, [preset]);

  return (
    <>
      <HeroCameraRig position={cameraPosition} lookAt={lookAtTarget} />
      <ambientLight intensity={0.28} color="#d7ecff" />
      <directionalLight
        castShadow
        position={[3.4, 4.8, 4.5]}
        intensity={1.08}
        color="#ffe2b0"
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.00014}
      />
      <directionalLight
        position={[-3.6, 2.6, 2.2]}
        intensity={0.32}
        color="#d7ebff"
      />
      <directionalLight
        position={[0.4, 2, -3.8]}
        intensity={0.42}
        color="#d3c7ff"
      />
      <Environment preset={preset.envPreset} />

      <mesh position={[0, 2.75, -4.4]}>
        <planeGeometry args={[14, 4.8]} />
        <meshBasicMaterial color={preset.skyTop} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.82, -4.3]}>
        <planeGeometry args={[14, 5.6]} />
        <meshBasicMaterial
          color={preset.skyBottom}
          transparent
          opacity={0.92}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, -0.98, -3.6]}>
        <planeGeometry args={[12.5, 1.9]} />
        <meshBasicMaterial
          color={preset.horizonColor}
          transparent
          opacity={0.52}
          depthWrite={false}
        />
      </mesh>

      <mesh
        receiveShadow
        position={[0, -1.58, -0.32]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[9.5, 6.6]} />
        <meshStandardMaterial color={preset.floorColor} roughness={1} />
      </mesh>
      <mesh
        receiveShadow
        position={[0, -1.54, -0.04]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[2.5, 1.5]} />
        <shadowMaterial transparent opacity={0.24} />
      </mesh>

      <group position={[-2.35, -0.1, -2.35]}>
        <mesh castShadow receiveShadow position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.2, 0.26, 1.35, 8]} />
          <meshStandardMaterial color="#6b4e36" roughness={0.94} />
        </mesh>
        <mesh castShadow receiveShadow position={[0.04, 1, 0.04]}>
          <sphereGeometry args={[0.72, 18, 16]} />
          <meshStandardMaterial color="#547a4f" roughness={0.97} />
        </mesh>
      </group>

      <BrandDogHeroModel
        anim={anim}
        position={preset.modelPosition}
        rotation={preset.modelRotation}
        scale={preset.modelScale}
      />
    </>
  );
}

BrandDogHeroScene.propTypes = {
  anim: PropTypes.string.isRequired,
  preset: PropTypes.shape({
    cameraPosition: PropTypes.arrayOf(PropTypes.number).isRequired,
    envPreset: PropTypes.string.isRequired,
    floorColor: PropTypes.string.isRequired,
    horizonColor: PropTypes.string.isRequired,
    lookAt: PropTypes.arrayOf(PropTypes.number).isRequired,
    modelPosition: PropTypes.arrayOf(PropTypes.number).isRequired,
    modelRotation: PropTypes.arrayOf(PropTypes.number).isRequired,
    modelScale: PropTypes.number.isRequired,
    skyBottom: PropTypes.string.isRequired,
    skyTop: PropTypes.string.isRequired,
  }).isRequired,
};

function supportsWebGL() {
  try {
    if (typeof document === "undefined") return false;
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}

export default function BrandDogHero3D({
  variant = "landing",
  anim = "Idle",
  className = "",
}) {
  const preset = HERO_PRESETS[variant] || HERO_PRESETS.landing;
  const canRenderWebGL = useMemo(() => supportsWebGL(), []);

  if (!canRenderWebGL) {
    return (
      <div
        className={`relative overflow-hidden ${preset.shellClassName} ${className}`.trim()}
      >
        <div
          className={`pointer-events-none absolute inset-0 ${preset.glowClassName}`}
        />
        <div className="h-full w-full bg-[radial-gradient(circle_at_50%_35%,rgba(16,185,129,0.18),rgba(2,6,23,0.1)_42%,rgba(2,6,23,0.72)_100%)]" />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${preset.shellClassName} ${className}`.trim()}
    >
      <div
        className={`pointer-events-none absolute inset-0 ${preset.glowClassName}`}
      />
      <div className="pointer-events-none absolute inset-x-8 bottom-5 h-10 rounded-full bg-black/35 blur-2xl" />
      <div className="absolute inset-[1px] rounded-[calc(2rem-1px)] border border-white/6" />
      <Canvas
        className="h-full w-full"
        shadows="percentage"
        dpr={[1, 1.6]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <Suspense fallback={null}>
          <BrandDogHeroScene preset={preset} anim={anim} />
        </Suspense>
      </Canvas>
    </div>
  );
}

BrandDogHero3D.propTypes = {
  className: PropTypes.string,
  anim: PropTypes.string,
  variant: PropTypes.oneOf(["card", "promo", "landing", "adopt", "showcase"]),
};
