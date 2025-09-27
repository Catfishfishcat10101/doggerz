// src/layout/RootLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "@/components/UI/NavBar.jsx";

export default function RootLayout() {
  return (
    <div className="min-h-dvh flex flex-col bg-slate-900 text-white">
      <NavBar />
      <main className="flex-1">
        <Outlet />
      </main>
      {/* Optional: footer, toasts portal, etc. */}
    </div>
  );
}
