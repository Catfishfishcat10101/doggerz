// src/components/UI/Splash.jsx
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthCtx } from "@/context/AuthProvider"; // <-- our provider

export default function Splash() {
  const { user, loading } = useAuthCtx();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && user) nav("/game", { replace: true }); // align to your routes
  }, [loading, user, nav]);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-slate-950 text-white">
      {/* animated background */}
      <GradientOrbs />

      {/* top nav */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/10 transition"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold hover:bg-sky-400 transition"
          >
            Create account
          </Link>
        </div>
      </div>

      {/* hero */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-10 items-center pt-10 lg:pt-16">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl font-black tracking-tight"
          >
            Adopt a{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-300">
              pixel pup
            </span>
            . Raise it. Flex it.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-5 text-lg text-white/70"
          >
            Zero-friction onboarding, offline-first PWA, cloud saves, and a cosmetics pipeline that
            prints serotonin.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 flex flex-wrap gap-4"
          >
            <Link
              to="/signup"
              className="px-6 py-3 rounded-2xl bg-sky-500 font-semibold hover:brightness-110 active:brightness-95"
            >
              Create account
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 rounded-2xl border border-white/20 font-semibold hover:bg-white/10"
            >
              I already have one
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-10"
          >
            <FeatureBullets />
          </motion.div>
        </div>

        {/* hero card / device mock */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="relative"
        >
          <div className="relative aspect-[10/7] rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.06] p-1 backdrop-blur">
            <div className="h-full w-full rounded-[22px] bg-[radial-gradient(35%_45%_at_30%_30%,rgba(56,189,248,0.35),transparent),radial-gradient(35%_45%_at_70%_70%,rgba(16,185,129,0.35),transparent)] grid place-items-center overflow-hidden">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                className="text-[110px] md:text-[140px] drop-shadow-[0_6px_20px_rgba(0,0,0,0.45)]"
                aria-hidden
              >
                🐶
              </motion.div>
              {/* diagonal shine */}
              <div className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]">
                <div className="absolute -left-1/3 -top-1/3 h-[200%] w-1/3 rotate-45 bg-white/10" />
              </div>
            </div>
          </div>
          {/* floating chips */}
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
      </div>

      {/* footer */}
      <div className="relative z-10 px-6 pt-14 pb-8 max-w-7xl mx-auto">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <div className="mt-6 text-xs text-white/60">
          © {new Date().getFullYear()} Doggerz. Be kind to your dogs.
        </div>
      </div>
    </div>
  );
}

/* ------------------------ inline UI atoms ------------------------ */

function Logo() {
  return (
    <div className="flex items-center gap-2 font-black">
      <img src="/icons/icon-192.png" alt="" className="h-8 w-8 rounded-xl" />
      <span className="text-xl">Doggerz</span>
    </div>
  );
}

function GradientOrbs() {
  return (
    <div aria-hidden className="absolute inset-0">
      <div className="absolute -top-24 -left-24 w-[40rem] h-[40rem] rounded-full blur-3xl opacity-20 bg-sky-500" />
      <div className="absolute -bottom-24 -right-24 w-[40rem] h-[40rem] rounded-full blur-3xl opacity-20 bg-emerald-500" />
      <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_40%,rgba(255,255,255,0.06),transparent)]" />
    </div>
  );
}

function FeatureBullets() {
  const items = [
    { title: "PWA", text: "Installable, offline-first, background updates" },
    { title: "Training", text: "Potty & tricks with XP multipliers" },
    { title: "Economy", text: "Coins, shop, accessories" },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map((it) => (
        <div key={it.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="font-semibold">{it.title}</div>
          <div className="text-sm text-white/70">{it.text}</div>
        </div>
      ))}
    </div>
  );
}
