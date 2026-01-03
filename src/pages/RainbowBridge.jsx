// src/pages/RainbowBridge.jsx
import { Link } from "react-router-dom";

import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";

export default function RainbowBridge() {
  return (
    <div className="min-h-dvh w-full bg-zinc-950 text-zinc-100">
      <Header />

      <main className="mx-auto w-full max-w-4xl px-4 py-10">
        <div className="rounded-[2rem] border border-white/10 bg-black/40 backdrop-blur-md shadow-[0_0_80px_rgba(0,0,0,0.55)] overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-white/10">
            <div className="text-xs uppercase tracking-[0.22em] text-zinc-300/90">
              Rainbow Bridge
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-sky-200 to-violet-200">
              A quiet place to remember
            </h1>
            <p className="mt-3 text-sm text-zinc-200/90 max-w-prose">
              This scene is here as a gentle, cozy space in the world — a place for gratitude,
              reflection, and the bond you built.
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <div className="rounded-3xl border border-white/10 bg-black/30 p-5 sm:p-6">
              <p className="text-sm text-zinc-200/90 leading-relaxed">
                When you’re ready, take a slow breath. Think of a moment your pup made you smile.
                That’s the kind of magic we’re collecting here.
              </p>
              <div className="mt-4 grid gap-2 text-xs text-zinc-300/80">
                <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                  Tip: we’ll wire this scene into the lifecycle later — for now it’s an optional route.
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                to="/game"
                className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-extrabold bg-emerald-400 text-black shadow-[0_0_35px_rgba(52,211,153,0.25)] hover:bg-emerald-300 transition"
              >
                Back to the yard
              </Link>
              <Link
                to="/settings"
                className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold border border-white/15 bg-black/30 text-zinc-100 hover:bg-black/45 transition"
              >
                Settings
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
