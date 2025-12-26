import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Html, useAnimations, useGLTF } from "@react-three/drei";
import * as THREE from "three";

function pickClip(clips = [], wants = []) {
  const lc = (s) => String(s || "").toLowerCase();
  const names = clips.map((c) => ({ raw: c.name, lc: lc(c.name) }));
  for (const w of wants) {
    const wl = lc(w);
    const hit = names.find((n) => n.lc.includes(wl));
    if (hit) return hit.raw;
  }
  return clips[0]?.name || null;
}

function DogModel({ url, mood = "neutral", mode = "idle", direction = "right", onPet }) {
  const group = useRef();
  const [loadError, setLoadError] = useState("");

  let scene = null;
  let animations = [];

  try {
    const gltf = useGLTF(url);
    scene = gltf.scene;
    animations = gltf.animations || [];
  } catch (e) {
    const msg = String(e?.message || e || "Failed to load dog.glb");
    if (!loadError) setTimeout(() => setLoadError(msg), 0);
  }

  const { actions, names } = useAnimations(animations, group);

  const moodWants = useMemo(() => {
    const base = {
      neutral: ["idle", "stand", "breath"],
      happy: ["happy", "tail", "idle", "stand"],
      tired: ["tired", "sleep", "idle"],
      sick: ["sick", "sad", "idle"],
      sad: ["sad", "idle"],
    };
    return base[mood] || base.neutral;
  }, [mood]);

  const idleName = useMemo(() => pickClip(animations, moodWants), [animations, moodWants]);
  const walkName = useMemo(() => pickClip(animations, ["walk", "run", "trot", "move"]), [animations]);
  const petName = useMemo(() => pickClip(animations, ["pet", "react", "bark", "wag", "look", "sit"]), [animations]);

  const activeName = useMemo(() => {
    if (mode === "walk" && walkName) return walkName;
    return idleName;
  }, [mode, walkName, idleName]);

  useEffect(() => {
    if (!actions) return;
    const next = actions[activeName];
    if (!next) return;

    Object.entries(actions).forEach(([k, a]) => {
      if (!a) return;
      if (k !== activeName) a.fadeOut(0.25);
    });

    next.reset().fadeIn(0.25).play();

    const speed =
      mood === "happy" ? 1.12 :
      mood === "tired" ? 0.80 :
      mood === "sick"  ? 0.75 :
      1.0;

    next.timeScale = speed;

    return () => next.fadeOut(0.15);
  }, [actions, activeName, mood]);

  useEffect(() => {
    if (!group.current) return;
    group.current.rotation.y = direction === "left" ? Math.PI : 0;
  }, [direction]);

  const handlePet = () => {
    if (typeof onPet === "function") onPet();
    if (!actions || !petName || !actions[petName]) return;

    const a = actions[petName];
    a.reset();
    a.setLoop(THREE.LoopOnce, 1);
    a.clampWhenFinished = true;
    a.fadeIn(0.08).play();
    window.setTimeout(() => a.fadeOut(0.15), 700);
  };

  useEffect(() => {
    if (!scene) return;
    scene.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        if (o.material) o.material.side = THREE.FrontSide;
      }
    });
  }, [scene]);

  if (!scene) {
    return (
      <Html center>
        <div style={{
          padding: "10px 12px",
          borderRadius: 12,
          background: "rgba(0,0,0,0.70)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "#e5e7eb",
          fontSize: 12,
          maxWidth: 320,
          textAlign: "center"
        }}>
          Missing 3D dog asset.<br />
          Put an animated model at <b>/public/models/dog.glb</b>.
          <div style={{ marginTop: 8, opacity: 0.85, fontSize: 11 }}>
            {loadError ? loadError : "No file found."}
          </div>
        </div>
      </Html>
    );
  }

  return (
    <group ref={group} onPointerDown={handlePet}>
      <primitive object={scene} />
      {(!names || names.length === 0) && (
        <Html center>
          <div style={{
            padding: "10px 12px",
            borderRadius: 12,
            background: "rgba(0,0,0,0.65)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#e5e7eb",
            fontSize: 12,
            maxWidth: 320,
            textAlign: "center"
          }}>
            dog.glb loaded but has no animations.<br />
            Add Idle/Walk clips to match the reference.
          </div>
        </Html>
      )}
    </group>
  );
}

export default function ThreeDog({
  url = "/models/dog.glb",
  mood = "neutral",
  mode = "idle",
  direction = "right",
  height = 420,
  width = 420,
  onPet,
}) {
  return (
    <div style={{ width, height, position: "relative" }}>
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 1.1, 2.6], fov: 38 }}>
        <ambientLight intensity={0.35} />
        <directionalLight
          position={[3, 5, 2]}
          intensity={1.1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <spotLight position={[-3, 6, 3]} intensity={0.55} angle={0.35} penumbra={0.6} />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
          <planeGeometry args={[10, 10]} />
          <shadowMaterial opacity={0.25} />
        </mesh>

        <React.Suspense fallback={null}>
          <group position={[0, -0.05, 0]} scale={[1, 1, 1]}>
            <DogModel url={url} mood={mood} mode={mode} direction={direction} onPet={onPet} />
          </group>
          <Environment preset="sunset" />
        </React.Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload("/models/dog.glb");
