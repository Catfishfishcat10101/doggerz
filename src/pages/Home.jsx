// src/pages/Home.jsx
// @ts-nocheck

import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/userSlice.js";

export default function Home() {
  const user = useSelector(selectUser);

  return (
    <main className="min-h-[calc(100vh-4rem)] flex justify-center px-4 py-10 text-zinc-100">
      <div className="w-full max-w-5xl space-y-10">
        {/* Hero / intro */}
        <section className="space-y-4 text-center">
          <p className="text-xs font-semibold tracking-[0.2em] text-emerald-400 uppercase">
            Virtual Pup • Time-based care
          </p>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-zinc-50">
            One digital dog. Real-time needs. Your choices shape its life.
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-400">
            Doggerz keeps track of hunger, energy, mood, and cleanliness,
            even when you&apos;re off doing real-world stuff. Check in, care
            for your pup, and watch it grow from puppy to wise senior.
          </p>

          {/* CTAs */}
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link
              to="/adopt"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-lime-400 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 hover:brightness-110 transition"
            >
              Adopt a pup
            </Link>

            {!user && (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-full border border-emerald-500/70 px-5 py-2 text-xs font-medium text-emerald-200 hover:bg-emerald-500/10 transition"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center rounded-full border border-zinc-700 px-5 py-2 text-xs font-medium text-zinc-200 hover:border-emerald-400 hover:text-emerald-300 transition"
                >
                  Sign up
                </Link>
              </>
            )}

            {user && (
              <Link
                to="/game"
                className="inline-flex items-center justify-center rounded-full border border-emerald-500/70 px-5 py-2 text-xs font-medium text-emerald-200 hover:bg-emerald-500/10 transition"
              >
                Back to game
              </Link>
            )}
          </div>

          {/* Need help? -> scroll to explainer */}
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("doggerz-help");
              if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
            className="mt-4 text-xs text-zinc-400 hover:text-zinc-200 underline underline-offset-4"
          >
            How does Doggerz work?
          </button>
        </section>

        {/* Explainer / help section */}
        <section
          id="doggerz-help"
          className="grid gap-6 md:grid-cols-2 rounded-3xl border border-zinc-800 bg-slate-950/80 p-6 sm:p-8 shadow-[0_18px_60px_rgba(6,95,70,0.25)]"
        >
          {/* Lifecycle card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 sm:p-6 flex flex-col gap-3">
            <header className="flex items-center justify-between gap-2">
              <h2 className="text-base sm:text-lg font-semibold text-zinc-50">
                Time keeps moving
              </h2>
              <span className="text-[0.7rem] uppercase tracking-[0.25em] text-emerald-400">
                Lifecycle
              </span>
            </header>

            <ul className="mt-1 space-y-3 text-sm text-zinc-300">
              <li>
                <span className="font-semibold text-emerald-400">1</span>{" "}
                <span className="font-semibold">Puppy • early days</span>
                <br />
                <span className="text-xs text-zinc-400">
                  High energy, hungry all the time, soaking up every bit of
                  attention.
                </span>
              </li>
              <li>
                <span className="font-semibold text-emerald-400">2</span>{" "}
                <span className="font-semibold">Adult • prime years</span>
                <br />
                <span className="text-xs text-zinc-400">
                  Balanced needs and routines. Great time to train and
                  explore.
                </span>
              </li>
              <li>
                <span className="font-semibold text-emerald-400">3</span>{" "}
                <span className="font-semibold">Senior • slow and wise</span>
                <br />
                <span className="text-xs text-zinc-400">
                  Slower pace, more rest, and more careful daily care.
                </span>
              </li>
              <li>
                <span className="font-semibold text-rose-400">∞</span>{" "}
                <span className="font-semibold">Legacy</span>
                <br />
                <span className="text-xs text-zinc-400">
                  Consistent care stretches out their days. Long neglect can
                  cut their story short.
                </span>
              </li>
            </ul>
          </div>

          {/* Dog polls / cleanliness card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 sm:p-6 flex flex-col gap-3">
            <header className="flex items-center justify-between gap-2">
              <h2 className="text-base sm:text-lg font-semibold text-zinc-50">
                Dog polls &amp; cleanliness tiers
              </h2>
              <span className="text-[0.7rem] uppercase tracking-[0.25em] text-emerald-400">
                Care loops
              </span>
            </header>

            <p className="text-xs text-zinc-400">
              Timed prompts (&quot;dog polls&quot;) ask what you want to do:
              go outside, play, snack, or bathe. Your answers affect mood,
              energy, and how messy your yard and pup get over time.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-1 text-xs">
              <div className="rounded-xl border border-zinc-700 bg-zinc-900/80 p-3">
                <p className="font-semibold text-zinc-100 mb-1">Fresh</p>
                <p className="text-zinc-400">
                  Regular baths, clean yard, and a comfortable, happy dog.
                </p>
              </div>
              <div className="rounded-xl border border-zinc-700 bg-zinc-900/80 p-3">
                <p className="font-semibold text-zinc-100 mb-1">Dirty</p>
                <p className="text-zinc-400">
                  Mud and grime build up. Happiness slowly ticks down.
                </p>
              </div>
              <div className="rounded-xl border border-zinc-700 bg-zinc-900/80 p-3">
                <p className="font-semibold text-zinc-100 mb-1">Fleas</p>
                <p className="text-zinc-400">
                  Neglect long enough and fleas show up, draining energy and
                  mood.
                </p>
              </div>
              <div className="rounded-xl border border-zinc-700 bg-zinc-900/80 p-3">
                <p className="font-semibold text-zinc-100 mb-1">Mange</p>
                <p className="text-zinc-400">
                  Worst-case state. Tough to recover from, but not impossible
                  if you commit.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};