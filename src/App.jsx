// src/App.jsx
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";

const Login = lazy(() => import("./components/Auth/Login"));
const Signup = lazy(() => import("./components/Auth/Signup"));
const GameScreen = lazy(() => import("./components/UI/GameScreen")); // <- your main game

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="min-h-screen bg-gradient-to-b from-gray-200 to-blue-100" />}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/game"
            element={
              <ProtectedRoute>
                <GameScreen />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}