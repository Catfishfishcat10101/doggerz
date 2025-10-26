// src/components/Features/UpgradeYard.jsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectCoins, spendCoins } from "@/../redux/dogSlice";

const SKINS = [
  { id: "lawn", title: "Green Lawn", cost: 100, preview: "🌿" },
  { id: "sunset", title: "Sunset Sky", cost: 120, preview: "🌇" },
];

export default function UpgradeYard() {
  const dispatch = useDispatch();
  const coins = useSelector(selectCoins);
  const [owned, setOwned] = useState(
    JSON.parse(sessionStorage.getItem("ownedSkins") || "[]"),
  );
  const active = sessionStorage.getItem("yardSkin") || "default";

  const buy = (skin) => {
    if (coins < skin.cost) return;
    dispatch(spendCoins(skin.cost));
    const next = Array.from(new Set([...owned, skin.id]));
    setOwned(next);
    sessionStorage.setItem("ownedSkins", JSON.stringify(next));
    sessionStorage.setItem("yardSkin", skin.id);
  };

  const useSkin = (skinId) => {
    sessionStorage.setItem("yardSkin", skinId);
    window.dispatchEvent(new Event("doggerz:yardskin"));
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-rose-900">
          Upgrade Backyard
        </h3>
        <div className="text-sm px-2 py-1 rounded bg-rose-100 text-rose-900">
          💰 {coins}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {SKINS.map((s) => {
          const has = owned.includes(s.id);
          const isActive = active === s.id;
          const canBuy = coins >= s.cost;
          return (
            <div
              key={s.id}
              className="rounded-xl border border-rose-100 p-4 flex items-center justify-between"
            >
              <div>
                <div className="font-semibold text-rose-900 flex items-center gap-2">
                  <span className="text-xl">{s.preview}</span> {s.title}
                </div>
                <div className="text-xs text-rose-900/60">
                  {has ? "Owned" : `Cost ${s.cost}`}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!has && (
                  <button
                    className={`px-3 py-1 rounded-lg ${canBuy ? "bg-rose-600 text-white" : "bg-rose-100 text-rose-400"}`}
                    onClick={() => buy(s)}
                    disabled={!canBuy}
                  >
                    Buy
                  </button>
                )}
                <button
                  className={`px-3 py-1 rounded-lg ${isActive ? "bg-rose-600 text-white" : "bg-rose-100 text-rose-700"}`}
                  onClick={() => useSkin(s.id)}
                >
                  {isActive ? "Using" : "Use"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
