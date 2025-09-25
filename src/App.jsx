// src/App.jsx
import React, { Suspense, lazy, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

/* ---------------------- Lazy routes (code-split) ----------------------- */
const Splash         = lazy(() => import("./components/UI/Splash"));
const GameScreen     = lazy(() => import("./components/UI/GameScreen"));
const PottyTrainer   = lazy(() => import("./components/Features/PottyTrainer"));
const TricksTrainer  = lazy(() => import("./components/Features/TricksTrainer"));
const StatsPanel     = lazy(() => import("./components/Features/StatsPanel"));
const Shop           = lazy(() => import("./components/Features/Shop"));
const Breeding       = lazy(() => import("./components/Features/Breeding"));
const Accessories    = lazy(() => import("./components/Features/Accessories"));
const Login          = lazy(() => import("./components/Auth/Login"));
const Signup         = lazy(() => import("./components/Auth/Signup"));

/* Optional: simple idle preloader to warm critical chunks */
function usePreloadRoutesOnIdle() {
  useEffect(() => {
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 400));
    const cancel = window.cancelIdleCallback || clearTimeout;

    const id = idle(() => {
      // Preload core game paths the user is likely to hit next
      Promise.allSettled([
        import("./components/UI/GameScreen"),
        import("./components/Features/StatsPanel"),
        import("./components/Features/Shop"),
      ]);
    });

    return () => cancel(id);
  }, []);
}

/* -------------------------- UX scaffolding ----------------------------- */
function LoadingFallback() {
  return (
    <div className="p-8 grid place-items-center min-h-[40vh]">
      <div className="w-full max-w-sm">
        <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded mb-4 shimmer"></div>
        <div className="h-24 rounded-xl bg-slate-100 dark:bg-slate-900 border border-black/5 dark:border-white/10 shimmer"></div>
        <div className="mt-4 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 border border-black/5 dark:border-white/10"></div>
      </div>
    </div>
  );
}

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, err: null };
  }
  static getDerivedStateFromError(err) {
    return { hasError: true, err };
  }
  componentDidCatch(err, info) {
    // Optional: send to analytics or logging
    // console.error("App crash:", err, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-xl mx-auto">
          <h1 className="text-xl font-semibold mb-2">Something went sideways.</h1>
          <p className="text-sm opacity-80 mb-4">
            The UI tripped over itself. Try reloading; if it persists, clear site data or check console logs.
          </p>
          <pre className="text-xs p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-blac
