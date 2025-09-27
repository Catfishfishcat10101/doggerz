// src/layout/AuthedLayout.jsx
import React, { Suspense } from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";
import NavBar from "@/components/UI/NavBar.jsx";
import RouteBoundary from "@/layout/RouteBoundary.jsx";

function Fallback() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="h-6 w-48 rounded bg-white/10 animate-pulse" />
        <div className="mt-4 h-4 w-80 rounded bg-white/10 animate-pulse" />
      </div>
    </div>
  );
}

export default function AuthedLayout() {
  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
        <RouteBoundary>
          <Suspense fallback={<Fallback />}>
            <Outlet />
          </Suspense>
        </RouteBoundary>
      </main>
      <ScrollRestoration />
    </>
  );
}
