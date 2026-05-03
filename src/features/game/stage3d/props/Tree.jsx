// src/features/game/stage3d/props/Tree.jsx
/* eslint-disable react/no-unknown-property */
export default function Tree({
  trunkColor = "#6e5037",
  leafColors = ["#4f774d", "#5d8658", "#456d44"],
  scale = 1,
}) {
  return (
    <group
      position={[-3.05, -0.34, -2.95]}
      rotation={[0, 0.16, 0]}
      scale={scale}
    >
      <mesh castShadow receiveShadow position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.22, 0.28, 1.55, 9]} />
        <meshStandardMaterial color={trunkColor} roughness={0.92} />
      </mesh>

      <mesh castShadow receiveShadow position={[0.02, 1.12, 0.02]}>
        <sphereGeometry args={[0.88, 20, 18]} />
        <meshStandardMaterial
          color={leafColors[0] || "#4f774d"}
          roughness={0.96}
        />
      </mesh>

      <mesh castShadow receiveShadow position={[-0.35, 0.9, 0.2]}>
        <sphereGeometry args={[0.46, 16, 14]} />
        <meshStandardMaterial
          color={leafColors[1] || "#5d8658"}
          roughness={0.96}
        />
      </mesh>

      <mesh castShadow receiveShadow position={[0.36, 0.82, -0.18]}>
        <sphereGeometry args={[0.42, 14, 14]} />
        <meshStandardMaterial
          color={leafColors[2] || "#456d44"}
          roughness={0.98}
        />
      </mesh>
    </group>
  );
}
