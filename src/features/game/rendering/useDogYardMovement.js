// src/features/game/rendering/useDogYardMovement.js
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";

const YARD_BOUNDS = Object.freeze({
  minX: -2.15,
  maxX: 2.05,
  minZ: -1.35,
  maxZ: 0.92,
});

const IDLE_ACTIONS = new Set(["", "idle", "wag", "sniff", "wander", "walk"]);
const HOLD_ACTIONS = new Set(["sleep", "sit", "bark", "eat", "drink"]);

function clamp(value, min, max) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return min;
  return Math.max(min, Math.min(max, numeric));
}

function clampPosition(position = [0, -1, 0]) {
  return [
    clamp(position[0], YARD_BOUNDS.minX, YARD_BOUNDS.maxX),
    Number.isFinite(Number(position[1])) ? Number(position[1]) : -1,
    clamp(position[2], YARD_BOUNDS.minZ, YARD_BOUNDS.maxZ),
  ];
}

function normalizeAction(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function resolveFacingFromDelta(dx, dz, fallback = "") {
  if (Math.abs(dx) >= Math.abs(dz)) {
    if (dx < -0.025) return "left";
    if (dx > 0.025) return "right";
  }

  if (dz > 0.025) return "front";
  if (dz < -0.025) return "back";
  return fallback || "right";
}

function pickTarget(current, scene) {
  const weather = scene?.behavior?.weather || {};
  if (weather?.shelterSeeking) return [1.45, -1, -1.15];

  const rangeX = YARD_BOUNDS.maxX - YARD_BOUNDS.minX;
  const rangeZ = YARD_BOUNDS.maxZ - YARD_BOUNDS.minZ;
  const nextX = YARD_BOUNDS.minX + Math.random() * rangeX;
  const nextZ = YARD_BOUNDS.minZ + Math.random() * rangeZ;

  const dx = nextX - current[0];
  const dz = nextZ - current[2];
  if (Math.hypot(dx, dz) < 0.65) {
    return clampPosition([
      current[0] + (dx >= 0 ? -0.85 : 0.85),
      current[1],
      current[2] + (dz >= 0 ? -0.45 : 0.45),
    ]);
  }

  return clampPosition([nextX, current[1], nextZ]);
}

export function useDogYardMovement({
  scene = null,
  basePosition = [0, -1, 0],
  requestedAction = "",
  requestedFacing = "",
  paused = false,
  reduceMotion = false,
  ghost = false,
} = {}) {
  const initialPosition = useMemo(() => clampPosition(basePosition), [basePosition]);
  const [view, setView] = useState(() => ({
    position: initialPosition,
    facing: requestedFacing || "right",
    requestedAction,
    moving: false,
  }));

  const stateRef = useRef({
    position: initialPosition,
    target: initialPosition,
    facing: requestedFacing || "right",
    nextTargetAt: 0,
    moving: false,
  });

  useEffect(() => {
    const next = clampPosition(basePosition);
    stateRef.current.position = next;
    stateRef.current.target = next;
    setView((current) => ({
      ...current,
      position: next,
      facing: requestedFacing || current.facing || "right",
      requestedAction,
      moving: false,
    }));
  }, [basePosition, requestedAction, requestedFacing]);

  useFrame((frameState, delta) => {
    const actionKey = normalizeAction(requestedAction);
    const shouldHold =
      ghost ||
      paused ||
      reduceMotion ||
      HOLD_ACTIONS.has(actionKey) ||
      (!IDLE_ACTIONS.has(actionKey) && Boolean(actionKey));

    const state = stateRef.current;
    if (shouldHold) {
      state.moving = false;
      state.facing = requestedFacing || state.facing || "right";
      setView((current) =>
        current.moving ||
        current.requestedAction !== requestedAction ||
        current.facing !== state.facing
          ? {
              position: state.position,
              facing: state.facing,
              requestedAction,
              moving: false,
            }
          : current
      );
      return;
    }

    const now = frameState.clock.getElapsedTime();
    if (now >= state.nextTargetAt) {
      state.target = pickTarget(state.position, scene);
      state.nextTargetAt = now + 3.2 + Math.random() * 3.4;
    }

    const dx = state.target[0] - state.position[0];
    const dz = state.target[2] - state.position[2];
    const distance = Math.hypot(dx, dz);

    if (distance < 0.035) {
      state.moving = false;
      state.position = clampPosition(state.target);
    } else {
      const speed = clamp(scene?.movementSpeed, 0.24, 0.72);
      const step = Math.min(distance, speed * Math.max(0, delta));
      state.position = clampPosition([
        state.position[0] + (dx / distance) * step,
        state.position[1],
        state.position[2] + (dz / distance) * step,
      ]);
      state.facing = resolveFacingFromDelta(dx, dz, state.facing);
      state.moving = true;
    }

    setView((current) => {
      const nextAction = state.moving ? "walk" : requestedAction || "idle";
      const moved =
        Math.abs(current.position[0] - state.position[0]) > 0.004 ||
        Math.abs(current.position[2] - state.position[2]) > 0.004;

      if (
        !moved &&
        current.facing === state.facing &&
        current.requestedAction === nextAction &&
        current.moving === state.moving
      ) {
        return current;
      }

      return {
        position: state.position,
        facing: state.facing,
        requestedAction: nextAction,
        moving: state.moving,
      };
    });
  });

  return view;
}

