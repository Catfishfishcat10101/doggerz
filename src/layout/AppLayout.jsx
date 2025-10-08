// src/layout/AuthLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "@/components/UI/NavBar.jsx";

export default function AuthLayout() {
  return (
    <div className="min-h-dvh flex flex-col bg-zinc-950 text-zinc-100">
      <NavBar />
      <main id="main" className="flex-1 grid place-items-center p-6">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
