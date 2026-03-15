// src/layout/AppShell.jsx
import { Outlet, useLocation } from "react-router-dom";

import BottomTabBar from "@/components/layout/BottomTabBar.jsx";
import Header from "@/components/layout/Header.jsx";
import { getPrimaryTabForPath } from "@/app/routes.js";
import { AppShellContext } from "./AppShellContext.js";

export default function AppShell() {
  const location = useLocation();
  const hasPrimaryTab = Boolean(getPrimaryTabForPath(location.pathname));

  return (
    <AppShellContext.Provider
      value={{ withinAppShell: true, mainId: "app-main" }}
    >
      <div className="dz-safe-area min-h-dvh flex flex-col bg-zinc-950 text-zinc-100">
        <a
          href="#app-main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 z-50 rounded-xl bg-emerald-400 px-4 py-2 text-xs font-semibold text-black shadow-lg"
        >
          Skip to content
        </a>
        <Header />

        <main
          id="app-main"
          tabIndex={-1}
          className={`flex-1 ${hasPrimaryTab ? "pb-24 md:pb-0" : "pb-0"}`}
        >
          <Outlet />
        </main>

        <BottomTabBar />
      </div>
    </AppShellContext.Provider>
  );
}
