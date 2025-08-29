

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

// change these to RELATIVE paths (no leading slash)
export const FEATURE_ROUTES = {
  DOG: "dog",
  AFFECTION: "affection",
  BACKGROUND: "background",
  REWARD: "reward",
  MEMORY: "memory",
  POTTY: "potty",
  POOP: "poop",
  SETTINGS: "settings",
  SHOP: "shop",
  UPGRADE: "upgrade",
};

export default function FeaturesRouter() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* when visiting /game, redirect to /game/dog */}
          <Route path="/" element={<Navigate to={FEATURE_ROUTES.DOG} replace />} />
          <Route path={FEATURE_ROUTES.DOG} element={<Dog />} />
          <Route path={FEATURE_ROUTES.AFFECTION} element={<Affection />} />
          <Route path={FEATURE_ROUTES.BACKGROUND} element={<BackgroundScene />} />
          <Route path={FEATURE_ROUTES.REWARD} element={<DailyLoginReward />} />
          <Route path={FEATURE_ROUTES.MEMORY} element={<Memory />} />
          <Route path={FEATURE_ROUTES.POTTY} element={<PottyTraining />} />
          <Route path={FEATURE_ROUTES.POOP} element={<PoopRenderer />} />
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

