// src/pages/Splash.jsx
// @ts-nocheck

import React from "react";
import { useNavigate } from "react-router-dom";

export default function Splash() {
  const navigate = useNavigate();

  const handleAdoptClick = () => {
    navigate("/adopt");
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Main hero */}
      <section className="mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-24 pt-28 md:flex-row md:items-center">
        {/* LEFT SIDE – BRAND + COPY */}
        <div className="flex-1 space-y-7">
          {/* Tiny label – no second DOGGERZ text */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
            virtual pup • real-time care
          </div>

          {/* Big DOGGERZ wordmark in the middle again */}
          <h1 className="space-y-2">
            <span className="block text-[3rem] leading-[1.05] font-black tracking-tight text-emerald-400 drop-shadow-[0_0_22px_rgba(16,185,129,0.85)] md:text-[4rem]">
              DOGGERZ
            </span>
            <span className="block text-2xl font-semibold text-slate-50 md:text-3xl">
              Virtual pup simulator
            </span>
          </h1>

          {/* Description – no yellow accent, just clean text */}
          <p className="max-w-xl text-sm leading-relaxed text-slate-300 md:text-base">
            Adopt a single pixel pup, keep it fed, clean, and trained, and
            try not to ghost your dog. Stats tick in real time, even when
            you&apos;re off doing human stuff.
          </p>

          {/* Primary CTA – ONLY Adopt button, no extra Log in text */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              type="button"
              onClick={handleAdoptClick}
              className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-7 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/40 transition-transform duration-150 hover:-translate-y-[1px] hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Adopt a pup
            </button>

            {/* If you *do* want a secondary action later, add it here –
                for now we keep it clean and avoid the extra Login. */}
          </div>

          {/* NO more "Dev shortcut: go straight to the yard" */}
        </div>

        {/* RIGHT SIDE – PREVIEW CARD */}
        <div className="flex-1">
          <div className="mx-auto w-full max-w-md rounded-3xl border border-emerald-500/30 bg-slate-900/60 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.75)] backdrop-blur">
            <div className="mb-4 flex items-center justify-between text-[0.65rem] font-mono uppercase tracking-[0.25em] text-slate-400">
              <span>Preview</span>
              <span className="text-emerald-300">real-time sim</span>
            </div>

            {/* Fake “device” / card */}
            <div className="flex items-center justify-center rounded-3xl bg-slate-950/80 px-6 py-10">
              <div className="relative flex h-32 w-24 items-center justify-center rounded-3xl bg-gradient-to-b from-slate-800 to-slate-950 shadow-[0_0_25px_rgba(15,118,110,0.9)]">
                <div className="absolute inset-[9px] rounded-2xl bg-gradient-to-br from-emerald-500/20 via-slate-900 to-slate-950 border border-emerald-500/40" />
                <span className="relative z-10 text-[0.6rem] font-mono text-emerald-200/80">
                  your<br />
                  pixel<br />
                  pup
                </span>
              </div>
            </div>

            {/* Tiny stats row */}
            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 text-[0.7rem] font-mono">
              <div className="text-slate-400">mood</div>
              <div className="text-right text-emerald-300">tbd</div>

              <div className="text-slate-400">hunger</div>
              <div className="text-right text-slate-100">ticks hourly</div>

              <div className="text-slate-400">energy</div>
              <div className="text-right text-slate-100">sleeps to heal</div>

              <div className="text-slate-400">cleanliness</div>
              <div className="text-right text-slate-100">dirt accumulates</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
