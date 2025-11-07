import React from "react";
import { useDispatch } from "react-redux";
import { awardCoins } from "../redux/dogSlice";

export default function Shop() {
  const dispatch = useDispatch();
  const claim = (n) => dispatch(awardCoins(n));

  return (
    <div className="container py-6 text-white">
      <div className="card">
        <h1 className="text-xl font-semibold">Shop (alpha)</h1>
        <p className="mt-2 text-white/70">
          Monetization hooks land later. For now, test rewards here.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn" onClick={() => claim(5)}>Daily Treat +5</button>
          <button className="btn" onClick={() => claim(20)}>Starter Pack +20</button>
          <button className="btn" onClick={() => claim(100)}>Whale Mode +100</button>
        </div>
      </div>
    </div>
  );
}