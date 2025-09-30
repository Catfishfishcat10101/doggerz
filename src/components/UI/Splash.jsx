// src/components/UI/Splash.jsx
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { selectUser } from "@/redux/userSlice";
import PupStage from "@/components/UI/PupStage.jsx";

export default function Splash() {
  const user = useSelector(selectUser);
  const nav = useNavigate();

  function handlePrimary() {
    if (user) nav("/game");
    else nav("/signup");
  }

  return (
    <main className="mx-auto max-w-6xl px-4 pt-10 pb-24">
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
        <div className="relative">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
            Adopt your <span className="text-amber-300 drop-shadow">Pixel Pup</span>.<br />
            Raise. Train. Bond.
          </h1>
          <p className="mt-5 text-slate-300 max-w-prose">
            Doggerz is a cozy virtual pet where your choices shape behavior.
            Keep hunger, energy, and cleanliness balanced—earn bones, unlock tricks,
            and deck out your pup with accessories.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={handlePrimary}
              className="px-5 py-3 rounded-2xl bg-amber-400 text-slate-900 font-semibold hover:bg-amber-300 transition"
            >
              {user ? "Continue" : "Get started"}
            </button>
            <Link to="/privacy" className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 transition">
              Privacy
            </Link>
          </div>
        </div>

        {/* Live demo pup on the right */}
        <PupStage interactive={false} className="rounded-3xl" />
      </section>
    </main>
  );
}
