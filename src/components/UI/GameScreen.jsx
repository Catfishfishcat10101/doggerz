import React from "react";
import useGameTick from "@/hooks/useGameTick";
import NeedsHUD from "@/components/Features/NeedsHUD.jsx";
import ActionsBar from "@/components/Features/ActionsBar.jsx";
import DailyQuests from "@/components/Features/DailyQuests.jsx";

export default function GameScreen() {
  useGameTick();
  return (
    <div className="mx-auto max-w-5xl p-6 grid md:grid-cols-[320px_1fr] gap-6">
      <div className="space-y-6">
        <NeedsHUD />
        <DailyQuests />
      </div>

      <div className="rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border border-white/10 min-h-[420px] p-4 flex flex-col justify-between">
        {/* TODO: plug your DogSprite here, for now a placeholder arena */}
        <div className="flex-1 grid place-items-center">
          <div className="size-24 bg-white/10 rounded-full grid place-items-center text-5xl select-none">🐶</div>
        </div>
        <div className="pt-4 border-t border-white/10">
          <ActionsBar />
        </div>
      </div>
    </div>
  );
}