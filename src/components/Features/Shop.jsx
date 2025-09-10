import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  claimDailyReward,
  equipBackyardSkin,
  grantBuff,
  selectBackyardSkin,
  selectBuffs,
  selectCoins,
  selectCosmetics,
  selectShopSaleEnds,
  selectUnlocks,
  spendCoins,
  startShopSale,
  unlockAccessory,
  unlockBackyardSkin,
  equipAccessory,
} from "../../redux/dogSlice";

const ITEMS = [
  {
    id: "happy_snack",
    title: "Happy Snack",
    desc: "+15 happiness now & 10 min +25% happiness gains.",
    cost: 15,
    onBuy: (dispatch) => { dispatch(grantBuff({ kind: "happiness", minutes: 10 })); },
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
    onBuy: (dispatch) => { dispatch(unlockBackyardSkin({ skin: "lush" })); dispatch(equipBackyardSkin({ skin: "lush" })); },
  },
];

const STARTER_BUNDLE = {
  id: "starter_bundle",
  title: "Starter Bundle",
  desc: "15m XP boost + 15m Happiness boost + Lush Skin + Red Collar",
  price: 120,
  salePrice: 79,
  grant: (dispatch) => {
    dispatch(grantBuff({ kind: "xp", minutes: 15 }));
    dispatch(grantBuff({ kind: "happiness", minutes: 15 }));
    dispatch(unlockBackyardSkin({ skin: "lush" }));
    dispatch(equipBackyardSkin({ skin: "lush" }));
    dispatch(unlockAccessory({ id: "collar_red" }));
    dispatch(equipAccessory({ slot: "collar", id: "collar_red" }));
  },
};

export default function Shop() {
  const dispatch = useDispatch();
  const coins = useSelector(selectCoins);
  const buffs = useSelector(selectBuffs);
  const ownedSkins = useSelector((s) => new Set(selectCosmetics(s).ownedSkins));
  const equippedSkin = useSelector(selectBackyardSkin);
  const unlocks = useSelector(selectUnlocks);
  const saleEndsAt = useSelector(selectShopSaleEnds);

  useEffect(() => {
    if (!saleEndsAt) dispatch(startShopSale({ minutes: 180 }));
  }, [saleEndsAt, dispatch]);

  const saleLeft = useMemo(() => timeLeft(saleEndsAt), [saleEndsAt]);

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

      {unlocks.shop && saleEndsAt && (
        <div className="w-full max-w-5xl px-4">
          <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-lime-500 text-white p-5 shadow flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="text-lg font-semibold">⏳ Limited-Time Offer: {STARTER_BUNDLE.title}</div>
            <div className="text-sm opacity-90">{STARTER_BUNDLE.desc}</div>
            <div className="flex items-center gap-3">
              <div className="text-white font-bold">🪙 <s className="opacity-80">{STARTER_BUNDLE.price}</s> <span className="text-yellow-200">{STARTER_BUNDLE.salePrice}</span></div>
              <div className="text-white/90 text-sm">Ends in {saleLeft}</div>
              <BuyBtn
                canBuy={coins >= STARTER_BUNDLE.salePrice}
                onClick={() => {
                  if (coins < STARTER_BUNDLE.salePrice) return;
                  dispatch(spendCoins(STARTER_BUNDLE.salePrice));
                  STARTER_BUNDLE.grant(dispatch);
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-5xl px-4 grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <Wallet coins={coins} buffs={buffs} />
        <DailyClaim onClaim={() => dispatch(claimDailyReward({ now: Date.now(), amount: 20 }))} />
      </div>

      <div className="w-full max-w-5xl px-4 grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {ITEMS.map((it) => {
          const isSkin = it.id.startsWith("backyard_");
          const alreadyOwned = isSkin ? ownedSkins.has("lush") : false;
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
