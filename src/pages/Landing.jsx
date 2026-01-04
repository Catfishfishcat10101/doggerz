// src/pages/Landing.jsx

import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import PageShell from '@/components/PageShell.jsx';
import { PATHS } from '@/routes.js';

export default function Landing() {
  const dog = useSelector((s) => s?.dog?.current || s?.dog || {});
  const adopted = Boolean(dog?.adoptedAt);

  const secondaryTo = adopted ? PATHS.GAME : PATHS.ADOPT;
  const secondaryLabel = adopted ? "Continue" : "Start your dog's story";

  return (
    <PageShell>
      <style>{`
        .dg-progress-window {
          height: var(--slide-h);
          overflow: hidden;
          position: relative;
        }
        .dg-progress-track {
          display: grid;
          gap: var(--slide-gap);
          animation: dg-progress-scroll 14s ease-in-out infinite;
        }
        .dg-progress-slide {
          min-height: var(--slide-h);
        }
        @keyframes dg-progress-scroll {
          0%, 22% { transform: translateY(0); }
          33%, 55% { transform: translateY(calc(-1 * (var(--slide-h) + var(--slide-gap)))); }
          66%, 88% { transform: translateY(calc(-2 * (var(--slide-h) + var(--slide-gap)))); }
          100% { transform: translateY(0); }
        }
      `}</style>
      <div className="min-h-[calc(100dvh-160px)] w-full">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-3xl border border-emerald-500/15 bg-black/35 backdrop-blur-md shadow-[0_0_60px_rgba(16,185,129,0.10)] overflow-hidden">
            <div className="grid grid-cols-1 gap-0">
              <div className="p-8 sm:p-10 lg:p-12">
                <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
                  Doggerz
                </h1>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Link
                    to={PATHS.ADOPT}
                    className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-base font-extrabold bg-emerald-500 text-white shadow-[0_0_35px_rgba(16,185,129,0.35)] hover:shadow-[0_0_45px_rgba(16,185,129,0.55)] transition"
                  >
                    Adopt
                  </Link>

                  <Link
                    to={secondaryTo}
                    className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-base font-bold border border-emerald-500/35 bg-black/30 text-white hover:bg-black/45 transition"
                  >
                    {secondaryLabel}
                  </Link>
                </div>

              </div>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-gradient-to-r from-white/10 via-white/5 to-white/10 px-6 py-4 text-sm text-zinc-100 shadow-[0_0_40px_rgba(15,23,42,0.5)] backdrop-blur-2xl">
            Tip: Best experience on desktop or &quot;Install App&quot; on mobile (PWA).
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-emerald-400/15 bg-white/5 p-6 backdrop-blur-md">
              <h3 className="text-base font-bold text-emerald-200">Progression that matters</h3>
              <div
                className="mt-3 dg-progress-window"
                style={{ '--slide-h': '88px', '--slide-gap': '12px' }}
              >
                <div className="dg-progress-track">
                  <div className="dg-progress-slide text-sm text-zinc-200/90">
                    Potty training is a real gate. Clear it to unlock trick training and deeper routines.
                  </div>
                  <div className="dg-progress-slide text-sm text-zinc-200/90">
                    Earn points to open new life stages and customize the pup&apos;s journey over time.
                  </div>
                  <div className="dg-progress-slide text-sm text-zinc-200/90">
                    Streaks and care habits compound into calmer moods and richer bonds.
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-500/10 bg-black/25 p-6">
              <h3 className="text-base font-bold text-emerald-200">Built for clean UI</h3>
              <p className="mt-2 text-sm text-zinc-300">
                Neon-black theme, readable spacing, and a layout that feels like a real product.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/10 bg-black/25 p-6">
              <h3 className="text-base font-bold text-emerald-200">Ready to ship</h3>
              <p className="mt-2 text-sm text-zinc-300">
                Vite + React + Tailwind + Firebase. Deploy to Vercel and iterate fast.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/10 bg-black/25 p-6">
              <h3 className="text-base font-bold text-emerald-200">Storybook moments</h3>
              <p className="mt-2 text-sm text-zinc-300">
                Cozy yard moments, gentle hints, and a pace that feels like a lived-in companion.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
