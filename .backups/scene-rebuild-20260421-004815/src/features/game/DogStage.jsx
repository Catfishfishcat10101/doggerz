import { useMemo } from "react";
import DogMobileCanvas from "./rendering/DogMobileCanvas";

function getTimeMode() {
  const hour = new Date().getHours();
  return hour >= 19 || hour < 6;
}

export default function DogStage({
  dog,
  currentAction = "idle",
  mood = "content",
  weather = "clear",
  paused = false,
  reduceMotion = false,
  topOverlay,
  bottomOverlay,
  onOpenSettings,
  onOpenStats,
}) {
  const isNight = useMemo(() => getTimeMode(), []);

  return (
    <section className="relative h-full w-full overflow-hidden rounded-[28px] bg-slate-950">
      <div className="absolute inset-0 z-0">
        <DogMobileCanvas
          isNight={isNight}
          weather={weather}
          dog={dog}
          currentAction={currentAction}
          mood={mood}
          paused={paused}
          reduceMotion={reduceMotion}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 z-20">
        <div className="pointer-events-auto absolute left-0 right-0 top-0 p-3 sm:p-4">
          {topOverlay ?? (
            <div className="flex items-start justify-between gap-3">
              <div className="max-w-[75%] rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 backdrop-blur-md">
                <div className="text-sm font-semibold text-white">
                  {dog?.name || "Doggerz"}
                </div>
                <div className="mt-1 text-xs text-slate-300">
                  {mood === "content" ? "Comfortable right now." : mood}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenStats}
                  className="rounded-2xl border border-white/20 bg-slate-950/70 px-4 py-3 text-sm font-medium text-white backdrop-blur-md"
                >
                  ^
                </button>

                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="rounded-2xl border border-white/20 bg-slate-950/70 px-4 py-3 text-sm font-medium text-white backdrop-blur-md"
                >
                  ⚙
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="pointer-events-auto absolute right-3 top-28 sm:right-4 sm:top-32">
          <div className="rounded-full border border-white/20 bg-slate-950/70 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
            {isNight ? "Night" : "Day"}
          </div>
        </div>

        <div className="pointer-events-auto absolute bottom-0 left-0 right-0 p-3 sm:p-4">
          {bottomOverlay}
        </div>
      </div>
    </section>
  );
}
