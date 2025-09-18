// src/components/Features/Memory.jsx
import React from "react";
import { useSelector } from "react-redux";
import { selectDogLevel, selectCoins, selectAccessories } from "../../redux/dogSlice";

/** Lightweight "event log" / memory board (static for now).
 *  Meant as a placeholder UI you can later wire to real events.
 */
export default function Memory() {
  const level = useSelector(selectDogLevel);
  const coins = useSelector(selectCoins);
  const accessories = useSelector(selectAccessories);
  const ownedCount = accessories?.owned?.length ?? 0;

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h3 className="text-lg font-semibold text-rose-900">Doggerz Memory</h3>
      <ul className="mt-3 text-rose-900/80 text-sm list-disc pl-5 space-y-1">
        <li>Current Level: {level}</li>
        <li>Coins: {coins}</li>
        <li>Owned Accessories: {ownedCount}</li>
        <li>Session Buff: {sessionStorage.getItem("buff") || "None"}</li>
        <li>Yard Skin: {sessionStorage.getItem("yardSkin") || "default"}</li>
      </ul>
    </div>
  );
}