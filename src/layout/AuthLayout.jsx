// src/layout/AuthedLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Footer from "@/components/UI/Footer.jsx";

export default function AuthedLayout() {
  return (
    <div className="min-h-dvh flex flex-col">
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
