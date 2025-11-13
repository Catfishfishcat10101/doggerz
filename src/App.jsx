// src/App.jsx
import React from "react";
import { Link, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/Login.jsx";
import SignupPage from "./pages/Signup.jsx";
import GamePage from "./pages/Game.jsx";

function Splash() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-50">
      <div className="w-full max-w-xl mx-auto px-4 text-center space-y-8">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Doggerz
        </h1>
        <p className="text-zinc-400">
          Adopt a virtual pup, keep their stats up, and don&apos;t let them poop
          the place up.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold bg-sky-500 hover:bg-sky-400 text-zinc-950 transition"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold border border-zinc-700 hover:border-sky-400 text-zinc-100 transition"
          >
            Create account
          </Link>
          <Link
            to="/game"
            className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-100 transition"
          >
            Jump to game (temp)
          </Link>
        </div>

        <p className="text-xs text-zinc-500 mt-4">
          This is the new Doggerz splash shell. We&apos;ll wire real Firebase
          auth and the full game screen into these routes next.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      {/* Top-level router views */}
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/game" element={<GamePage />} />
        {/* fallback: anything unknown goes back home */}
        <Route path="*" element={<Splash />} />
      </Routes>
    </>
  );
}