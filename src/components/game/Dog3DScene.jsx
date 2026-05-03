// src/components/game/Dog3DScene.jsx
/* eslint-disable react/no-unknown-property */
import React, { useMemo } from "react";
import { Canvas } from "@react-three/fiber";

import AnimatedDog from "@/features/game/rendering/AnimatedDog.jsx";
import DOG_STAGE_CAMERA, {
  DogCameraRig,
} from "@/features/game/stage3d/DogCamera.jsx";
import DogGroundPlane from "@/features/game/stage3d/DogGround.jsx";
import DogLightRig from "@/features/game/stage3d/DogLightRig.jsx";
import resolveDogStageLighting from "@/features/game/stage3d/DogLights.jsx";
import DogShadowPlane from "@/features/game/stage3d/DogShadowPlane.jsx";
import DogHouse from "@/features/game/stage3d/props/DogHouse.jsx";
import Tree from "@/features/game/stage3d/props/Tree.jsx";

function clamp(value, min, max) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return min;
  return Math.max(min, Math.min(max, numeric));
}

function resolveSceneArt(scene, lighting) {
  const weatherKey = String(scene?.weatherKey || "clear").toLowerCase();
  const moodKey = String(scene?.moodLabel || "content").toLowerCase();
  const careTone = String(scene?.careTone || "steady").toLowerCase();
  const stageKey = String(scene?.stageKey || "PUPPY").toUpperCase();
  const energyPct = clamp(scene?.energyPct, 0, 100);
  const happinessPct = clamp(scene?.happinessPct, 0, 100);
  const cleanlinessPct = clamp(scene?.cleanlinessPct, 0, 100);
  const bondPct = clamp(scene?.bondPct, 0, 100);
  const tired =
    scene?.isSleeping || moodKey.includes("tired") || energyPct < 30;
  const strained =
    careTone === "neglected" ||
    cleanlinessPct <= 25 ||
    moodKey.includes("uneasy");
  const thriving =
    careTone === "secure" || (happinessPct >= 75 && bondPct >= 70);
  const rainy =
    weatherKey.includes("rain") ||
    weatherKey.includes("storm") ||
    weatherKey.includes("drizzle");
  const snowy = weatherKey.includes("snow") || weatherKey.includes("sleet");

  return {
    groundAccentColor: rainy
      ? "#6d816d"
      : snowy
        ? "#97a2a8"
        : lighting.groundColor,
    shadowOpacity: tired ? 0.14 : 0.24,
    treeScale: stageKey === "SENIOR" ? 0.76 : 0.72,
    treeLeafColors: strained
      ? ["#4f664e", "#5b7256", "#465b45"]
      : thriving
        ? ["#5b8755", "#6b955f", "#4f764a"]
        : ["#53754f", "#62825a", "#486847"],
    trunkColor: stageKey === "SENIOR" ? "#6b523d" : "#72553a",
    houseBodyColor: strained ? "#7c5a45" : thriving ? "#906147" : "#855a41",
    houseRoofColor: strained ? "#674433" : "#734d37",
    houseTrimColor: strained ? "#4c3529" : "#52382a",
    houseDoorwayColor: strained ? "#32241b" : "#3c2a1d",
    houseGlow: lighting.isNight && tired ? 0.9 : 0,
    auraColor: thriving ? "#baf6d7" : "#f6ddb5",
    dogFocusGlow: bondPct >= 80 ? 0.22 : 0.12,
  };
}

function DogModelFallback({ art }) {
  return (
    <group>
      <mesh
        position={[DOG_STAGE_CAMERA.dogAnchor[0], -1.54, -0.88]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.28, 0.42, 36]} />
        <meshBasicMaterial
          color={String(art?.auraColor || "#baf6d7")}
          transparent
          opacity={0.26}
        />
      </mesh>
      <DogShadowPlane opacity={0.22} />
    </group>
  );
}

class DogRenderBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("[Doggerz][Dog3D] model render failed", error);
  }

  render() {
    if (this.state.hasError) return this.props.fallback || null;
    return this.props.children;
  }
}

function StageBackdrop({ lighting }) {
  return (
    <>
      <fog
        attach="fog"
        args={[lighting.fogColor, lighting.fogNear, lighting.fogFar]}
      />
      <mesh position={[0, 2.85, -4.55]}>
        <planeGeometry args={[14, 4.8]} />
        <meshBasicMaterial color={lighting.skyGlowColor} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.95, -4.5]}>
        <planeGeometry args={[14, 5.4]} />
        <meshBasicMaterial
          color={lighting.skyColor}
          transparent
          opacity={0.72}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, -1.38, -3.9]}>
        <planeGeometry args={[14, 2.1]} />
        <meshBasicMaterial
          color={lighting.groundColor}
          transparent
          opacity={0.82}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

function DogLayer({ scene, dogView, art }) {
  const ghost = scene?.behavior?.ghost;

  return (
    <DogRenderBoundary fallback={<DogModelFallback art={art} />}>
      <AnimatedDog
        scene={scene}
        position={DOG_STAGE_CAMERA.dogAnchor}
        {...dogView}
      />
      {ghost?.present ? (
        <>
          <AnimatedDog
            scene={scene}
            position={[-1.45, -1, -0.95]}
            ghost
            {...dogView}
          />
          <pointLight
            position={[-1.45, -0.2, -0.9]}
            color="#bedbff"
            intensity={Number(ghost?.glowOpacity || 0)}
            distance={3.4}
          />
        </>
      ) : null}
    </DogRenderBoundary>
  );
}

export function Dog3DScene({ scene = null, dogView = {} }) {
  const lighting = resolveDogStageLighting(scene);
  const art = useMemo(
    () => resolveSceneArt(scene, lighting),
    [scene, lighting]
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: `linear-gradient(180deg, ${lighting.skyGlowColor} 0%, ${lighting.skyColor} 60%, ${lighting.groundColor} 100%)`,
      }}
    >
      <Canvas
        shadows
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        dpr={[1, 1.6]}
      >
        <DogCameraRig />
        <DogLightRig lighting={lighting} />
        <StageBackdrop lighting={lighting} />
        <DogGroundPlane color={art.groundAccentColor} />
        <DogShadowPlane opacity={art.shadowOpacity} />
        <Tree
          scale={art.treeScale}
          trunkColor={art.trunkColor}
          leafColors={art.treeLeafColors}
        />
        <DogHouse
          bodyColor={art.houseBodyColor}
          roofColor={art.houseRoofColor}
          trimColor={art.houseTrimColor}
          doorwayColor={art.houseDoorwayColor}
          windowGlow={art.houseGlow}
        />
        {art.dogFocusGlow > 0 ? (
          <pointLight
            position={[0, -0.15, 1.8]}
            color={art.auraColor}
            intensity={art.dogFocusGlow}
            distance={5.2}
          />
        ) : null}
        <DogLayer scene={scene} dogView={dogView} art={art} />
      </Canvas>
    </div>
  );
}

export default Dog3DScene;
