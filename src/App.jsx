// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { PATHS } from "@/routes.js";
import ProfilePage from "@/pages/Profile.jsx";

import Home from "@/pages/Home.jsx";
import Splash from "@/pages/Splash.jsx";
import GamePage from "@/pages/Game.jsx";
import Adopt from "@/pages/Adopt.jsx";
import Memory from "@/pages/Memory.jsx";
import Affection from "@/pages/Affection.jsx";
import LoginPage from "@/pages/Login.jsx";
import SignupPage from "@/pages/Signup.jsx";

export default function App() {
  return (
    <Routes>
      <Route path={PATHS.PROFILE} element={<ProfilePage />} />
      <Route path={PATHS.HOME} element={<Home />} />
      <Route path={PATHS.SPLASH} element={<Splash />} />
      <Route path={PATHS.GAME} element={<GamePage />} />
      <Route path={PATHS.ADOPT} element={<Adopt />} />
      <Route path={PATHS.MEMORY} element={<Memory />} />
      <Route path={PATHS.AFFECTION} element={<Affection />} />
      <Route path={PATHS.LOGIN} element={<LoginPage />} />
      <Route path={PATHS.SIGNUP} element={<SignupPage />} />
      {/* catch-all */}
      <Route path="*" element={<Navigate to={PATHS.HOME} replace />} />
    </Routes>
  );
}
