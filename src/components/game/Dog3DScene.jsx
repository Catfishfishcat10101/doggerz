// src/components/game/Dog3DScene.jsx
import React, { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import Dog3D from "@/components/dog/Dog3D.jsx";
import DOG_STAGE_CAMERA, {
  DogCameraRig,
} from "@/features/game/stage3d/DogCamera.jsx";
import DogShadowPlane from "@/features/game/stage3d/DogShadowPlane.jsx";

const NORMAL_YARD_DOG_SCALE = 0.72;
const CLOSE_YARD_DOG_SCALE = 1.05;
const PAW_GLASS_DOG_SCALE = 1.25;

const NORMAL_YARD_POSITION = [0, -1, -0.85];
const CLOSE_SCREEN_POSITION = [0, -1.05, 0.35];

function resolveFacingRotation(facing = "") {
  const key = String(facing || "")
    .trim()
    .toLowerCase();

  if (key === "left") return [0, Math.PI * -0.18, 0];
  if (key === "front") return [0, 0, 0];
  if (key === "back") return [0, Math.PI, 0];

  return [0, Math.PI * 0.18, 0];
}

function SkyBackdrop() {
  return (
    <group>
      <mesh position={[0, 1.95, -4.8]}>
        <planeGeometry args={[18, 7]} />
        <meshBasicMaterial color="#8fcbe6" depthWrite={false} />
      </mesh>

      <mesh position={[0, -0.25, -4.7]}>
        <planeGeometry args={[18, 2.4]} />
        <meshBasicMaterial color="#5f9b57" depthWrite={false} />
      </mesh>

      <mesh position={[-3.9, 2.5, -4.6]}>
        <sphereGeometry args={[0.42, 18, 18]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.55} />
      </mesh>

      <mesh position={[-3.45, 2.58, -4.6]}>
        <sphereGeometry args={[0.52, 18, 18]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.48} />
      </mesh>

      <mesh position={[-2.95, 2.48, -4.6]}>
        <sphereGeometry args={[0.38, 18, 18]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.42} />
      </mesh>
    </group>
  );
}

function BackyardFence() {
  const boards = useMemo(() => {
    return Array.from({ length: 17 }, (_, index) => index - 8);
  }, []);

  return (
    <group position={[0, -0.55, -3.25]}>
      <mesh position={[0, -0.48, -0.04]}>
        <boxGeometry args={[11.8, 0.18, 0.14]} />
        <meshStandardMaterial color="#7b573b" roughness={0.9} />
      </mesh>

      <mesh position={[0, 0.18, -0.04]}>
        <boxGeometry args={[11.8, 0.18, 0.14]} />
        <meshStandardMaterial color="#8b6341" roughness={0.88} />
      </mesh>

      {boards.map((x) => {
        const isEven = Math.abs(x) % 2 === 0;

        return (
          <mesh key={x} position={[x * 0.68, -0.1, 0]}>
            <boxGeometry args={[0.38, 1.8, 0.14]} />
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

function GrassGround() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.08, 0]}>
        <planeGeometry args={[16, 12, 1, 1]} />
        <meshStandardMaterial color="#4f8f45" roughness={0.96} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.075, 1.35]}>
        <circleGeometry args={[3.8, 48]} />
        <meshStandardMaterial color="#69a75a" roughness={0.98} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2.7, -1.07, -0.55]}>
        <circleGeometry args={[1.25, 32]} />
        <meshStandardMaterial color="#3f7838" roughness={1} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3.0, -1.07, -0.35]}>
        <circleGeometry args={[1.45, 32]} />
        <meshStandardMaterial color="#3f7838" roughness={1} />
      </mesh>
    </group>
  );
}

function DogHouse() {
  return (
    <group position={[-3.35, -0.72, -2.05]} rotation={[0, 0.08, 0]}>
      <mesh position={[0, 0.16, 0]}>
        <boxGeometry args={[1.25, 0.9, 0.95]} />
        <meshStandardMaterial color="#9a4f35" roughness={0.85} />
      </mesh>

      <mesh position={[0, 0.72, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.95, 0.95, 1.05]} />
        <meshStandardMaterial color="#633322" roughness={0.88} />
      </mesh>

      <mesh position={[0, -0.1, 0.49]}>
        <boxGeometry args={[0.42, 0.58, 0.08]} />
        <meshStandardMaterial color="#20130f" roughness={0.9} />
      </mesh>
    </group>
  );
}

function Tree() {
  return (
    <group position={[3.65, -0.72, -2.35]}>
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

function Bushes() {
  return (
    <group>
      <mesh position={[-4.25, -0.93, -2.35]}>
        <sphereGeometry args={[0.42, 18, 18]} />
        <meshStandardMaterial color="#2f7d3b" roughness={1} />
      </mesh>

      <mesh position={[-3.82, -0.92, -2.42]}>
        <sphereGeometry args={[0.34, 18, 18]} />
        <meshStandardMaterial color="#3b8e46" roughness={1} />
      </mesh>

      <mesh position={[4.2, -0.93, -2.55]}>
        <sphereGeometry args={[0.42, 18, 18]} />
        <meshStandardMaterial color="#2f7d3b" roughness={1} />
      </mesh>

      <mesh position={[4.62, -0.92, -2.48]}>
        <sphereGeometry args={[0.34, 18, 18]} />
        <meshStandardMaterial color="#3b8e46" roughness={1} />
      </mesh>
    </group>
  );
}

function BackyardScene() {
  return (
    <group>
      <SkyBackdrop />
      <BackyardFence />
      <GrassGround />
      <DogHouse />
      <Tree />
      <Bushes />
    </group>
  );
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

function StableDog({ scene, dogView }) {
  const { dog = null, renderModel = null, paused = false } = dogView || {};
  const facing = renderModel?.facing || dog?.facing || "right";

  // TODO: Use CLOSE_YARD_DOG_SCALE for future high-bond close/front behavior.
  // TODO: Use PAW_GLASS_DOG_SCALE temporarily for future paw-on-glass behavior.

  return (
    <DogRenderBoundary fallback={<DogFallback />}>
      <Dog3D
        scene={scene}
        dog={dog}
        action="idle"
        desiredClip="idle"
        facing={facing}
        position={DOG_STAGE_CAMERA.dogAnchor}
        rotation={resolveFacingRotation(facing)}
        scale={NORMAL_YARD_DOG_SCALE}
        paused={paused}
        reduceMotion
      />
    </DogRenderBoundary>
  );
}

export function Dog3DScene({ scene = null, dogView = {} }) {
  return (
    <div className="h-full min-h-[520px] w-full overflow-hidden bg-[#8fcbe6]">
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
          position={[0, 0.88, 5.15]}
          lookAt={[0, -0.62, -0.35]}
          fov={34}
        />

        <ambientLight intensity={0.92} />
        <hemisphereLight args={["#f8fbff", "#597a42", 1.35]} />
        <directionalLight position={[3.6, 5.4, 4.2]} intensity={1.35} />

        <BackyardScene />

        <DogShadowPlane opacity={0.22} />

        <Suspense fallback={<DogFallback />}>
          <StableDog scene={scene} dogView={dogView} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default Dog3DScene;
