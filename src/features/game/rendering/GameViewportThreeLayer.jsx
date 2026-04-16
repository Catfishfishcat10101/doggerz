/* eslint-disable react/no-unknown-property */

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  MeshDistortMaterial,
  PerformanceMonitor,
} from "@react-three/drei";

function AccentOrb({
  position = [0, 0, 0],
  scale = 1,
  speed = 1,
  color,
  distort = 0.34,
}) {
  const meshRef = useRef(null);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    mesh.rotation.x += delta * 0.18 * speed;
    mesh.rotation.y += delta * 0.24 * speed;
    mesh.position.y =
      position[1] + Math.sin(state.clock.elapsedTime * 0.7 * speed) * 0.08;
  });

  return (
    <Float
      speed={1.2 * speed}
      rotationIntensity={0.42}
      floatIntensity={0.52}
      position={position}
    >
      <mesh ref={meshRef} scale={scale}>
        <icosahedronGeometry args={[0.52, 16]} />
        <MeshDistortMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.62}
          roughness={0.18}
          metalness={0.08}
          transparent
          opacity={0.9}
          distort={distort}
          speed={2.1 * speed}
        />
      </mesh>
    </Float>
  );
}

function AccentScene() {
  const stars = useMemo(
    () =>
      Array.from({ length: 30 }, (_, index) => ({
        id: `spark-${index}`,
        position: [
          ((index % 6) - 2.5) * 0.85,
          0.35 + Math.floor(index / 6) * 0.44,
          -1.4 - (index % 4) * 0.2,
        ],
        scale: 0.02 + (index % 3) * 0.01,
      })),
    []
  );

  return (
    <>
      <color attach="background" args={["#020617"]} />
      <fog attach="fog" args={["#020617", 3.5, 8]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[1.6, 2.2, 3.2]} intensity={16} color="#7dd3fc" />
      <pointLight position={[-2.8, -0.6, 2.6]} intensity={10} color="#34d399" />
      <AccentOrb
        position={[-0.52, 0.18, -0.18]}
        scale={1.16}
        speed={0.82}
        color="#38bdf8"
        distort={0.4}
      />
      <AccentOrb
        position={[1.22, -0.22, -0.44]}
        scale={0.54}
        speed={1.18}
        color="#10b981"
        distort={0.28}
      />
      <AccentOrb
        position={[-1.48, -0.36, -0.62]}
        scale={0.36}
        speed={1.34}
        color="#f59e0b"
        distort={0.22}
      />
      <mesh position={[0, -1.48, -0.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.6, 48]} />
        <meshBasicMaterial color="#0f172a" transparent opacity={0.65} />
      </mesh>
      <gridHelper
        args={[14, 18, "#164e63", "#0f766e"]}
        position={[0, -1.44, -1.2]}
      />
      {stars.map((star) => (
        <mesh key={star.id} position={star.position} scale={star.scale}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial color="#e0f2fe" transparent opacity={0.6} />
        </mesh>
      ))}
    </>
  );
}

export default function GameViewportThreeLayer({ className = "" }) {
  const [dpr, setDpr] = useState(1.35);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`.trim()}
    >
      <Canvas
        gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
        camera={{ position: [0, 0, 4.8], fov: 34 }}
        dpr={dpr}
      >
        <PerformanceMonitor
          onDecline={() => setDpr(1)}
          onIncline={() => setDpr(1.5)}
        />
        <AccentScene />
      </Canvas>
    </div>
  );
}
