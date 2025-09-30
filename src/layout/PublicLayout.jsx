// src/layout/PublicLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "@/components/UI/NavBar.jsx";
import RouteBoundary from "@/layout/RouteBoundary.jsx";
import Footer from "@/components/UI/Footer.jsx";

export default function PublicLayout() {
  return (
    <div className="min-h-dvh flex flex-col">
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-10 flex-1">
        <RouteBoundary>
          <React.Suspense>
            <Outlet />
          </React.Suspense>
        </RouteBoundary>
      </main>
      <Footer />
    </div>
  );
}
