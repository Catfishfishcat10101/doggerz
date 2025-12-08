// src/router.jsx
import * as React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "@/App.jsx";

// Lazy-load all main pages
const Landing = React.lazy(() => import("@/pages/Landing.jsx"));
const Adopt = React.lazy(() => import("@/pages/Adopt.jsx"));
const Game = React.lazy(() => import("@/features/game/MainGame.jsx"));
const Login = React.lazy(() => import("@/pages/Login.jsx"));
const Signup = React.lazy(() => import("@/pages/Signup.jsx"));
const About = React.lazy(() => import("@/pages/About.jsx"));
const Settings = React.lazy(() => import("@/pages/Settings.jsx"));
const Potty = React.lazy(() => import("@/pages/Potty.jsx"));
const TemperamentReveal = React.lazy(
  () => import("@/pages/TemperamentReveal.jsx"),
);
const Memorials = React.lazy(() => import("@/pages/Memorials.jsx"));
const Contact = React.lazy(() => import("@/pages/Contact.jsx"));
const Legal = React.lazy(() => import("@/pages/Legal.jsx"));
const NotFound = React.lazy(() => import("@/pages/NotFound.jsx"));
const Journal = React.lazy(() => import("@/pages/Journal.jsx"));

const suspense = (Component) => (
  <React.Suspense fallback={<div className="p-8 text-center">Loading…</div>}>
    <Component />
  </React.Suspense>
);

const resolvedRoutes = [
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: suspense(Landing) },
      { path: "adopt", element: suspense(Adopt) },
      { path: "game", element: suspense(Game) },
      { path: "login", element: suspense(Login) },
      { path: "signup", element: suspense(Signup) },
      { path: "about", element: suspense(About) },
      { path: "settings", element: suspense(Settings) },
      { path: "potty", element: suspense(Potty) },
      { path: "memorials", element: suspense(Memorials) },
      { path: "journal", element: suspense(Journal) },
      { path: "temperament", element: suspense(TemperamentReveal) },
      { path: "contact", element: suspense(Contact) },
      { path: "legal", element: suspense(Legal) },
      { path: "*", element: suspense(NotFound) },
    ],
  },
];

const router = createBrowserRouter(resolvedRoutes);

export default function AppRouter() {
  return (
    <RouterProvider router={router} future={{ v7_startTransition: true }} />
  );
}
