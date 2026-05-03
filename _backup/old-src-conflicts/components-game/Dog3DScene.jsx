/* eslint-disable react/no-unknown-property */
import * as React from "react";
import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";

import { Dog3D } from "../dog/Dog3D";
import DOG_STAGE_CAMERA, {
  DogCameraRig,
} from "@/features/game/stage3d/DogCamera.jsx";
import { DogGroundPlane } from "@/features/game/stage3d/DogGround.jsx";
import DogLightRig from "@/features/game/stage3d/DogLightRig.jsx";
import resolveDogStageLighting from "@/features/game/stage3d/DogLights.jsx";
import DogShadowPlane from "@/features/game/stage3d/DogShadowPlane.jsx";
import DogHouse from "@/features/game/stage3d/props/DogHouse.jsx";
import Tree from "@/features/game/stage3d/props/Tree.jsx";

class DogModelErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    // Keep the yard rendering even if the GLB fails to load.
    console.error("[Doggerz][Dog3D] model render failed", error);
  }

  render() {
    if (this.state.hasError) return this.props.fallback || null;
    return this.props.children;
  }
}

function clamp(value, min, max) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return min;
  return Math.max(min, Math.min(max, numeric));
}

function getSceneArtDirection(scene, lighting) {
  const weatherKey = String(scene?.weatherKey || "clear").toLowerCase();
  const moodKey = String(scene?.moodLabel || "content").toLowerCase();
  const careTone = String(scene?.careTone || "steady").toLowerCase();
  const stageKey = String(scene?.stageKey || "PUPPY").toUpperCase();
  const energyPct = clamp(scene?.energyPct, 0, 100);
  const happinessPct = clamp(scene?.happinessPct, 0, 100);
  const cleanlinessPct = clamp(scene?.cleanlinessPct, 0, 100);
  const bondPct = clamp(scene?.bondPct, 0, 100);
  const stageProgressPct = clamp(scene?.stageProgressPct, 0, 100);
  const isSleeping = Boolean(scene?.isSleeping);

  const rainy =
    weatherKey.includes("rain") ||
    weatherKey.includes("storm") ||
    weatherKey.includes("drizzle");
  const snowy =
    weatherKey.includes("snow") ||
    weatherKey.includes("sleet") ||
    weatherKey.includes("flurry");
  const misty =
    weatherKey.includes("fog") ||
    weatherKey.includes("mist") ||
    weatherKey.includes("haze");

  const needsHelp =
    careTone === "neglected" ||
    cleanlinessPct <= 25 ||
    moodKey.includes("dirty") ||
    moodKey.includes("uneasy");
  const cozy =
    isSleeping || moodKey.includes("sleepy") || moodKey.includes("tired");
  const thriving =
    careTone === "secure" || (happinessPct >= 75 && bondPct >= 70);

  return {
    skyGradientTop: lighting.isNight
      ? needsHelp
        ? "#0b1730"
        : "#112042"
      : thriving
        ? "#9ac8e8"
        : "#89b0d0",
    skyGradientBottom: lighting.isNight
      ? cozy
        ? "#475d82"
        : "#395474"
      : needsHelp
        ? "#bccdc9"
        : "#d4e8f3",
    horizonBandColor: lighting.isNight
      ? needsHelp
        ? "#324660"
        : "#435d74"
      : thriving
        ? "#b9d3af"
        : "#b7c7ae",
    distantTreeColor: needsHelp ? "#465a4d" : thriving ? "#567852" : "#4d6751",
    distantFenceColor: needsHelp ? "#6f7c67" : "#819171",
    cloudColor: lighting.isNight ? "#7c8dac" : "#f1f5fa",
    cloudOpacity: lighting.isNight ? 0.12 : rainy || misty ? 0.28 : 0.18,
    cloudSpeed: cozy ? 0.55 : rainy ? 1.2 : 1,
    weatherMode: rainy ? "rain" : snowy ? "snow" : misty ? "mist" : "none",
    weatherColor: rainy
      ? "#b8d0ea"
      : snowy
        ? "#ffffff"
        : "rgba(210,226,239,0.4)",
    weatherOpacity: rainy ? 0.46 : snowy ? 0.68 : 0.22,
    weatherSpeed: cozy ? 0.65 : rainy ? 1.2 : snowy ? 0.85 : 1,
    starsOpacity: lighting.isNight ? (cozy ? 0.34 : 0.24) : 0,
    celestialColor: lighting.isNight ? "#dfe8ff" : "#ffe4a8",
    celestialGlow: lighting.isNight ? "#a9bcff" : "#ffd28d",
    houseGlow: lighting.isNight && (cozy || isSleeping) ? 0.9 : 0,
    shadowOpacity: cozy ? 0.14 : 0.24,
    puddleOpacity: rainy ? 0.22 : snowy ? 0.1 : 0,
    mudOpacity: needsHelp && !snowy ? 0.18 : 0.06,
    groundAccentColor: rainy ? "#6d816d" : snowy ? "#97a2a8" : "#788b5d",
    pathOpacity: stageKey === "ADULT" || stageKey === "SENIOR" ? 0.16 : 0.1,
    fireflyCount:
      lighting.isNight && thriving && !rainy && !snowy && !misty ? 12 : 0,
    fireflyColor: "#d8ffc4",
    auraOpacity: thriving ? 0.16 : stageKey === "PUPPY" ? 0.12 : 0.06,
    auraColor: thriving ? "#baf6d7" : "#f6ddb5",
    treeScale:
      stageKey === "SENIOR"
        ? 1.06
        : 0.96 + stageProgressPct / 450 + bondPct / 900,
    treeLeafColors: needsHelp
      ? ["#4f664e", "#5b7256", "#465b45"]
      : thriving
        ? ["#5b8755", "#6b955f", "#4f764a"]
        : ["#53754f", "#62825a", "#486847"],
    trunkColor: stageKey === "SENIOR" ? "#6b523d" : "#72553a",
    houseBodyColor: needsHelp ? "#7c5a45" : thriving ? "#906147" : "#855a41",
    houseRoofColor: needsHelp ? "#674433" : "#734d37",
    houseTrimColor: needsHelp ? "#4c3529" : "#52382a",
    houseDoorwayColor: needsHelp ? "#32241b" : "#3c2a1d",
    foregroundMistOpacity:
      misty || cozy ? (lighting.isNight ? 0.16 : 0.12) : 0.04,
    yardMood: needsHelp
      ? "strained"
      : cozy
        ? "resting"
        : thriving
          ? "thriving"
          : "steady",
    dogFocusGlow: bondPct >= 80 ? 0.22 : 0.12,
    sunHeight: lighting.isNight ? 1.65 : stageKey === "PUPPY" ? 1.8 : 2.05,
    horizonLift: energyPct <= 25 ? -0.06 : 0,
  };
}

function DriftClouds({ art }) {
  const cloudRefs = useRef([]);
  const clouds = useMemo(
    () => [
      { x: -4.3, y: 1.95, z: -3.75, s: [1.9, 0.56, 1], speed: 0.06 },
      { x: -1.2, y: 2.15, z: -3.55, s: [1.45, 0.48, 1], speed: 0.04 },
      { x: 2.4, y: 1.82, z: -3.65, s: [1.75, 0.52, 1], speed: 0.05 },
      { x: 4.5, y: 2.04, z: -3.6, s: [2.1, 0.6, 1], speed: 0.03 },
    ],
    []
  );

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    for (let i = 0; i < cloudRefs.current.length; i += 1) {
      const mesh = cloudRefs.current[i];
      const def = clouds[i];
      if (!mesh || !def) continue;
      const speed = def.speed * art.cloudSpeed;
      mesh.position.x = def.x + Math.sin(t * speed) * 0.35;
      mesh.position.y = def.y + Math.cos(t * speed * 0.8) * 0.04;
    }
  });

  return (
    <group>
      {clouds.map((cloud, index) => (
        <mesh
          key={`cloud-${index}`}
          ref={(node) => {
            cloudRefs.current[index] = node;
          }}
          position={[cloud.x, cloud.y, cloud.z]}
          scale={cloud.s}
        >
          <sphereGeometry args={[0.56, 18, 14]} />
          <meshBasicMaterial
            color={art.cloudColor}
            transparent
            opacity={art.cloudOpacity}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function WeatherLayer({ art }) {
  const particleRefs = useRef([]);
  const particles = useMemo(() => {
    if (art.weatherMode === "none") return [];

    const count =
      art.weatherMode === "mist" ? 12 : art.weatherMode === "snow" ? 34 : 42;
    return Array.from({ length: count }, (_, index) => {
      const rng = (Math.sin(index * 14.97) + 1) * 0.5;
      const x = -3.8 + ((index * 0.47) % 7.6);
      const y =
        art.weatherMode === "mist" ? -0.2 + rng * 1.6 : -0.1 + rng * 3.3;
      const z = -2.8 + ((index * 0.29) % 3.2);
      return {
        x,
        y,
        z,
        speed: 0.24 + rng * 0.42,
        drift: -0.09 + rng * 0.18,
        size:
          art.weatherMode === "snow"
            ? [0.045, 0.045]
            : art.weatherMode === "mist"
              ? [0.42, 0.18]
              : [0.012, 0.22],
      };
    });
  }, [art.weatherMode]);

  useFrame((state, delta) => {
    if (art.weatherMode === "none") return;
    const t = state.clock.getElapsedTime();

    for (let i = 0; i < particleRefs.current.length; i += 1) {
      const mesh = particleRefs.current[i];
      const def = particles[i];
      if (!mesh || !def) continue;

      if (art.weatherMode === "mist") {
        mesh.position.x = def.x + Math.sin(t * 0.12 + i) * 0.22;
        mesh.position.z = def.z + Math.cos(t * 0.09 + i) * 0.18;
        continue;
      }

      const speedMultiplier =
        art.weatherMode === "snow" ? 0.55 : 1.3 * art.weatherSpeed;
      mesh.position.y -= def.speed * delta * speedMultiplier;
      mesh.position.x += def.drift * delta * art.weatherSpeed;
      if (mesh.position.y < -1.7) {
        mesh.position.y = 2.9;
      }
      if (mesh.position.x < -4.2) mesh.position.x = 4.2;
      if (mesh.position.x > 4.2) mesh.position.x = -4.2;
    }
  });

  if (!particles.length) return null;

  return (
    <group>
      {particles.map((particle, index) => (
        <mesh
          key={`weather-${index}`}
          ref={(node) => {
            particleRefs.current[index] = node;
          }}
          position={[particle.x, particle.y, particle.z]}
          rotation={art.weatherMode === "rain" ? [0.26, 0, 0.06] : [0, 0, 0]}
        >
          <planeGeometry args={particle.size} />
          <meshBasicMaterial
            color={art.weatherColor}
            transparent
            opacity={
              art.weatherMode === "mist"
                ? art.weatherOpacity
                : art.weatherMode === "snow"
                  ? art.weatherOpacity
                  : art.weatherOpacity
            }
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function CelestialLayer({ art, lighting }) {
  if (!lighting.isNight && art.weatherMode === "mist") return null;

  return (
    <>
      <mesh position={[2.95, art.sunHeight + art.horizonLift, -4.35]}>
        <circleGeometry args={[lighting.isNight ? 0.28 : 0.38, 24]} />
        <meshBasicMaterial color={art.celestialColor} depthWrite={false} />
      </mesh>
      <mesh position={[2.95, art.sunHeight + art.horizonLift, -4.38]}>
        <circleGeometry args={[lighting.isNight ? 0.55 : 0.7, 24]} />
        <meshBasicMaterial
          color={art.celestialGlow}
          transparent
          opacity={lighting.isNight ? 0.14 : 0.18}
          depthWrite={false}
        />
      </mesh>

      {lighting.isNight && art.starsOpacity > 0 ? (
        <group>
          {[
            [-3.2, 2.3, -4.28],
            [-1.7, 2.8, -4.18],
            [0.2, 2.42, -4.32],
            [1.3, 2.74, -4.27],
            [3.6, 2.24, -4.24],
          ].map((position, index) => (
            <mesh key={`star-${index}`} position={position}>
              <sphereGeometry args={[0.028, 10, 10]} />
              <meshBasicMaterial
                color="#f8fbff"
                transparent
                opacity={art.starsOpacity}
                depthWrite={false}
              />
            </mesh>
          ))}
        </group>
      ) : null}
    </>
  );
}

function FireflyField({ art }) {
  const refs = useRef([]);
  const particles = useMemo(
    () =>
      Array.from({ length: art.fireflyCount }, (_, index) => ({
        base: [
          -2.1 + (index % 6) * 0.78,
          -0.34 + (index % 3) * 0.22,
          -1.8 - (index % 4) * 0.25,
        ],
        phase: index * 0.8,
      })),
    [art.fireflyCount]
  );

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    for (let i = 0; i < refs.current.length; i += 1) {
      const mesh = refs.current[i];
      const def = particles[i];
      if (!mesh || !def) continue;
      mesh.position.x = def.base[0] + Math.sin(t * 0.6 + def.phase) * 0.18;
      mesh.position.y = def.base[1] + Math.cos(t * 1.2 + def.phase) * 0.12;
      mesh.position.z = def.base[2] + Math.sin(t * 0.45 + def.phase) * 0.08;
      mesh.material.opacity = 0.2 + (Math.sin(t * 2.1 + def.phase) + 1) * 0.18;
    }
  });

  if (!art.fireflyCount) return null;

  return (
    <group>
      {particles.map((particle, index) => (
        <mesh
          key={`firefly-${index}`}
          ref={(node) => {
            refs.current[index] = node;
          }}
          position={particle.base}
        >
          <sphereGeometry args={[0.03, 10, 10]} />
          <meshBasicMaterial
            color={art.fireflyColor}
            transparent
            opacity={0.28}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function GroundAccents({ art }) {
  return (
    <>
      <mesh position={[-0.6, -1.565, -0.7]} rotation={[-Math.PI / 2, 0.06, 0]}>
        <planeGeometry args={[4.6, 1.35]} />
        <meshStandardMaterial
          color={art.groundAccentColor}
          transparent
          opacity={Math.min(0.1, art.pathOpacity)}
          roughness={1}
        />
      </mesh>

      {art.puddleOpacity > 0 ? (
        <mesh position={[1.2, -1.56, -0.95]} rotation={[-Math.PI / 2, 0.26, 0]}>
          <planeGeometry args={[1.35, 0.7]} />
          <meshStandardMaterial
            color="#b6cbe0"
            transparent
            opacity={art.puddleOpacity}
            roughness={0.28}
            metalness={0.1}
          />
        </mesh>
      ) : null}

      {art.mudOpacity > 0 ? (
        <mesh
          position={[-1.15, -1.557, -0.92]}
          rotation={[-Math.PI / 2, -0.18, 0]}
        >
          <planeGeometry args={[1.25, 0.82]} />
          <meshStandardMaterial
            color="#5f4d3d"
            transparent
            opacity={art.mudOpacity}
            roughness={1}
          />
        </mesh>
      ) : null}

      <mesh position={[0, -1.52, -0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.9, 1.65]} />
        <meshBasicMaterial
          color={art.auraColor}
          transparent
          opacity={art.auraOpacity}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

function PremiumBackdrop({ art, lighting }) {
  return (
    <>
      <mesh position={[0, 2.85, -4.55]}>
        <planeGeometry args={[14, 4.8]} />
        <meshBasicMaterial color={art.skyGradientTop} depthWrite={false} />
      </mesh>

      <mesh position={[0, 0.95, -4.5]}>
        <planeGeometry args={[14, 5.4]} />
        <meshBasicMaterial
          color={art.skyGradientBottom}
          transparent
          opacity={0.72}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, -0.5 + art.horizonLift, -4.05]}>
        <planeGeometry args={[14, 1.2]} />
        <meshBasicMaterial
          color={art.horizonBandColor}
          transparent
          opacity={0.62}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, -1.38, -3.9]}>
        <planeGeometry args={[14, 2.1]} />
        <meshBasicMaterial
          color={art.groundAccentColor}
          transparent
          opacity={0.82}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[-3.15, -0.28, -3.55]}>
        <coneGeometry args={[0.48, 1.05, 7]} />
        <meshStandardMaterial color={art.distantTreeColor} roughness={1} />
      </mesh>
      <mesh position={[3.25, -0.32, -3.6]}>
        <coneGeometry args={[0.56, 1.16, 7]} />
        <meshStandardMaterial color={art.distantTreeColor} roughness={1} />
      </mesh>

      <mesh position={[0, -1.12, -3.45]}>
        <boxGeometry args={[7.8, 0.07, 0.08]} />
        <meshStandardMaterial color={art.distantFenceColor} roughness={0.94} />
      </mesh>
      <mesh position={[0, -0.82, -3.5]}>
        <boxGeometry args={[7.8, 0.055, 0.07]} />
        <meshStandardMaterial color={art.distantFenceColor} roughness={0.92} />
      </mesh>

      <CelestialLayer art={art} lighting={lighting} />
      <DriftClouds art={art} />
      <WeatherLayer art={art} />
    </>
  );
}

function EnvironmentSet({ scene, lighting }) {
  const art = useMemo(
    () => getSceneArtDirection(scene, lighting),
    [scene, lighting]
  );

  return (
    <>
      <fog
        attach="fog"
        args={[lighting.fogColor, lighting.fogNear, lighting.fogFar]}
      />
      <PremiumBackdrop art={art} lighting={lighting} />
      <DogGroundPlane color={art.groundAccentColor || lighting.groundColor} />
      <GroundAccents art={art} />
      <DogShadowPlane opacity={art.shadowOpacity} />
      <Tree
        scale={Math.min(0.76, art.treeScale * 0.72)}
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
      <FireflyField art={art} />
      {art.foregroundMistOpacity > 0 ? (
        <mesh position={[0, -0.86, -1.45]}>
          <planeGeometry args={[7.8, 1.55]} />
          <meshBasicMaterial
            color={lighting.isNight ? "#dce8ff" : "#eff6f9"}
            transparent
            opacity={art.foregroundMistOpacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}
    </>
  );
}

function DogModelFallback({ art }) {
  const auraColor = String(art?.auraColor || "#baf6d7");
  const opacity = 0.26;

  return (
    <group>
      <mesh
        position={[
          DOG_STAGE_CAMERA.dogAnchor[0],
          -1.54,
          DOG_STAGE_CAMERA.dogAnchor[2] + 0.12,
        ]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.28, 0.42, 36]} />
        <meshBasicMaterial
          color={auraColor}
          transparent
          opacity={opacity}
          depthWrite={false}
        />
      </mesh>
      <mesh
        position={[
          DOG_STAGE_CAMERA.dogAnchor[0],
          -1.56,
          DOG_STAGE_CAMERA.dogAnchor[2] + 0.12,
        ]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[1.7, 1.05]} />
        <shadowMaterial transparent opacity={0.22} />
      </mesh>
    </group>
  );
}

function DogModelLayer({ scene, art }) {
  return (
    <DogModelErrorBoundary fallback={<DogModelFallback art={art} />}>
      <Suspense fallback={<DogModelFallback art={art} />}>
        <Dog3D position={DOG_STAGE_CAMERA.dogAnchor} scene={scene} />
        {scene?.behavior?.ghost?.present ? (
          <>
            <Dog3D
              position={[-1.45, -1, -0.95]}
              rotation={[0, Math.PI * -0.08, 0]}
              scene={scene}
              ghost
            />
            <pointLight
              position={[-1.45, -0.2, -0.9]}
              color="#bedbff"
              intensity={Number(scene?.behavior?.ghost?.glowOpacity || 0)}
              distance={3.4}
            />
          </>
        ) : null}
      </Suspense>
    </DogModelErrorBoundary>
  );
}

export function Dog3DScene({ scene = null }) {
  const lighting = resolveDogStageLighting(scene);
  const art = useMemo(
    () => getSceneArtDirection(scene, lighting),
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
        camera={undefined}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        dpr={[1, 1.6]}
      >
        <DogCameraRig />
        <DogLightRig lighting={lighting} />
        <EnvironmentSet scene={scene} lighting={lighting} />
        {art.dogFocusGlow > 0 ? (
          <pointLight
            position={[0, -0.15, 1.8]}
            color={art.auraColor}
            intensity={art.dogFocusGlow}
            distance={5.2}
          />
        ) : null}
        <DogModelLayer scene={scene} art={art} />
      </Canvas>
    </div>
  );
}
