import React, { useMemo } from "react";
import { useDispatch } from "react-redux";
import { gainXP } from "../../redux/dogSlice";

const KEY = "doggerz_last_login";

function todayISO() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

export default function DailyLoginReward() {
  const dispatch = useDispatch();

  const state = useMemo(() => {
    const last = localStorage.getItem(KEY);
    const today = todayISO();
    const isNewDay = last !== today;
    return { last, today, isNewDay };
  }, []);

  const claim = () => {
    if (!state.isNewDay) return;
    localStorage.setItem(KEY, state.today);
    dispatch(gainXP(25)); // reward amount
    alert("Daily reward claimed! +25 XP");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-indigo-200 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-indigo-900 mb-2">🎁 Daily Login</h2>
        <p className="text-gray-700 mb-4">
          Check in once per day to earn bonus XP!
        </p>
        <button
          className={`px-4 py-2 rounded-lg font-semibold ${
            state.isNewDay
              ? "bg-indigo-500 text-white hover:bg-indigo-600"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
          }`}
          onClick={claim}
          disabled={!state.isNewDay}
        >
          {state.isNewDay ? "Claim Reward" : "Already Claimed Today"}
        </button>
        <div className="mt-4 text-xs text-gray-500">
          Last claimed: {state.last ? state.last : "—"}
        </div>
      </div>
    </div>
  );
}
