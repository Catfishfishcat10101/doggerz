// src/layout/AppShell.jsx
import { Outlet } from "react-router-dom";

import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";
import { AppShellContext } from "./AppShellContext.js";

export default function AppShell() {
  return (
    <AppShellContext.Provider value={{ withinAppShell: true }}>
      <div className="min-h-dvh flex flex-col bg-zinc-950 text-zinc-100">
        <Header />

        <main className="flex-1">
          <Outlet />
        </main>

        <Footer />
      </div>
    </AppShellContext.Provider>
  );
}
