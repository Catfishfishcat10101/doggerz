// src/components/Features/Accessories.jsx
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  equipAccessory,
  unlockAccessory,
  spendCoins,
  selectAccessories,
  selectCoins,
  selectUnlocks,
  selectDogLevel,
} from "@/redux/dogSlice.js";

const ACCESSORIES = [
  {
    id: "collar_red",
    slot: "collar",
    title: "Red Collar",
    cost: 30,
    icon: "🟥",
  },
  {
    id: "collar_blue",
    slot: "collar",
    title: "Blue Collar",
    cost: 30,
    icon: "🟦",
  },
  { id: "hat_party", slot: "hat", title: "Party Hat", cost: 60, icon: "🥳" },
  { id: "hat_crown", slot: "hat", title: "Crown", cost: 120, icon: "👑" },
];

export default function Accessories() {
  const dispatch = useDispatch();
  const coins = useSelector(selectCoins);
  const unlocks = useSelector(selectUnlocks);
  const level = useSelector(selectDogLevel);
  const accessories = useSelector(selectAccessories);

  const owned = new Set(accessories?.owned ?? []);
  const equipped = accessories?.equipped ?? { collar: null, hat: null };

  const unlocked = (unlocks && unlocks.accessories) || level >= 8;

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-rose-100">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-rose-900">Accessories</h1>
            <Link className="bg-white px-3 py-2 rounded-xl shadow" to="/play">
              ← Back
            </Link>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 mt-4 text-rose-900">
            Reach <b>Level 8</b> to unlock Accessories.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-rose-100">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-rose-900">Accessories</h1>
          <div className="flex items-center gap-2">
            <span className="bg-white px-3 py-1 rounded-lg shadow">
              💰 {coins}
            </span>
            <Link className="bg-white px-3 py-2 rounded-xl shadow" to="/play">
              ← Back
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {ACCESSORIES.map((a) => {
            const isOwned = owned.has(a.id);
            const isEquipped = equipped[a.slot] === a.id;
            const canBuy = coins >= a.cost;

            return (
              <div
                key={a.id}
                className="bg-white rounded-2xl shadow p-5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{a.icon}</div>
                  <div>
                    <div className="font-semibold text-rose-900">{a.title}</div>
                    <div className="text-xs text-rose-900/60">
                      Slot: {a.slot}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!isOwned ? (
                    <button
                      className={`px-3 py-1 rounded-lg ${canBuy ? "bg-rose-600 text-white hover:shadow" : "bg-rose-100 text-rose-400 cursor-not-allowed"}`}
                      onClick={() => {
                        if (!canBuy) return;
                        dispatch(spendCoins(a.cost));
                        dispatch(unlockAccessory(a.id));
                      }}
                    >
                      Buy • {a.cost}
                    </button>
                  ) : (
                    <button
                      className={`px-3 py-1 rounded-lg ${isEquipped ? "bg-rose-600 text-white" : "bg-rose-100 text-rose-700 hover:shadow"}`}
                      onClick={() =>
                        dispatch(
                          equipAccessory({
                            slot: a.slot,
                            id: isEquipped ? null : a.id,
                          }),
                        )
                      }
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
    </div>
  );
}
