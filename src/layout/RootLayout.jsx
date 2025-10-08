import React from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";
import NavBar from "@/components/layout/NavBar.jsx";
import Footer from "@/components/layout/Footer.jsx";

export default function RootLayout() {
  return (
    <div className="min-h-dvh flex flex-col bg-neutral-950 text-neutral-100">
      {/* keyboard/screen-reader affordance */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:p-2 focus:rounded-md focus:bg-neutral-800"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-neutral/60 bg-neutral-900/70 border-b border-neutral-800">
        <NavBar />
      </header>

      <main id="main" className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-neutral-800 bg-neutral-900/70">
        <Footer brand="doggerz@2025 • No grind. Just vibes." />
      </footer>

      <ScrollRestoration />
    </div>
  );
}
