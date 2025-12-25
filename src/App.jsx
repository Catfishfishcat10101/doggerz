// src/App.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import AppRouter from "@/AppRouter.jsx";
import AppHeader from "@/components/AppHeader.jsx";
import AppFooter from "@/components/AppFooter.jsx";

export default function App() {
  const { pathname } = useLocation();
  // Routes that provide their own full-screen shell (avoid stacking global chrome).
  const isFrameless =
    pathname.startsWith("/game") ||
    pathname.startsWith("/adopt") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup");

  return (
    <div className="min-h-dvh flex flex-col">

      {!isFrameless && <AppHeader />}

      <main className="flex-1">
        <AppRouter />
      </main>

      {!isFrameless && <AppFooter />}
    </div>
  );
}
