// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-50">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Doggerz Splash (Test)
        </h1>
        <p className="text-zinc-400">
          If you can see this, React + Router are working. We&apos;ll plug the
          real game back in next.
        </p>
      </div>

      <Routes>
        <Route path="/" element={<div />} />
      </Routes>
    </div>
  );
}