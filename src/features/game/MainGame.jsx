// src/features/game/MainGame.jsx

import { useDispatch, useSelector } from "react-redux";
import DogPixiView from "@/components/DogPixiView.jsx";
import EnvironmentScene from "@/features/game/EnvironmentScene.jsx";
import { selectSettings } from "@/redux/settingsSlice.js";
import {
  feed,
  play,
  petDog,
  bathe,
  goPotty,
  trainObedience,
} from "@/redux/dogSlice.js";
import { selectDog } from "@/redux/dogSlice.js";
import { selectDogRenderModel } from "@/features/game/dogSelectors.js";

function toNightBucket(timeOfDay) {
  const key = String(timeOfDay || "").toLowerCase();
  return key === "night" || key === "evening" ? "night" : "day";
}

export default function MainGame({ scene }) {
  const dispatch = useDispatch();
  const dog = useSelector(selectDog);
  const settings = useSelector(selectSettings);
  const renderModel = useSelector(selectDogRenderModel);

  const seasonMode = settings?.seasonMode || "auto";
  const reduceMotion = settings?.reduceMotion === "on";
  const reduceTransparency = settings?.reduceTransparency === true;

  const activeAnim = renderModel?.anim || "idle";

  return (
    <div className="relative min-h-dvh">
      <EnvironmentScene
        season={seasonMode}
        timeOfDay={toNightBucket(scene?.timeOfDay)}
        weather={scene?.weatherKey || "clear"}
        reduceMotion={reduceMotion}
        reduceTransparency={reduceTransparency}
      />

      <div className="relative z-20 mx-auto w-full max-w-6xl px-4 py-6">
        <div className="rounded-3xl border border-white/10 bg-black/35 p-4 backdrop-blur-md">
          <div className="text-xs uppercase tracking-[0.22em] text-zinc-300/80">
            {scene?.label || "Backyard"} · {scene?.timeOfDay || "Day"} ·{" "}
            {scene?.weather || "Clear"}
          </div>
          <div className="mt-2 text-xl font-extrabold text-emerald-200">
            {dog?.name || "Your pup"}
          </div>

          <div className="mt-4 flex items-center justify-center">
            <DogPixiView
              stage={renderModel?.stage}
              condition={renderModel?.condition}
              anim={activeAnim}
              width={420}
              height={320}
              scale={2.25}
            />
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-5">
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
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-white/15 bg-black/35 px-3 py-2 text-xs font-semibold text-zinc-100 transition hover:bg-black/50"
    >
      {label}
    </button>
  );
}
