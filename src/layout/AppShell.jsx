// src/layout/AppShell.jsx
import { Outlet } from "react-router-dom";

import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";
import { AppShellContext } from "./AppShellContext.js";

export default function AppShell() {
  return (
    <AppShellContext.Provider
      value={{ withinAppShell: true, mainId: "app-main" }}
    >
      <div className="min-h-dvh flex flex-col bg-zinc-950 text-zinc-100">
        <a
          href="#app-main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 z-50 rounded-xl bg-emerald-400 px-4 py-2 text-xs font-semibold text-black shadow-lg"
        >
          Skip to content
        </a>
        <Header />

        <main id="app-main" tabIndex={-1} className="flex-1">
          <Outlet />
        </main>

        <Footer />
      </div>
    </AppShellContext.Provider>
  );
}
