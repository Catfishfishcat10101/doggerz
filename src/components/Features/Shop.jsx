// src/components/Features/Shop.jsx
import React from "react";
import { useDispatch } from "react-redux";
import { addToy } from "../../redux/dogSlice.js"; // adjust path if different

const items = [
  { name: "Rubber Ball", price: 20 },
  { name: "Fancy Collar", price: 100 },
  { name: "Tasty Treat", price: 15 },
];

export default function Shop() {
  const dispatch = useDispatch();

  const handleBuy = (item) => {
    dispatch(addToy(item)); // adds to dog.toylist in the slice
    // optionally deduct coins, play sound, toast, etc.
  };

  return (
    <div className="p-4 bg-yellow-50 rounded-md shadow-lg max-w-sm">
      <h2 className="text-2xl font-bold mb-4">Doggerz Shop</h2>

      {items.map((item) => (
        <div
          key={item.name}
          className="flex items-center justify-between py-2 border-b last:border-none"
        >
          <span>{item.name}</span>
          <span className="font-semibold">${item.price}</span>

          <button
            onClick={() => handleBuy(item)}
            className="ml-3 px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Add&nbsp;to&nbsp;Cart
          </button>
        </div>
      ))}
    </div>
  );
}
