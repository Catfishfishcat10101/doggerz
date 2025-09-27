import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Splash() {
  const nav = useNavigate();
  const user = useSelector((s) => s.user.user);

  return (
    <main className="flex-1 grid place-items-center px-4">
      <section className="w-full max-w-3xl text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Adopt your <span className="text-emerald-400">Pixel Pup</span>
        </h1>
        <p className="mt-3 opacity-80">
          Train. Feed. Scoop. Repeat. Your decisions shape behavior.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button className="btn-primary" onClick={() => nav("/game")}>
            {user ? "Continue Game" : "Play Now"}
          </button>
          <button className="btn-ghost" onClick={() => nav("/shop")}>
            Browse Shop
          </button>
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-black/20 p-6">
          <ul className="grid sm:grid-cols-3 gap-4 text-left text-sm">
            <li className="card-kpi">
              <span className="kpi">Real-time Needs</span>
              Hunger • Energy • Cleanliness
            </li>
            <li className="card-kpi">
              <span className="kpi">Behavior Engine</span>
              Idle → Playful → Gremlin
            </li>
            <li className="card-kpi">
              <span className="kpi">Offline PWA</span>
              Launch from home screen
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}