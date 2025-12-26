// src/AppRouter.jsx
// Central router for Doggerz

import * as React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Core pages
import Landing from "./pages/Landing.jsx";

// Route-level code splitting: keep Landing fast, lazy-load everything else.
const GamePage = React.lazy(() => import("./pages/Game.jsx"));
const AdoptPage = React.lazy(() => import("./pages/Adopt.jsx"));
const LoginPage = React.lazy(() => import("./pages/Login.jsx"));
const SignupPage = React.lazy(() => import("./pages/Signup.jsx"));
const AboutPage = React.lazy(() => import("./pages/About.jsx"));
const FaqPage = React.lazy(() => import("./pages/Faq.jsx"));
const ContactPage = React.lazy(() => import("./pages/Contact.jsx"));
const HelpPage = React.lazy(() => import("./pages/Help.jsx"));
const DevelopersPage = React.lazy(() => import("./pages/Developers.jsx"));
const SettingsPage = React.lazy(() => import("./pages/Settings.jsx"));
const LegalPage = React.lazy(() => import("./pages/Legal.jsx"));
const PottyPage = React.lazy(() => import("./pages/Potty.jsx"));
const TemperamentRevealPage = React.lazy(
  () => import("./pages/TemperamentReveal.jsx"),
);
const NotFoundPage = React.lazy(() => import("./pages/NotFound.jsx"));

function RouteFallback() {
  return (
    <div
      className="min-h-[60vh] grid place-items-center"
      style={{
        background:
          "var(--grad-shell, radial-gradient(circle at top, #1e293b 0, #020617 55%, #000 100%))",
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/20 p-5 text-center text-white/80 shadow-[0_18px_60px_rgba(0,0,0,.55)] backdrop-blur">
        <div className="text-[11px] uppercase tracking-[0.28em] text-white/60">
          Loading
        </div>
        <div className="mt-2 text-lg font-semibold tracking-wide">Fetching the good stuff…</div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full w-1/2 animate-pulse rounded-full"
            style={{
              background:
                "linear-gradient(90deg, rgba(34,197,94,.95), rgba(249,115,22,.95))",
            }}
          />
        </div>
      </div>
    </div>
  );
}

const suspense = (node) => (
  <React.Suspense fallback={<RouteFallback />}>{node}</React.Suspense>
);

// Define all routes here
const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/game",
    element: suspense(<GamePage />),
  },
  {
    path: "/adopt",
    element: suspense(<AdoptPage />),
  },
  {
    path: "/login",
    element: suspense(<LoginPage />),
  },
  {
    path: "/signup",
    element: suspense(<SignupPage />),
  },
  {
    path: "/about",
    element: suspense(<AboutPage />),
  },
  {
    path: "/faq",
    element: suspense(<FaqPage />),
  },
  {
    path: "/contact",
    element: suspense(<ContactPage />),
  },
  {
    path: "/help",
    element: suspense(<HelpPage />),
  },
  {
    path: "/developers",
    element: suspense(<DevelopersPage />),
  },
  {
    path: "/settings",
    element: suspense(<SettingsPage />),
  },
  {
    path: "/legal",
    element: suspense(<LegalPage />),
  },
  {
    path: "/privacy",
    element: suspense(<LegalPage />),
  },
  {
    path: "/potty",
    element: suspense(<PottyPage />),
  },
  {
    path: "/temperament-reveal",
    element: suspense(<TemperamentRevealPage />),
  },
  {
    path: "*",
    element: suspense(<NotFoundPage />),
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
