// src/components/layout/AppShell.jsx
import { Outlet, useLocation } from "react-router-dom";

import { PATHS } from "@/app/routes.js";
import BottomTabBar from "@/components/layout/BottomTabBar.jsx";
import Header from "@/components/layout/Header.jsx";
import { AppShellContext } from "./AppShellContext.js";

const HIDE_BOTTOM_NAV_ON_PATHS = new Set([
  PATHS.HOME,
  PATHS.ADOPT,
  PATHS.LOGIN,
  PATHS.SIGNUP,
]);

export default function AppShell() {
  const location = useLocation();
  const showBottomNav = !HIDE_BOTTOM_NAV_ON_PATHS.has(location.pathname);

  return (
    <AppShellContext.Provider
      value={{ withinAppShell: true, mainId: "app-main" }}
    >
      <div className="dz-safe-area min-h-dvh flex flex-col overflow-x-hidden bg-zinc-950 text-zinc-100">
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
          className={`min-h-0 flex-1 ${
            showBottomNav
              ? "pb-[calc(env(safe-area-inset-bottom,0px)+6.75rem)]"
              : ""
          }`}
        >
          <Outlet />
        </main>
        {showBottomNav ? <BottomTabBar /> : null}
      </div>
    </AppShellContext.Provider>
  );
}
