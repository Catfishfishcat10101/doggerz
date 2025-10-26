import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import BackgroundScene from "@/components/Features/BackgroundScene.jsx";
import DogAIEngine from "@/components/Features/DogAIEngine.jsx";
import NeedsHUD from "@/components/Features/NeedsHUD.jsx";
import DogStage from "@/components/game/DogStage.jsx";
import NamePupModal from "@/components/game/NamePupModal.jsx";
import { selectUser } from "@/redux/userSlice.js";
import { selectDog, takeOutside } from "@/redux/dogSlice.js";
import { ensureDogForUser } from "@/services/dogService.js";
import { WORLD } from "@/config/game";

export default function Game() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const dog = useSelector(selectDog);

  const [nameOpen, setNameOpen] = useState(false);
  const [hint, setHint] = useState("");

  // On mount: ensure user has a dog
  useEffect(() => {
    let live = true;
    (async () => {
      if (!user?.uid) return;
      const d = await ensureDogForUser(user.uid);
      if (!live) return;
      if (!d?.name) setNameOpen(true);
    })();
    return () => {
      live = false;
    };
  }, [user?.uid]);

  // Yard detection
  const WORLD_W = 640;
  const yardX = WORLD_W * (1 - WORLD.YARD_FRACTION);

  function onPotty() {
    if ((dog?.pos?.x ?? 0) >= yardX) {
      dispatch(takeOutside());
      setHint("Nice! Going outside boosts happiness and XP.");
      clearHintSoon();
    } else {
      setHint("Your pup will go when it wanders into the yard on the right.");
      clearHintSoon();
    }
  }

  function clearHintSoon(ms = 2600) {
    window.setTimeout(() => setHint(""), ms);
  }

  return (
    <div className="container mx-auto px-4 py-6 grid gap-6">
      {/* Driver */}
      <DogAIEngine worldW={WORLD_W} worldH={360} debug={false} />

      {/* Visual Scene */}
      <BackgroundScene skin="default" accent="#10b981">
        <DogStage />
      </BackgroundScene>

      {/* Controls */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onPotty}
            disabled={!dog?.needToGo}
            className={`px-4 py-2 rounded-xl font-semibold ${
              dog?.needToGo
                ? "bg-emerald-400/90 text-slate-900 hover:bg-emerald-300"
                : "bg-white/10 text-white/50 cursor-not-allowed"
            }`}
          >
            Go Potty 🚽
          </button>

          {dog?.needToGo ? (
            <span className="text-sm text-amber-300/90">
              Pup will handle it when it’s in the yard.
            </span>
          ) : (
            <span className="text-sm text-white/60">All good for now.</span>
          )}
        </div>

        {hint && <div className="mt-2 text-sm text-white/80">{hint}</div>}
      </div>

      {/* HUD */}
      <NeedsHUD />

      {/* Naming modal */}
      {user?.uid && !dog?.name && (
        <NamePupModal open={nameOpen} onClose={() => setNameOpen(false)} />
      )}

      {/* Footer */}
      <footer className="mt-8 text-center text-xs text-white/30">
        All rights reserved. Catfish™ 2025.
      </footer>
    </div>
  );
}
