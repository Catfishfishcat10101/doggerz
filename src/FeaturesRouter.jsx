// src/FeaturesRouter.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";

// Lazy-loaded feature components (must exist at these paths)
const Dog = lazy(() => import("./components/Features/Dog"));
const Affection = lazy(() => import("./components/Features/Affection"));
const BackgroundScene = lazy(() => import("./components/Features/BackgroundScene"));
const Memory = lazy(() => import("./components/Features/Memory"));
// NOTE: file name fix — we built PottyTrainer earlier
const PottyTraining = lazy(() => import("./components/Features/PottyTrainer"));
const Shop = lazy(() => import("./components/Features/Shop"));
const DailyLoginReward = lazy(() => import("./components/Features/DailyLoginReward"));
const PoopRenderer = lazy(() => import("./components/Features/PoopRenderer"));
const SettingsModal = lazy(() => import("./components/Features/SettingsModal"));
const UpgradeYard = lazy(() => import("./components/Features/UpgradeYard"));
const NotFound = lazy(() => import("./components/NotFound"));

export const FEATURE_ROUTES = {
  DOG: "/dog",
  AFFECTION: "/affection",
  BACKGROUND: "/background",
  REWARD: "/reward",
  MEMORY: "/memory",
  POTTY: "/potty",
  POOP: "/poop",
  SETTINGS: "/settings",
  SHOP: "/shop",
  UPGRADE: "/upgrade",
};

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div style={{ padding: 16 }}>
      <p>Something went wrong:</p>
      <pre style={{ whiteSpace: "pre-wrap" }}>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

function Loading() {
  return (
    <div style={{ padding: 16, textAlign: "center" }}>
      <div className="loading-spinner" aria-busy="true">Loading…</div>
    </div>
  );
}

export default function FeaturesRouter() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Navigate to={FEATURE_ROUTES.DOG} replace />} />
          <Route path={FEATURE_ROUTES.DOG} element={<Dog />} />
          <Route path={FEATURE_ROUTES.AFFECTION} element={<Affection />} />
          <Route path={FEATURE_ROUTES.BACKGROUND} element={<BackgroundScene />} />
          <Route path={FEATURE_ROUTES.REWARD} element={<DailyLoginReward />} />
          <Route path={FEATURE_ROUTES.MEMORY} element={<Memory />} />
          <Route path={FEATURE_ROUTES.POTTY} element={<PottyTraining />} />
          <Route path={FEATURE_ROUTES.POOP} element={<PoopRenderer />} />
          {/* Open settings modal by default; close = go back */}
          <Route
            path={FEATURE_ROUTES.SETTINGS}
            element={<SettingsModal isOpen onClose={() => window.history.back()} />}
          />
          <Route path={FEATURE_ROUTES.SHOP} element={<Shop />} />
          <Route path={FEATURE_ROUTES.UPGRADE} element={<UpgradeYard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
