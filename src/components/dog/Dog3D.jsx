/* eslint-disable react/no-unknown-property */
// src/components/dog/Dog3D.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Box3, Vector3 } from "three";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";

import {
  DOG_MODEL_GLTF_PATH,
  resolveClipName,
} from "@/features/game/stage3d/dog/dogAnimationMap.js";
import { resolveDogStageBehavior } from "@/features/game/stage3d/dog/resolveDogStageBehavior.js";

function applyMaterialState(node, { ghost, opacity }) {
  if (!node?.material) return;

  node.material = node.material.clone();
  node.material.transparent = ghost;
  node.material.opacity = ghost ? opacity : 1;

  if (ghost && node.material.emissive?.set) {
    node.material.emissive.set("#b7dcff");
    node.material.emissiveIntensity = 0.24;
  }
}

function resolveStageClip(scene, ghost) {
  if (ghost) return "Idle";
  return resolveDogStageBehavior(scene, Date.now()).clip || "Idle";
}

export function Dog3D({
  position = [0, -1, 0],
  rotation = [0, Math.PI * 0.15, 0],
  scale = 1,
  scene = null,
  ghost = false,
}) {
  const rootRef = useRef(null);
  const currentActionRef = useRef(null);
  const currentClipRef = useRef("");
  const [behaviorTick, setBehaviorTick] = useState(0);

  const { scene: dogScene, animations } = useGLTF(DOG_MODEL_GLTF_PATH);
  const modelScene = useMemo(() => cloneSkeleton(dogScene), [dogScene]);

  const modelLooksRigged = useMemo(() => {
    if (Array.isArray(animations) && animations.length > 0) return true;

    let hasSkinnedMesh = false;

    try {
      modelScene.traverse((node) => {
        if (node?.isSkinnedMesh) hasSkinnedMesh = true;
      });
    } catch {
      hasSkinnedMesh = false;
    }

    return hasSkinnedMesh;
  }, [animations, modelScene]);

  const fit = useMemo(() => {
    try {
      const box = new Box3().setFromObject(modelScene);

      if (!Number.isFinite(box.min.y) || !Number.isFinite(box.max.y)) {
        return { scale: 1, offset: [0, 0, 0] };
      }

      const size = new Vector3();
      const center = new Vector3();

      box.getSize(size);
      box.getCenter(center);

      const height = Math.max(0.0001, size.y || 0.0001);
      const targetHeight = modelLooksRigged ? 1.55 : 0.5;
      const fitScale = targetHeight / height;

      return {
        scale: fitScale,
        offset: [-center.x, -box.min.y, -center.z],
      };
    } catch {
      return { scale: 1, offset: [0, 0, 0] };
    }
  }, [modelLooksRigged, modelScene]);

  const { actions } = useAnimations(animations, rootRef);

  const behavior = useMemo(() => {
    void behaviorTick;
    return ghost ? null : resolveDogStageBehavior(scene, Date.now());
  }, [behaviorTick, ghost, scene]);

  const desiredClip = ghost
    ? resolveStageClip(scene, ghost)
    : behavior?.clip || "Idle";
  const weather = scene?.behavior?.weather || {};
  const opacity = ghost ? Number(scene?.behavior?.ghost?.opacity || 0) : 1;

  const effectivePosition = useMemo(() => {
    if (ghost) return [-1.45, -1, -0.95];
    if (weather?.shelterSeeking) return [1.45, -1, -1.15];
    return position;
  }, [ghost, position, weather?.shelterSeeking]);

  const effectiveRotation = useMemo(() => {
    if (ghost) return [0, Math.PI * -0.08, 0];
    if (weather?.shelterSeeking) return [0, Math.PI * -0.22, 0];
    return rotation;
  }, [ghost, rotation, weather?.shelterSeeking]);

  useEffect(() => {
    if (ghost) return undefined;

    const intervalId = window.setInterval(() => {
      setBehaviorTick((value) => value + 1);
    }, 2200);

    return () => window.clearInterval(intervalId);
  }, [ghost]);

  useFrame((state) => {
    const root = rootRef.current;
    if (!root) return;

    const t = state.clock.getElapsedTime();
    const baseScale = scale * fit.scale;
    const blinkPhase = behavior?.blink ? (t * 0.55) % 6.2 : 3;
    const blinkScale = blinkPhase > 0.04 && blinkPhase < 0.11 ? 0.988 : 1;

    root.scale.setScalar(baseScale * blinkScale);

    const idleLike =
      desiredClip === "Idle" ||
      desiredClip === "Wag" ||
      desiredClip === "Sleep";

    if (!idleLike) {
      root.position.y = effectivePosition[1];
      root.rotation.x = effectiveRotation[0];
      root.rotation.y = effectiveRotation[1];
      return;
    }

    const breath = ghost ? 0.012 : desiredClip === "Sleep" ? 0.018 : 0.02;

    const lookYaw =
      behavior?.lookAround && desiredClip !== "Sleep"
        ? Math.sin(t * 0.34) * 0.11 + Math.sin(t * 0.13) * 0.05
        : 0;

    const wanderSway =
      behavior?.id?.includes("wander") || desiredClip === "Walk"
        ? Math.sin(t * 1.2) * 0.035
        : 0;

    root.position.y =
      effectivePosition[1] +
      Math.sin(t * (desiredClip === "Sleep" ? 1.1 : 1.8)) * breath;

    root.rotation.x =
      effectiveRotation[0] +
      Math.sin(t * 0.8) * (desiredClip === "Sleep" ? 0.018 : 0.01);

    root.rotation.y = effectiveRotation[1] + lookYaw + wanderSway;
  });

  useEffect(() => {
    modelScene.traverse((node) => {
      if (!node?.isMesh) return;

      node.castShadow = !ghost;
      node.receiveShadow = true;

      applyMaterialState(node, { ghost, opacity });
    });
  }, [modelScene, ghost, opacity]);

  useEffect(() => {
    const clipName = resolveClipName(desiredClip, actions);
    if (!clipName || currentClipRef.current === clipName) return;

    const nextAction = actions?.[clipName];
    if (!nextAction) return;

    if (currentActionRef.current && currentActionRef.current !== nextAction) {
      currentActionRef.current.fadeOut(0.2);
    }

    nextAction.reset().fadeIn(0.2).play();

    currentActionRef.current = nextAction;
    currentClipRef.current = clipName;
  }, [actions, desiredClip]);

  useEffect(
    () => () => {
      if (currentActionRef.current?.stop) {
        currentActionRef.current.stop();
      }

      currentActionRef.current = null;
      currentClipRef.current = "";
    },
    []
  );

  return (
    <group
      ref={rootRef}
      scale={scale * fit.scale}
      position={effectivePosition}
      rotation={effectiveRotation}
    >
      <group position={fit.offset}>
        <primitive object={modelScene} />
      </group>
    </group>
  );
}

useGLTF.preload(DOG_MODEL_GLTF_PATH);

export default Dog3D;
