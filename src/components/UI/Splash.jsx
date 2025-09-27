import React from "react";
import { useNavigate } from "react-router-dom";

export default function Splash() {
  const nav = useNavigate();

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      {/* Decorative background that cannot eat clicks */}
      <div className="decor-overlay fixed inset-0 -z-10 bg-gradient-to-b from-slate-900 via-[#0b0f19] to-black" />

      <section className="z-content grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl md:text-6xl font-black leading-tight">
            Adopt your pixel pup.
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-400 bg-clip-text text-transparent">
              Raise. Train. Bond.
            </span>
          </h1>

          <p className="mt-4 text-neutral-300 max-w-prose">
            One dog per user, offline-ready, and your choices shape behavior.
            Installable as a PWA when available. No pay-to-win nonsense.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => nav("/game")}
              className="rounded-xl px-5 py-3 bg-fuchsia-500 font-semibold text-white hover:bg-fuchsia-400 active:scale-[.99] transition"
            >
              Play Now
            </button>
            <button
              onClick={() => nav("/signup")}
              className="rounded-xl px-5 py-3 border border-white/20 hover:bg-white/10 transition"
            >
              Create Account
            </button>
          </div>
        </div>

        <div className="rounded-3xl p-6 bg-white/5 border border-white/10 z-content">
          <Feature
            title="Needs & Mood"
            text="Feed, play, rest. Mood drives animations and behaviors."
          />
          <Feature
            title="Responsive Controls"
            text="Keyboard, touch D-pad, or click-to-move. Smooth and accessible."
          />
          <Feature
            title="Shop & Cosmetics"
            text="Earn coins, unlock skins, keep it tasteful."
          />
        </div>
      </section>
    </main>
  );
}

function Feature({ title, text }) {
  return (
    <div className="rounded-2xl p-4 mb-4 bg-black/30 border border-white/10">
      <div className="font-semibold">{title}</div>
      <div className="text-sm text-neutral-300">{text}</div>
    </div>
  );
}