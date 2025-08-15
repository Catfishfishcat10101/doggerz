// src/components/Features/Shop.jsx
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToy } from "../../redux/dogSlice";
import { useNavigate } from "react-router-dom";

const SHOP_ITEMS = [
  { id: "ball", name: "Bouncy Ball", emoji: "⚽️", description: "A classic dog toy!" },
  { id: "bone", name: "Chew Bone", emoji: "🦴", description: "Satisfies those chewing urges." },
  { id: "duck", name: "Squeaky Duck", emoji: "🦆", description: "Makes noise. Dogs love it!" },
  { id: "frisbee", name: "Frisbee", emoji: "🥏", description: "For the active pup." },
];

export default function Shop() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toylist = useSelector((state) => state.dog.toylist);

  const buyToy = (toy) => {
    if (!toylist.includes(toy.id)) {
      dispatch(addToy(toy.id));
      alert(`You bought a ${toy.name}!`);
    } else {
      alert("You already own this toy.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-100 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-4 text-orange-800">🛒 Shop</h2>
        <div className="grid grid-cols-2 gap-4">
          {SHOP_ITEMS.map((toy) => (
            <div
              key={toy.id}
              className={`border rounded-xl p-4 flex flex-col items-center justify-center bg-orange-50 ${
                toylist.includes(toy.id)
                  ? "opacity-60 border-gray-400"
                  : "border-orange-300"
              }`}
            >
              <span className="text-4xl mb-2">{toy.emoji}</span>
              <span className="font-semibold">{toy.name}</span>
              <span className="text-xs text-gray-600">{toy.description}</span>
              <button
                className={`mt-2 px-3 py-1 rounded ${
                  toylist.includes(toy.id)
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-orange-400 text-white hover:bg-orange-500"
                }`}
                disabled={toylist.includes(toy.id)}
                onClick={() => buyToy(toy)}
              >
                {toylist.includes(toy.id) ? "Owned" : "Buy"}
              </button>
            </div>
          ))}
        </div>
        <button
          className="mt-6 bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded-lg"
          onClick={() => navigate("/game")}
        >
          ← Back to Game
        </button>
      </div>
    </div>
  );
}
