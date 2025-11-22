// src/App.jsx
import React from "react";
import AppShell from "./AppShell.jsx";
import ErrorBoundary from "@/components/ErrorBoundary.jsx";

export default function App() {
  return (
    <ErrorBoundary>
      <AppShell />
    </ErrorBoundary>
  );
}
