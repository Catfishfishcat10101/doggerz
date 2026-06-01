// src/features/game/stage3d/DogShadowPlane.jsx
/* eslint-disable react/no-unknown-property */
export default function DogShadowPlane({ opacity = 0.22 }) {
  return (
    <mesh
      receiveShadow
      position={[0, -1.54, -0.05]}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={[1.8, 0.72, 1]}
    >
      <circleGeometry args={[0.72, 48]} />
      <meshBasicMaterial
        color="#08110b"
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </mesh>
  );
}
