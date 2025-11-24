// src/App.jsx
// Top-level routing for Doggerz

import { Routes, Route } from "react-router-dom";

import Splash from "@/pages/Splash.jsx";
import Landing from "@/pages/Landing.jsx";
import Adopt from "@/pages/Adopt.jsx";
import Game from "@/pages/Game.jsx";
import Login from "@/pages/Login.jsx";
import Potty from "@/pages/Potty.jsx";

import ProtectedRoute from "@/components/ProtectedRoute.jsx";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* If you later extract a Header/Footer component, they’d wrap Routes here */}

      <Routes>
        {/* First screen */}
        <Route path="/splash" element={<Splash />} />

        {/* Main landing */}
        <Route path="/" element={<Landing />} />

        {/* Public flows */}
        <Route path="/adopt" element={<Adopt />} />
        <Route path="/login" element={<Login />} />

        {/* Protected game routes */}
        <Route
          path="/game"
          element={
            <ProtectedRoute>
              <Game />
            </ProtectedRoute>
          }
        />

        <Route
          path="/potty"
          element={
            <ProtectedRoute>
              <Potty />
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* Footer would live here once we extract it into a component */}
    </div>
  );
}
