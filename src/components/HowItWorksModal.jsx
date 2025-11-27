import React from "react";
import { Link } from "react-router-dom";

export default function HowItWorksModal({ open = false, onClose = () => {} }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      <div className="relative mx-4 max-w-3xl rounded-2xl bg-zinc-900/95 p-6 shadow-2xl border border-zinc-800">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-emerald-300">
              How Doggerz works
            </h3>
            <p className="mt-1 text-sm text-zinc-300">
              A short overview — hit “Learn more” for the full guide.
            </p>
          </div>
          <button
            aria-label="Close"
            onClick={onClose}
            className="ml-auto rounded-md bg-zinc-800/60 px-3 py-1 text-sm text-zinc-200 hover:bg-zinc-800"
          >
            Close
          </button>
        </header>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
            <h4 className="font-semibold text-zinc-100">Core loop</h4>
            <p className="mt-1 text-xs text-zinc-300">
              Feed, play, train, and rest — short daily check-ins keep your pup
              happy.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
            <h4 className="font-semibold text-zinc-100">Aging & life</h4>
            <p className="mt-1 text-xs text-zinc-300">
              Your pup advances through Puppy → Adult → Senior. Care affects
              growth and longevity.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
            <h4 className="font-semibold text-zinc-100">Potty training</h4>
            <p className="mt-1 text-xs text-zinc-300">
              Outdoor successes build training; consistency reduces accidents.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
            <h4 className="font-semibold text-zinc-100">Privacy</h4>
            <p className="mt-1 text-xs text-zinc-300">
              Your pup is stored locally by default. Cloud sync is optional and
              gated in Settings.
            </p>
          </div>
        </div>

        <footer className="mt-6 flex items-center justify-end gap-3">
          <Link
            to="/about#how-it-works"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-semibold text-emerald-300 ring-1 ring-emerald-400/20 hover:bg-emerald-500/5"
          >
            Learn more
          </Link>
          <button
            onClick={onClose}
            className="rounded-md bg-zinc-800/60 px-4 py-2 text-sm text-zinc-200"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}
