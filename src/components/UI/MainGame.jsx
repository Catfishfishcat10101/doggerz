// src/components/UI/MainGame.jsx
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import DogSprite from "./DogSprite";
import Controls from "./Controls";
import TrickList from "./TrickList";
import { gainXP, feedDog, playWithDog, batheDog, move, startWalking, stopWalking } from "../../redux/dogSlice";
import { useNavigate } from "react-router-dom";

export default function MainGame() {
  const dog = useSelector((state) => state.dog);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Example handler for moving the dog
  const walkDog = (dx = 0, dy = 0) => {
    dispatch(startWalking());
    setTimeout(() => {
      dispatch(move({ x: dog.x + dx, y: dog.y + dy, direction: dx > 0 ? "right" : dx < 0 ? "left" : dy > 0 ? "down" : "up" }));
      dispatch(stopWalking());
    }, 400);
  };

  return (
    <div className="bg-[#15161a] min-h-screen flex flex-col items-center p-4 relative">
      <header className="flex flex-row items-center justify-between w-full max-w-xl mb-2">
        <div>
          <span className="font-bold text-xl text-yellow-200">{dog.name || "Your Dog"}</span>
          <span className="ml-3 text-gray-400 text-sm">Level {dog.level} • XP {dog.xp}/{dog.level * 100}</span>
        </div>
        <button
          className="bg-white/10 text-white text-xs px-3 py-1 rounded hover:bg-white/20"
          onClick={() => navigate("/settings")}
        >
          ⚙️ Settings
        </button>
      </header>
      <section className="relative w-full max-w-xl h-80 bg-[url('/backgrounds/yard_day.png')] bg-cover rounded-2xl shadow-lg overflow-hidden flex items-end justify-center mb-4">
        <DogSprite x={dog.x} y={dog.y} direction={dog.direction} isWalking={dog.isWalking} isDirty={dog.isDirty} />
        {/* You can render poop, toys, and more here */}
      </section>
      <div className="grid grid-cols-2 gap-4 mb-4 w-full max-w-xl">
        <div className="bg-white/10 rounded-xl p-4 flex flex-col space-y-2">
          <div>
            <span className="font-semibold text-green-400">Hunger:</span>
            <span className="ml-2">{dog.hunger}</span>
          </div>
          <div>
            <span className="font-semibold text-pink-300">Happiness:</span>
            <span className="ml-2">{dog.happiness}</span>
          </div>
          <div>
            <span className="font-semibold text-blue-200">Energy:</span>
            <span className="ml-2">{dog.energy}</span>
          </div>
          <div>
            <span className="font-semibold text-purple-200">Potty Trained:</span>
            <span className="ml-2">{dog.isPottyTrained ? "Yes" : "No"}</span>
          </div>
          <div>
            <span className="font-semibold text-yellow-400">Cleanliness:</span>
            <span className="ml-2">{dog.isDirty ? "Dirty" : "Clean"}</span>
          </div>
        </div>
        <div>
          <TrickList />
        </div>
      </div>
      <Controls
        onFeed={() => { dispatch(feedDog()); dispatch(gainXP(10)); }}
        onPlay={() => { dispatch(playWithDog()); dispatch(gainXP(15)); }}
        onBathe={() => { dispatch(batheDog()); dispatch(gainXP(5)); }}
        onWalkUp={() => walkDog(0, -16)}
        onWalkDown={() => walkDog(0, 16)}
        onWalkLeft={() => walkDog(-16, 0)}
        onWalkRight={() => walkDog(16, 0)}
      />
      <div className="flex flex-row gap-4 mt-4">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700"
          onClick={() => navigate("/potty")}
        >
          🚽 Potty Training
        </button>
        <button
          className="bg-sky-600 text-white px-4 py-2 rounded-xl hover:bg-sky-700"
          onClick={() => navigate("/shop")}
        >
          🛒 Shop
        </button>
        <button
          className="bg-yellow-500 text-white px-4 py-2 rounded-xl hover:bg-yellow-600"
          onClick={() => navigate("/memory")}
        >
          📖 Memories
        </button>
      </div>
    </div>
  );
}
