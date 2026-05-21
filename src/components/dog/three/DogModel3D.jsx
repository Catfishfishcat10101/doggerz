import { useEffect, useMemo, useRef } from "react";
import { useAnimations, useGLTF } from "@react-three/drei";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";

export const DOG_MODEL_PATH = "/assets/models/dog/jackrussell-doggerz.glb";

const ACTION_ALIASES = {
  idle: ["idle", "stand", "standing", "breath", "breathing"],
  walk: ["walk", "walking"],
  run: ["run", "running"],
  bark: ["bark", "barking"],
  sit: ["sit", "sitting"],
  sleep: ["sleep", "sleeping", "lay", "laying", "rest"],
  dig: ["dig", "digging"],
  wag: ["wag", "tailwag", "happy"],
  scratch: ["scratch", "scratching"],
};

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function pickClipName(requestedAction, clipNames) {
  if (!clipNames.length) return null;

  const requested = normalize(requestedAction || "idle");
  const aliases = ACTION_ALIASES[requestedAction] || [requestedAction];

  for (const alias of aliases) {
    const exact = clipNames.find((name) => normalize(name) === normalize(alias));
    if (exact) return exact;
  }

  for (const alias of aliases) {
    const fuzzy = clipNames.find((name) =>
      normalize(name).includes(normalize(alias))
    );
    if (fuzzy) return fuzzy;
  }

  const requestedFuzzy = clipNames.find((name) =>
    normalize(name).includes(requested)
  );

  if (requestedFuzzy) return requestedFuzzy;

  const idleFallback = clipNames.find((name) =>
    normalize(name).includes("idle")
  );

  return idleFallback || clipNames[0];
}

function resolveAction({
  action = "idle",
  actionOverride = null,
  mood = "neutral",
  isSleeping = false,
  energy = 50,
  happiness = 50,
}) {
  if (actionOverride) return actionOverride;
  if (isSleeping || Number(energy) <= 8) return "sleep";

  const moodKey = normalize(mood);

  if (moodKey.includes("sleep")) return "sleep";
  if (moodKey.includes("dirty")) return "scratch";
  if (moodKey.includes("happy") && Number(happiness) >= 70) return "wag";
  if (moodKey.includes("excited")) return "wag";

  return action || "idle";
}

export default function DogModel3D({
  action = "idle",
  actionOverride = null,
  mood = "neutral",
  isSleeping = false,
  energy = 50,
  happiness = 50,
  scale = 1.25,
  position = [0, -0.95, 0],
  rotation = [0, Math.PI, 0],
}) {
  const groupRef = useRef(null);
  const activeActionRef = useRef(null);

  const { scene, animations } = useGLTF(DOG_MODEL_PATH);
  const clonedScene = useMemo(() => clone(scene), [scene]);

  const { actions, names } = useAnimations(animations, groupRef);

  const resolvedAction = useMemo(
    () =>
      resolveAction({
        action,
        actionOverride,
        mood,
        isSleeping,
        energy,
        happiness,
      }),
    [action, actionOverride, mood, isSleeping, energy, happiness]
  );

  const clipName = useMemo(
    () => pickClipName(resolvedAction, names),
    [resolvedAction, names]
  );

  useEffect(() => {
    clonedScene.traverse((object) => {
      object.frustumCulled = false;

      if (object.isMesh || object.isSkinnedMesh) {
        object.castShadow = true;
        object.receiveShadow = true;

        if (object.material) {
          object.material.side = THREE.FrontSide;
          object.material.needsUpdate = true;
        }
      }
    });
  }, [clonedScene]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    console.info("[Doggerz] Jack Russell GLB animation clips:", names);
  }, [names]);

  useEffect(() => {
    if (!clipName || !actions?.[clipName]) return;

    const nextAction = actions[clipName];
    const previousAction = activeActionRef.current;

    nextAction.reset();
    nextAction.enabled = true;
    nextAction.setLoop(THREE.LoopRepeat, Infinity);
    nextAction.clampWhenFinished = false;

    if (previousAction && previousAction !== nextAction) {
      previousAction.fadeOut(0.2);
    }

    nextAction.fadeIn(0.2).play();
    activeActionRef.current = nextAction;

    return () => {
      nextAction.fadeOut(0.15);
    };
  }, [actions, clipName]);

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
      dispose={null}
    >
      <primitive object={clonedScene} />
    </group>
  );
}

useGLTF.preload(DOG_MODEL_PATH);
