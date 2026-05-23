/* eslint-disable react/no-unknown-property */
// src/components/dog/Dog3D.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Box3, Vector3 } from "three";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";

import {
  DOG_MODEL_GLTF_PATH,
  FEED_LOOP_CLIP,
  FEED_START_CLIP,
  hasPlayableDogModelClips,
  isFeedingDogAction,
  resolveFeedingClipName,
  resolveDogModelClipRequest,
  resolveClipName,
} from "@/features/game/stage3d/dog/dogAnimationMap.js";
import { DOG_MODEL_PATH_BY_STAGE } from "@/features/game/stage3d/dog/dogModelMap.js";
import { resolveDogModelProfile } from "@/features/game/stage3d/dog/dogModelResolver.js";

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

  if (key === "Sniff" || actionKey.includes("sniff")) {
    return {
      y: -0.018 + Math.sin(t * 2.6) * 0.01,
      xRot: 0.08 + Math.sin(t * 5.4) * 0.018,
      yRot: Math.sin(t * 1.6) * 0.08,
      zRot: Math.sin(t * 2.2) * 0.012,
      x: Math.sin(t * 0.9) * 0.018,
      z: 0.04 + Math.sin(t * 1.3) * 0.018,
      squashY: 0.97,
      squashZ: 1.03,
    };
  }

  if (
    key === "Scratch" ||
    actionKey.includes("scratch") ||
    actionKey.includes("dig")
  ) {
    return {
      y: Math.abs(Math.sin(t * 9.2)) * 0.018,
      xRot: 0.06 + Math.sin(t * 9.2) * 0.028,
      yRot: Math.sin(t * 2.5) * 0.045,
      zRot: Math.sin(t * 9.2) * 0.02,
      x: 0,
      z: 0.035,
      squashY: 0.96 + Math.abs(Math.sin(t * 9.2)) * 0.025,
      squashZ: 1.04,
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

function clamp01(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(1, numeric));
}

function easeInOutSine(value) {
  const t = clamp01(value);
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

function normalizeMotionKey(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function resolveTrickRootMotion(clip = "Idle", action = "", localT = 0) {
  const requestKey = normalizeMotionKey(resolveDogModelClipRequest(clip));
  const actionKey = normalizeMotionKey(action);
  const key = requestKey || actionKey;
  const seconds = Math.max(0, Number(localT) || 0);
  const phase = (seconds % 1.4) / 1.4;
  const loop = Math.sin(seconds * Math.PI * 2);
  const pulse = Math.sin(phase * Math.PI);

  if (key === "speak" || key === "bark") {
    return {
      y: Math.max(0, Math.sin(seconds * 12)) * 0.03,
      xRot: -0.05 + Math.sin(seconds * 12) * 0.022,
      yRot: Math.sin(seconds * 4) * 0.035,
      zRot: 0,
      x: 0,
      z: 0,
      squashX: 1,
      squashY: 1 + Math.max(0, Math.sin(seconds * 12)) * 0.03,
      squashZ: 1,
    };
  }

  if (key === "sitpretty") {
    return {
      y: -0.02 + pulse * 0.045 + Math.sin(seconds * 3) * 0.006,
      xRot: -0.18 + Math.sin(seconds * 2.4) * 0.014,
      yRot: Math.sin(seconds * 1.7) * 0.035,
      zRot: Math.sin(seconds * 2.1) * 0.018,
      x: 0,
      z: 0.025,
      squashX: 0.98,
      squashY: 1.04,
      squashZ: 0.98,
    };
  }

  if (key === "rollover") {
    const roll = easeInOutSine(phase) * Math.PI * 2;
    return {
      y: -0.09 + Math.sin(phase * Math.PI) * 0.025,
      xRot: 0.08 + Math.sin(phase * Math.PI * 2) * 0.04,
      yRot: Math.sin(phase * Math.PI * 2) * 0.08,
      zRot: roll,
      x: Math.sin(phase * Math.PI * 2) * 0.07,
      z: 0.035,
      squashX: 1.06,
      squashY: 0.86,
      squashZ: 1.08,
    };
  }

  if (key === "spin") {
    return {
      y: Math.abs(Math.sin(seconds * 7)) * 0.018,
      xRot: Math.sin(seconds * 5) * 0.02,
      yRot: easeInOutSine(phase) * Math.PI * 2,
      zRot: Math.sin(seconds * 7) * 0.035,
      x: 0,
      z: 0,
      squashX: 1,
      squashY: 0.98 + Math.abs(loop) * 0.025,
      squashZ: 1,
    };
  }

  if (key === "crawl" || key === "armycrawl") {
    return {
      y: -0.08 + Math.abs(Math.sin(seconds * 6.5)) * 0.014,
      xRot: 0.13 + Math.sin(seconds * 6.5) * 0.02,
      yRot: Math.sin(seconds * 2.2) * 0.035,
      zRot: Math.sin(seconds * 6.5) * 0.018,
      x: Math.sin(seconds * 1.6) * 0.055,
      z: 0.055 + Math.sin(seconds * 3.2) * 0.025,
      squashX: 1.06,
      squashY: 0.86,
      squashZ: 1.1,
    };
  }

  if (key === "playdead") {
    const flop = easeInOutSine(Math.min(phase * 2.2, 1));
    return {
      y: -0.105 + Math.sin(seconds * 1.2) * 0.006,
      xRot: -0.08 * flop,
      yRot: Math.sin(seconds * 0.5) * 0.012,
      zRot: 0.42 * flop + Math.sin(seconds * 0.7) * 0.006,
      x: 0.015 * flop,
      z: 0.045,
      squashX: 1.08,
      squashY: 0.82,
      squashZ: 1.08,
    };
  }

  if (key === "backflip") {
    const lift = Math.sin(phase * Math.PI);
    const flip = easeInOutSine(phase) * -Math.PI * 2;
    return {
      y: Math.max(0, lift) * 0.32,
      xRot: flip,
      yRot: Math.sin(phase * Math.PI * 2) * 0.08,
      zRot: Math.sin(phase * Math.PI * 2) * 0.035,
      x: 0,
      z: Math.sin(phase * Math.PI) * -0.035,
      squashX: 1,
      squashY: 1 + Math.max(0, lift) * 0.04,
      squashZ: 1,
    };
  }

  if (key === "highfive" || key === "shake" || key === "paw") {
    return {
      y: -0.025 + Math.sin(seconds * 3) * 0.008,
      xRot: -0.08 + Math.sin(seconds * 4.2) * 0.016,
      yRot: Math.sin(seconds * 5.5) * 0.055,
      zRot:
        (key === "highfive" ? 0.035 : 0.02) + Math.sin(seconds * 5.5) * 0.02,
      x: key === "highfive" ? 0.012 : 0,
      z: 0.02,
      squashX: 0.99,
      squashY: key === "highfive" ? 1.02 : 0.96,
      squashZ: 1.03,
    };
  }

  if (key === "dance") {
    return {
      y: Math.abs(Math.sin(seconds * 5.6)) * 0.05,
      xRot: Math.sin(seconds * 5.6) * 0.045,
      yRot: Math.sin(seconds * 3.4) * 0.22,
      zRot: Math.sin(seconds * 5.6) * 0.08,
      x: Math.sin(seconds * 2.8) * 0.06,
      z: 0,
      squashX: 1,
      squashY: 0.98 + Math.abs(Math.sin(seconds * 5.6)) * 0.05,
      squashZ: 1,
    };
  }

  if (key === "fetch" || key === "jump") {
    return {
      y: Math.abs(Math.sin(seconds * 5.2)) * 0.05,
      xRot: Math.sin(seconds * 5.2) * 0.04,
      yRot: Math.sin(seconds * 1.8) * 0.06,
      zRot: Math.sin(seconds * 5.2) * 0.025,
      x: Math.sin(seconds * 1.4) * 0.055,
      z: Math.sin(seconds * 2.8) * 0.04,
      squashX: 1,
      squashY: 0.98 + Math.abs(Math.sin(seconds * 5.2)) * 0.03,
      squashZ: 1,
    };
  }

  return null;
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
  const feedActionKeyRef = useRef("");
  const feedStartTimerRef = useRef(0);
  const motionStartTimeRef = useRef(0);
  const motionKeyRef = useRef("");
  const [feedPhase, setFeedPhase] = useState("loop");
  const dogModelProfile = useMemo(
    () =>
      resolveDogModelProfile({
        scene,
        dog,
        action,
        mood: scene?.moodLabel || scene?.mood,
        useStageModels: scene?.useStageDogModels !== false,
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

  const desiredClip = ghost
    ? "Idle"
    : forcedClip || animationClip?.key || "Idle";
  const feedActionKey = useMemo(() => {
    const requested = [desiredClip, action].find((value) =>
      isFeedingDogAction(value)
    );
    return requested ? String(requested).trim().toLowerCase() : "";
  }, [action, desiredClip]);
  const feedActionActive = Boolean(feedActionKey);
  const effectiveFeedPhase =
    feedActionActive &&
    feedActionKeyRef.current !== feedActionKey &&
    actions?.[FEED_START_CLIP]
      ? "start"
      : feedPhase;
  const playbackClip =
    feedActionActive && hasModelClips
      ? resolveFeedingClipName(effectiveFeedPhase, actions) || FEED_LOOP_CLIP
      : desiredClip;
  const renderMotion = useMemo(
    () => ({
      id: String(playbackClip || "Idle").toLowerCase(),
      lookAround: playbackClip === "Idle" || playbackClip === "Wag",
      blink: playbackClip !== "Bark" && playbackClip !== "Walk",
    }),
    [playbackClip]
  );
  const opacity = ghost ? Number(scene?.behavior?.ghost?.opacity || 0) : 1;

  const effectivePosition = useMemo(() => {
    if (ghost) return [-1.45, -1, -0.95];
    return position;
  }, [ghost, position]);

  const effectiveRotation = useMemo(() => {
    if (ghost) return [0, Math.PI * -0.08, 0];
    if (facing === "left" || dog?.facing === "left") {
      return [rotation[0], Math.PI * -0.16, rotation[2] || 0];
    }
    if (facing === "right" || dog?.facing === "right") {
      return [rotation[0], Math.PI * 0.16, rotation[2] || 0];
    }
    if (facing === "front" || dog?.facing === "front") {
      return [rotation[0], 0, rotation[2] || 0];
    }
    if (facing === "back" || dog?.facing === "back") {
      return [rotation[0], Math.PI, rotation[2] || 0];
    }
    return rotation;
  }, [dog?.facing, facing, ghost, rotation]);

  useFrame((state) => {
    const root = rootRef.current;
    if (!root) return;

    const t = state.clock.getElapsedTime();
    const motionKey = `${playbackClip}:${action}`;
    if (motionKeyRef.current !== motionKey) {
      motionKeyRef.current = motionKey;
      motionStartTimeRef.current = t;
    }
    const localT = t - motionStartTimeRef.current;
    const baseScale = scale * fit.scale;
    const motionPaused = paused || reduceMotion;
    const blinkPhase =
      renderMotion?.blink && !motionPaused ? (t * 0.55) % 6.2 : 3;
    const blinkScale = blinkPhase > 0.04 && blinkPhase < 0.11 ? 0.988 : 1;

    if (!hasModelClips) {
      const motion = motionPaused
        ? { x: 0, y: 0, z: 0, xRot: 0, yRot: 0, zRot: 0 }
        : resolveStaticMotion(
            desiredClip,
            t,
            renderMotion || resolution,
            action
          );
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

    const trickMotion = motionPaused
      ? null
      : resolveTrickRootMotion(playbackClip, action, localT);
    if (trickMotion) {
      root.scale.set(
        baseScale * blinkScale * (trickMotion.squashX || 1),
        baseScale * blinkScale * (trickMotion.squashY || 1),
        baseScale * blinkScale * (trickMotion.squashZ || 1)
      );
      root.position.x = effectivePosition[0] + (trickMotion.x || 0);
      root.position.y = effectivePosition[1] + (trickMotion.y || 0);
      root.position.z = effectivePosition[2] + (trickMotion.z || 0);
      root.rotation.x = effectiveRotation[0] + (trickMotion.xRot || 0);
      root.rotation.y = effectiveRotation[1] + (trickMotion.yRot || 0);
      root.rotation.z = effectiveRotation[2] + (trickMotion.zRot || 0);
      return;
    }

    root.scale.setScalar(baseScale * blinkScale);

    const idleLike =
      playbackClip === "Idle" ||
      playbackClip === "Wag" ||
      playbackClip === "Sleep" ||
      playbackClip === "Sniff" ||
      playbackClip === "Scratch";

    if (!idleLike || motionPaused) {
      root.position.x = effectivePosition[0];
      root.position.y = effectivePosition[1];
      root.position.z = effectivePosition[2];
      root.rotation.x = effectiveRotation[0];
      root.rotation.y = effectiveRotation[1];
      root.rotation.z = effectiveRotation[2];
      return;
    }

    const breath = ghost ? 0.012 : playbackClip === "Sleep" ? 0.018 : 0.02;
    const actionDip =
      playbackClip === "Sniff"
        ? -0.018
        : playbackClip === "Scratch"
          ? -0.01
          : 0;
    const actionPitch =
      playbackClip === "Sniff"
        ? 0.07 + Math.sin(t * 5.4) * 0.014
        : playbackClip === "Scratch"
          ? 0.045 + Math.sin(t * 9.2) * 0.02
          : 0;

    const lookYaw =
      renderMotion?.lookAround && playbackClip !== "Sleep"
        ? Math.sin(t * 0.34) * 0.11 + Math.sin(t * 0.13) * 0.05
        : 0;

    const wanderSway =
      renderMotion?.id?.includes("wander") || playbackClip === "Walk"
        ? Math.sin(t * 1.2) * 0.035
        : 0;

    root.position.y =
      effectivePosition[1] +
      actionDip +
      Math.sin(t * (playbackClip === "Sleep" ? 1.1 : 1.8)) * breath;

    root.rotation.x =
      effectiveRotation[0] +
      actionPitch +
      Math.sin(t * 0.8) * (playbackClip === "Sleep" ? 0.018 : 0.01);

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
    if (feedStartTimerRef.current) {
      window.clearTimeout(feedStartTimerRef.current);
      feedStartTimerRef.current = 0;
    }

    if (!feedActionActive || !hasModelClips) {
      feedActionKeyRef.current = "";
      setFeedPhase("loop");
      return undefined;
    }

    const hasStartClip = Boolean(actions?.[FEED_START_CLIP]);
    const hasLoopClip = Boolean(actions?.[FEED_LOOP_CLIP]);

    if (feedActionKeyRef.current !== feedActionKey) {
      feedActionKeyRef.current = feedActionKey;
      setFeedPhase(hasStartClip ? "start" : "loop");
    }

    if (!hasStartClip || !hasLoopClip) {
      setFeedPhase("loop");
      return undefined;
    }

    const startDurationMs = Math.max(
      350,
      Math.min(
        1600,
        Number(actions?.[FEED_START_CLIP]?.getClip?.()?.duration || 0.8) * 1000
      )
    );

    feedStartTimerRef.current = window.setTimeout(() => {
      setFeedPhase("loop");
      feedStartTimerRef.current = 0;
    }, startDurationMs);

    return () => {
      if (feedStartTimerRef.current) {
        window.clearTimeout(feedStartTimerRef.current);
        feedStartTimerRef.current = 0;
      }
    };
  }, [actions, feedActionActive, feedActionKey, hasModelClips]);

  useEffect(() => {
    if (!hasModelClips) return;

    const clipName = feedActionActive
      ? resolveFeedingClipName(effectiveFeedPhase, actions)
      : resolveClipName(playbackClip, actions);
    if (!clipName || currentClipRef.current === clipName) return;

    const nextAction = actions?.[clipName];
    if (!nextAction) return;

    if (currentActionRef.current && currentActionRef.current !== nextAction) {
      currentActionRef.current.fadeOut(0.2);
    }

    nextAction.reset().fadeIn(0.2).play();

    currentActionRef.current = nextAction;
    currentClipRef.current = clipName;
  }, [
    actions,
    effectiveFeedPhase,
    feedActionActive,
    hasModelClips,
    playbackClip,
  ]);

  useEffect(
    () => () => {
      if (currentActionRef.current?.stop) {
        currentActionRef.current.stop();
      }

      currentActionRef.current = null;
      currentClipRef.current = "";
      if (feedStartTimerRef.current) {
        window.clearTimeout(feedStartTimerRef.current);
        feedStartTimerRef.current = 0;
      }
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
Object.values(DOG_MODEL_PATH_BY_STAGE).forEach((modelPath) => {
  useGLTF.preload(modelPath);
});

export default Dog3D;
