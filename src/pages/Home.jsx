// src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectDog } from "@/redux/dogSlice.js";

export default function Home() {
  const dog = useSelector(selectDog);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-zinc-100 flex justify-center px-4 py-10">
      <div className="w-full max-w-5xl space-y-10">
        {/* Hero / intro */}
        <section className="space-y-4 text-center">
          <p className="text-xs font-semibold tracking-[0.2em] text-emerald-400 uppercase">
            Virtual Pup • Time-based care
          </p>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-zinc-50">
            From puppy to wise senior. How you treat your dog literally
            determines its lifespan.
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-400">
            Doggerz keeps time ticking while you&apos;re away. Check in, feed,
            clean, and play—your choices shape their story.
          </p>

          {/* Primary CTAs */}
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link to="/adopt" className="dz-btn dz-btn--pill text-sm">
              Adopt
            </Link>

            {!dog && (
              <>
                <Link
                  to="/login"
                  className="dz-btn dz-btn--ghost dz-btn--pill text-sm"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="dz-btn dz-btn--ghost dz-btn--pill text-sm"
                >
                  Sign up
                </Link>
              </>
            )}

            {dog && (
              <Link
                to="/game"
                className="dz-btn dz-btn--ghost dz-btn--pill text-sm"
              >
                Back to game
              </Link>
            )}
          </div>

          {/* No “Already created an account? Jump back in.” */}

          {/* Need help? link */}
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
            Need help? Learn how Doggerz works.
          </button>
        </section>

        {/* Help / explainer section */}
        <section
          id="doggerz-help"
          className="grid gap-6 md:grid-cols-2 rounded-3xl border border-zinc-800 bg-gradient-to-br from-slate-900/90 to-slate-950/95 p-6 sm:p-8"
        >
          {/* Life doesn’t pause block */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6 flex flex-col gap-3">
            <header className="flex items-center justify-between gap-2">
              <h2 className="text-base sm:text-lg font-semibold text-zinc-50">
                Life doesn&apos;t pause
              </h2>
              <span className="text-[0.7rem] uppercase tracking-[0.25em] text-emerald-400">
                Lifecycle
              </span>
            </header>

            <ul className="mt-1 space-y-3 text-sm text-zinc-300">
              <li>
                <span className="font-semibold text-emerald-400">1</span>{" "}
                <span className="font-semibold">Puppy • 0–6 months</span>
                <br />
                <span className="text-xs text-zinc-400">
                  High energy, fast growth, soaking up every cuddle.
                </span>
              </li>
              <li>
                <span className="font-semibold text-emerald-400">2</span>{" "}
                <span className="font-semibold">
                  Adult • 6 months – 7 years
                </span>
                <br />
                <span className="text-xs text-zinc-400">
                  Balanced needs, learns routines, pushes for adventures.
                </span>
              </li>
              <li>
                <span className="font-semibold text-emerald-400">3</span>{" "}
                <span className="font-semibold">Senior • 7+ years</span>
                <br />
                <span className="text-xs text-zinc-400">
                  Slower pace, higher care requirements, legacy memories.
                </span>
              </li>
              <li>
                <span className="font-semibold text-rose-400">∞</span>{" "}
                <span className="font-semibold">Legacy</span>
                <br />
                <span className="text-xs text-zinc-400">
                  Care well and extend their days. Neglect them and the story
                  ends sooner.
                </span>
              </li>
            </ul>
          </div>

          {/* Dog polls / cleanliness block */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6 flex flex-col gap-3">
            <header className="flex items-center justify-between gap-2">
              <h2 className="text-base sm:text-lg font-semibold text-zinc-50">
                Dog polls &amp; cleanliness
              </h2>
              <span className="text-[0.7rem] uppercase tracking-[0.25em] text-emerald-400">
                Care loops
              </span>
            </header>

            <p className="text-xs text-zinc-400">
              Timed &quot;dog polls&quot; nudge you with quick decisions.
              Ignore them and the pup tells everyone how it feels. Bathing is
              critical—the longer you wait, the worse the consequences.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-1 text-xs">
              <div className="rounded-xl border border-zinc-700 bg-zinc-900/80 p-3">
                <p className="font-semibold text-zinc-100 mb-1">Fresh</p>
                <p className="text-zinc-400">
                  Regular baths keep the coat shiny and stats boosted.
                </p>
              </div>
              <div className="rounded-xl border border-zinc-700 bg-zinc-900/80 p-3">
                <p className="font-semibold text-zinc-100 mb-1">Dirty</p>
                <p className="text-zinc-400">
                  Skip a wash and dirt accrues, lowering happiness.
                </p>
              </div>
              <div className="rounded-xl border border-zinc-700 bg-zinc-900/80 p-3">
                <p className="font-semibold text-zinc-100 mb-1">Fleas</p>
                <p className="text-zinc-400">
                  Neglect longer and fleas appear, sapping energy.
                </p>
              </div>
              <div className="rounded-xl border border-zinc-700 bg-zinc-900/80 p-3">
                <p className="font-semibold text-zinc-100 mb-1">Mange</p>
                <p className="text-zinc-400">
                  At rock bottom, the pup needs urgent care to recover.
                </p>
              </div>
            </div>

            <div className="mt-2">
              <Link
                to="/guide"
                className="text-[0.75rem] text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
              >
                Read the full care guide →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
