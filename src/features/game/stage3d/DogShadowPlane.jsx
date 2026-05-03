/* eslint-disable react/no-unknown-property */
export default function DogShadowPlane({ opacity = 0.22 }) {
  return (
    <mesh
      receiveShadow
      position={[0, -1.54, -0.05]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[2.4, 1.4]} />
      <shadowMaterial transparent opacity={opacity} />
    </mesh>
  );
}
