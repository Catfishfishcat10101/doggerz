// src/layout/AppShell.jsx
import { Outlet, useLocation } from "react-router-dom";

import Header from "@/components/Header.jsx";
import { AppShellContext } from "@/layout/AppShellContext.js";

export default function AppShell() {
  const { pathname } = useLocation();

  // Routes that provide their own full-screen shell (avoid stacking global chrome).
  const isFrameless =
    pathname.startsWith("/game") ||
    pathname.startsWith("/adopt") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/sprite-test"); // ✅ include the verification route

  return (
    <div className="min-h-dvh flex flex-col">
      {!isFrameless && <Header />}

      <main className="flex-1">
        <div key={pathname} className="dz-route-frame">
          <AppShellContext.Provider value={{ withinAppShell: true }}>
            <Outlet />
          </AppShellContext.Provider>
        </div>
      </main>

      {/* Footer handled by PageShell */}
    </div>
  );
}
