// src/components/UI/Splash.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import FeatureStripe from "./FeatureStripe.jsx";

/* Inline icon to avoid lucide-react dep */
const DogIcon = (p) => (
  <svg
    width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden {...p}
  >
    <path d="M3 10l2-2 3 2 3-2 3 2 2-2 2 2v3a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5v-3z"/>
    <circle cx="9" cy="11" r="1"/><circle cx="15" cy="11" r="1"/>
  </svg>
);

export default function Splash() {
  // Motion primitives
  const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
  };
  const stagger = {
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  };

  return (
    <main className="min-h-[calc(100vh-56px)] bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <section className="mx-auto max-w-6xl px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* Left column */}
        <motion.div initial="hidden" animate="show" variants={stagger}>
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full bg-slate-800/70 ring-1 ring-white/10 px-3 py-1 mb-6"
          >
            <DogIcon className="h-4 w-4" />
            <span className="text-xs tracking-wide uppercase text-slate-300">Doggerz</span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-4xl sm:text-5xl font-extrabold leading-tight"
          >
            Raise your <span className="text-sky-400">pixel pup</span>. Keep it happy. Show it off.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-4 text-slate-300 max-w-prose"
          >
            Frictionless onboarding, true offline play, and cloud saves when you’re back online.
            Cosmetics you actually care about. Zero clutter. Maximum vibes.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/signup"
              className="px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-medium shadow-lg shadow-sky-900/30"
            >
              Create account
            </Link>
            <Link
              to="/login"
              className="px-5 py-3 rounded-xl border border-white/20 hover:bg-white/10 font-medium"
            >
              I already have one
            </Link>
          </motion.div>

          <motion.div variants={fadeUp}>
            <FeatureStripe />
          </motion.div>
        </motion.div>

        {/* Right column (hero device mock) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          className="relative"
        >
          <div className="aspect-square rounded-3xl bg-gradient-to-br from-sky-500/20 via-sky-300/10 to-transparent ring-1 ring-white/10 p-8">
            <div className="h-full w-full rounded-2xl bg-slate-900/40 grid place-content-center">
              {/* Placeholder hero art; swap with your dog sprite/animation */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                className="h-24 w-24 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 mx-auto"
              />
            </div>
          </div>

          {/* Floating chips */}
          <motion.div
            className="absolute -top-6 -right-6 rounded-2xl px-3 py-2 text-xs bg-emerald-400/20 border border-emerald-300/30"
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 4.2, ease: "easeInOut", delay: 0.2 }}
          >
            Cloud save ✅
          </motion.div>
          <motion.div
            className="absolute -bottom-6 -left-6 rounded-2xl px-3 py-2 text-xs bg-sky-400/20 border border-sky-300/30"
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 4.8, ease: "easeInOut", delay: 0.5 }}
          >
            Offline PWA ⚡
          </motion.div>
        </motion.div>
      </section>

      {/* footer */}
      <div className="relative z-10 px-6 pt-14 pb-8 max-w-7xl mx-auto">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <div className="mt-6 text-xs text-white/60">
          © {new Date().getFullYear()} Doggerz. Be kind to your dogs.
        </div>
      </div>
    </main>
  );
}
