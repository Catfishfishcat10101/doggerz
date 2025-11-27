import React, { useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import EnhancedDogSprite from "@/features/game/components/EnhancedDogSprite.jsx";
import { selectDog } from "@/features/game/redux/dogSlice.js";

function pct(n) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export default function LivePupSnapshot({ className = "" }) {
  const dog = useSelector(selectDog) || {};
  const name = dog.name || "Your pup";
  const level = dog.level || 1;
  const age = dog.age || "0d";
  const navigate = useNavigate();

  // Simulated potty progress: read from dog.stats.pottyProgress or fallback
  const potty = useMemo(() => {
    try {
      return pct((dog.stats && dog.stats.pottyProgress) || 0);
    } catch {
      return 0;
    }
  }, [dog]);

  const pottyComplete = potty >= 100;

  // Wag on hover state
  const [isWag, setWag] = useState(false);
  useEffect(() => {
    if (!isWag) return;
    const t = setTimeout(() => setWag(false), 750);
    return () => clearTimeout(t);
  }, [isWag]);

  // Small stats with safe fallbacks
  const stats = dog.stats || {};
  const hunger = pct(stats.hunger ?? 80);
  const happiness = pct(stats.happiness ?? 72);
  const energy = pct(stats.energy ?? 64);
  const cleanliness = pct(stats.cleanliness ?? 55);

  return (
    <div
      className={`relative rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-950/60 to-zinc-900/60 p-4 ${className}`}
    >
      <div className="flex gap-4">
        {/* Left: framed sprite */}
        <div
          className="flex-shrink-0 rounded-xl bg-zinc-900/60 p-3 cursor-pointer shadow-sm hover:scale-105 transition-transform"
          onMouseEnter={() => setWag(true)}
          onClick={() => {
            setWag(true);
            navigate("/game");
          }}
          role="button"
          aria-label="Open game"
        >
          <div className="w-32 h-32">
            <EnhancedDogSprite animateWag={isWag} />
          </div>
        </div>

        {/* Middle: name, level, badges, potty */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="truncate">
              <div className="text-lg font-semibold text-white truncate">
                {name}
              </div>
              <div className="text-xs text-zinc-400">
                Lv {level} • {age}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/game")}
                className="rounded-md bg-emerald-500 px-3 py-1 text-sm font-semibold text-black hover:bg-emerald-400"
              >
                Open yard
              </button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <div className="text-[0.75rem] text-zinc-300">Potty</div>
              <div className="w-full bg-zinc-800 rounded h-2 mt-1">
                <div
                  className={`h-2 rounded bg-emerald-400 transition-all duration-500 ${pottyComplete ? "bg-emerald-500" : ""}`}
                  style={{ width: `${potty}%` }}
                />
              </div>
            </div>

            <div>
              <div className="text-[0.75rem] text-zinc-300">Trained</div>
              <div className="text-xs text-zinc-400 mt-1">
                {pottyComplete ? "Yes — fewer accidents" : "Working on it"}
              </div>
            </div>
          </div>

          {/* Stat rings row */}
          <div className="mt-4 flex items-center gap-4">
            {[
              { label: "Hunger", v: hunger },
              { label: "Happy", v: happiness },
              { label: "Energy", v: energy },
              { label: "Clean", v: cleanliness },
            ].map((s) => {
              const deg = Math.round((s.v / 100) * 360);
              return (
                <div
                  key={s.label}
                  className="flex flex-col items-center text-xs"
                >
                  <div
                    className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center"
                    style={{
                      background: `conic-gradient(#10b981 ${deg}deg, rgba(255,255,255,0.04) 0deg)`,
                    }}
                    aria-hidden
                  >
                    <div className="text-[0.72rem] font-semibold text-white">
                      {s.v}%
                    </div>
                  </div>
                  <div className="mt-1 text-[--dg-muted]">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
