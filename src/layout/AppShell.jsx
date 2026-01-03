// src/layout/AppShell.jsx
import { Outlet, useLocation } from "react-router-dom";

import AppHeader from "@/components/AppHeader.jsx";
import AppFooter from "@/components/AppFooter.jsx";

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
      {!isFrameless && <AppHeader />}

      <main className="flex-1">
        <Outlet />
      </main>

      {!isFrameless && <AppFooter />}
    </div>
  );
}
