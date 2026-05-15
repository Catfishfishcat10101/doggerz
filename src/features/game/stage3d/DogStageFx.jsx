/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending } from "three";

const DIG_PARTICLE_COUNT = 24;
const FIREFLY_COUNT = 20;

function DigParticles({ active = false, origin = [0, -1.5, 0.18] }) {
  const pointsRef = useRef(null);
  const velocitiesRef = useRef(new Float32Array(DIG_PARTICLE_COUNT * 3));
  const positions = useMemo(() => {
    const next = new Float32Array(DIG_PARTICLE_COUNT * 3);
    for (let i = 0; i < DIG_PARTICLE_COUNT; i += 1) {
      next[i * 3 + 1] = -3;
    }
    return next;
  }, []);

  useFrame((_, delta) => {
    const points = pointsRef.current;
    if (!points) return;

    const attr = points.geometry.attributes.position;
    const velocity = velocitiesRef.current;

    for (let i = 0; i < DIG_PARTICLE_COUNT; i += 1) {
      const x = i * 3;
      const y = x + 1;
      const z = x + 2;

      if (active) {
        if (attr.array[y] < origin[1] - 0.18) {
          attr.array[x] = origin[0] + (Math.random() - 0.5) * 0.18;
          attr.array[y] = origin[1];
          attr.array[z] = origin[2] + (Math.random() - 0.5) * 0.1;
          velocity[x] = (Math.random() - 0.5) * 0.08;
          velocity[y] = 0.06 + Math.random() * 0.12;
          velocity[z] = 0.04 + Math.random() * 0.11;
        }

        attr.array[x] += velocity[x];
        attr.array[y] += velocity[y];
        attr.array[z] += velocity[z];
        velocity[y] -= delta * 1.15;
      } else if (attr.array[y] > -3) {
        attr.array[y] -= delta * 4.5;
      }
    }

    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={DIG_PARTICLE_COUNT}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#5a4635"
        size={0.045}
        sizeAttenuation
        transparent
        opacity={0.68}
      />
    </points>
  );
}

function Fireflies({ active = false }) {
  const pointsRef = useRef(null);
  const { positions, phases } = useMemo(() => {
    const nextPositions = new Float32Array(FIREFLY_COUNT * 3);
    const nextPhases = new Float32Array(FIREFLY_COUNT);

    for (let i = 0; i < FIREFLY_COUNT; i += 1) {
      nextPositions[i * 3] = (Math.random() - 0.5) * 6.8;
      nextPositions[i * 3 + 1] = -0.85 + Math.random() * 1.9;
      nextPositions[i * 3 + 2] = -2.4 + Math.random() * 3.8;
      nextPhases[i] = Math.random() * Math.PI * 2;
    }

    return { positions: nextPositions, phases: nextPhases };
  }, []);

  useFrame((state) => {
    const points = pointsRef.current;
    if (!points) return;

    const t = state.clock.elapsedTime;
    const attr = points.geometry.attributes.position;

    for (let i = 0; i < FIREFLY_COUNT; i += 1) {
      attr.array[i * 3] += Math.sin(t * 0.5 + phases[i]) * 0.0025;
      attr.array[i * 3 + 1] += Math.cos(t * 0.8 + phases[i]) * 0.0018;
      attr.array[i * 3 + 2] += Math.sin(t * 0.34 + phases[i]) * 0.0025;
    }

    attr.needsUpdate = true;
    points.material.opacity = active ? Math.sin(t * 2) * 0.3 + 0.48 : 0;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={FIREFLY_COUNT}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#b7f46a"
        size={0.1}
        sizeAttenuation
        transparent
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function normalizeAction(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function isDigAction(value = "") {
  const action = normalizeAction(value);
  return action.includes("dig") || action.includes("scratch");
}

export default function DogStageFx({
  scene = null,
  dogView = null,
  lighting = null,
}) {
  const reduceMotion = Boolean(dogView?.reduceMotion || dogView?.paused);
  const lastAction = scene?.lastAction || dogView?.dog?.lastAction;
  const requestedAction = dogView?.requestedAction;
  const actionAt = Number(scene?.lastCareResponse?.createdAt || 0);
  const recentlyActed = actionAt > 0 && Date.now() - actionAt < 2800;
  const activeDig =
    !reduceMotion &&
    (isDigAction(requestedAction) || (recentlyActed && isDigAction(lastAction)));

  return (
    <>
      <DigParticles active={activeDig} />
      <Fireflies active={!reduceMotion && Boolean(lighting?.isNight)} />
    </>
  );
}
