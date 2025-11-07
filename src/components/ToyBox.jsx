import React from "react";
import { useDispatch } from "react-redux";
import { feedDog, playWithDog, batheDog, increasePottyLevel, awardCoins } from "@/redux/dogSlice";

/**
 * ToyBox: small, opinionated actions with immediate feedback.
 * Hook this anywhere (MainGame, sidebar, etc.).
 */
export default function ToyBox({ className = "" }) {
  const dispatch = useDispatch();

  return (
    <div className={`card flex flex-wrap gap-2 ${className}`}>
      <button
        className="btn"
        onClick={() => {
          dispatch(feedDog());
          dispatch(awardCoins(1));
        }}
      >
        🍖 Feed
      </button>

      <button
        className="btn"
        onClick={() => {
          dispatch(playWithDog());
          dispatch(awardCoins(1));
        }}
      >
        🦴 Play
      </button>

      <button
        className="btn"
        onClick={() => dispatch(batheDog())}
      >
        🛁 Bathe
      </button>

      <button
        className="btn"
        onClick={() => dispatch(increasePottyLevel(10))}
      >
        🚽 Potty Train
      </button>
    </div>
  );
}