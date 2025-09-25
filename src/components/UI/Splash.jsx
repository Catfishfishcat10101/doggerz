// src/components/UI/Splash.jsx
import React from "react";
import { Link } from "react-router-dom";
import FeatureStripe from "./FeatureStripe";
import { Dog } from "lucide-react";

export default function Splash() {
  return (
    <main className="min-h-[calc(100vh-56px)] bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <section className="mx-auto max-w-6xl px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-800/70 ring-1 ring-white/10 px-3 py-1 mb-6">
            <Dog className="h-4 w-4" />
            <span className="text-xs tracking-wide uppercase text-slate-300">Doggerz</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
            Raise your <span className="text-sky-400">pixel pup</span>.
            Keep it happy. Show it off.
          </h1>

          <p className="mt-4 text-slate-300 max-w-prose">
            Frictionless onboarding, true offline play, and cloud saves when you’re back online.
            Cosmetics you actually care about. Zero clutter. Maximum vibes.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/signup"
              className="px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-medium shadow-lg shadow-sky-900/30"
            >
              Create account
            </Link>
            <Link
              to="/login"
              className="px-5 py-3 rounded-xl border border-white/20 hover:bg-white/10 font-medium"
            >
              I already have one
            </Link>
          </div>

          <FeatureStripe />
        </div>

        <div className="relative">
          <div className="aspect-square rounded-3xl bg-gradient-to-br from-sky-500/20 via-sky-300/10 to-transparent ring-1 ring-white/10 p-8">
            <div className="h-full w-full rounded-2xl bg-slate-900/40 grid place-content-center">
              {/* Placeholder hero art; swap with your dog sprite/animation */}
              <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 mx-auto" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}