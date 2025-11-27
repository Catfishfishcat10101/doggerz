// src/pages/Splash.jsx
// Doggerz: Entry splash screen. Usage: <Splash /> is the first route before landing.
// Accessibility: ARIA roles and meta tags are documented for SEO and screen readers.

import React from "react";
import { Link } from "react-router-dom";
import PageContainer from "@/features/game/components/PageContainer.jsx";

export default function Splash() {
  return (
    <PageContainer
      title="Doggerz"
      subtitle="ADOPT. TRAIN. RAISE. BOND."
      metaDescription="Doggerz splash entry: adopt and care for a real-time virtual dog with evolving needs and personality."
      padding="py-24 px-4"
    >
      <div className="space-y-8 text-center" aria-label="Splash content">
        <div
          className="inline-flex flex-col items-center gap-2"
          aria-label="Brand stack"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">
            Welcome To
          </span>
          <span className="text-5xl font-black tracking-tight text-emerald-400 drop-shadow-[0_0_30px_rgba(16,185,129,0.7)]">
            DOGGERZ
          </span>
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-emerald-300">
            virtual dog simulator
          </span>
        </div>
        <p className="mx-auto max-w-md text-sm text-zinc-200">
          Real-time stats, even when your away. Your care & choices will
          influence growth, temperament & story. Check in often to keep your
          Doggerz happy and healthy!
        </p>
        <div
          className="flex flex-wrap justify-center gap-3"
          aria-label="Splash actions"
        >
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl border border-emerald-400 bg-emerald-400 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:bg-emerald-300"
          >
            Adopt
          </Link>

          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-xl border border-emerald-400 bg-emerald-400 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:bg-emerald-300"
          >
            Log in
          </Link>
        </div>
        <div className="text-[0.65rem] text-zinc-200"> </div>
      </div>
    </PageContainer>
  );
}
