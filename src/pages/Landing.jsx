// src/pages/Landing.jsx
// @ts-nocheck
import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import DogSpriteAnimator from "@/components/DogSpriteAnimator.jsx";
import { ASSETS } from "@/game/assetPaths.js";

export default function Landing() {
  const dog = useSelector((s) => s?.dog?.current || s?.dog || {});
  const adopted = !!dog?.adoptedAt;

  const primaryTo = adopted ? "/game" : "/adopt";
  const primaryLabel = adopted ? "Continue" : "Start your dog’s story";

  return (
    <div className="min-h-[calc(100dvh-120px)] w-full">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="rounded-3xl border border-emerald-500/15 bg-black/35 backdrop-blur-md shadow-[0_0_60px_rgba(16,185,129,0.10)] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div className="p-8 sm:p-10 lg:p-12">
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-200">
                  Potty trained will unlock awesome tricks!
                </span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-emerald-600">
                Doggerz
              </h1>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  to={primaryTo}
                  className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-base font-extrabold bg-emerald-400 text-black shadow-[0_0_35px_rgba(52,211,153,0.35)] hover:shadow-[0_0_45px_rgba(52,211,153,0.55)] transition"
                >
                  {primaryLabel}
                </Link>

                <Link
                  to="/game"
                  className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-base font-bold border border-emerald-500/25 bg-black/30 text-emerald-100 hover:bg-black/45 transition"
                >
                  Live preview
                </Link>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <div className="text-sm font-bold text-emerald-200">Care</div>
                  <div className="text-xs text-zinc-300 mt-1">
                    Hunger, Happiness, Energy, Hygiene.
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <div className="text-sm font-bold text-emerald-200">
                    Potty
                  </div>
                  <div className="text-xs text-zinc-300 mt-1">
                    Progress-driven.
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <div className="text-sm font-bold text-emerald-200">
                    Train
                  </div>
                  <div className="text-xs text-zinc-300 mt-1">
                    Locked until Potty Trained.
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Preview panel */}
            <div className="p-8 sm:p-10 lg:p-12 border-t lg:border-t-0 lg:border-l border-emerald-500/10 bg-black/25">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-bold text-emerald-200">
                    Live Preview
                  </div>
                  <div className="text-xs text-zinc-400">
                    Idle animation (8-frame loop)
                  </div>
                </div>
                <div className="text-xs text-zinc-400">
                  puppy → adult → senior
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/30 p-8 flex items-center justify-center min-h-[360px]">
                <DogSpriteAnimator
                  src={ASSETS.sprite("jack_russell_puppy.png")}
                  cols={9}
                  rows={9}
                  sheetWidth={1152}
                  sheetHeight={1152}
                  fps={8}
                  sequence={[0, 1, 2, 3, 4, 5, 6, 7]}
                  frameWidth={128}
                  frameHeight={128}
                  scale={3.2}
                />
              </div>

              <div className="mt-4 text-xs text-zinc-400">
                Tip: Best experience on desktop or “Install App” on mobile
                (PWA).
              </div>
            </div>
          </div>
        </div>

        {/* Secondary section (optional) */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-emerald-500/10 bg-black/25 p-6">
            <h3 className="text-base font-bold text-emerald-200">
              Progression that matters
            </h3>
            <p className="mt-2 text-sm text-zinc-300">
              Potty training is a real gate. Complete it to unlock trick
              training and later life stages.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-500/10 bg-black/25 p-6">
            <h3 className="text-base font-bold text-emerald-200">
              Built for clean UI
            </h3>
            <p className="mt-2 text-sm text-zinc-300">
              Neon-black theme, readable spacing, and a layout that feels like a
              real product.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-500/10 bg-black/25 p-6">
            <h3 className="text-base font-bold text-emerald-200">
              Ready to ship
            </h3>
            <p className="mt-2 text-sm text-zinc-300">
              Vite + React + Tailwind + Firebase. Deploy to Vercel and iterate
              fast.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
