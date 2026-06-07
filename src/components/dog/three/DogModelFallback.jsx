/* eslint-disable react/no-unknown-property */
export default function DogModelFallback({
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  color = "#f4f1e8",
  shadowColor = "#000000",
  shadowOpacity = 0.2,
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.42, 32]} />
        <meshBasicMaterial
          color={shadowColor}
          transparent
          opacity={shadowOpacity}
        />
      </mesh>

      <mesh position={[0, 0.35, 0]}>
        <capsuleGeometry args={[0.22, 0.52, 8, 16]} />
        <meshStandardMaterial color={color} roughness={0.82} />
      </mesh>

      <mesh position={[0, 0.77, 0.15]}>
        <sphereGeometry args={[0.2, 20, 20]} />
        <meshStandardMaterial color={color} roughness={0.78} />
      </mesh>

      <mesh position={[-0.12, 0.96, 0.1]} rotation={[0, 0, 0.28]}>
        <coneGeometry args={[0.08, 0.18, 12]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>

      <mesh position={[0.12, 0.96, 0.1]} rotation={[0, 0, -0.28]}>
        <coneGeometry args={[0.08, 0.18, 12]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
    </group>
  );
}
