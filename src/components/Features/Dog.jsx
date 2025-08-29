// src/components/Features/Dog.jsx
import React from "react";
import { useSelector } from "react-redux";
import sprite from "../UI/sprites/jack_russell_directions.png";

export default function Dog() {
  // Pull position & facing from Redux if you already track them
  const { x = 96, y = 96, direction = "down" } = useSelector((s) => s.dog || {});
  console.log("resolved sprite URL ->", sprite);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-4">
        <img
          src={sprite}
          alt="Dog sprite"
          className="w-96 h-auto rounded shadow-lg"
        />
        <div className="text-lg">Your pup</div>
        <div className="text-sm text-slate-400 break-words max-w-lg">
          {sprite}
        </div>
      </div>
    </div>
  );
}
