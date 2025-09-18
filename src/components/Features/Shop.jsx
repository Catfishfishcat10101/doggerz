// src/components/Features/Shop.jsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { selectCoins, spendCoins, earnCoins } from "../../redux/dogSlice";

/** Minimal shop:
 * - Training Treat (+XP session buff)
 * - Happy Snack (+Happiness session buff)
 * - Backyard Skin (Lawn or Sunset) -> writes to sessionStorage
 */
const ITEMS = [
  { id: "buff_xp",   title: "Training Treat", desc: "+10% XP (session)",   cost: 15, icon: "🍖" },
  { id: "buff_hap",  title: "Happy Snack",    desc: "+10 Happiness (once)", cost: 10, icon: "🍪" },
  { id: "skin_lawn", title: "Backyard: Lawn", desc: "Green lush lawn",      cost: 100, icon: "🌿", skin: "lawn" },
  { id: "skin_sun",  title: "Backyard: Sunset", desc: "Warm sunset sky",    cost: 120, icon: "🌇", skin: "sunset" },
];

export default function Shop() {
  const dispatch = useDispatch();
  const coins = useSelector(selectCoins);
  const [ownedSkins, setOwnedSkins] = useState(
    JSON.parse(sessionStorage.getItem("ownedSkins") || "[]")
  );

  const buy = (item) => {
    if (coins < item.cost) return;
    dispatch(spendCoins(item.cost));

    if (item.id === "buff_xp") sessionStorage.setItem("buff", "XP+10%");
    if (item.id === "buff_hap") {
      // grant 1 coin back as a “feel good” bonus & mark buff
      dispatch(earnCoins(0));
      sessionStorage.setItem("buff", "Happiness+10");
    }
    if (item.skin) {
      const nextOwned = Array.from(new Set([...ownedSkins, item.skin]));
      setOwnedSkins(nextOwned);
      sessionStorage.setItem("ownedSkins", JSON.stringify(nextOwned));
      sessionStorage.setItem("yardSkin", item.skin);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-rose-100">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-rose-900">Shop</h1>
          <div className="flex items-center gap-2">
            <span className="bg-white px-3 py-1 rounded-lg shadow">💰 {coins}</span>
            <Link className="bg-white px-3 py-2 rounded-xl shadow" to="/game">← Back</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {ITEMS.map((it) => {
            const canBuy = coins >= it.cost;
            const owned = it.skin ? ownedSkins.includes(it.skin) : false;

            return (
              <div key={it.id} className="bg-white rounded-2xl shadow p-5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-rose-900 flex items-center gap-2">
                    <span className="text-2xl">{it.icon}</span> {it.title}
                  </div>
                  <div className="text-xs text-rose-900/60">{it.desc}</div>
                </div>
                {it.skin ? (
                  <div className="flex items-center gap-2">
                    <button
                      className={`px-3 py-1 rounded-lg ${canBuy && !owned ? "bg-rose-600 text-white" : "bg-rose-100 text-rose-400"}`}
                      disabled={!canBuy || owned}
                      onClick={() => buy(it)}
                    >
                      {owned ? "Owned" : `Buy • ${it.cost}`}
                    </button>
                    <button
                      className="px-3 py-1 rounded-lg bg-rose-100 text-rose-700"
                      onClick={() => sessionStorage.setItem("yardSkin", it.skin)}
                    >
                      Use
                    </button>
                  </div>
                ) : (
                  <button
                    className={`px-3 py-1 rounded-lg ${canBuy ? "bg-rose-600 text-white" : "bg-rose-100 text-rose-400"}`}
                    disabled={!canBuy}
                    onClick={() => buy(it)}
                  >
                    Buy • {it.cost}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}