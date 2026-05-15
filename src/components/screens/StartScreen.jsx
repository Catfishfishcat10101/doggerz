import { Link, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import HeroDog3D from "@/components/brand/HeroDog3D.jsx";
import { PATHS } from "@/app/routes.js";
import { selectIsLoggedIn } from "@/store/userSlice.js";

export default function StartScreen() {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const settings = useSelector((state) => state.settings || {});
  const reduceMotion = Boolean(settings.reduceMotion || settings.batterySaver);

  if (isLoggedIn) return <Navigate to={PATHS.GAME} replace />;

  return (
    <main className="min-h-[100dvh] bg-[#07111f] text-white">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col px-5 py-[calc(env(safe-area-inset-top,0px)+24px)] sm:px-8 lg:px-10">
        <nav className="flex items-center justify-between gap-4">
          <div className="text-xl font-black uppercase tracking-[0.22em] text-emerald-200">
            Doggerz
          </div>
          <Link
            to={PATHS.LOGIN}
            className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-zinc-100 transition hover:bg-white/12"
          >
            Login
          </Link>
        </nav>

        <section className="grid flex-1 items-center gap-8 py-8 md:grid-cols-[0.95fr_1.05fr] md:py-10">
          <div className="order-2 md:order-1">
            <div className="text-[11px] font-black uppercase tracking-[0.28em] text-amber-200/85">
              180-day companion sim
            </div>
            <h1 className="mt-4 max-w-xl text-5xl font-black leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Adopt a Jack Russell with a memory.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-8 text-zinc-300 sm:text-lg">
              Feed, train, play, and build a bond that changes how your pup acts
              across the yard. Your dog keeps growing between sessions.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to={PATHS.ADOPT}
                className="btn-squish rounded-2xl bg-emerald-300 px-6 py-4 text-center text-sm font-black uppercase tracking-[0.16em] text-slate-950 shadow-[0_16px_40px_rgba(16,185,129,0.22)]"
              >
                Adopt your pup
              </Link>
              <Link
                to={PATHS.ABOUT}
                className="btn-squish rounded-2xl border border-white/12 bg-white/8 px-6 py-4 text-center text-sm font-black uppercase tracking-[0.16em] text-zinc-100"
              >
                How it works
              </Link>
            </div>

            <div className="mt-7 grid max-w-xl grid-cols-3 gap-2 text-left">
              {[
                ["Cloud save", "Keep progress on your account."],
                ["Training", "Unlock obedience and perks."],
                ["3D yard", "Watch moods and weather shift."],
              ].map(([title, body]) => (
                <div
                  key={title}
                  className="rounded-lg border border-white/10 bg-black/22 p-3"
                >
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-200">
                    {title}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-zinc-400">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 flex min-h-[22rem] items-center justify-center md:order-2">
            <div className="relative aspect-square w-full max-w-[26rem] overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,24,40,0.9),rgba(3,7,18,0.95))] shadow-[0_28px_90px_rgba(0,0,0,0.5)]">
              <HeroDog3D
                className="absolute inset-4 max-w-none"
                stage="PUPPY"
                mood={reduceMotion ? "neutral" : "happy"}
                actionOverride={reduceMotion ? "Idle" : "Wag"}
                timeOfDay="sunset"
                weather="sunny"
              />
              <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-black/36 p-4 backdrop-blur">
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-100">
                  Fireball preview
                </div>
                <div className="mt-1 text-sm font-bold text-white">
                  Lively, stubborn, and ready for the yard.
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
