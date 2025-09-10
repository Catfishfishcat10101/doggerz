// src/components/Features/Shop.jsx
import React, { useState } from "react";

export default function Shop() {
  const [items] = useState([
    { id: 1, name: "Bone", price: 10, desc: "Boost happiness for one session." },
    { id: 2, name: "Ball", price: 20, desc: "Increases play XP for one session." },
    { id: 3, name: "Training Whistle", price: 50, desc: "Boosts training XP for one session." },
  ]);

  const handleBuy = (item) => {
    alert(`You bought a ${item.name} for ${item.price} coins!`);
    // TODO: hook into Redux / Dog state for real XP or happiness buffs
  };

  return (
    <div className="shop-container p-6 bg-gradient-to-b from-gray-100 to-gray-200 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Shop</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl shadow-lg p-4 flex flex-col justify-between"
          >
            <div>
              <h2 className="text-xl font-semibold">{item.name}</h2>
              <p className="text-gray-600 mb-2">{item.desc}</p>
            </div>
            <button
              onClick={() => handleBuy(item)}
              className="mt-3 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition"
            >
              Buy for {item.price} coins
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}