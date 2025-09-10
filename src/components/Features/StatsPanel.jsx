import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  claimDailyReward,
  registerDailyVisit,
  selectAgeDays,
  selectCoins,
  selectDog,
  selectLastClaim,
  selectLastVisit,
  selectPotty,
  selectStreak,
  selectTricks,
  selectXP,
  selectUnlocks,
  selectBuffs,
  selectBackyardSkin,
  selectCosmetics,
  selectShopSaleEnds,
} from "../../redux/dogSlice";

const Bar = ({ value, color }) => (
  <div className="w-full h-3 bg-black/10 rounded">
    <div className={`h-3 ${color} rounded`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
  </div>
);

export default function StatsPanel() {
  const dispatch = useDispatch();
  const dog = useSelector(selectDog);
  const { xp, level, next } = useSelector(selectXP);
  const ageDays = useSelector(selectAgeDays);
  const potty = useSelector(selectPotty);
  const tricks = useSelector(selectTricks);
  const coins = useSelector(selectCoins);
  const streak = useSelector(selectStreak);
  const lastVisit = useSelector(selectLastVisit);
  const lastClaim = useSelector(selectLastClaim);
  const unlocks = useSelector(selectUnlocks);
  const buffs = useSelector(selectBuffs);
  const skin = useSelector(selectBackyardSkin);
  const cosmetics = useSelector(selectCosmetics);
  const saleEnds = useSelector(selectShopSaleEnds);

  useEffect(() => {
    dispatch(registerDailyVisit({ now: Date.now() }));
  }, [dispatch]);

  const claimedToday = (() => {
    if (!lastClaim) return false;
    const today = new Date(); today.setHours(0,0,0,0);
    const claimed = new Date(lastClaim); claimed.setHours(0,0,0,0);
    return today.getTime() === claimed.getTime();
  })();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-amber-50 to-rose-100 flex flex-col items-center">
      <div className="w-full max-w-5xl px-4 py-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-rose-900">Milestones & Stats</h2>
        <Link to="/game" className="px-3 py-2 rounded-xl bg-white shadow hover:shadow-md active:scale-95">← Back to Game</Link>
      </div>

      <div className="w-full max-w-5xl px-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-rose-900/70">Level</div>
              <div className="text-3xl font-extrabold text-rose-700">{level}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-rose-900/70">XP</div>
              <div className="font-semibold">{xp} / {next}</div>
            </div>
          </div>
          <div className="mt-3"><Bar value={(xp / next) * 100} color="bg-rose-500" /></div>
          <div className="mt-3 text-xs text-rose-900/60">
            Unlocks: {unlocks.shop ? "Shop (Lvl 3)" : "Shop at Lvl 3"}, {unlocks.backyardUpgrade ? "Backyard Upgrade (Lvl 5)" : "Backyard at Lvl 5"},
            {` ${unlocks.accessories ? "Accessories (Lvl 8)" : "Accessories at Lvl 8)"}`} {unlocks.breeding ? "• Breeding (Lvl 12)" : "• Breeding at Lvl 12"}
          </div>
        </div>

        <div className="rounded-2xl bg-white shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-rose-900/70">Age (real-time, slow)</div>
              <div className="text-3xl font-extrabold text-rose-700">{ageDays} days</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-rose-900/70">Backyard Skin</div>
              <div className="font-semibold">{skin}</div>
            </div>
          </div>
          <div className="mt-3 text-xs text-rose-900/60">Puppy &lt; 90 days • Adult 90–730 days • Senior 730+ days</div>
        </div>

        <div className="rounded-2xl bg-white shadow p-5">
          <div className="text-lg font-semibold text-rose-900 mb-3">Needs</div>
          <div className="space-y-3">
            <Row label="Happiness" value={dog.happiness} color="bg-green-500" />
            <Row label="Energy" value={dog.energy} color="bg-blue-500" />
            <Row label="Hunger" value={dog.hunger} color="bg-yellow-500" />
            <Row label="Hygiene" value={dog.hygiene} color="bg-cyan-500" />
            <Row label="Bladder" value={dog.bladder} color="bg-emerald-500" />
          </div>
        </div>

        <div className="rounded-2xl bg-white shadow p-5">
          <div className="text-lg font-semibold text-rose-900 mb-3">Training</div>
          <div className="mb-4">
            <div className="text-sm text-rose-900/70">Potty Level {potty.level} • Progress</div>
            <Bar value={potty.progress} color="bg-emerald-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Col label={`Sit (${tricks.sit}%)`} value={tricks.sit} />
            <Col label={`Stay (${tricks.stay}%)`} value={tricks.stay} />
            <Col label={`Paw (${tricks.paw}%)`} value={tricks.paw} />
            <Col label={`Roll Over (${tricks.rollOver}%)`} value={tricks.rollOver} />
          </div>
        </div>

        <div className="rounded-2xl bg-white shadow p-5 md:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-rose-900/70">Coins</div>
              <div className="text-2xl font-bold text-rose-700">🪙 {coins}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-rose-900/70">Login Streak</div>
              <div className="text-2xl font-bold text-rose-700">{streak} day{streak === 1 ? "" : "s"}</div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => dispatch(claimDailyReward({ now: Date.now(), amount: 20 }))}
              disabled={claimedToday}
              className={`px-4 py-2 rounded-xl shadow ${claimedToday ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-rose-600 text-white hover:shadow-md active:scale-95"}`}
            >
              🎁 Claim Daily Treat (+20)
            </button>
            <div className="text-xs text-rose-900/60">
              {claimedToday ? "Already claimed today." : "Claim once per day to stack your streak and coins."}
            </div>
          </div>

          <div className="mt-4 text-xs text-rose-900/50">
            Sale ends: {saleEnds ? new Date(saleEnds).toLocaleString() : "—"} • Accessories owned: {cosmetics.accessories.owned.length}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, color }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-28 text-sm text-rose-900/80">{label}</div>
      <div className="flex-1"><Bar value={value} color={color} /></div>
      <div className="w-10 text-right text-sm text-rose-900/60">{Math.round(value)}%</div>
    </div>
  );
}
function Col({ label, value }) {
  return (
    <div>
      <div className="text-sm text-rose-900/80 mb-1">{label}</div>
      <Bar value={value} color="bg-indigo-500" />
    </div>
  );
}
