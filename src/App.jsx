// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Direct (non-lazy) imports to avoid Suspense blackouts
import Splash from "@/components/UI/Splash.jsx";
import Login from "@/components/Auth/Login.jsx";
import Signup from "@/components/Auth/Signup.jsx";
import NewPup from "@/components/Setup/NewPup.jsx";
import GameScreen from "@/components/UI/GameScreen.jsx";

// Ultra-safe guard: if you don't have auth yet, just let them in
function Protected({ children }) {
  // TODO: wire real auth when firebase is set
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/setup/new" element={<NewPup />} />
        <Route
          path="/play"
          element={
            <Protected>
              <GameScreen />
            </Protected>
          }
        />
        {/* catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
