// src/components/game/Dog3DScene.jsx
/* eslint-disable react/no-unknown-property */
import React, { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import Dog3D from "@/components/dog/Dog3D.jsx";
import DOG_STAGE_CAMERA, {
  DogCameraRig,
} from "@/features/game/stage3d/DogCamera.jsx";
import DogShadowPlane from "@/features/game/stage3d/DogShadowPlane.jsx";
import DogAnimationDebugPanel from "@/features/game/stage3d/dog/DogAnimationDebugPanel.jsx";
import { resolveDogStageBehavior } from "@/features/game/stage3d/dog/resolveDogStageBehavior.js";

const NORMAL_YARD_DOG_SCALE = 0.52;

const NORMAL_YARD_POSITION = [0, -1.0, -0.08];
const YARD_WANDER_RADIUS = Object.freeze({ x: 0.82, z: 0.34 });

function resolveFacingRotation(facing = "") {
  const key = String(facing || "")
    .trim()
    .toLowerCase();

  if (key === "left") return [0, Math.PI * -0.18, 0];
  if (key === "front") return [0, 0, 0];
  if (key === "back") return [0, Math.PI, 0];

  return [0, Math.PI * 0.18, 0];
}

function StageSkyGradient() {
  return (
    <group>
      <mesh position={[0, 2.92, -4.9]}>
        <planeGeometry args={[18, 2.2]} />
        <meshBasicMaterial color="#78bde0" depthWrite={false} />
      </mesh>
      <mesh position={[0, 1.55, -4.91]}>
        <planeGeometry args={[18, 2.1]} />
        <meshBasicMaterial color="#a7d8e8" depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.42, -4.92]}>
        <planeGeometry args={[18, 1.45]} />
        <meshBasicMaterial color="#d9efdf" depthWrite={false} />
      </mesh>
    </group>
  );
}

function SunMoonGlow() {
  return (
    <group>
      <mesh position={[-3.75, 2.55, -4.55]}>
        <circleGeometry args={[0.88, 48]} />
        <meshBasicMaterial
          color="#fff1ad"
          transparent
          opacity={0.26}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[-3.75, 2.55, -4.5]}>
        <circleGeometry args={[0.35, 32]} />
        <meshBasicMaterial color="#ffe38c" depthWrite={false} />
      </mesh>
      <mesh position={[3.42, 2.38, -4.55]}>
        <circleGeometry args={[0.62, 40]} />
        <meshBasicMaterial
          color="#dcefff"
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[3.42, 2.38, -4.5]}>
        <circleGeometry args={[0.24, 32]} />
        <meshBasicMaterial
          color="#eef8ff"
          transparent
          opacity={0.68}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function ParallaxStageBackground() {
  const farLayerRef = useRef(null);
  const nearLayerRef = useRef(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (farLayerRef.current) {
      farLayerRef.current.position.x = Math.sin(t * 0.11) * 0.08;
    }

    if (nearLayerRef.current) {
      nearLayerRef.current.position.x = Math.sin(t * 0.16 + 1.8) * 0.14;
    }
  });

  return (
    <group>
      <group ref={farLayerRef}>
        <DistantTreeLine />
      </group>
      <group ref={nearLayerRef}>
        <FarBackPropSilhouettes />
      </group>
    </group>
  );
}

function DistantTreeLine() {
  const trees = useMemo(
    () => [
      [-5.4, 0.12, 0.72],
      [-4.75, 0.2, 0.94],
      [-4.0, 0.08, 0.78],
      [-3.25, 0.18, 0.92],
      [-2.45, 0.06, 0.72],
      [-1.72, 0.15, 0.86],
      [-0.98, 0.1, 0.78],
      [-0.2, 0.2, 0.98],
      [0.58, 0.06, 0.75],
      [1.35, 0.16, 0.9],
      [2.12, 0.08, 0.76],
      [2.88, 0.2, 0.94],
      [3.66, 0.1, 0.8],
      [4.38, 0.18, 0.88],
      [5.08, 0.06, 0.72],
    ],
    []
  );

  return (
    <group position={[0, -0.05, -4.42]}>
      <mesh position={[0, -0.44, 0]}>
        <planeGeometry args={[14, 0.85]} />
        <meshBasicMaterial color="#477d4f" depthWrite={false} />
      </mesh>
      {trees.map(([x, y, radius]) => (
        <mesh key={`${x}-${radius}`} position={[x, y, 0]}>
          <sphereGeometry args={[radius, 16, 12]} />
          <meshBasicMaterial color="#376f43" depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function FenceLine() {
  const boards = useMemo(() => {
    return Array.from({ length: 19 }, (_, index) => index - 9);
  }, []);

  return (
    <group position={[0, -0.48, -3.32]}>
      <mesh position={[0, -0.48, -0.05]}>
        <boxGeometry args={[12.8, 0.18, 0.12]} />
        <meshStandardMaterial color="#7b573b" roughness={0.9} />
      </mesh>

      <mesh position={[0, 0.18, -0.05]}>
        <boxGeometry args={[12.8, 0.18, 0.12]} />
        <meshStandardMaterial color="#8b6341" roughness={0.88} />
      </mesh>

      {boards.map((x) => {
        const isEven = Math.abs(x) % 2 === 0;

        return (
          <mesh key={x} position={[x * 0.67, -0.08, 0]}>
            <boxGeometry args={[0.36, 1.72, 0.12]} />
            <meshStandardMaterial
              color={isEven ? "#946b47" : "#805b3d"}
              roughness={0.92}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function FenceInteractionCues() {
  const cueRef = useRef(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (cueRef.current) {
      cueRef.current.children.forEach((child, index) => {
        child.material.opacity = 0.18 + Math.sin(t * 2.2 + index) * 0.06;
        child.scale.setScalar(1 + Math.sin(t * 1.7 + index) * 0.05);
      });
    }
  });

  return (
    <group ref={cueRef}>
      {[-4.05, -1.35, 1.35, 4.05].map((x) => (
        <mesh key={x} position={[x, -0.48, -3.14]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.14, 0.2, 24]} />
          <meshBasicMaterial color="#fff3a7" transparent opacity={0.2} />
        </mesh>
      ))}
    </group>
  );
}

function YardGround() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.095, -2.35]}>
        <planeGeometry args={[14, 2.7]} />
        <meshStandardMaterial color="#5f9852" roughness={0.98} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.08, 0]}>
        <planeGeometry args={[16, 12, 1, 1]} />
        <meshStandardMaterial color="#4c8b42" roughness={0.96} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.072, 1.15]}>
        <circleGeometry args={[4.25, 56]} />
        <meshStandardMaterial color="#69a75a" roughness={0.98} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.068, -0.28]}>
        <circleGeometry args={[1.35, 40]} />
        <meshStandardMaterial
          color="#2c4b31"
          transparent
          opacity={0.18}
          roughness={1}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.064, 2.72]}>
        <planeGeometry args={[16, 1.2]} />
        <meshStandardMaterial color="#3c793c" roughness={1} />
      </mesh>
    </group>
  );
}

function DiggingHoles() {
  return (
    <group>
      {[
        [-1.95, -0.58, 0.34, 0.16],
        [2.04, 0.42, 0.42, -0.1],
        [0.92, -1.28, 0.28, 0.2],
      ].map(([x, z, radius, rotation]) => (
        <group key={`${x}-${z}`} position={[x, -1.052, z]}>
          <mesh rotation={[-Math.PI / 2, 0, rotation]}>
            <circleGeometry args={[radius, 34]} />
            <meshStandardMaterial color="#3b3225" roughness={1} />
          </mesh>
          <mesh
            rotation={[-Math.PI / 2, 0, rotation]}
            position={[radius * 0.42, 0.004, 0]}
          >
            <circleGeometry args={[radius * 0.44, 22]} />
            <meshStandardMaterial color="#78623f" roughness={1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function LawnToysAndBowls() {
  return (
    <group>
      <mesh position={[-1.48, -0.83, 0.95]} rotation={[0.15, 0, -0.3]}>
        <sphereGeometry args={[0.18, 20, 16]} />
        <meshStandardMaterial color="#d8433e" roughness={0.58} />
      </mesh>
      <mesh position={[-1.39, -0.83, 0.95]} rotation={[0.15, 0.1, -0.3]}>
        <torusGeometry args={[0.18, 0.035, 10, 24]} />
        <meshStandardMaterial color="#f2f4f0" roughness={0.62} />
      </mesh>

      <mesh position={[1.52, -0.9, 1.18]} rotation={[0.12, 0.28, 0]}>
        <boxGeometry args={[0.58, 0.16, 0.18]} />
        <meshStandardMaterial color="#f0c449" roughness={0.72} />
      </mesh>
      <mesh position={[1.52, -0.78, 1.18]} rotation={[0.12, 0.28, 0]}>
        <boxGeometry args={[0.18, 0.16, 0.58]} />
        <meshStandardMaterial color="#3d80b9" roughness={0.68} />
      </mesh>

      <mesh position={[2.35, -0.96, 0.35]}>
        <cylinderGeometry args={[0.34, 0.42, 0.16, 32]} />
        <meshStandardMaterial color="#4974b7" roughness={0.64} />
      </mesh>
      <mesh position={[2.35, -0.86, 0.35]}>
        <cylinderGeometry args={[0.28, 0.3, 0.06, 32]} />
        <meshStandardMaterial color="#d9ecf7" roughness={0.5} />
      </mesh>
      <mesh position={[2.82, -0.96, 0.68]}>
        <cylinderGeometry args={[0.26, 0.34, 0.13, 28]} />
        <meshStandardMaterial color="#cf5d45" roughness={0.66} />
      </mesh>
    </group>
  );
}

function TrainingProps() {
  return (
    <group>
      <group position={[-2.85, -0.86, 0.38]} rotation={[0, 0.16, 0]}>
        <mesh position={[-0.34, 0.38, 0]}>
          <cylinderGeometry args={[0.035, 0.045, 0.74, 12]} />
          <meshStandardMaterial color="#f4f4ec" roughness={0.72} />
        </mesh>
        <mesh position={[0.34, 0.38, 0]}>
          <cylinderGeometry args={[0.035, 0.045, 0.74, 12]} />
          <meshStandardMaterial color="#f4f4ec" roughness={0.72} />
        </mesh>
        <mesh position={[0, 0.7, 0]}>
          <boxGeometry args={[0.8, 0.08, 0.08]} />
          <meshStandardMaterial color="#4d95ce" roughness={0.7} />
        </mesh>
      </group>

      <group position={[0.02, -0.95, 1.64]}>
        {[-0.46, -0.16, 0.14, 0.44].map((x, index) => (
          <mesh key={x} position={[x, 0.08, 0]} rotation={[0, 0, index * 0.2]}>
            <cylinderGeometry args={[0.08, 0.12, 0.18, 16]} />
            <meshStandardMaterial
              color={index % 2 === 0 ? "#ffdd56" : "#ee7d4b"}
              roughness={0.74}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function PottyMarkers() {
  return (
    <group>
      <mesh position={[-2.76, -0.62, -1.18]}>
        <cylinderGeometry args={[0.035, 0.045, 0.72, 12]} />
        <meshStandardMaterial color="#dce8df" roughness={0.78} />
      </mesh>
      <mesh position={[-2.58, -0.31, -1.18]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[0.38, 0.18, 0.045]} />
        <meshStandardMaterial color="#67a567" roughness={0.74} />
      </mesh>
      <mesh position={[-2.45, -0.97, -0.94]} rotation={[-Math.PI / 2, 0, 0.1]}>
        <ringGeometry args={[0.18, 0.23, 24]} />
        <meshBasicMaterial color="#cfe7a1" transparent opacity={0.48} />
      </mesh>
    </group>
  );
}

function RearGroundAccents() {
  const tufts = useMemo(
    () => [
      [-4.6, -2.45, 0.34],
      [-3.86, -2.34, 0.26],
      [-2.85, -2.52, 0.3],
      [2.75, -2.48, 0.3],
      [3.78, -2.32, 0.28],
      [4.52, -2.5, 0.34],
    ],
    []
  );

  return (
    <group>
      {tufts.map(([x, z, radius]) => (
        <mesh
          key={`${x}-${z}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[x, -1.055, z]}
        >
          <circleGeometry args={[radius, 22]} />
          <meshStandardMaterial color="#39783b" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function FarBackPropSilhouettes() {
  return (
    <group>
      <mesh position={[-4.72, -0.2, -3.78]}>
        <boxGeometry args={[0.22, 1.2, 0.08]} />
        <meshBasicMaterial color="#33643a" depthWrite={false} />
      </mesh>
      <mesh position={[-4.72, 0.56, -3.78]}>
        <sphereGeometry args={[0.62, 16, 14]} />
        <meshBasicMaterial color="#2f693b" depthWrite={false} />
      </mesh>
      <mesh position={[4.62, 0.12, -3.82]}>
        <boxGeometry args={[0.96, 0.72, 0.08]} />
        <meshBasicMaterial color="#6f533b" depthWrite={false} />
      </mesh>
      <mesh position={[4.62, 0.56, -3.82]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.72, 0.72, 0.08]} />
        <meshBasicMaterial color="#58402f" depthWrite={false} />
      </mesh>
    </group>
  );
}

function DogHouseRight() {
  return (
    <group position={[3.35, -0.72, -1.98]} rotation={[0, -0.08, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, -0.08]} position={[0.06, -0.32, 0.1]}>
        <circleGeometry args={[0.96, 32]} />
        <meshBasicMaterial color="#253321" transparent opacity={0.22} />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <boxGeometry args={[1.25, 0.9, 0.95]} />
        <meshStandardMaterial color="#9b5237" roughness={0.85} />
      </mesh>

      <mesh position={[0, 0.72, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.95, 0.95, 1.05]} />
        <meshStandardMaterial color="#653322" roughness={0.88} />
      </mesh>

      <mesh position={[0, -0.1, 0.49]}>
        <boxGeometry args={[0.42, 0.58, 0.08]} />
        <meshStandardMaterial color="#20130f" roughness={0.9} />
      </mesh>
    </group>
  );
}

function LeftTree() {
  return (
    <group position={[-3.68, -0.74, -2.12]}>
      <mesh rotation={[-Math.PI / 2, 0, 0.22]} position={[0.08, -0.28, 0.08]}>
        <circleGeometry args={[1.05, 36]} />
        <meshBasicMaterial color="#23331e" transparent opacity={0.25} />
      </mesh>
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.16, 0.24, 1.25, 14]} />
        <meshStandardMaterial color="#6b432b" roughness={0.92} />
      </mesh>

      <mesh position={[0, 1.25, 0]}>
        <sphereGeometry args={[0.82, 22, 22]} />
        <meshStandardMaterial color="#2f7a3c" roughness={0.96} />
      </mesh>

      <mesh position={[-0.42, 1.05, 0.05]}>
        <sphereGeometry args={[0.55, 18, 18]} />
        <meshStandardMaterial color="#3b8a45" roughness={0.96} />
      </mesh>

      <mesh position={[0.48, 1.02, -0.03]}>
        <sphereGeometry args={[0.58, 18, 18]} />
        <meshStandardMaterial color="#327e3d" roughness={0.96} />
      </mesh>
    </group>
  );
}

function ForegroundGrassStrip() {
  const blades = useMemo(
    () => Array.from({ length: 34 }, (_, index) => index - 16.5),
    []
  );

  return (
    <group position={[0, -0.9, 2.78]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.16, 0.1]}>
        <planeGeometry args={[16, 0.54]} />
        <meshStandardMaterial color="#356f37" roughness={1} />
      </mesh>
      {blades.map((x, index) => (
        <mesh
          key={`${x}-${index}`}
          position={[x * 0.44, 0.03 + (index % 3) * 0.015, 0]}
          rotation={[0, 0, (index % 2 === 0 ? -1 : 1) * 0.08]}
        >
          <coneGeometry args={[0.045, 0.42 + (index % 4) * 0.04, 6]} />
          <meshStandardMaterial
            color={index % 2 === 0 ? "#4e923f" : "#2f7337"}
            roughness={1}
          />
        </mesh>
      ))}
    </group>
  );
}

function TapTargetCue({ position, color = "#fff3a7", radius = 0.36, phase = 0 }) {
  const ringRef = useRef(null);
  const pulseRef = useRef(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + phase;
    const pulse = 1 + Math.sin(t * 2.1) * 0.08;

    if (ringRef.current) {
      ringRef.current.scale.setScalar(pulse);
      ringRef.current.material.opacity = 0.34 + Math.sin(t * 2.1) * 0.08;
    }

    if (pulseRef.current) {
      pulseRef.current.scale.setScalar(1.18 + Math.sin(t * 1.4) * 0.12);
      pulseRef.current.material.opacity = 0.12 + Math.sin(t * 1.4) * 0.04;
    }
  });

  return (
    <group position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh ref={pulseRef}>
        <ringGeometry args={[radius * 0.98, radius * 1.08, 36]} />
        <meshBasicMaterial color={color} transparent opacity={0.12} />
      </mesh>
      <mesh ref={ringRef} position={[0, 0, 0.006]}>
        <ringGeometry args={[radius * 0.74, radius, 36]} />
        <meshBasicMaterial color={color} transparent opacity={0.34} />
      </mesh>
    </group>
  );
}

function InteractionCues() {
  return (
    <group>
      <TapTargetCue position={[0, -1.038, -0.04]} color="#f9f0a8" radius={0.48} />
      <TapTargetCue
        position={[-1.48, -1.032, 0.95]}
        color="#f5b0a4"
        radius={0.3}
        phase={0.9}
      />
      <TapTargetCue
        position={[1.52, -1.032, 1.18]}
        color="#9fd5ff"
        radius={0.32}
        phase={1.4}
      />
      <TapTargetCue
        position={[-2.85, -1.032, 0.38]}
        color="#fff3a7"
        radius={0.38}
        phase={2.1}
      />
      <TapTargetCue
        position={[-2.54, -1.032, -1.02]}
        color="#cfe7a1"
        radius={0.28}
        phase={2.7}
      />
    </group>
  );
}

function ActionIndicators() {
  const indicatorRef = useRef(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (indicatorRef.current) {
      indicatorRef.current.children.forEach((child, index) => {
        child.position.y = Math.sin(t * 1.8 + index) * 0.04;
      });
    }
  });

  return (
    <group ref={indicatorRef}>
      <group position={[-1.48, -0.42, 0.95]}>
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.08, 16, 12]} />
          <meshBasicMaterial color="#fffdf0" transparent opacity={0.9} />
        </mesh>
        <mesh position={[0, -0.08, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.16, 0.16, 0.04]} />
          <meshBasicMaterial color="#f07f72" transparent opacity={0.9} />
        </mesh>
      </group>

      <group position={[-2.85, -0.32, 0.38]}>
        <mesh>
          <coneGeometry args={[0.12, 0.18, 3]} />
          <meshBasicMaterial color="#ffe66d" transparent opacity={0.92} />
        </mesh>
        <mesh position={[0, -0.18, 0]}>
          <boxGeometry args={[0.07, 0.22, 0.04]} />
          <meshBasicMaterial color="#ffe66d" transparent opacity={0.92} />
        </mesh>
      </group>

      <group position={[0.56, -0.42, -0.05]}>
        <mesh>
          <sphereGeometry args={[0.09, 16, 12]} />
          <meshBasicMaterial color="#bbf7d0" transparent opacity={0.88} />
        </mesh>
        <mesh position={[0.13, 0.02, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.11, 0.11, 0.04]} />
          <meshBasicMaterial color="#bbf7d0" transparent opacity={0.88} />
        </mesh>
      </group>
    </group>
  );
}

function AmbientMotion() {
  const leavesRef = useRef([]);
  const butterfliesRef = useRef([]);
  const crittersRef = useRef([]);

  const leaves = useMemo(
    () => [
      [-3.2, 1.78, -2.05, 0.2],
      [-2.58, 1.38, -1.62, 1.7],
      [-3.78, 1.08, -1.12, 3.1],
      [-2.1, 0.74, -0.82, 4.4],
      [3.1, 1.42, -2.38, 2.3],
      [2.64, 0.9, -1.48, 5.2],
    ],
    []
  );
  const butterflies = useMemo(
    () => [
      [-0.96, 0.22, -1.38, 0.1],
      [1.18, 0.34, -1.22, 1.9],
      [2.24, 0.62, -2.02, 3.2],
    ],
    []
  );
  const critters = useMemo(
    () => [
      [-4.18, -0.9, -2.68, 0.3],
      [3.86, -0.9, -2.86, 2.4],
      [0.28, -0.94, 2.18, 4.1],
    ],
    []
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    leavesRef.current.forEach((leaf, index) => {
      if (!leaf) return;
      const [x, y, z, phase] = leaves[index];
      leaf.position.set(
        x + Math.sin(t * 0.65 + phase) * 0.22,
        y - ((t * 0.1 + phase * 0.07) % 0.7),
        z + Math.cos(t * 0.48 + phase) * 0.08
      );
      leaf.rotation.set(t * 0.6 + phase, t * 0.35 + phase, t * 0.85);
    });

    butterfliesRef.current.forEach((butterfly, index) => {
      if (!butterfly) return;
      const [x, y, z, phase] = butterflies[index];
      butterfly.position.set(
        x + Math.sin(t * 0.7 + phase) * 0.36,
        y + Math.sin(t * 1.8 + phase) * 0.08,
        z + Math.cos(t * 0.52 + phase) * 0.12
      );
      butterfly.rotation.y = Math.sin(t * 1.5 + phase) * 0.55;
    });

    crittersRef.current.forEach((critter, index) => {
      if (!critter) return;
      const [x, y, z, phase] = critters[index];
      critter.position.set(x + Math.sin(t * 0.42 + phase) * 0.16, y, z);
      critter.scale.setScalar(1 + Math.sin(t * 2.6 + phase) * 0.07);
    });
  });

  return (
    <group>
      {leaves.map(([x, y, z, phase], index) => (
        <mesh
          key={`leaf-${phase}`}
          ref={(node) => {
            leavesRef.current[index] = node;
          }}
          position={[x, y, z]}
          rotation={[0, 0, phase]}
        >
          <planeGeometry args={[0.16, 0.08]} />
          <meshBasicMaterial color={index % 2 === 0 ? "#c88f3f" : "#d4aa4c"} />
        </mesh>
      ))}

      {butterflies.map(([x, y, z, phase], index) => (
        <group
          key={`butterfly-${phase}`}
          ref={(node) => {
            butterfliesRef.current[index] = node;
          }}
          position={[x, y, z]}
        >
          <mesh position={[-0.045, 0, 0]} rotation={[0, 0, 0.55]}>
            <circleGeometry args={[0.075, 14]} />
            <meshBasicMaterial
              color={index % 2 === 0 ? "#f4d35e" : "#f6a6c9"}
              transparent
              opacity={0.88}
            />
          </mesh>
          <mesh position={[0.045, 0, 0]} rotation={[0, 0, -0.55]}>
            <circleGeometry args={[0.075, 14]} />
            <meshBasicMaterial
              color={index % 2 === 0 ? "#f4d35e" : "#f6a6c9"}
              transparent
              opacity={0.88}
            />
          </mesh>
          <mesh>
            <boxGeometry args={[0.025, 0.13, 0.025]} />
            <meshBasicMaterial color="#42352e" />
          </mesh>
        </group>
      ))}

      {critters.map(([x, y, z, phase], index) => (
        <group
          key={`critter-${phase}`}
          ref={(node) => {
            crittersRef.current[index] = node;
          }}
          position={[x, y, z]}
        >
          <mesh>
            <sphereGeometry args={[0.08, 12, 10]} />
            <meshStandardMaterial
              color={index === 2 ? "#5c6f44" : "#5d4a3a"}
              roughness={0.92}
            />
          </mesh>
          <mesh position={[0.08, 0.03, 0]}>
            <sphereGeometry args={[0.045, 10, 8]} />
            <meshStandardMaterial
              color={index === 2 ? "#5c6f44" : "#5d4a3a"}
              roughness={0.92}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function BackyardScene() {
  return (
    <group>
      <StageSkyGradient />
      <SunMoonGlow />
      <ParallaxStageBackground />
      <FenceLine />
      <FenceInteractionCues />
      <YardGround />
      <DiggingHoles />
      <RearGroundAccents />
      <LeftTree />
      <DogHouseRight />
      <LawnToysAndBowls />
      <TrainingProps />
      <PottyMarkers />
      <InteractionCues />
      <ActionIndicators />
      <AmbientMotion />
      <ForegroundGrassStrip />
    </group>
  );
}

function YardDogWander({ active = false, paused = false, children }) {
  const groupRef = useRef(null);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;

    if (paused || !active) {
      group.position.set(0, 0, 0);
      group.rotation.set(0, 0, 0);
      return;
    }

    const t = clock.getElapsedTime();
    const x = Math.sin(t * 0.18) * YARD_WANDER_RADIUS.x;
    const z = Math.sin(t * 0.13 + 1.1) * YARD_WANDER_RADIUS.z;
    const turn = Math.cos(t * 0.18) * 0.12;

    group.position.set(x, 0, z);
    group.rotation.set(0, turn, 0);
  });

  return <group ref={groupRef}>{children}</group>;
}

function DogFallback() {
  return (
    <group>
      <DogShadowPlane opacity={0.2} />

      <mesh position={[DOG_STAGE_CAMERA.dogAnchor[0], -0.82, -0.02]}>
        <boxGeometry args={[0.9, 0.62, 0.48]} />
        <meshStandardMaterial color="#f4f1e8" roughness={0.82} />
      </mesh>
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

function StableDog({ scene, dogView, desiredClip = "" }) {
  const { dog = null, renderModel = null, paused = false } = dogView || {};
  const facing = renderModel?.facing || dog?.facing || "right";
  const yardFacing =
    facing === "left" || facing === "right" ? "front" : facing;
  const stageBehavior = resolveDogStageBehavior({ dog, renderModel });
  const yardAction = stageBehavior.action;
  const yardClip = desiredClip || stageBehavior.desiredClip;

  return (
    <DogRenderBoundary fallback={<DogFallback />}>
      <YardDogWander active={stageBehavior.movementActive} paused={paused}>
        <Dog3D
          scene={scene}
          dog={dog}
          action={yardAction}
          desiredClip={yardClip}
          facing={yardFacing}
          position={NORMAL_YARD_POSITION}
          rotation={resolveFacingRotation(yardFacing)}
          scale={NORMAL_YARD_DOG_SCALE}
          paused={paused}
          reduceMotion={false}
        />
      </YardDogWander>
    </DogRenderBoundary>
  );
}

export function Dog3DScene({ scene = null, dogView = {} }) {
  const [debugDesiredClip, setDebugDesiredClip] = useState("");

  return (
    <div className="relative h-full min-h-[520px] w-full overflow-hidden bg-[#8fcbe6]">
      <Canvas
        shadows={false}
        dpr={[1, 1.25]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "default",
        }}
      >
        <color attach="background" args={["#8fcbe6"]} />

        <DogCameraRig
          position={[0, 0.92, 5.22]}
          lookAt={[0, -0.64, -0.08]}
          fov={34}
        />

        <ambientLight intensity={0.92} />
        <hemisphereLight args={["#f8fbff", "#597a42", 1.35]} />
        <directionalLight position={[3.6, 5.4, 4.2]} intensity={1.35} />

        <BackyardScene />

        <DogShadowPlane opacity={0.22} />

        <Suspense fallback={<DogFallback />}>
          <StableDog
            scene={scene}
            dogView={dogView}
            desiredClip={debugDesiredClip}
          />
        </Suspense>
      </Canvas>

      {import.meta.env.DEV ? (
        <DogAnimationDebugPanel
          desiredClip={debugDesiredClip}
          onDesiredClipChange={setDebugDesiredClip}
        />
      ) : null}
    </div>
  );
}

export default Dog3DScene;
