// src/features/game/stage3d/DogLightRig.jsx
/* eslint-disable react/no-unknown-property */
import { Environment } from "@react-three/drei";

export default function DogLightRig({ lighting }) {
  return (
    <>
      <ambientLight
        intensity={lighting.ambientIntensity}
        color={lighting.ambientColor}
      />
      <directionalLight
        castShadow
        position={[3.8, 5.6, 4.5]}
        intensity={lighting.keyIntensity}
        color={lighting.keyColor}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.00012}
        shadow-radius={4}
      />
      <directionalLight
        position={[-3.4, 2.5, 2.2]}
        intensity={lighting.fillIntensity}
        color={lighting.fillColor}
      />
      <directionalLight
        position={[0.4, 1.9, -3.8]}
        intensity={lighting.rimIntensity}
        color={lighting.rimColor}
      />
      <Environment preset={lighting.envPreset} />
    </>
  );
}
