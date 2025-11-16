// src/App.jsx
import React from "react";
import {
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
  Link,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import MainGame from "@/features/game/MainGame.jsx";

// Simple static pages (we'll create these next)
import SplashPage from "@/pages/Splash.jsx";
import SignupPage from "@/pages/Signup.jsx";
import LoginPage from "@/pages/Login.jsx";
import AboutPage from "@/pages/About.jsx";
import ContactPage from "@/pages/Contact.jsx";
import LegalPage from "@/pages/Legal.jsx";
import TemperamentReveal from "@/pages/TemperamentReveal.jsx";

// Firebase sign-out so the auth listener in your user slice can pick it up
import { auth } from "@/firebase.js";
import { signOut } from "firebase/auth";

// --------- Layout shell: header + footer around all routes ---------

function AppShell({ children }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Make TS/JS checkers chill about the state shape
  const currentUser = useSelector((state) => {
    const anyState = /** @type {any} */ (state);
    return anyState.user?.user ?? null;
  });

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // If you have a Redux logout action, you can dispatch it here too.
      navigate("/", { replace: true });
    } catch (err) {
      console.error("[Doggerz] Failed to log out", err);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/95 backdrop-blur flex items-center justify-between px-6 py-4">
        <div
          className="flex items-baseline gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <span className="text-2xl sm:text-3xl font-black tracking-tight">
            Doggerz
          </span>
          <span className="text-xs sm:text-sm uppercase tracking-[0.25em] text-zinc-500">
            virtual pup simulator
          </span>
        </div>

        <nav className="flex items-center gap-6 text-sm">
          <Link
            to="/"
            className="text-zinc-300 hover:text-emerald-400 transition"
          >
            Home
          </Link>
          <Link
            to="/about"
            className="text-zinc-300 hover:text-emerald-400 transition"
          >
            About
          </Link>
          <Link
            to="/contact"
            className="text-zinc-300 hover:text-emerald-400 transition"
          >
            Contact
          </Link>
          <Link
            to="/legal"
            className="text-zinc-300 hover:text-emerald-400 transition"
          >
            Legal
          </Link>

          <div className="h-4 w-px bg-zinc-700 mx-1" />

          {currentUser ? (
            <>
              <span className="hidden sm:inline text-xs text-zinc-400">
                Hi,{" "}
                <span className="font-semibold text-zinc-100">
                  {currentUser.displayName || currentUser.email}
                </span>
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-zinc-600 px-3 py-1 text-xs font-semibold hover:border-emerald-400 hover:text-emerald-300 transition"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-xs font-semibold text-zinc-300 hover:text-emerald-400 transition"
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-semibold px-4 py-1.5 transition"
              >
                Sign up
              </button>
            </>
          )}
        </nav>
      </header>

      {/* Main routed content */}
      <main className="flex-1 flex flex-col">{children}</main>

      {/* Footer – always visible, even on /game */}
      <footer className="border-t border-zinc-800 bg-zinc-950 px-6 py-4 text-xs text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>
          Doggerz — Created by William Johnson — 2025. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <Link
            to="/about"
            className="hover:text-emerald-400 transition underline-offset-2 hover:underline"
          >
            About
          </Link>
          <Link
            to="/contact"
            className="hover:text-emerald-400 transition underline-offset-2 hover:underline"
          >
            Contact
          </Link>
          <Link
            to="/legal"
            className="hover:text-emerald-400 transition underline-offset-2 hover:underline"
          >
            Terms &amp; Privacy
          </Link>
        </div>
      </footer>
    </div>
  );
}

// --------- App routes inside AppShell ---------

export default function App() {
  const location = useLocation();

  const currentUser = useSelector((state) => {
    const anyState = /** @type {any} */ (state);
    return anyState.user?.user ?? null;
  });

  return (
    <AppShell>
      <Routes location={location}>
        <Route path="/" element={<SplashPage />} />

        {/* Simple auth routes – you can keep your existing Login/Signup components
            if you already have them wired; just ensure the files exist. */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SplashPage mode="signup" />} />
        <Route path="/signup/new" element={<SignupPage />} />

        {/* If you have a dedicated Adopt page, you can swap this out later */}
        <Route
          path="/adopt"
          element={currentUser ? <MainGame /> : <Navigate to="/signup" />}
        />

        {/* Main game – gated behind being signed in */}
        <Route
          path="/game"
          element={currentUser ? <MainGame /> : <Navigate to="/login" />}
        />

        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/temperament" element={<TemperamentReveal />} />
        <Route path="/legal" element={<LegalPage />} />

        {/* Fallback */}
        <Route path="*" element={<SplashPage />} />
      </Routes>
    </AppShell>
  );
}
