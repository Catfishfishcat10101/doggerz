// src/layout/PublicLayout.jsx
import React, { Suspense } from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";
import NavBar from "@/components/UI/NavBar.jsx";

function Fallback() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <div className="h-6 w-48 rounded bg-white/10 animate-pulse" />
    </div>
  );
}

export default function PublicLayout() {
  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
        <Suspense fallback={<Fallback />}>
          <Outlet />
        </Suspense>
      </main>
      <ScrollRestoration />
    </>
  );
}
