// src/App.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import AppHeader from "@/components/AppHeader.jsx";
import AppFooter from "@/components/AppFooter.jsx";
import AppRouter from "@/AppRouter.jsx";
import WorkflowEngine from "@/features/workflow/WorkflowEngine.jsx";

export default function App() {
  const { pathname } = useLocation();
  const isGame = pathname.startsWith("/game");

  return (
    <div className="min-h-dvh flex flex-col">
      <WorkflowEngine />
      {!isGame && <AppHeader />}

      <main className="flex-1">
        <AppRouter />
      </main>

      {!isGame && <AppFooter />}
    </div>
  );
}
