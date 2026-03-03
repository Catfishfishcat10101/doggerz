/** @format */
// src/pages/Landing.jsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import PageShell from "@/components/layout/PageShell.jsx";
import { PATHS } from "@/routes.js";

const TRAILER_EMBED_URL = String(import.meta.env.VITE_TRAILER_EMBED_URL || "");
const TRAILER_EXTERNAL_URL = String(
  import.meta.env.VITE_TRAILER_URL || "https://doggerz.app"
);

export default function Landing() {
  const [trailerOpen, setTrailerOpen] = useState(false);

  useEffect(() => {
    if (!trailerOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setTrailerOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [trailerOpen]);

  return (
    <PageShell>
      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col overflow-hidden border-x border-white/10 bg-black shadow-2xl">
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-doggerz-leaf/25 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-doggerz-sky/20 blur-[100px]" />

        <div className="z-10 mt-10 flex flex-1 flex-col items-center justify-center p-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-doggerz-leaf/50 bg-doggerz-neon/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-doggerz-bone"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-doggerz-leaf opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-doggerz-leaf" />
            </span>
            Alpha Playtest
          </motion.div>

          <motion.div
            initial={{ scale: 0.82, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8 h-48 w-48 overflow-hidden rounded-full border border-doggerz-leaf/35 bg-black/35 p-1 shadow-[0_0_60px_rgba(34,197,94,0.2)]"
          >
            <img
              src="/assets/sprites/jr/doggerz-source.png"
              alt="Doggerz hero dog"
              className="h-full w-full rounded-full object-cover object-[74%_38%]"
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-extrabold tracking-tight"
          >
            <span className="bg-gradient-to-r from-doggerz-leaf to-doggerz-sky bg-clip-text text-transparent">
              DOGGERZ
            </span>
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-2 text-xl font-bold tracking-widest text-white/90"
          >
            ADOPT. TRAIN. BOND.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 max-w-xs text-sm leading-relaxed text-doggerz-paw/75"
          >
            Your highly unpredictable AI companion.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="z-10 flex w-full flex-col gap-4 p-6 pb-12"
        >
          <Link
            to={PATHS.ADOPT}
            className="w-full rounded-2xl bg-doggerz-leaf py-4 text-center text-lg font-extrabold text-black shadow-lg transition-all hover:scale-[1.01] hover:bg-doggerz-neonSoft hover:shadow-[0_0_40px_rgba(34,197,94,0.5)]"
          >
            Adopt Your Pup
          </Link>

          <button
            type="button"
            onClick={() => setTrailerOpen(true)}
            className="w-full rounded-2xl border-2 border-white/20 bg-transparent py-4 text-lg font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
          >
            Watch Trailer
          </button>

          <Link
            to={PATHS.LOGIN}
            className="w-full rounded-2xl border border-doggerz-mange/50 bg-black/30 py-3 text-center text-sm font-semibold text-doggerz-paw transition hover:bg-white/10"
          >
            Login
          </Link>
        </motion.div>
      </div>

      {trailerOpen ? (
        <div
          className="fixed inset-0 z-[120] grid place-items-center bg-black/75 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Doggerz trailer"
          onClick={() => setTrailerOpen(false)}
        >
          <div
            className="w-full max-w-4xl overflow-hidden rounded-3xl border border-doggerz-mange/50 bg-black shadow-[0_0_80px_rgba(0,0,0,0.65)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="text-sm font-bold tracking-wide text-doggerz-bone">
                Doggerz Trailer
              </div>
              <button
                type="button"
                onClick={() => setTrailerOpen(false)}
                className="rounded-full border border-doggerz-mange/50 px-3 py-1 text-xs font-semibold text-doggerz-paw hover:bg-white/10"
              >
                Close
              </button>
            </div>

            {TRAILER_EMBED_URL ? (
              <div className="aspect-video w-full bg-black">
                <iframe
                  title="Doggerz trailer"
                  src={TRAILER_EMBED_URL}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="p-5 sm:p-6">
                <img
                  src="/assets/sprites/jr/doggerz-source.png"
                  alt="Doggerz trailer preview"
                  className="w-full rounded-2xl border border-white/10"
                />
                <p className="mt-4 text-sm text-doggerz-paw/80">
                  Trailer source is not set yet. Add{" "}
                  <code className="rounded bg-white/10 px-1 py-0.5 text-xs">
                    VITE_TRAILER_EMBED_URL
                  </code>{" "}
                  for an embedded trailer, or open your trailer page below.
                </p>
                <a
                  href={TRAILER_EXTERNAL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex rounded-full border border-doggerz-leaf/50 bg-doggerz-neon/15 px-4 py-2 text-sm font-bold text-doggerz-bone hover:bg-doggerz-neon/25"
                >
                  Open Trailer Page
                </a>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
