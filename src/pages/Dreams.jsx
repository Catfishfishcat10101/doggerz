import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import { PATHS } from "@/routes.js";
import { selectDog, selectDogDreams } from "@/redux/dogSlice.js";

import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";

import DreamJournal from "@/features/dreams/DreamJournal.jsx";

export default function Dreams() {
  const dog = useSelector(selectDog);
  const dreamsState = useSelector(selectDogDreams);

  const dreams = useMemo(() => {
    const raw = Array.isArray(dreamsState?.journal) ? dreamsState.journal : [];
    return raw;
  }, [dreamsState?.journal]);

  return (
    <div className="min-h-dvh w-full bg-zinc-950 text-zinc-100">
      <Header />

      <main className="mx-auto w-full max-w-5xl px-4 py-10">
        <div className="rounded-[2rem] border border-white/10 bg-black/40 backdrop-blur-md shadow-[0_0_80px_rgba(0,0,0,0.55)] overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-white/10">
            <div className="text-xs uppercase tracking-[0.22em] text-zinc-300/90">
              Dream Journal
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-200">
              {dog?.name || "Your pup"}&rsquo;s dreams
            </h1>
            <p className="mt-2 text-sm text-zinc-200/90 max-w-prose">
              A good day can bring lucid dreams; Neglect can trigger nightmares.
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <DreamJournal dreams={dreams} />

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to={PATHS.GAME}
                className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-extrabold bg-emerald-400 text-black shadow-[0_0_35px_rgba(52,211,153,0.25)] hover:bg-emerald-300 transition"
              >
                Back to the yard
              </Link>
              <Link
                to={PATHS.MEMORIES}
                className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold border border-white/15 bg-black/30 text-zinc-100 hover:bg-black/45 transition"
              >
                Open Memory Reel
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
