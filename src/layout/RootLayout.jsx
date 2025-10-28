import React, { Suspense } from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";
import AppHeader from "./components/AppHeader.jsx";
import AppFooter from "./components/AppFooter.jsx";
import SkipLink from "./components/SkipLink.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import Loading from "./components/Loading.jsx";

export default function RootLayout() {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-neutral-900 via-neutral-950 to-black text-neutral-100 selection:bg-amber-400 selection:text-black">
      <SkipLink targetId="main-content" />
      <AppHeader />
      <main id="main-content" className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-6" role="main">
        <ErrorBoundary>
          <Suspense fallback={<Loading label="Booting Doggerz UI…" />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <AppFooter />
      <ScrollRestoration />
    </div>
  );
}
