import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const nav = useNavigate();
  return (
    <div className="min-h-[calc(100dvh-3.5rem-3rem)] grid place-items-center bg-[#0b1020] text-white">
      <div className="text-center px-6">
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight">DOGGERZ</h1>
        <p className="mt-3 text-white/70 max-w-xl mx-auto">
          Feed, play, train. Virtual dog chaos, minus the chewed cables.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button className="btn text-black" onClick={() => nav("/")}>Go to Splash</button>
          <button className="btn btn--ghost" onClick={() => nav("/game")}>Jump to Game</button>
        </div>
      </div>
    </div>
  );
}import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const nav = useNavigate();
  return (
    <div className="min-h-[calc(100dvh-3.5rem-3rem)] grid place-items-center bg-[#0b1020] text-white">
      <div className="text-center px-6">
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight">DOGGERZ</h1>
        <p className="mt-3 text-white/70 max-w-xl mx-auto">
          Feed, play, train. Virtual dog chaos, minus the chewed cables.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button className="btn text-black" onClick={() => nav("/")}>Go to Splash</button>
          <button className="btn btn--ghost" onClick={() => nav("/game")}>Jump to Game</button>
        </div>
      </div>
    </div>
  );
}