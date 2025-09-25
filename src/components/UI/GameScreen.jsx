// src/components/UI/GameScreen.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import useDogEngine from "@/hooks/useDogEngine";
import Dog from "@/components/Features/Dog";
import Training from "@/components/Features/Training";
import { selectDog, tickRealTime } from "@/redux/dogSlice";

export default function GameScreen() {
  useDogEngine(); // ticks, audio

  const d = useSelector(selectDog);
  const dispatch = useDispatch();

  // Force a tick when the tab regains focus (keeps age stable)
  useEffect(() => {
    const f = () => dispatch(tickRealTime(Date.now()));
    document.addEventListener("visibilitychange", f);
    return () => document.removeEventListener("visibilitychange", f);
  }, [dispatch]);

  return (
    <div className="relative min-h-[calc(100dvh-64px)] overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-black text-slate-100">
      {/* Ground/sky */}
      <div className="absolute bottom-0 left-0 right-0 h-[22%] bg-gradient-to-t from-emerald-900/60 via-emerald-800/20 to-transparent" />

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 pt-8 pb-24 lg:grid-cols-5">
        {/* World viewport */}
        <div className="relative col-span-3 rounded-2xl border border-white/10 bg-gradient-to-b from-sky-900/20 to-sky-950/30 p-2 backdrop-blur overflow-hidden">
          <div className="absolute top-[28%] left-0 right-0 h-px bg-white/10" />
          <Dog worldW={640} worldH={360} />
        </div>

        {/* Right rail */}
        <div className="col-span-2 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-1 text-sm text-slate-300">Name</div>
            <div className="text-2xl font-bold">{d.name ?? "Your Pup"}</div>
            <div className="mt-2 text-sm text-slate-300">
              Stage: <span className="font-semibold text-slate-100">{d.stage}</span>
            </div>
            <div className="text-sm text-slate-300">
              Age: <span className="font-semibold text-slate-100">{Math.floor(d.ageDays)} days</span>
            </div>
            <div className="text-sm text-slate-300">
              Level: <span className="font-semibold text-slate-100">{d.level}</span>
            </div>
          </div>
          <Training />
        </div>
      </div>
    </div>
  );
}