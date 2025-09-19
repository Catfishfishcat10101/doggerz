// src/router.jsx
import React, { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";
import ProtectedRoute from "./routes/ProtectedRoute";

// Lazy pages
const Splash = lazy(() => import("./components/UI/Splash"));
const GameScreen = lazy(() => import("./components/UI/GameScreen"));
const PottyTrainer = lazy(() => import("./components/Features/PottyTrainer"));
const TricksTrainer = lazy(() => import("./components/Features/TricksTrainer"));
const StatsPanel = lazy(() => import("./components/Features/StatsPanel"));
const Shop = lazy(() => import("./components/Features/Shop"));
const Breeding = lazy(() => import("./components/Features/Breeding"));
const Accessories = lazy(() => import("./components/Features/Accessories"));
const Login = lazy(() => import("./components/Auth/Login"));
const Signup = lazy(() => import("./components/Auth/Signup"));
// Optional extras if you added them:
// const NotFound = lazy(() => import("./pages/NotFound"));

export const router = createBrowserRouter(
  [
    {
      element: <App />,
      // Optional global error boundary:
      // errorElement: <NotFound />,
      children: [
        { path: "/", element: <Splash /> },

        // Protected area
        {
          element: <ProtectedRoute redirect="/login" />,
          children: [
            { path: "/game", element: <GameScreen /> },
            { path: "/train/potty", element: <PottyTrainer /> },
            { path: "/train/tricks", element: <TricksTrainer /> },
            { path: "/stats", element: <StatsPanel /> },
            { path: "/shop", element: <Shop /> },
            { path: "/accessories", element: <Accessories /> },
            { path: "/breed", element: <Breeding /> },
          ],
        },

        // Auth
        { path: "/login", element: <Login /> },
        { path: "/signup", element: <Signup /> },

        // Fallback
        // { path: "*", element: <NotFound /> },
        { path: "*", element: <Navigate to="/" replace /> },
      ],
    },
  ],
  {
    future: { v7_startTransition: true, v7_relativeSplatPath: true },
  }
);
// src/routes/ProtectedRoute.jsx