import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import NavBar from "./components/UI/NavBar.jsx";
import Splash from "./components/UI/Splash.jsx";
import GameScreen from "./components/UI/GameScreen.jsx"; // keep your version
import Shop from "./components/Features/Shop.jsx";       // placeholder ok
import Login from "./components/Auth/Login.jsx";
import Signup from "./components/Auth/Signup.jsx";

export default function App() {
  return (
    <div className="min-h-dvh flex flex-col bg-neutral-950 text-white">
      <NavBar />
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/game" element={<GameScreen />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}