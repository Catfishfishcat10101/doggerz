// src/components/screens/StartScreen.jsx

import { Link, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowRight, PawPrint } from "lucide-react";

import HeroDog3D from "@/components/brand/HeroDog3D.jsx";
import { PATHS } from "@/app/routes.js";
import { selectIsLoggedIn } from "@/store/userSlice.js";

/*
  LEARNING MODE

  This is the first screen a new user sees at "/".

  The old version had:
  - headline too big
  - dog card too empty
  - dog preview looking like a raw model viewer
  - weak visual hierarchy

  This version makes the first screen more app-store/premium:
  - smaller, sharper hero copy
  - better spacing
  - one clear CTA
  - dog preview framed like a real product card
  - stronger tagline
*/

const FEATURE_CARDS = Object.freeze([
  {
    title: "One dog",
    body: "Build a bond with one Jack Russell that remembers your care.",
  },
  {
    title: "Real habits",
    body: "Potty training, obedience, mood, energy, and daily routines.",
  },
  {
    title: "Living yard",
    body: "Day, night, weather, memories, and behavior changes over time.",
  },
]);

const TRUST_POINTS = Object.freeze([
  "Cloud save ready",
  "3D dog renderer",
  "180-day companion arc",
]);

export default function StartScreen() {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const settings = useSelector((state) => state.settings || {});
  const reduceMotion = Boolean(settings.reduceMotion || settings.batterySaver);

  if (isLoggedIn) return <Navigate to={PATHS.GAME} replace />;

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#040a14] text-white">
      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col px-5 py-[calc(env(safe-area-inset-top,0px)+22px)] sm:px-8 lg:px-10">
        <nav className="flex items-center justify-between gap-4">
          <Link
            to={PATHS.HOME}
            className="group inline-flex items-center gap-3"
            aria-label="Doggerz home"
          >
            <span className="grid h-10 w-10 place-items-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 shadow-[0_0_30px_rgba(34,197,94,0.12)]">
              <PawPrint
                aria-hidden="true"
                className="h-5 w-5 text-emerald-100"
              />
            </span>
            <span className="text-lg font-black uppercase tracking-[0.28em] text-emerald-100 drop-shadow-[0_0_14px_rgba(134,239,172,0.18)]">
              Doggerz
            </span>
          </Link>

          <Link
            to={PATHS.LOGIN}
            className="rounded-full border border-white/14 bg-white/[0.06] px-4 py-2.5 text-xs font-black uppercase tracking-[0.18em] text-zinc-100 backdrop-blur transition hover:bg-white/10"
          >
            Login
          </Link>
        </nav>

        <section className="grid flex-1 items-center gap-8 py-8 md:grid-cols-[0.92fr_1.08fr] lg:gap-12">
          <div className="order-2 max-w-2xl md:order-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-100">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(134,239,172,0.9)]" />
              Doggerz companion sim
            </div>

            <h1 className="mt-5 max-w-[11ch] text-[clamp(3.1rem,8vw,5.9rem)] font-black leading-[0.92] text-white">
              Raise a dog that remembers you.
            </h1>

            <p className="mt-5 max-w-xl text-[1.05rem] leading-8 text-zinc-300 sm:text-lg">
              Adopt a Jack Russell, care for its daily needs, potty train it,
              and shape its personality across a 180-day companion journey.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                to={PATHS.ADOPT}
                className="doggerz-button doggerz-hero-button gap-2 px-6 py-4 text-center text-sm uppercase tracking-[0.16em]"
              >
                <span>Adopt your pup</span>
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>

              <Link
                to={PATHS.ABOUT}
                className="doggerz-button doggerz-button-ghost px-6 py-4 text-center text-sm uppercase tracking-[0.16em]"
              >
                How it works
              </Link>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {TRUST_POINTS.map((point) => (
                <span key={point} className="doggerz-chip doggerz-chip-good">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  {point}
                </span>
              ))}
            </div>

            <div className="mt-7 grid max-w-2xl gap-3 sm:grid-cols-3">
              {FEATURE_CARDS.map((item) => (
                <article
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur"
                >
                  <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-200">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {item.body}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="order-1 flex min-h-[23rem] items-center justify-center md:order-2">
            <div className="relative w-full max-w-[31rem]">
              <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,6,23,0.96))] shadow-[0_30px_110px_rgba(0,0,0,0.58)]">
                <div className="relative h-[23rem] overflow-hidden sm:h-[27rem]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(134,239,172,0.2),transparent_34%),linear-gradient(180deg,rgba(56,189,248,0.08),transparent_48%,rgba(34,197,94,0.12))]" />

                  <HeroDog3D
                    className="absolute inset-0"
                    stage="PUPPY"
                    mood={reduceMotion ? "neutral" : "happy"}
                    actionOverride={reduceMotion ? "Idle" : "Wag"}
                    timeOfDay="sunset"
                    weather="sunny"
                  />

                  <div className="pointer-events-none absolute inset-x-8 bottom-16 h-10 rounded-full bg-black/30 blur-xl" />
                </div>

                <div className="border-t border-white/10 bg-black/38 p-5 backdrop-blur-xl">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.24em] text-amber-100">
                        Fireball preview
                      </div>
                      <p className="mt-1 text-base font-black leading-6 text-white">
                        Lively, stubborn, and ready for the yard.
                      </p>
                    </div>

                    <div className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-100">
                      Puppy stage
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
