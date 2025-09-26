import React from "react";
import { Link } from "react-router-dom";

/**
 * Doggerz — Splash
 * - Brand-forward copy (no dev-tech brag tiles)
 * - Clear CTAs that speak in-world (“Adopt your pup”)
 * - Lightweight hero with a tiny animated pixel pup (no external asset required)
 * - Responsive, accessible, dark-friendly
 *
 * Drop-in: replace your existing Splash.jsx with this file.
 */
export default function Splash() {
  return (
    <main className="min-h-screen w-full bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* Background frame with soft glow + subtle paw pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black" />
        <div className="absolute inset-0 opacity-10 pointer-events-none paw-bg" />
        <div className="absolute -top-40 -right-40 h-[480px] w-[480px] rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-[380px] w-[380px] rounded-full bg-fuchsia-500/20 blur-3xl" />
      </div>

      {/* Shell */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Top nav row (brand and lightweight nav) */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoMark />
            <span className="text-lg tracking-wider font-semibold text-slate-200">
              DOGGERZ
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#screenshots" className="hover:text-white">Screens</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
          </nav>
        </header>

        {/* Hero */}
        <section className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10 md:gap-14 mt-12 md:mt-20">
          {/* Copy Block */}
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-[12px] leading-none text-slate-300/90 bg-white/5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Offline-first • Cloud sync on return
            </div>

            <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">
              <span className="text-white">Your pup.</span>{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400">
                Your world.
              </span>
            </h1>

            <p className="mt-4 md:mt-6 text-slate-300 text-lg md:text-xl max-w-prose">
              Adopt a single digital dog that actually feels like yours. Train,
              feed, style, and explore. Works anywhere. Syncs when you’re back.
              Maximum vibes; zero clutter.
            </p>

            {/* CTAs */}
            <div className="mt-7 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link
                to="/signup"
                className="inline-flex justify-center items-center rounded-xl px-5 py-3 text-base font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-900 shadow-lg shadow-cyan-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
              >
                Adopt your pup
              </Link>
              <Link
                to="/login"
                className="inline-flex justify-center items-center rounded-xl px-5 py-3 text-base font-semibold border border-white/15 text-white hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              >
                Already adopted? Sign in
              </Link>
            </div>

            {/* Player-facing “highlights” (not gray dev tiles) */}
            <ul id="features" className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Feature icon={<PawIcon />} title="One Dog, One Bond">
                Every player raises just one pup. Commit, care, and watch it grow.
              </Feature>
              <Feature icon={<BoltIcon />} title="Play Anywhere">
                Offline by default. Your session syncs when you reconnect.
              </Feature>
              <Feature icon={<HatIcon />} title="Style That Pup">
                Earn and equip cosmetics. Subtle flexes; zero pay-to-win nonsense.
              </Feature>
              <Feature icon={<CloudIcon />} title="Cloud Saves">
                Seamless device hopping. Your pup is always where you are.
              </Feature>
            </ul>
          </div>

          {/* Visual Block */}
          <div className="order-1 lg:order-2">
            <div className="relative mx-auto max-w-md w-full">
              {/* Device frame card */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm shadow-2xl">
                <div className="aspect-[9/16] rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-white/10 overflow-hidden relative">
                  {/* HUD chrome */}
                  <div className="absolute inset-x-0 top-0 h-10 bg-black/10 backdrop-blur-[2px] border-b border-white/10" />
                  {/* Animated pixel pup */}
                  <div className="absolute inset-0 grid place-items-center">
                    <PixelPup />
                  </div>
                  {/* Soft vignette */}
                  <div className="absolute inset-0 pointer-events-none bg-radial from-transparent via-transparent to-black/40" />
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -right-2 -top-2">
                <div className="rounded-xl bg-fuchsia-500 text-slate-950 text-xs font-bold px-3 py-1.5 shadow-lg shadow-fuchsia-500/30">
                  Pre-adoption preview
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer micro-nav */}
        <footer className="mt-16 md:mt-24 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-400/80">
          <span>© {new Date().getFullYear()} Doggerz</span>
          <a href="#privacy" className="hover:text-white/90">Privacy</a>
          <a href="#terms" className="hover:text-white/90">Terms</a>
          <span className="opacity-60">Build: Vite • React 18 • Tailwind</span>
        </footer>
      </div>

      {/* Local styles for background pattern and simple keyframes */}
      <style>{`
        .paw-bg {
          background-image:
            radial-gradient(transparent 60%, rgba(255,255,255,0.06) 61%),
            url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120' fill='none'><g fill='%23FFFFFF' fill-opacity='0.08'><circle cx='30' cy='30' r='10'/><circle cx='60' cy='24' r='6'/><circle cx='72' cy='36' r='6'/><circle cx='48' cy='36' r='6'/><circle cx='60' cy='60' r='10'/><circle cx='90' cy='84' r='10'/><circle cx='24' cy='84' r='8'/></g></svg>");
          background-size: 100% 100%, 180px 180px;
          background-repeat: no-repeat, repeat;
        }

        @keyframes hop {
          0%, 100% { transform: translateY(0) }
          50% { transform: translateY(-6px) }
        }
        @keyframes wag {
          0%, 100% { transform: rotate(18deg) }
          50% { transform: rotate(-18deg) }
        }
        @keyframes blink {
          0%, 92%, 100% { opacity: 1 }
          93%, 97% { opacity: 0 }
        }
      `}</style>
    </main>
  );
}

/* ---------- Subcomponents ---------- */

function Feature({ icon, title, children }) {
  return (
    <li className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mt-0.5 h-9 w-9 grid place-items-center rounded-xl bg-white/[0.06] border border-white/10">
        {icon}
      </div>
      <div>
        <div className="font-semibold text-white">{title}</div>
        <p className="text-sm text-slate-300/90">{children}</p>
      </div>
    </li>
  );
}

function LogoMark() {
  return (
    <div
      aria-hidden
      className="h-7 w-7 rounded-xl bg-gradient-to-br from-cyan-400 to-fuchsia-400 grid place-items-center shadow-md shadow-cyan-500/30"
    >
      <span className="sr-only">Doggerz</span>
      <svg width="16" height="16" viewBox="0 0 24 24" className="text-slate-900">
        <path fill="currentColor" d="M7 11c0-2.2 1.8-4 4-4s4 1.8 4 4v2h1a2 2 0 0 1 0 4H6a2 2 0 1 1 0-4h1v-2z" />
      </svg>
    </div>
  );
}

function PixelPup() {
  return (
    <div className="relative scale-110">
      {/* Body */}
      <div
        className="relative h-20 w-28 rounded-md bg-cyan-400"
        style={{ imageRendering: "pixelated", animation: "hop 1.8s ease-in-out infinite" }}
        aria-label="Wagging pixel pup"
      >
        {/* Ear */}
        <div className="absolute -top-3 left-6 h-5 w-5 bg-cyan-500 rounded-sm" />
        {/* Eye */}
        <div
          className="absolute top-5 left-16 h-2 w-2 bg-slate-900 rounded-sm"
          style={{ animation: "blink 4s infinite" }}
        />
        {/* Nose */}
        <div className="absolute top-8 right-2 h-2 w-3 bg-slate-900 rounded-sm" />
        {/* Tail */}
        <div
          className="absolute -right-2 top-6 h-8 w-2 bg-fuchsia-400 origin-left rounded-sm"
          style={{ animation: "wag .45s ease-in-out infinite" }}
        />
        {/* Ground shadow */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 h-2 w-20 rounded-full bg-black/40 blur-sm" />
      </div>
    </div>
  );
}

/* ---------- Tiny inline icons (no external deps) ---------- */
function PawIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-cyan-300" aria-hidden>
      <path fill="currentColor" d="M12 13c3 0 6 2 6 5 0 1-1 2-2 2H8c-1 0-2-1-2-2 0-3 3-5 6-5Zm-6-1c1 0 2-1 2-2s-1-3-2-3-2 2-2 3 1 2 2 2Zm12 0c1 0 2-1 2-2s-1-3-2-3-2 2-2 3 1 2 2 2ZM10 10c1 0 2-1 2-2s-1-3-2-3-2 2-2 3 1 2 2 2Zm4 0c1 0 2-1 2-2s-1-3-2-3-2 2-2 3 1 2 2 2Z"/>
    </svg>
  );
}
function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-cyan-300" aria-hidden>
      <path fill="currentColor" d="M13 2 3 14h7l-1 8 11-12h-7l0-8z"/>
    </svg>
  );
}
function HatIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-cyan-300" aria-hidden>
      <path fill="currentColor" d="M12 3c4 0 7 3 7 6l2 1-9 4-9-4 2-1c0-3 3-6 7-6Zm-8 9 8 4 8-4v2c0 3-3 5-8 5s-8-2-8-5v-2z"/>
    </svg>
  );
}
function CloudIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-cyan-300" aria-hidden>
      <path fill="currentColor" d="M6 19h11a4 4 0 0 0 0-8 6 6 0 0 0-11-2A4 4 0 0 0 6 19Z"/>
    </svg>
  );
}