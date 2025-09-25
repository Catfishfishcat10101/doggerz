// src/components/UI/Splash.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Dog,
  Bone,
  Cloud,
  Download,
  Rocket,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function Splash() {
  const navigate = useNavigate();

  // Motion primitives
  const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
  };
  const stagger = {
    show: {
      transition: { staggerChildren: 0.08, delayChildren: 0.05 },
    },
  };

  return (
    <div className="relative min-h-[calc(100dvh-64px)] overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-black text-slate-100">
      {/* Subtle hero glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute -top-32 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-2xl" />
      </div>

      {/* Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-20">
        {/* Top utility bar (keeps nav minimal; hero owns the primary CTA) */}
        <div className="mb-8 flex items-center justify-end gap-3">
          <Link
            to="/login"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-slate-100 backdrop-blur hover:bg-white/10"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="rounded-full bg-cyan-500 px-4 py-1.5 text-sm font-semibold text-slate-900 hover:bg-cyan-400"
          >
            Sign up
          </Link>
        </div>

        {/* Hero */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2"
        >
          {/* Left column — headline & CTAs */}
          <div className="relative z-10">
            <motion.div variants={fadeUp} className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200/90">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Offline-first PWA • Cloud saves • Zero-friction onboarding</span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-4xl font-black leading-tight tracking-tight sm:text-5xl"
            >
              Adopt a <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400">pixel pup.</span>
              <br />
              Raise it. Flex it.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-4 max-w-xl text-base text-slate-300 sm:text-lg"
            >
              Your dog lives on every device you use. Train tricks, manage needs,
              and drip serotonin via cosmetics. Ship-grade performance powered by
              React 18 + Vite + Redux Toolkit.
            </motion.p>

            {/* Consolidated primary CTA */}
            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate("/signup")}
                className="group inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-slate-900 font-semibold hover:bg-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                Start raising your pup
                <Rocket className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </button>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-slate-100 hover:bg-white/10"
              >
                I already have an account
              </Link>
              <Link
                to="/game"
                className="ml-1 inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white"
              >
                Try a demo <Bone className="h-4 w-4" />
              </Link>
            </motion.div>

            {/* Feature chips */}
            <motion.ul variants={stagger} className="mt-10 grid gap-3 sm:grid-cols-2">
              <FeatureChip
                variants={fadeUp}
                icon={<Download className="h-4 w-4" />}
                title="Offline PWA"
                blurb="Install to home screen; it just works without network."
              />
              <FeatureChip
                variants={fadeUp}
                icon={<Cloud className="h-4 w-4" />}
                title="Cloud saves"
                blurb="State syncs across devices via Firebase."
              />
              <FeatureChip
                variants={fadeUp}
                icon={<ShieldCheck className="h-4 w-4" />}
                title="Account safety"
                blurb="Auth guards, rate-limited writes, and secure defaults."
              />
              <FeatureChip
                variants={fadeUp}
                icon={<Dog className="h-4 w-4" />}
                title="Cosmetics pipeline"
                blurb="Unlock skins, collars, toys. Flex responsibly."
              />
            </motion.ul>
          </div>

          {/* Right column — mascot card */}
          <motion.div variants={fadeUp} className="relative">
            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-br from-cyan-400/30 to-fuchsia-400/30 blur-xl" />
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.45 }}
                className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-slate-800/70 to-slate-900/70 p-10 shadow-2xl backdrop-blur"
              >
                <motion.div
                  aria-hidden="true"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                  className="mx-auto flex h-40 w-40 items-center justify-center rounded-2xl bg-slate-950/70"
                >
                  <Dog className="h-20 w-20 text-cyan-300" />
                </motion.div>

                <motion.div
                  className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                >
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1">
                    <Bone className="h-3 w-3" /> Idle blink & wag
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1">
                    <Sparkles className="h-3 w-3" /> Delightful micro-motion
                  </span>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Social proof / footnote */}
        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 text-slate-400">
          <div className="text-xs">
            © 2025 Doggerz. Be kind to your dogs. Built with React 18, Vite, Redux Toolkit, Firebase.
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">v1.1</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">Performance budget: green</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** ---------- Local components (no extra files) ---------- */

function FeatureChip({ icon, title, blurb, variants }) {
  return (
    <motion.li
      variants={variants}
      className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur transition hover:bg-white/[0.08]"
    >
      <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-100">
        <span className="grid h-6 w-6 place-items-center rounded-md bg-slate-900/70">
          {icon}
        </span>
        {title}
      </div>
      <p className="text-xs text-slate-300/90">{blurb}</p>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-cyan-400/10 opacity-0 blur-xl transition group-hover:opacity-100"
      />
    </motion.li>
  );
}