// src/components/screens/StartScreen.jsx

import { Link, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowRight, PawPrint } from "lucide-react";

import HeroDog3D from "@/components/brand/HeroDog3D.jsx";
import { PATHS } from "@/app/routes.js";
import { selectIsLoggedIn } from "@/store/userSlice.js";

export default function StartScreen() {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const settings = useSelector((state) => state.settings || {});
  const reduceMotion = Boolean(settings.reduceMotion || settings.batterySaver);

  if (isLoggedIn) return <Navigate to={PATHS.GAME} replace />;

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#040a14] text-white">
      <div className="relative flex min-h-[100dvh] w-full flex-col items-center px-4 py-[calc(env(safe-area-inset-top,0px)+16px)] sm:px-6 lg:px-10">
        {/* Mobile-first nav - vertical stack on mobile, horizontal on md+ */}
        <nav className="flex w-full max-w-2xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <Link
            to={PATHS.HOME}
            className="group flex flex-col items-center gap-3 sm:flex-row sm:gap-4"
            aria-label="Doggerz home"
          >
            <span className="grid h-20 w-20 place-items-center rounded-2xl border border-emerald-600/30 bg-emerald-600/8 shadow-[0_0_30px_rgba(5,150,105,0.15)]">
              <PawPrint
                aria-hidden="true"
                className="h-10 w-10 bg-gradient-to-br from-emerald-400 to-emerald-600 bg-clip-text text-transparent"
              />
            </span>
            <span className="text-4xl font-black uppercase tracking-[0.22em] bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 bg-clip-text text-transparent drop-shadow-[0_0_14px_rgba(5,150,105,0.2)]">
              Doggerz
            </span>
          </Link>

          <Link
            to={PATHS.ABOUT}
            className="rounded-full border border-emerald-500/40 bg-black px-4 py-2.5 text-xs font-black uppercase tracking-[0.18em] backdrop-blur transition hover:border-emerald-400/60 hover:shadow-[0_8px_24px_rgba(34,197,94,0.25)]"
            style={{
              background: "rgba(0, 0, 0, 0.8)",
              backgroundImage: "linear-gradient(135deg, #bef264, #34d399 48%, #22c55e)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            How it works
          </Link>
        </nav>

        {/* Main content - mobile-first single column, then grid on md */}
        <section className="mt-8 flex w-full max-w-2xl flex-col items-center gap-8 py-8 lg:mt-12">
          <div className="flex w-full flex-col items-center text-center">
            <h1 className="text-[clamp(1.8rem,5vw,3rem)] font-black leading-[0.92] text-white">
              Raise a dog that remembers you.
            </h1>

            <p className="mt-5 max-w-xl text-[clamp(0.95rem,2.5vw,1.05rem)] leading-8 text-zinc-300">
              Adopt a Jack Russell, care for its daily needs, potty train it,
              and shape its personality across a 180-day companion journey.
            </p>

            <div className="mt-7 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                to={PATHS.ADOPT}
                className="doggerz-button doggerz-hero-button gap-2 px-6 py-4 text-center text-sm uppercase tracking-[0.16em]"
              >
                <span>Adopt your pup</span>
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>

              <Link
                to={PATHS.LOGIN}
                className="rounded-2xl border border-emerald-500/40 bg-black px-6 py-4 text-center text-sm font-black uppercase tracking-[0.16em] transition hover:border-emerald-400/60 hover:shadow-[0_8px_24px_rgba(34,197,94,0.25)]"
                style={{
                  background: "rgba(0, 0, 0, 0.8)",
                  backgroundImage: "linear-gradient(135deg, #bef264, #34d399 48%, #22c55e)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Login
              </Link>
            </div>
          </div>

          {/* Dog preview - centered below on mobile, side by side on lg */}
          <div className="flex w-full items-center justify-center">
            <div className="relative w-full max-w-[31rem]">
              <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,6,23,0.96))] shadow-[0_30px_110px_rgba(0,0,0,0.58)]">
                <div className="relative h-[24rem] overflow-hidden sm:h-[27rem]">
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
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
