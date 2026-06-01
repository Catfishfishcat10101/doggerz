// src/features/game/stage3d/DogGround.jsx
/* eslint-disable react/no-unknown-property */
const DOG_STAGE_GROUND = Object.freeze({
  id: "yard-ground-plane",
  position: [0, -1.58, -0.45],
  rotation: [-Math.PI / 2, 0, 0],
  size: [10, 7],
});

const GRASS_TUFTS = Object.freeze([
  [-3.4, -1.49, -0.6, 0.72],
  [-2.4, -1.49, 0.32, 0.52],
  [-1.2, -1.49, -1.2, 0.62],
  [1.65, -1.49, -0.95, 0.56],
  [2.75, -1.49, 0.08, 0.7],
  [3.42, -1.49, -1.36, 0.48],
]);

function GrassTuft({ x, y, z, scale = 1, color = "#496f3e" }) {
  return (
    <group position={[x, y, z]} scale={scale}>
      <mesh rotation={[0, 0, -0.22]}>
        <coneGeometry args={[0.035, 0.32, 5]} />
        <meshStandardMaterial color={color} roughness={1} />
      </mesh>
      <mesh position={[0.08, 0.02, 0.02]} rotation={[0, 0, 0.18]}>
        <coneGeometry args={[0.032, 0.26, 5]} />
        <meshStandardMaterial color={color} roughness={1} />
      </mesh>
      <mesh position={[-0.08, 0, -0.02]} rotation={[0, 0, -0.46]}>
        <coneGeometry args={[0.03, 0.24, 5]} />
        <meshStandardMaterial color={color} roughness={1} />
      </mesh>
    </group>
  );
}

export function DogGroundPlane({ color = "#7fa06a", grassColor = "#496f3e" }) {
  return (
    <group>
      <mesh
        receiveShadow
        position={DOG_STAGE_GROUND.position}
        rotation={DOG_STAGE_GROUND.rotation}
      >
        <planeGeometry args={DOG_STAGE_GROUND.size} />
        <meshStandardMaterial color={color} roughness={1} />
      </mesh>
      {GRASS_TUFTS.map(([x, y, z, scale]) => (
        <GrassTuft
          key={`${x}:${z}`}
          x={x}
          y={y}
          z={z}
          scale={scale}
          color={grassColor}
        />
      ))}
    </group>
  );
}

export default DOG_STAGE_GROUND;
