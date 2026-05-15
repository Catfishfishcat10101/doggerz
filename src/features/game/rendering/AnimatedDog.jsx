// src/features/game/rendering/AnimatedDog.jsx
import { useMemo } from "react";
import DogRenderer from "./DogRenderer.jsx";
import { useDogAnimationController } from "./useDogAnimationController.js";

const MODEL_CLIP_BY_ACTION = Object.freeze({
  idle: "Idle",
  idle_resting: "Idle_Resting",
  puppy_idle_pack: "Idle",
  golden_years_idle: "Idle",
  sit: "Sit",
  gate_watch: "GateWatch",
  walk: "Walk",
  walk_left: "Walk_Left",
  walk_right: "Walk_Right",
  turn_walk_left: "Turn_Walk_Left",
  turn_walk_right: "Turn_Walk_Right",
  bark: "Bark",
  sleep: "Sleep",
  light_sleep: "Light_Sleep",
  deep_rem_sleep: "Deep_Rem_Sleep",
  puppy_sleeping_pack: "Sleep",
  golden_years_sleeping: "Sleep",
  lethargic_lay: "Lethargic_Lay",
  wag: "Wag",
  paw: "Paw",
  eat: "Eat",
  drink: "Drink",
  scratch: "Scratch",
  sniff: "Sniff",
  dig: "Scratch",
  jump: "Jump",
  fetch: "Fetch",
  beg: "Beg",
  shake: "Shake",
  highfive: "HighFive",
  high_five: "HighFive",
  dance: "Dance",
  lay_down: "Lay_Down",
});

function normalizeScale(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return 1;
  return Math.max(0.72, Math.min(1.28, numeric));
}

function resolveFacingRotation(facing = "") {
  const key = String(facing || "")
    .trim()
    .toLowerCase();
  if (key === "left") return [0, Math.PI * -0.16, 0];
  if (key === "right") return [0, Math.PI * 0.16, 0];
  if (key === "front") return [0, 0, 0];
  if (key === "back") return [0, Math.PI, 0];
  return [0, Math.PI * 0.15, 0];
}

export default function AnimatedDog({
  scene = null,
  dog = null,
  brainState = null,
  renderModel = null,
  requestedAction = "",
  requestedFacing = "",
  paused = false,
  reduceMotion = false,
  scale = 1,
  position,
  ghost = false,
}) {
  const animation = useDogAnimationController({
    dog,
    brainState,
    renderModel,
    requestedAction,
    requestedFacing,
  });

  const resolved = useMemo(() => {
    const actionKey = String(animation?.resolvedAction || "idle")
      .trim()
      .toLowerCase();
    const clip = MODEL_CLIP_BY_ACTION[actionKey] || "Idle";
    const facing =
      animation?.preferredFacing ||
      requestedFacing ||
      brainState?.facing ||
      dog?.facing ||
      renderModel?.facing ||
      "";

    return {
      action: actionKey,
      clip,
      facing,
      rotation: resolveFacingRotation(facing),
      scale: normalizeScale(scale || renderModel?.scaleMultiplier),
      animationClip: animation?.animationClip || null,
      resolution: animation?.resolution || null,
    };
  }, [
    animation?.animationClip,
    animation?.preferredFacing,
    animation?.resolution,
    animation?.resolvedAction,
    brainState?.facing,
    dog?.facing,
    renderModel?.facing,
    renderModel?.scaleMultiplier,
    requestedFacing,
    scale,
  ]);

  return (
    <DogRenderer
      scene={scene}
      dog={dog}
      action={resolved.action}
      clip={resolved.clip}
      facing={resolved.facing}
      animationClip={resolved.animationClip}
      resolution={resolved.resolution}
      position={position}
      rotation={resolved.rotation}
      scale={resolved.scale}
      paused={paused}
      reduceMotion={reduceMotion}
      ghost={ghost}
    />
  );
}
