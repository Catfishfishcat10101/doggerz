import React from "react";
import { useSelector } from "react-redux";
import { selectDog, selectDogLevel, selectCoins } from "../../redux/dogSlice";

export default function Status() {
  const dog = useSelector(selectDog) || {};
  const coins = useSelector(selectCoins);
  const level = useSelector(selectDogLevel);
  const name = dog.name ?? localStorage.getItem("doggerz_name") ?? "Your Pup";

  return (
    <div className="bg-white rounded-2xl shadow p-4 flex items-center justify-between">
      <div className="text-rose-900">
        <div className="font-semibold">{name}</div>
        <div className="text-xs text-rose-900/60">Level {level}</div>
      </div>
      <div className="px-3 py-1 rounded-lg bg-rose-100 text-rose-900">💰 {coins}</div>
    </div>
  );
}