import React from "react";

const COIN_PACKS = [
  { id: "small", coins: 500, price: "$0.99", bonus: 0, color: "bg-zinc-700" },
  {
    id: "medium",
    coins: 1200,
    price: "$1.99",
    bonus: 20,
    color: "bg-emerald-500",
  },
  {
    id: "large",
    coins: 3000,
    price: "$3.99",
    bonus: 50,
    color: "bg-amber-400",
  },
  {
    id: "mega",
    coins: 10000,
    price: "$9.99",
    bonus: 100,
    color: "bg-pink-400",
  },
];

export default function CoinPackOptions({ onBuy }) {
  return (
    <div className="grid grid-cols-1 gap-4 my-4">
      {COIN_PACKS.map((pack) => (
        <button
          key={pack.id}
          className={`flex items-center justify-between rounded-xl p-4 shadow-lg font-semibold text-black ${pack.color} hover:scale-105 transition`}
          onClick={() => onBuy && onBuy(pack.id)}
        >
          <span className="text-lg">{pack.coins} coins</span>
          <span className="ml-2 text-xs font-bold text-zinc-900 bg-white/80 rounded px-2 py-1">
            {pack.price}
          </span>
          {pack.bonus > 0 && (
            <span className="ml-4 text-xs font-bold text-emerald-700 bg-emerald-100 rounded px-2 py-1">
              +{pack.bonus}% bonus
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
