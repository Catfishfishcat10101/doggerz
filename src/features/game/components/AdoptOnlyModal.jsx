import React, { useState } from "react";
import { DOG_STORAGE_KEY } from "@/redux/dogSlice.js";
import EnhancedDogSprite from "@/features/game/components/EnhancedDogSprite.jsx";

export default function AdoptOnlyModal({ open, onClose }) {
  const [name, setName] = useState("Pup");

  const adopt = () => {
    try {
      const now = Date.now();
      const dog = {
        id: `local-${now}`,
        name: name || "Pup",
        adoptedAt: now,
        level: 1,
        xp: 0,
        stats: {
          hunger: 100,
          happiness: 100,
          energy: 100,
          cleanliness: 100,
          pottyProgress: 0,
        },
        lifeStage: "PUPPY",
      };
      window.localStorage.setItem(DOG_STORAGE_KEY, JSON.stringify(dog));
      window.location.reload();
    } catch (e) {
      console.error("Adopt failed", e);
      alert("Adoption failed. Check console.");
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="adopt-modal-title"
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative z-10 mx-4 w-full max-w-2xl rounded-2xl bg-zinc-900/95 border border-zinc-800 p-6 shadow-2xl">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h3
              id="adopt-modal-title"
              className="text-2xl font-bold text-emerald-300"
            >
              Adopt a pup
            </h3>
            <p className="mt-1 text-sm text-zinc-300">
              Create a local pup save on this device. You can enable cloud sync
              later in Settings.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close adopt dialog"
            className="rounded-md bg-zinc-800/60 px-3 py-1 text-sm text-zinc-200 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            Close
          </button>
        </header>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="flex items-center justify-center sm:col-span-1">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/6 to-zinc-900 p-4 shadow-inner">
              <div className="w-40 h-40 flex items-center justify-center rounded-lg bg-zinc-800">
                <EnhancedDogSprite />
              </div>
            </div>
          </div>

          <div className="sm:col-span-2">
            <div>
              <label className="block text-xs text-zinc-300">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div className="mt-4 text-sm text-zinc-300">
              <p>
                Your pup will be saved locally unless you enable cloud sync.
                Adoption is instant — you can always adopt another pup later.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="rounded-md px-3 py-2 text-sm bg-zinc-800 text-zinc-200 hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                Cancel
              </button>
              <button
                onClick={adopt}
                className="rounded-md bg-gradient-to-r from-emerald-500 to-emerald-400 px-4 py-2 text-sm font-semibold text-black shadow hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              >
                Adopt
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
