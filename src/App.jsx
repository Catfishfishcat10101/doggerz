// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { PATHS } from "@/routes.js";

import Home from "@/pages/Home.jsx";
import Splash from "@/pages/Splash.jsx";
import GamePage from "@/pages/Game.jsx";
import Adopt from "@/pages/Adopt.jsx";
import Memory from "@/pages/Memory.jsx";
import Affection from "@/pages/Affection.jsx"; // 👈 added

export default function App() {
  return (
    <Routes>
      <Route path={PATHS.HOME} element={<Home />} />
      <Route path="/splash" element={<Splash />} />
      <Route path={PATHS.GAME} element={<GamePage />} />
      <Route path="/adopt" element={<Adopt />} />
      <Route path="/memory" element={<Memory />} />
      <Route path="/affection" element={<Affection />} /> {/* 👈 new route */}
      <Route path="*" element={<Navigate to={PATHS.HOME} replace />} />
    </Routes>
  );
}
