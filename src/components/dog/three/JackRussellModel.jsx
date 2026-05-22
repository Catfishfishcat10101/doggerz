/* eslint-disable react/no-unknown-property */
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useAnimations, useGLTF } from "@react-three/drei";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

import { DOG_MODEL_GLTF_PATH } from "@/features/game/stage3d/dog/dogModelMap.js";

const DEFAULT_ANIMATION_CANDIDATES = [
  "Idle_1",
  "Idle_2",
  "Idle",
  "idle",
  "Armature|Idle",
  "Armature|Idle_1",
  "Sitting_loop_1",
  "Lie_Sleep_loop",
];

function findBestAnimationName(animationNames, requestedName) {
  if (!animationNames?.length) return null;

  if (requestedName && animationNames.includes(requestedName)) {
    return requestedName;
  }

  const requestedLower = requestedName?.toLowerCase?.();

  if (requestedLower) {
    const fuzzyMatch = animationNames.find((name) =>
      name.toLowerCase().includes(requestedLower)
    );

    if (fuzzyMatch) return fuzzyMatch;
  }

  return (
    DEFAULT_ANIMATION_CANDIDATES.find((name) => animationNames.includes(name)) ||
    animationNames[0]
  );
}

export default function JackRussellModel({
  animationName = "Idle_1",
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  autoCenter = false,
  debugAnimations = false,
  animationSpeed = 1,
}) {
  const { scene, animations } = useGLTF(DOG_MODEL_GLTF_PATH);

  const model = useMemo(() => {
    const clonedScene = clone(scene);

    clonedScene.traverse((object) => {
      if (object.isMesh || object.isSkinnedMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
        object.frustumCulled = false;

        if (object.material) {
          object.material.side = THREE.FrontSide;
          object.material.needsUpdate = true;
        }
      }
    });

    if (autoCenter) {
      clonedScene.updateMatrixWorld(true);

      const box = new THREE.Box3().setFromObject(clonedScene);

      if (!box.isEmpty()) {
        const center = box.getCenter(new THREE.Vector3());
        clonedScene.position.set(-center.x, -box.min.y, -center.z);
      }
    }

    return clonedScene;
  }, [scene, autoCenter]);

  const { actions, names } = useAnimations(animations, model);

  useEffect(() => {
    if (!names?.length) return undefined;

    const activeAnimationName = findBestAnimationName(names, animationName);
    const activeAction = activeAnimationName ? actions[activeAnimationName] : null;

    if (debugAnimations) {
      console.log("[Doggerz 3D] Available dog animations:", names);
      console.log("[Doggerz 3D] Requested animation:", animationName);
      console.log("[Doggerz 3D] Active animation:", activeAnimationName);
    }

    if (!activeAction) return undefined;

    activeAction.reset();
    activeAction.timeScale = animationSpeed;
    activeAction.setLoop(THREE.LoopRepeat);
    activeAction.fadeIn(0.25);
    activeAction.play();

    return () => {
      activeAction.fadeOut(0.2);
    };
  }, [actions, names, animationName, debugAnimations, animationSpeed]);

  return (
    <primitive
      object={model}
      scale={scale}
      position={position}
      rotation={rotation}
    />
  );
}

useGLTF.preload(DOG_MODEL_GLTF_PATH);
