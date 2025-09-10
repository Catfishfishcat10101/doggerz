// src/components/Features/Accessories.jsx
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  equipAccessory,
  selectAccessories,
  selectCoins,
  selectUnlocks,
  spendCoins,
  unlockAccessory,
} from "../../redux/dogSlice";

const ACCESSORIES = [
  { id: "collar_red", slot: "collar", title: "Red Collar", cost: 30, icon: "🟥" },
  { id: "collar_blue", slot: "collar", title: "Blue Collar", cost: 30, icon: "🟦" },
  { id: "hat_party", slot: "hat", title: "Party Hat", cost: 60, icon: "🥳" },
  { id: "hat_crown", slot: "hat", title: "Crown", cost: 120, icon: "👑" },
];

export default function Accessories() {
  const dispatch = useDispatch();
  const coins = useSelector(selectCoins);
  const accessories = useSelector(selectAccessories);
  const unlocks = useSelector(selectUnlocks);

  if (!unlocks.accessories) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-amber-50 to-rose-100 flex flex-col items-center">
        <div className="w-full max-w-4xl px-4 py-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-rose-900">Accessories</h2>
          <Link to="/game" className="px-3 py-2 rounded-xl bg-white shadow hover:shadow-md active:scale-95">← Back to Game</Link>
        </div>
        <div className="w-full max-w-4xl px-4">
          <div className="rounded-xl bg-white shadow p-4 text-rose-900">Reach <b>Level 8</b> to unlock Accessories.</div>
        </div>
      </div>
    );
  }

  const owned = new Set(accessories.owned);
  const eq = accessories.equipped;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-amber-50 to-rose-100 flex flex-col items-center">
      <div className="w-full max-w-4xl px-4 py-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-rose-900">Accessories</h2>
        <Link to="/game" className="px-3 py-2 rounded-xl bg-white shadow hover:shadow-md active:scale-95">← Back to Game</Link>
      </div>

      <div className="w-full max-w-4xl px-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {ACCESSORIES.map((a) => {
          const isOwned = owned.has(a.id);
          const isEquipped = eq[a.slot] === a.id;
          const canBuy = coins >= a.cost;
          return (
            <div key={a.id} className="rounded-2xl bg-white shadow p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{a.icon}</div>
                <div>
                  <div className="font-semibold text-rose-900">{a.title}</div>
                  <div className="text-xs text-rose-900/60">Slot: {a.slot}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isOwned ? (
                  <button
                    className={`px-3 py-1 rounded-lg ${canBuy ? "bg-rose-600 text-white hover:shadow-md active:scale-95" : "bg-gray-200 text-gray-500 cursor-not-allowed"} shadow`}
                    onClick={() => { if (!canBuy) return; dispatch(spendCoins(a.cost)); dispatch(unlockAccessory({ id: a.id })); }}
                  >
                    Buy 🪙{a.cost}
                  </button>
                ) : (
                  <button
                    className={`px-3 py-1 rounded-lg ${isEquipped ? "bg-rose-600 text-white" : "bg-rose-100 text-rose-700 hover:shadow-md active:scale-95"} shadow`}
                    onClick={() => dispatch(equipAccessory({ slot: a.slot, id: isEquipped ? null : a.id }))}
                  >
                    {isEquipped ? "Equipped ✓" : "Equip"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
