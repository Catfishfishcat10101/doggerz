// src/features/game/MainGame.jsx

import { useCallback, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DogPixiView from "@/components/dog/DogPixiView.jsx";
import DogToy from "@/components/ui/DogToy.jsx";
import EnvironmentScene from "@/features/game/EnvironmentScene.jsx";
import { selectSettings } from "@/redux/settingsSlice.js";
import {
  bathe,
  feed,
  goPotty,
  petDog,
  play,
  selectDog,
  trainObedience,
} from "@/redux/dogSlice.js";
import { selectDogRenderModel } from "@/features/game/dogSelectors.js";

const ACTION_META = Object.freeze({
  Feed: {
    icon: "🍖",
    hint: "Refill hunger",
    card: "from-doggerz-leaf/35 to-doggerz-treat/20",
    edge: "border-doggerz-leaf/45",
  },
  Play: {
    icon: "🎾",
    hint: "Boost happiness",
    card: "from-doggerz-leaf/30 to-doggerz-sky/20",
    edge: "border-doggerz-sky/45",
  },
  Pet: {
    icon: "🖐️",
    hint: "Build affection",
    card: "from-doggerz-leaf/30 to-doggerz-neonSoft/20",
    edge: "border-doggerz-leaf/45",
  },
  Bath: {
    icon: "🧼",
    hint: "Clean up dirt",
    card: "from-doggerz-paw/30 to-doggerz-sky/20",
    edge: "border-doggerz-paw/45",
  },
  Potty: {
    icon: "🌿",
    hint: "Prevent accidents",
    card: "from-doggerz-leaf/35 to-doggerz-neon/20",
    edge: "border-doggerz-leaf/45",
  },
  Train: {
    icon: "🎯",
    hint: "Level skills",
    card: "from-doggerz-neonSoft/30 to-doggerz-leaf/25",
    edge: "border-doggerz-leaf/45",
  },
});

function toNightBucket(timeOfDay) {
  const key = String(timeOfDay || "").toLowerCase();
  return key === "night" || key === "evening" ? "night" : "day";
}

export default function MainGame({ scene }) {
  const dispatch = useDispatch();
  const dog = useSelector(selectDog);
  const settings = useSelector(selectSettings);
  const renderModel = useSelector(selectDogRenderModel);
  const lastToySqueakAtRef = useRef(0);
  const dogViewportRef = useRef(null);
  const [attentionTarget, setAttentionTarget] = useState(null);

  const seasonMode = settings?.seasonMode || "auto";
  const reduceMotion = settings?.reduceMotion === "on";
  const reduceTransparency = settings?.reduceTransparency === true;

  const activeAnim = renderModel?.anim || "idle";
  const holes = Array.isArray(dog?.yard?.holes) ? dog.yard.holes : [];

  const handleToySqueak = useCallback(
    (point) => {
      const now = Date.now();
      if (now - lastToySqueakAtRef.current < 600) return;
      lastToySqueakAtRef.current = now;

      const rect = dogViewportRef.current?.getBoundingClientRect?.();
      const rawX = Number(point?.x);
      const rawY = Number(point?.y);
      if (rect && Number.isFinite(rawX) && Number.isFinite(rawY)) {
        const xNorm = Math.max(0, Math.min(1, (rawX - rect.left) / rect.width));
        const yNorm = Math.max(0, Math.min(1, (rawY - rect.top) / rect.height));
        setAttentionTarget({ xNorm, yNorm, at: now });
      }

      dispatch(play({ now, source: "toy" }));
    },
    [dispatch]
  );

  return (
    <div className="relative min-h-dvh">
      <EnvironmentScene
        season={seasonMode}
        timeOfDay={toNightBucket(scene?.timeOfDay)}
        weather={scene?.weatherKey || "clear"}
        reduceMotion={reduceMotion}
        reduceTransparency={reduceTransparency}
        holes={holes}
      />

      <div className="relative z-20 mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
        <div className="rounded-[28px] border border-doggerz-leaf/30 bg-black/55 p-4 shadow-[0_18px_48px_rgba(2,6,23,0.65)] backdrop-blur-md sm:p-6">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-doggerz-paw">
            <span className="rounded-full border border-doggerz-leaf/40 bg-doggerz-neon/15 px-3 py-1">
              {scene?.label || "Backyard"}
            </span>
            <span className="rounded-full border border-doggerz-leaf/40 bg-doggerz-neon/15 px-3 py-1">
              {scene?.timeOfDay || "Day"}
            </span>
            <span className="rounded-full border border-doggerz-leaf/40 bg-doggerz-neon/15 px-3 py-1">
              {scene?.weather || "Clear"}
            </span>
          </div>

          <div className="mt-3 text-2xl font-black tracking-tight text-doggerz-bone sm:text-3xl">
            {dog?.name || "Your pup"}
          </div>

          <div className="mt-4 rounded-3xl border border-doggerz-leaf/30 bg-black/45 px-2 py-4 sm:px-4">
            <div
              ref={dogViewportRef}
              className="relative flex items-center justify-center"
            >
              <DogPixiView
                stage={renderModel?.stage}
                condition={renderModel?.condition}
                anim={activeAnim}
                width={420}
                height={320}
                scale={2.25}
                attentionTarget={attentionTarget}
                bondValue={Number(dog?.bond?.value ?? 0)}
                dogIsSleeping={Boolean(renderModel?.isSleeping)}
              />
              <DogToy
                onSqueak={handleToySqueak}
                className="left-4 top-4 z-30 h-14 w-14"
              />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            <ActionButton
              label="Feed"
              onClick={() => dispatch(feed({ now: Date.now() }))}
            />
            <ActionButton
              label="Play"
              onClick={() => dispatch(play({ now: Date.now() }))}
            />
            <ActionButton
              label="Pet"
              onClick={() => dispatch(petDog({ now: Date.now() }))}
            />
            <ActionButton
              label="Bath"
              onClick={() => dispatch(bathe({ now: Date.now() }))}
            />
            <ActionButton
              label="Potty"
              onClick={() => dispatch(goPotty({ now: Date.now() }))}
            />
            <ActionButton
              label="Train"
              onClick={() =>
                dispatch(
                  trainObedience({
                    now: Date.now(),
                    commandId: "sit",
                    input: "button",
                  })
                )
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ label, onClick }) {
  const meta = ACTION_META[label] || ACTION_META.Play;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border px-3 py-3 text-left transition active:translate-y-[1px] active:scale-[0.99] ${meta.edge} bg-gradient-to-b ${meta.card} shadow-[0_10px_22px_rgba(2,6,23,0.25)] hover:brightness-110`}
    >
      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.3),transparent_55%)]" />
      <div className="relative flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-xl border border-white/20 bg-black/25 text-base">
          {meta.icon}
        </span>
        <span>
          <span className="block text-sm font-bold text-doggerz-bone">
            {label}
          </span>
          <span className="block text-[10px] uppercase tracking-[0.14em] text-doggerz-paw/75">
            {meta.hint}
          </span>
        </span>
      </div>
    </button>
  );
}
