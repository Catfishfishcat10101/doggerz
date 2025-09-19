import React from "react";
import { useSelector, useDispatch } from "react-redux";
import DogSprite from "../UI/DogSprite";
import {
  feedDog,
  playWithDog,
  batheDog,
  teachTrick,
  startWalking,
  stopWalking,
  move,
} from "../../redux/dogSlice";

export default function Dog() {
  const dog = useSelector((s) => s.dog);
  const dispatch = useDispatch();

  const walk = (dx = 0, dy = 0) => {
    dispatch(startWalking());
    setTimeout(() => {
      dispatch(
        move({
          x: dog.x + dx,
          y: dog.y + dy,
          direction: dx > 0 ? "right" : dx < 0 ? "left" : dy > 0 ? "down" : "up",
        })
      );
      dispatch(stopWalking());
    }, 300);
  };

  const learnSampleTrick = () => dispatch(teachTrick("Sit"));

  return (
    <div className="min-h-screen bg-[#15161a] text-white flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-2">🐶 {dog.name || "Your Dog"}</h1>
      <div className="text-sm text-white/70 mb-4">
        Level {dog.level} • XP {dog.xp}/{dog.level * 100}
      </div>

      <div className="relative w-full max-w-xl h-80 bg-[url('/backgrounds/yard_day.png')] bg-cover rounded-2xl shadow overflow-hidden mb-4 flex items-end justify-center">
        <DogSprite
          x={dog.x}
          y={dog.y}
          direction={dog.direction}
          isWalking={dog.isWalking}
          isDirty={dog.isDirty}
        />
      </div>

      <div className="grid grid-cols-3 gap-3 w-full max-w-xl mb-4">
        <div className="bg-white/10 rounded p-3">
          <div className="text-xs text-white/70">Hunger</div>
          <div className="font-semibold">{dog.hunger}</div>
        </div>
        <div className="bg-white/10 rounded p-3">
          <div className="text-xs text-white/70">Happiness</div>
          <div className="font-semibold">{dog.happiness}</div>
        </div>
        <div className="bg-white/10 rounded p-3">
          <div className="text-xs text-white/70">Energy</div>
          <div className="font-semibold">{dog.energy}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button className="bg-green-600 px-3 py-2 rounded" onClick={() => dispatch(feedDog())}>🍖 Feed</button>
        <button className="bg-sky-600 px-3 py-2 rounded" onClick={() => dispatch(playWithDog())}>🦴 Play</button>
        <button className="bg-yellow-600 px-3 py-2 rounded" onClick={() => dispatch(batheDog())}>🛁 Bathe</button>
        <button className="bg-purple-600 px-3 py-2 rounded" onClick={learnSampleTrick}>🎓 Learn “Sit”</button>
      </div>

      <div className="flex gap-2">
        <button className="bg-white/10 px-3 py-2 rounded" onClick={() => walk(0, -16)}>⬆️</button>
        <div className="flex gap-2">
          <button className="bg-white/10 px-3 py-2 rounded" onClick={() => walk(-16, 0)}>⬅️</button>
          <button className="bg-white/10 px-3 py-2 rounded" onClick={() => walk(16, 0)}>➡️</button>
        </div>
        <button className="bg-white/10 px-3 py-2 rounded" onClick={() => walk(0, 16)}>⬇️</button>
      </div>
    </div>
  );
}
