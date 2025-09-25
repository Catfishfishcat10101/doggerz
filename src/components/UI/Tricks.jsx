// src/components/UI/Tricks.jsx
import React, { Suspense, lazy, useEffect } from "react";
import { Link } from "react-router-dom";

const TricksTrainer = lazy(() => import("../Features/TricksTrainer.jsx"));

export default function Tricks(props) {
  useEffect(() => {
    const prev = document.title;
    document.title = "Doggerz — Tricks Training";
    return () => { document.title = prev; };
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <header className="sticky top-0 z-30 backdrop-blur bg-white/75 dark:bg-slate-950/70 border-b border-black/5 dark:border-white/10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/game"
              className="px-3 py-1 rounded-xl text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-black/5 dark:border-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              aria-label="Back to game"
            >
              ← Back
            </Link>
            <h1 className="text-lg font-semibold">Tricks Training</h1>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Earn XP by practicing tricks
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <ErrorBoundary
          fallback={
            <div className="rounded-2xl border border-rose-300/50 bg-rose-50 text-rose-900 dark:bg-rose-900/20 dark:text-rose-100 p-4">
              <div className="font-semibold">Trainer failed to load</div>
              <div className="text-sm opacity-80">
                Try refreshing, or head <Link to="/game" className="underline">back to the yard</Link>.
              </div>
            </div>
          }
        >
          <Suspense fallback={<TrainerSkeleton />}>
            {/* Pass any future props (difficulty, sessionId, etc.) through */}
            <TricksTrainer {...props} />
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}

/* ---------------------- UI bits ---------------------- */

function TrainerSkeleton() {
  return (
    <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-slate-900 p-6">
      <div className="h-6 w-40 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="h-28 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        <div className="h-28 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      </div>
      <div className="mt-4 h-10 w-40 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { err: null };
  }
  static getDerivedStateFromError(err) { return { err }; }
  componentDidCatch(err, info) { console.error("[Tricks] crashed:", err, info); }
  render() {
    if (this.state.err) return this.props.fallback ?? null;
    return this.props.children;
  }
}
ErrorBoundary.defaultProps = { fallback: null };