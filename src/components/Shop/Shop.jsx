import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { spend, selectWallet } from "@/redux/economySlice";

const ITEMS = [
  { id: "collar_red",  name: "Red Collar",  price: 80 },
  { id: "collar_gold", name: "Gold Collar", price: 250 },
  { id: "hat_beanie",  name: "Beanie",      price: 180 },
];

export default function Shop() {
  const d = useDispatch();
  const { coins } = useSelector(selectWallet);

  const buy = (item) => {
    if (coins < item.price) return;
    d(spend(item.price));
    // TODO: persist to inventory slice; apply to sprite
    alert(`Purchased ${item.name}! (wire to inventory next)`);
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold text-white mb-4">Shop & Cosmetics</h1>
      <div className="mb-4 text-white/80">Coins: {coins}</div>
      <div className="grid sm:grid-cols-2 gap-4">
        {ITEMS.map(item => (
          <div key={item.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div className="text-white">
              <div className="font-semibold">{item.name}</div>
              <div className="text-white/70 text-sm">🪙 {item.price}</div>
            </div>
            <button
              onClick={() => buy(item)}
              className="px-3 py-2 rounded bg-violet-600 hover:bg-violet-500 text-white"
            >
              Buy
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}