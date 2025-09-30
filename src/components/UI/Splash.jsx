import React from "react";
import { useNavigate } from "react-router-dom";
import { ensureGuest } from "@/Auth/guest"; // from earlier guest helper

export default function Splash() {
  const nav = useNavigate();
  const start = () => { ensureGuest(); nav("/game"); };

  return (
    <div className="mx-auto max-w-5xl p-6 py-16">
      <h1 className="text-4xl font-black leading-tight">Adopt your Pixel Pup.<br/>Raise. Train. Bond.</h1>
      <p className="mt-3 opacity-80 max-w-prose">
        Keep hunger, energy, and cleanliness balanced—earn bones, unlock tricks, and deck out your pup with accessories.
      </p>
      <div className="mt-6 flex gap-3">
        <button onClick={start} className="rounded-lg px-4 py-2 bg-yellow-500 text-black font-semibold">Play now</button>
        <a href="/privacy" className="rounded-lg px-4 py-2 bg-slate-800">Privacy</a>
      </div>
      {/* no stats, no dog, no tech badges */}
    </div>
  );
}