// src/pages/Game.jsx
import React, { useEffect, useState } from "react";
import PupStage from "@/components/UI/PupStage.jsx";
import { useDispatch, useSelector } from "react-redux";
import { selectDog, takeOutside } from "@/redux/dogSlice.js";
import NamePupModal from "@/components/UI/NamePupModal.jsx";
import { selectUser } from "@/redux/userSlice.js";
import { ensureDogForUser } from "@/services/dogService.js";

export default function Game() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const dog = useSelector(selectDog);
  const [nameOpen, setNameOpen] = useState(false);
  const [hint, setHint] = useState("");

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

  function onPotty() {
    // If not in yard, coach the player
    if (dog.pos?.x < 1400) {
      setHint("Move your pup to the right into the yard, then press Go Potty.");
      return;
    }
    dispatch(takeOutside());
    setHint("Nice! Going outside boosts happiness and XP.");
    setTimeout(() => setHint(""), 2500);
  }

  return (
    <div className="space-y-4">
      {/* Yard marker strip */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="relative">
          {/* Visual yard zone on right */}
          <div className="absolute inset-y-0 right-0 w-40 bg-emerald-700/20 border-l border-emerald-400/30 pointer-events-none flex items-center justify-center">
            <span className="text-emerald-200/80 text-xs rotate-90">Yard</span>
          </div>
          <PupStage interactive className="min-h-[420px]" />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
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
              Your pup needs to go! Move to the yard on the right, then press the button.
            </span>
          ) : (
            <span className="text-sm text-white/60">All good for now.</span>
          )}
        </div>

        {hint && <div className="mt-2 text-sm text-white/80">{hint}</div>}
      </div>

      {user?.uid && !dog?.name && (
        <NamePupModal open={nameOpen} onClose={() => setNameOpen(false)} />
      )}
    </div>
  );
}
