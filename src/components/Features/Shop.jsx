// src/components/Features/Shop.jsx
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

let addXP, changeHappiness, addCoins, selectCoins, purchaseItem;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const dogSlice = require("../../redux/dogSlice");
  addXP = dogSlice.addXP;
  changeHappiness = dogSlice.changeHappiness;
  addCoins = dogSlice.addCoins;
  selectCoins = dogSlice.selectCoins;
  purchaseItem = dogSlice.purchaseItem;
} catch {}

import { useSelector } from "react-redux";

const ITEMS = [
  { id: "snack", name: "Tasty Snack", price: 10, xp: 0, mood: 8, desc: "Boost happiness for this session." },
  { id: "toyPack", name: "Toy Pack", price: 25, xp: 10, mood: 6, desc: "A few toys for extra XP and fun." },
  { id: "trainerTreats", name: "Trainer Treats", price: 15, xp: 15, mood: 2, desc: "Earn more XP while training." },
];

function useSafeCoins() {
  const sel = useSelector(selectCoins || (() => null));
  const [fallback, setFallback] = useState(() => Number(localStorage.getItem("doggerz_coins") || 50));
  useEffect(() => {
    if (sel == null) localStorage.setItem("doggerz_coins", String(fallback));
  }, [sel, fallback]);
  return sel ?? fallback;
}

export default function Shop() {
  const dispatch = useDispatch();
  const coins = useSafeCoins();
  const setFallbackCoins = (v) => localStorage.setItem("doggerz_coins", String(v));

  const buy = (item) => {
    if (coins < item.price) {
      alert("Not enough coins.");
      return;
    }
    if (purchaseItem) {
      // Your slice can handle balances and effects
      dispatch(purchaseItem(item.id));
    } else {
      // Fallback effects
      if (changeHappiness) dispatch(changeHappiness(item.mood));
      if (addXP) dispatch(addXP(item.xp));
      setFallbackCoins(coins - item.price);
    }
    alert(`Purchased ${item.name}!`);
  };

  const grant50 = () => {
    if (addCoins) {
      dispatch(addCoins(50));
    } else {
      setFallbackCoins(coins + 50);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-6 p-5 rounded-2xl bg-white shadow border border-emerald-100">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-emerald-900">🛒 Shop</h2>
        <div className="text-emerald-800">
          Coins: <span className="font-bold">{coins}</span>
        </div>
      </div>
      <div className="mt-4 grid gap-3">
        {ITEMS.map((it) => (
          <div key={it.id} className="p-4 rounded-xl border border-emerald-100 flex items-center justify-between">
            <div>
              <div className="font-semibold text-emerald-900">{it.name}</div>
              <div className="text-sm text-emerald-900/70">{it.desc}</div>
              <div className="text-xs text-emerald-900/60 mt-1">+{it.mood} happiness, +{it.xp} XP</div>
            </div>
            <button
              onClick={() => buy(it)}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white shadow hover:shadow-md active:scale-95"
            >
              {it.price} coins
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={grant50}
        className="mt-4 px-4 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-700 hover:shadow active:scale-95"
        title="Dev helper"
      >
        Add 50 Coins (dev)
      </button>
    </div>
  );
}