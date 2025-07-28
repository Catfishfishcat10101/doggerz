// src/FeaturesRouter.jsx
import React, { Suspense, lazy, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";

// Lazy-loaded feature components
const Dog = lazy(() => import("./components/Features/Dog"));
const Affection = lazy(() => import("./components/Features/Affection"));
const BackgroundScene = lazy(() =>
  import("./components/Features/BackgroundScene")
);
const Memory = lazy(() => import("./components/Features/Memory"));
const PottyTraining = lazy(() =>
  import("./components/Features/PottyTraining")
);
const Shop = lazy(() => import("./components/Features/Shop"));
const DailyLoginReward = lazy(() =>
  import("./components/Features/DailyLoginReward")
);
const PoopRenderer = lazy(() => import("./components/Features/PoopRenderer"));
const SettingsModal = lazy(() =>
  import("./components/Features/SettingsModal")
);
const UpgradeYard = lazy(() => import("./components/Features/UpgradeYard"));
const NotFound = lazy(() => import("./components/NotFound"));

const FEATURE_ROUTES = {
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

const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div>
    <p>Something went wrong:</p>
    <pre>{error.message}</pre>
    <button onClick={resetErrorBoundary}>Try again</button>
  </div>
);

export default function FeaturesRouter() {
  const [isSettingsOpen, setSettingsOpen] = useState(false);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<div className="loading-spinner">Loading...</div>}>
        <Routes>
          <Route
            path="/"
            element={<Navigate to={FEATURE_ROUTES.DOG} replace />}
          />
          <Route path={FEATURE_ROUTES.DOG} element={<Dog />} />
          <Route path={FEATURE_ROUTES.AFFECTION} element={<Affection />} />
          <Route
            path={FEATURE_ROUTES.BACKGROUND}
            element={<BackgroundScene />}
          />
          <Route path={FEATURE_ROUTES.REWARD} element={<DailyLoginReward />} />
          <Route path={FEATURE_ROUTES.MEMORY} element={<Memory />} />
          <Route path={FEATURE_ROUTES.POTTY} element={<PottyTraining />} />
          <Route path={FEATURE_ROUTES.POOP} element={<PoopRenderer />} />
          <Route
            path={FEATURE_ROUTES.SETTINGS}
            element={
              <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setSettingsOpen(false)}
              />
            }
          />
          <Route path={FEATURE_ROUTES.SHOP} element={<Shop />} />
          <Route path={FEATURE_ROUTES.UPGRADE} element={<UpgradeYard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
