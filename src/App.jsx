// src/App.jsx
import React, { Suspense, lazy, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// UI shell
import NavBar from "@/components/UI/NavBar.jsx";

// Route-level code-splitting
const Splash         = lazy(() => import("@/components/UI/Splash.jsx"));
const GameScreen     = lazy(() => import("@/components/UI/GameScreen.jsx"));
const PottyTrainer   = lazy(() => import("@/components/Features/PottyTrainer.jsx"));
const TricksTrainer  = lazy(() => import("@/components/Features/TricksTrainer.jsx"));
const StatsPanel     = lazy(() => import("@/components/Features/StatsPanel.jsx"));
const Shop           = lazy(() => import("@/components/Features/Shop.jsx"));
const Breeding       = lazy(() => import("@/components/Features/Breeding.jsx"));
const Accessories    = lazy(() => import("@/components/Features/Accessories.jsx"));
const Login          = lazy(() => import("@/components/Auth/Login.jsx"));
const Signup         = lazy(() => import("@/components/Auth/Signup.jsx"));

export default function App() {
  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <NavBar />
      <ScrollRestore />

      <main className="mx-auto max-w-6xl px-4 py-4">
        <ErrorBoundary
          fallback={
            <div className="rounded-2xl border border-rose-300/50 bg-rose-50 text-rose-900 dark:bg-rose-900/20 dark:text-rose-100 p-4">
              <div className="font-semibold">Something went sideways.</div>
              <div className="text-sm opacity-80">Try refreshing the page.</div>
            </div>
          }
        >
          <Suspense fallback={<RouteSkeleton />}>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Splash />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Core game surfaces */}
              <Route path="/game" element={<GameScreen />} />
              <Route path="/stats" element={<StatsPanel />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/accessories" element={<Accessories />} />
              <Route path="/breed" element={<Breeding />} />

              {/* Trainers */}
              <Route path="/train/potty" element={<PottyTrainer />} />
              <Route path="/train/tricks" element={<TricksTrainer />} />

              {/* 404 → home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}

/* ----------------------------- UX glue ----------------------------- */

function ScrollRestore() {
  const { pathname } = useLocation();
  useEffect(() => {
    // restore to top on route changes; avoids stale scroll between surfaces
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function RouteSkeleton() {
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
  componentDidCatch(err, info) { console.error("[App] route crash:", err, info); }
  render() {
    if (this.state.err) return this.props.fallback ?? null;
    return this.props.children;
  }
}
