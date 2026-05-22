/* eslint-disable react/no-unknown-property */
import { Suspense, useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, Environment } from "@react-three/drei";

import JackRussellModel from "@/components/dog/three/JackRussellModel.jsx";

function HeroCamera() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0.08, 1.05, 4.6);
    camera.lookAt(0, 0.9, 0);
    camera.updateProjectionMatrix();
  }, [camera]);

  return null;
}

function PreviewScene({ currentAction, setActionNames, reduceMotion, timeOfDay, weather }) {
  return (
    <>
      <color attach="background" args={["#07111f"]} />
      <Environment preset="city" blur={0} background />
      <HeroCamera />

      <Suspense fallback={null}>
        <JackRussellModel
          autoCenter
          animationName={currentAction}
          animationSpeed={0.9}
          debugAnimations
          onAnimationsLoaded={setActionNames}
          scale={2.85}
          position={[0, -0.82, 0]}
          rotation={[0, Math.PI * 0.02, 0]}
        />
      </Suspense>

      <ContactShadows
        position={[0, -0.9, 0]}
        opacity={0.52}
        scale={5.6}
        blur={2.6}
        far={2.4}
      />
    </>
  );
}

export default function HeroDog3D({
  className = "",
  animationName = "Idle_1",
  title = "FIREBALL PREVIEW",
  subtitle = "Lively, stubborn, and ready for the yard.",
  badge = "PUPPY STAGE",
}) {
  const [currentAction, setCurrentAction] = useState(animationName);
  const [actionNames, setActionNames] = useState([]);

  const availableActions = useMemo(() => {
    if (!actionNames?.length) return [animationName];
    return actionNames.slice(0, 6);
  }, [actionNames, animationName]);

  return (
    <section
      className={[
        "mx-auto flex max-w-[480px] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/95 shadow-2xl shadow-cyan-950/40",
        className,
      ].join(" ")}
      style={{ minHeight: "100dvh", maxHeight: "100dvh" }}
    >
      <div className="relative h-[65%] min-h-[320px] w-full">
        <Canvas
          shadows
          dpr={[1, 1.5]}
          camera={{ position: [0, 1.18, 4.05], fov: 34, near: 0.1, far: 100 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
            toneMapping: THREE.ACESFilmicToneMapping,
            outputColorSpace: THREE.SRGBColorSpace,
          }}
        >
          <PreviewScene
            currentAction={currentAction}
            setActionNames={setActionNames}
            reduceMotion={false}
            timeOfDay={"day"}
            weather={"sunny"}
          />
        </Canvas>
      </div>

      <div className="flex h-[35%] min-h-[220px] flex-col gap-4 border-t border-emerald-300/20 bg-black/30 px-4 py-4 backdrop-blur-[12px]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-emerald-200">
              Action drawer
            </p>
            <h2 className="mt-2 text-lg font-black uppercase tracking-[0.08em] text-white">
              Tap an animation
            </h2>
          </div>
          <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-emerald-100">
            {badge}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {availableActions.map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => setCurrentAction(action)}
              className={
                "rounded-2xl border px-3 py-2 text-xs font-black uppercase tracking-[0.18em] transition " +
                (action === currentAction
                  ? "border-emerald-300 bg-emerald-300/15 text-emerald-100"
                  : "border-white/10 bg-white/5 text-zinc-200 hover:border-emerald-300/50 hover:bg-emerald-300/10")
              }
            >
              {action.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        <div className="rounded-[1.35rem] border border-white/10 bg-slate-950/80 p-3 text-sm leading-6 text-zinc-300">
          {subtitle}
        </div>
      </div>
    </section>
  );
}
