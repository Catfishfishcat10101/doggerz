import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/userSlice";

export default function Splash() {
  const user = useSelector(selectUser);
  const nav = useNavigate();

  function primaryCta() {
    if (!user?.uid) nav("/signup");
    else nav("/game");
  }

  return (
    <section className="relative min-h-[calc(100dvh-56px)] overflow-hidden bg-gradient-to-b from-amber-200/20 via-pink-200/15 to-slate-900/40">
      {/* subtle glow */}
      <div className="pointer-events-none absolute inset-0 opacity-50 mix-blend-screen" aria-hidden>
        <div className="absolute -top-20 -left-20 w-[45rem] h-[45rem] rounded-full bg-pink-300 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-[42rem] h-[42rem] rounded-full bg-amber-200 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Hero copy */}
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow mb-4">
              Adopt your <span className="text-amber-300">Pixel Pup</span>.
              Raise. Train. Bond.
            </h1>
            <p className="text-white/85 text-lg leading-relaxed mb-8">
              Doggerz is a cozy virtual pet where your choices shape behavior.
              Keep hunger, energy, and cleanliness balanced—earn bones, unlock
              tricks, and deck out your pup with accessories.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={primaryCta}
                className="px-5 py-3 rounded-2xl text-slate-900 font-semibold bg-amber-400/90 hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300"
              >
                {user?.uid ? "Play now" : "Get started"}
              </button>

              {!user?.uid ? (
                <button
                  type="button"
                  onClick={() => nav("/login")}
                  className="px-5 py-3 rounded-2xl font-semibold bg-white/10 hover:bg-white/20 text-white"
                >
                  Log in
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => nav("/shop")}
                  className="px-5 py-3 rounded-2xl font-semibold bg-white/10 hover:bg-white/20 text-white"
                >
                  Open Shop
                </button>
              )}

              <Link
                to="/legal/privacy"
                className="px-5 py-3 rounded-2xl font-semibold bg-white/5 hover:bg-white/10 text-white"
              >
                Privacy
              </Link>
            </div>

            {/* Social proof / badges (optional) */}
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/70">
              <span>React 18 • Redux Toolkit • Vite • Tailwind • Firebase • PWA</span>
            </div>
          </div>

          {/* Placeholder visual (replace with your sprite preview later) */}
          <div className="relative">
            <div className="aspect-square rounded-3xl bg-slate-900/50 border border-white/10 shadow-2xl flex items-center justify-center">
              <div className="text-center p-6">
                <div className="text-6xl mb-2">🐶</div>
                <div className="text-white/80">Your pup is waiting…</div>
                <div className="text-white/60 text-sm mt-1">Tap to bark. WASD to move.</div>
              </div>
            </div>
            {/* CTA chip */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-emerald-300/90 text-slate-900 text-sm font-semibold shadow">
              Offline-ready PWA
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
