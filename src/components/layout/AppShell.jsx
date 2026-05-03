<<<<<<< HEAD
<<<<<<< HEAD
=======
// src/components/layout/AppShell.jsx
>>>>>>> 0a405bd4 (Fix Doggerz index boot markup)
// src/layout/AppShell.jsx
import { Outlet, useLocation } from "react-router-dom";
import BottomTabBar from "@/components/layout/BottomTabBar.jsx";
import Header from "@/components/layout/Header.jsx";
import { getPrimaryTabForPath, PATHS } from "@/app/routes.js";
import { AppShellContext } from "./AppShellContext.js";

const HIDE_BOTTOM_TAB_ON_PATHS = new Set([PATHS.GAME]);

export default function AppShell() {
  const location = useLocation();
  const hasPrimaryTab = Boolean(getPrimaryTabForPath(location.pathname));
  const hideBottomTabBar = HIDE_BOTTOM_TAB_ON_PATHS.has(location.pathname);

<<<<<<< HEAD
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
          className={`flex-1 ${
            hasPrimaryTab && !hideBottomTabBar ? "pb-24 md:pb-0" : "pb-0"
          }`}
        >
          <Outlet />
        </main>
        {!hideBottomTabBar ? <BottomTabBar /> : null}
      </div>
    </AppShellContext.Provider>
=======
export default function AppShell({ children }) {
  return (
    <main className="safe-screen flex min-h-screen items-center justify-center">
      {children}
    </main>
>>>>>>> 10f88903 (chore: remove committed backup folders)
=======
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
          className={`flex-1 ${
            hasPrimaryTab && !hideBottomTabBar ? "pb-24 md:pb-0" : "pb-0"
          }`}
        >
          <Outlet />
        </main>
        {!hideBottomTabBar ? <BottomTabBar /> : null}
      </div>
    </AppShellContext.Provider>
>>>>>>> 0a405bd4 (Fix Doggerz index boot markup)
  );
}
