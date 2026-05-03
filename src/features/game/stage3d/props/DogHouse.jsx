/* eslint-disable react/no-unknown-property */
export default function DogHouse({
  bodyColor = "#86593d",
  roofColor = "#6f4832",
  trimColor = "#4b3122",
  doorwayColor = "#3d2a1d",
  windowGlow = 0,
}) {
  return (
    <group
      position={[2.55, -0.92, -2.55]}
      rotation={[0, -0.24, 0]}
      scale={0.68}
    >
      <mesh castShadow receiveShadow position={[0, 0.12, 0]}>
        <boxGeometry args={[1.62, 0.86, 1.1]} />
        <meshStandardMaterial color={bodyColor} roughness={0.94} />
      </mesh>

      <mesh castShadow receiveShadow position={[0, 0.6, 0.03]}>
        <coneGeometry args={[0.93, 0.56, 4]} />
        <meshStandardMaterial color={roofColor} roughness={0.92} />
      </mesh>

      <mesh receiveShadow position={[0, -0.26, 0.52]}>
        <boxGeometry args={[0.62, 0.33, 0.06]} />
        <meshStandardMaterial color={doorwayColor} roughness={1} />
      </mesh>

      <mesh receiveShadow position={[0, -0.14, 0.53]}>
        <boxGeometry args={[0.82, 0.1, 0.05]} />
        <meshStandardMaterial color={trimColor} roughness={1} />
      </mesh>

      {windowGlow > 0 ? (
        <>
          <mesh position={[-0.32, 0.12, 0.56]}>
            <planeGeometry args={[0.16, 0.16]} />
            <meshBasicMaterial
              color="#ffdca0"
              transparent
              opacity={Math.min(0.72, windowGlow)}
            />
          </mesh>
          <pointLight
            position={[-0.28, 0.12, 0.44]}
            color="#ffd7a2"
            intensity={windowGlow * 0.85}
            distance={2.8}
          />
        </>
      ) : null}
    </group>
  );
}
