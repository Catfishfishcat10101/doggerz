import { useMemo } from "react";

import {
  RAW_DOG_MODEL_CLIPS,
  getDogAnimationResolution,
  listDogAnimations,
} from "@/features/game/stage3d/dog/dogAnimationMap.js";

function compactSourceLabel(source = "") {
  if (source === "canonical") return "map";
  if (source === "raw") return "raw";
  return "fallback";
}

export default function DogAnimationDebugPanel({
  desiredClip = "",
  onDesiredClipChange,
}) {
  const rawClipNames = RAW_DOG_MODEL_CLIPS;
  const mappedAnimations = useMemo(
    () => listDogAnimations({ includeRaw: false, includeUnpolished: true }),
    []
  );
  const activeResolution = getDogAnimationResolution(
    desiredClip || "idle",
    rawClipNames
  );

  return (
    <aside className="pointer-events-auto absolute right-2 top-2 z-20 flex max-h-[calc(100%-1rem)] w-[min(360px,calc(100%-1rem))] flex-col overflow-hidden rounded-md border border-lime-300/40 bg-slate-950/88 text-[11px] text-slate-100 shadow-xl backdrop-blur">
      <div className="border-b border-white/10 px-3 py-2">
        <div className="text-xs font-black uppercase tracking-normal text-lime-200">
          Dog Animation Debug
        </div>
        <div className="mt-1 text-slate-300">
          desired: {desiredClip || "auto"} | resolved: {activeResolution.clip}
        </div>
        <div className="text-slate-400">
          source: {compactSourceLabel(activeResolution.source)}
          {activeResolution.fallback ? ` | fallback: ${activeResolution.fallback}` : ""}
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 gap-0 overflow-hidden">
        <section className="min-h-0 overflow-auto border-r border-white/10">
          <div className="sticky top-0 bg-slate-950 px-3 py-2 font-black uppercase text-lime-200">
            Mapped
          </div>
          {mappedAnimations.map((entry) => {
            const resolution = getDogAnimationResolution(entry.action, rawClipNames);
            const missing = resolution.missing.length > 0;

            return (
              <button
                key={entry.action}
                type="button"
                className="block w-full border-b border-white/5 px-3 py-2 text-left hover:bg-lime-300/10"
                onClick={() => onDesiredClipChange?.(entry.action)}
              >
                <span className="block font-bold text-slate-100">
                  {entry.action}
                </span>
                <span className="block text-slate-300">{resolution.clip}</span>
                <span className={missing ? "text-amber-200" : "text-slate-500"}>
                  {missing ? `missing: ${resolution.missing.join(", ")}` : "map"}
                </span>
              </button>
            );
          })}
        </section>

        <section className="min-h-0 overflow-auto">
          <div className="sticky top-0 bg-slate-950 px-3 py-2 font-black uppercase text-sky-200">
            Raw GLB
          </div>
          {rawClipNames.map((clipName) => {
            const resolution = getDogAnimationResolution(clipName, rawClipNames);

            return (
              <button
                key={clipName}
                type="button"
                className="block w-full border-b border-white/5 px-3 py-2 text-left hover:bg-sky-300/10"
                onClick={() => onDesiredClipChange?.(clipName)}
              >
                <span className="block font-bold text-slate-100">{clipName}</span>
                <span className="text-slate-500">
                  {compactSourceLabel(resolution.source)}
                </span>
              </button>
            );
          })}
        </section>
      </div>

      <button
        type="button"
        className="border-t border-white/10 px-3 py-2 text-left font-black uppercase text-slate-300 hover:bg-white/10"
        onClick={() => onDesiredClipChange?.("")}
      >
        Clear override
      </button>
    </aside>
  );
}
