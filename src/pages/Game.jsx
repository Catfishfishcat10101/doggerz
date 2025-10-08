// src/pages/Game.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import BackgroundScene from "@/components/Features/BackgroundScene.jsx";
import DogAIEngine from "@/components/Features/DogAIEngine.jsx";   // autonomous-only engine
import DogStage from "@/components/game/DogStage.jsx";             // view-only renderer
import NeedsHUD from "@/components/Features/NeedsHUD.jsx";

import NamePupModal from "@/components/UI/NamePupModal.jsx";
import { selectUser } from "@/redux/userSlice.js";
import { selectDog, takeOutside } from "@/redux/dogSlice.js";

import { ensureDogForUser } from "@/services/dogService.js";

export default function Game() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const dog  = useSelector(selectDog);

  const [nameOpen, setNameOpen] = useState(false);
  const [hint, setHint] = useState("");

  // Ensure a dog exists for the user; open naming modal if needed
  useEffect(() => {
    let live = true;
    (async () => {
      if (!user?.uid) return;
      const d = await ensureDogForUser(user.uid);
      if (!live) return;
      if (!d?.name) setNameOpen(true);
    })();
    return () => { live = false; };
  }, [user?.uid]);

  // ——— Potty flow (autonomous) ———
  // The AI uses a normalized world width; we mirror that here for a robust yard check.
  // Keep this in sync with <DogAIEngine worldW={...} /> below.
  const WORLD_W = 640;
  const YARD_FRACTION = 0.18; // right-most 18% is the yard
  const yardX = WORLD_W * (1 - YARD_FRACTION);

  function onPotty() {
    // If pup is already in the yard, let them go outside now.
    if ((dog?.pos?.x ?? 0) >= yardX) {
      dispatch(takeOutside());
      setHint("Nice! Going outside boosts happiness and XP.");
      clearHintSoon();
      return;
    }

    // Autonomy-first UX: we don't let the player drive the dog.
    // Instead, we inform them the pup will go when it wanders into the yard.
    setHint("Your pup will go when it wanders into the yard on the right.");
    clearHintSoon();
  }

  function clearHintSoon(ms = 2600) {
    window.setTimeout(() => setHint(""), ms);
  }

  return (
    <div className="container mx-auto px-4 py-6 grid gap-6">
      {/* Headless driver: mount once. The dog moves/acts on its own. */}
      <DogAIEngine worldW={WORLD_W} worldH={360} debug={false} />

      {/* Scene shell + autonomous stage */}
      <BackgroundScene skin="default" accent="#10b981">
        <DogStage />
      </BackgroundScene>

      {/* Controls/HUD row (player cannot move the dog) */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onPotty}
            disabled={!dog.needToGo}
            className={`px-4 py-2 rounded-xl font-semibold ${
              dog.needToGo
                ? "bg-emerald-400/90 text-slate-900 hover:bg-emerald-300"
                : "bg-white/10 text-white/50 cursor-not-allowed"
            }`}
          >
            Go Potty 🚽
          </button>

          {dog.needToGo ? (
            <span className="text-sm text-amber-300/90">
              Pup will handle it when it’s in the yard.
            </span>
          ) : (
            <span className="text-sm text-white/60">All good for now.</span>
          )}
        </div>

        {hint && <div className="mt-2 text-sm text-white/80">{hint}</div>}
      </div>

      {/* Needs overlay (or any other meta UI you already have) */}
      <NeedsHUD />

      {/* Name-onboarding */}
      {user?.uid && !dog?.name && (
        <NamePupModal open={nameOpen} onClose={() => setNameOpen(false)} />
      )}
    </div>
  );
}
