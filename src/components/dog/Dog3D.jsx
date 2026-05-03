/* eslint-disable react/no-unknown-property */
// src/components/dog/Dog3D.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Box3, Vector3 } from "three";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";

import {
  DOG_MODEL_GLTF_PATH,
  hasPlayableDogModelClips,
  resolveClipName,
} from "@/features/game/stage3d/dog/dogAnimationMap.js";
import { resolveDogModelProfile } from "@/features/game/stage3d/dog/dogModelResolver.js";
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

function resolveStaticMotion(
  clip = "Idle",
  t = 0,
  behavior = null,
  action = ""
) {
  const key = String(clip || "Idle").trim();
  const actionKey = String(action || "")
    .trim()
    .toLowerCase();

  if (key === "Sit" || actionKey.includes("sit")) {
    return {
      y: -0.035 + Math.sin(t * 1.45) * 0.01,
      xRot: -0.055 + Math.sin(t * 0.7) * 0.008,
      yRot: behavior?.lookAround
        ? Math.sin(t * 0.32) * 0.08 + Math.sin(t * 0.11) * 0.035
        : Math.sin(t * 0.24) * 0.025,
      zRot: 0,
      x: 0,
      z: 0.018,
      squashY: 0.94,
      squashZ: 1.04,
    };
  }

  if (key === "Sleep" || actionKey.includes("sleep")) {
    return {
      y: Math.sin(t * 1.1) * 0.012,
      xRot: -0.08 + Math.sin(t * 0.65) * 0.014,
      yRot: 0,
      zRot: Math.sin(t * 0.5) * 0.01,
      x: 0,
      z: 0.025,
      squashY: 0.88 + Math.sin(t * 1.1) * 0.01,
      squashZ: 1.08,
    };
  }

  if (key === "Walk" || actionKey.includes("walk")) {
    return {
      y: Math.abs(Math.sin(t * 5.2)) * 0.032,
      xRot: Math.sin(t * 5.2) * 0.026,
      yRot: Math.sin(t * 1.7) * 0.09,
      zRot: Math.sin(t * 5.2) * 0.022,
      x: Math.sin(t * 1.2) * 0.045,
      z: Math.sin(t * 2.4) * 0.035,
    };
  }

  if (key === "Bark" || actionKey.includes("bark")) {
    return {
      y: Math.max(0, Math.sin(t * 8.5)) * 0.025,
      xRot: -0.045 + Math.sin(t * 8.5) * 0.02,
      yRot: Math.sin(t * 2.4) * 0.035,
      zRot: 0,
      x: 0,
      z: 0,
      squashY: 1 + Math.max(0, Math.sin(t * 8.5)) * 0.035,
    };
  }

  if (key === "Wag" || actionKey.includes("wag")) {
    return {
      y: Math.sin(t * 2.4) * 0.018,
      xRot: Math.sin(t * 1.2) * 0.012,
      yRot: Math.sin(t * 4.2) * 0.075,
      zRot: Math.sin(t * 4.2) * 0.018,
      x: 0,
      z: 0,
    };
  }

  return {
    y: Math.sin(t * 1.8) * 0.018,
    xRot: Math.sin(t * 0.8) * 0.01,
    yRot: behavior?.lookAround
      ? Math.sin(t * 0.34) * 0.11 + Math.sin(t * 0.13) * 0.05
      : 0,
    zRot: 0,
    x: 0,
    z: 0,
  };
}

export function Dog3D({
  dog = null,
  action = "",
  facing = "",
  animationClip = null,
  resolution = null,
  position = [0, -1, 0],
  rotation = [0, Math.PI * 0.15, 0],
  scale = 1,
  scene = null,
  ghost = false,
  desiredClip: forcedClip = "",
  paused = false,
  reduceMotion = false,
}) {
  const rootRef = useRef(null);
  const currentActionRef = useRef(null);
  const currentClipRef = useRef("");
  const [behaviorTick, setBehaviorTick] = useState(0);
  const dogModelProfile = useMemo(
    () =>
      resolveDogModelProfile({
        scene,
        dog,
        action,
        mood: scene?.moodLabel || scene?.mood,
        useStageModels: scene?.useStageDogModels === true,
      }),
    [action, dog, scene]
  );
  const dogModelPath = dogModelProfile.modelPath;

  const { scene: dogScene, animations } = useGLTF(dogModelPath);
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
  const hasModelClips = useMemo(
    () => hasPlayableDogModelClips(actions),
    [actions]
  );

  const behavior = useMemo(() => {
    void behaviorTick;
    if (forcedClip && !ghost) {
      return {
        id: String(forcedClip).toLowerCase(),
        clip: forcedClip,
        loop: forcedClip !== "Bark",
        lookAround: forcedClip === "Idle" || forcedClip === "Wag",
        blink: forcedClip !== "Bark" && forcedClip !== "Walk",
        intensity: forcedClip === "Bark" ? 1 : 0.5,
      };
    }
    return ghost ? null : resolveDogStageBehavior(scene, Date.now());
  }, [behaviorTick, forcedClip, ghost, scene]);

  const desiredClip = ghost
    ? resolveStageClip(scene, ghost)
    : behavior?.clip || forcedClip || animationClip?.key || "Idle";
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
    if (facing === "left" || dog?.facing === "left") {
      return [rotation[0], Math.PI * -0.16, rotation[2] || 0];
    }
    if (facing === "right" || dog?.facing === "right") {
      return [rotation[0], Math.PI * 0.16, rotation[2] || 0];
    }
    return rotation;
  }, [dog?.facing, facing, ghost, rotation, weather?.shelterSeeking]);

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
    const motionPaused = paused || reduceMotion;
    const blinkPhase = behavior?.blink && !motionPaused ? (t * 0.55) % 6.2 : 3;
    const blinkScale = blinkPhase > 0.04 && blinkPhase < 0.11 ? 0.988 : 1;

    if (!hasModelClips) {
      const motion = motionPaused
        ? { x: 0, y: 0, z: 0, xRot: 0, yRot: 0, zRot: 0 }
        : resolveStaticMotion(desiredClip, t, behavior || resolution, action);
      const squashX = motion.squashX || 1;
      const squashY = motion.squashY || 1;
      const squashZ = motion.squashZ || 1;

      root.scale.set(
        baseScale * blinkScale * squashX,
        baseScale * blinkScale * squashY,
        baseScale * blinkScale * squashZ
      );
      root.position.x = effectivePosition[0] + (motion.x || 0);
      root.position.y = effectivePosition[1] + motion.y;
      root.position.z = effectivePosition[2] + (motion.z || 0);
      root.rotation.x = effectiveRotation[0] + motion.xRot;
      root.rotation.y = effectiveRotation[1] + motion.yRot;
      root.rotation.z = effectiveRotation[2] + motion.zRot;
      return;
    }

    root.scale.setScalar(baseScale * blinkScale);

    const idleLike =
      desiredClip === "Idle" ||
      desiredClip === "Wag" ||
      desiredClip === "Sleep";

    if (!idleLike || motionPaused) {
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
    if (!hasModelClips) return;

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
  }, [actions, desiredClip, hasModelClips]);

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
