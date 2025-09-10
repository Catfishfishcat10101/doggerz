// src/components/Features/Shop.jsx
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  addCoins,
  claimDailyReward,
  equipBackyardSkin,
  grantBuff,
  selectBackyardSkin,
  selectBuffs,
  selectCoins,
  selectCosmetics,
  selectUnlocks,
  spendCoins,
  unlockBackyardSkin,
} from "../../redux/dogSlice";

const ITEMS = [
  {
    id: "happy_snack",
    title: "Happy Snack",
    desc: "+15 happiness now & 10 min +25% happiness gains.",
    cost: 15,
    onBuy: (dispatch) => {
      dispatch(grantBuff({ kind: "happiness", minutes: 10 }));
      // immediate nudge happens where you award happiness in gameplay; buff scales those gains
      // if you want an immediate boost too:
      dispatch(addCoins(0)); // no-op to force autosave timing if needed
    },
  },
  {
    id: "xp_treat",
    title: "XP Treat",
    desc: "10 min XP boost (×1.5 to XP gains).",
    cost: 25,
    onBuy: (dispatch) => dispatch(grantBuff({ kind: "xp", minutes: 10 })),
  },
  {
    id: "backyard_lush",
    title: "Backyard Skin: Lush",
    desc: "Greener, prettier yard. Cosmetic only.",
    cost: 100,
    onBuy: (dispatch) => {
      dispatch(unlockBackyardSkin({ skin: "lush" }));
      dispatch(equipBackyardSkin({ skin: "lush" }));
    },
  },
];

export default function Shop() {
  const dispatch = useDispatch();
  const coins = useSelector(selectCoins);
  const buffs = useSelector(selectBuffs);
  const owned = useSelector((s) => new Set(selectCosmetics(s).ownedSkins));
  const equippedSkin = useSelector(selectBackyardSkin);
  const unlocks = useSelector(selectUnlocks);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-amber-50 to-emerald-100 flex flex-col items-center">
      <div className="w-full max-w-5xl px-4 py-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-emerald-900">Shop</h2>
        <Link to="/game" className="px-3 py-2 rounded-xl bg-white shadow hover:shadow-md active:scale-95">← Back to Game</Link>
      </div>

      {!unlocks.shop && (
        <div className="w-full max-w-5xl px-4">
          <div className="rounded-xl bg-white shadow p-4 text-emerald-900">
            Reach <b>Level 3</b> to unlock the shop.
          </div>
        </div>
      )}

      <div className="w-full max-w-5xl px-4 grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        <Wallet coins={coins} buffs={buffs} />
        <DailyClaim onClaim={() => dispatch(claimDailyReward({ now: Date.now(), amount: 20 }))} />
      </div>

      <div className="w-full max-w-5xl px-4 grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {ITEMS.map((it) => {
          const isSkin = it.id.startsWith("backyard_");
          const alreadyOwned = isSkin ? owned.has(it.id.split("_")[1]) || owned.has("lush") : false;
          const canBuy = unlocks.shop && coins >= it.cost && !alreadyOwned;
          return (
            <div key={it.id} className="rounded-2xl bg-white shadow p-5 flex flex-col">
              <div className="text-lg font-semibold text-emerald-900">{it.title}</div>
              <div className="text-sm text-emerald-900/70 mt-1 flex-1">{it.desc}</div>
              <div className="mt-3 flex items-center justify-between">
                <div className="text-emerald-900 font-semibold">🪙 {it.cost}</div>
                {isSkin && alreadyOwned ? (
                  <button
                    className={`px-3 py-1 rounded-lg ${equippedSkin === "lush" ? "bg-emerald-600 text-white" : "bg-emerald-100 text-emerald-700"} shadow`}
                    onClick={() => dispatch(equipBackyardSkin({ skin: "lush" }))}
                  >
                    {equippedSkin === "lush" ? "Equipped" : "Equip"}
                  </button>
                ) : (
                  <button
                    className={`px-3 py-1 rounded-lg ${canBuy ? "bg-emerald-600 text-white hover:shadow-md active:scale-95" : "bg-gray-200 text-gray-500 cursor-not-allowed"} shadow`}
                    onClick={() => {
                      if (!canBuy) return;
                      dispatch(spendCoins(it.cost));
                      it.onBuy(dispatch);
                    }}
                  >
                    Buy
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

function Wallet({ coins, buffs }) {
  const xpLeft = timeLeft(buffs.xpBoostUntil);
  const happyLeft = timeLeft(buffs.happinessBoostUntil);
  return (
    <div className="rounded-2xl bg-white shadow p-5">
      <div className="text-sm text-emerald-900/70">Coins</div>
      <div className="text-2xl font-bold text-emerald-700">🪙 {coins}</div>
      <div className="mt-3 text-sm text-emerald-900/70">
        XP Boost: <b>{xpLeft}</b> • Happiness Boost: <b>{happyLeft}</b>
      </div>
    </div>
  );
}

function DailyClaim({ onClaim }) {
  return (
    <div className="rounded-2xl bg-white shadow p-5">
      <div className="text-sm text-emerald-900/70">Daily Treat</div>
      <div className="text-2xl font-bold text-emerald-700">+20</div>
      <button onClick={onClaim} className="mt-3 px-3 py-1 rounded-lg bg-emerald-600 text-white shadow hover:shadow-md active:scale-95">
        Claim
      </button>
      <div className="text-xs text-emerald-900/60 mt-2">Claim once per day to build your streak.</div>
    </div>
  );
}

function timeLeft(until) {
  if (!until) return "—";
  const ms = until - Date.now();
  if (ms <= 0) return "—";
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}m ${s}s`;
}
