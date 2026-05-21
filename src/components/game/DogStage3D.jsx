import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import DogModel3D from "@/components/dog/three/DogModel3D.jsx";

export default function DogStage3D({
  action = "idle",
  actionOverride = null,
  mood = "neutral",
  isSleeping = false,
  energy = 50,
  happiness = 50,
  className = "",
  debugControls = import.meta.env.DEV,
}) {
  return (
    <section
      className={[
        "relative h-[360px] w-full overflow-hidden rounded-[2rem]",
        "border border-emerald-400/20 bg-gradient-to-b from-sky-950 via-emerald-950 to-zinc-950",
        "shadow-[0_0_45px_rgba(16,185,129,0.16)]",
        className,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(16,185,129,0.24),transparent_45%)]" />

      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{
          position: [0, 1.1, 4.4],
          fov: 38,
          near: 0.1,
          far: 100,
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <ambientLight intensity={0.9} />

        <directionalLight
          position={[3, 5, 4]}
          intensity={2.25}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        <spotLight
          position={[-3, 3.5, 3]}
          intensity={0.75}
          angle={0.45}
          penumbra={0.8}
        />

        <Suspense fallback={null}>
          <DogModel3D
            action={action}
            actionOverride={actionOverride}
            mood={mood}
            isSleeping={isSleeping}
            energy={energy}
            happiness={happiness}
          />

          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -1.08, 0]}
            receiveShadow
          >
            <circleGeometry args={[2.15, 64]} />
            <meshStandardMaterial
              color="#064e3b"
              roughness={0.92}
              metalness={0}
            />
          </mesh>
        </Suspense>

        {debugControls ? (
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 2.7}
            maxPolarAngle={Math.PI / 2.05}
          />
        ) : null}
      </Canvas>
    </section>
  );
}
