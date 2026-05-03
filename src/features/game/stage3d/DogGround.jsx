// src/features/game/stage3d/DogGround.jsx
/* eslint-disable react/no-unknown-property */
const DOG_STAGE_GROUND = Object.freeze({
  id: "yard-ground-plane",
  position: [0, -1.58, -0.45],
  rotation: [-Math.PI / 2, 0, 0],
  size: [10, 7],
});

export function DogGroundPlane({ color = "#7fa06a" }) {
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
    </group>
  );
}

export default DOG_STAGE_GROUND;
