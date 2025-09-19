// src/pages/NotFound.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-140px)] grid place-items-center bg-emerald-50">
      <div className="max-w-lg mx-auto bg-white border rounded-2xl shadow p-6 text-center">
        <div className="text-5xl">🐕‍🦺</div>
        <h1 className="mt-2 text-2xl font-extrabold text-emerald-900">404 — Lost Pup</h1>
        <p className="mt-2 text-emerald-900/70">
          The page you’re sniffing for doesn’t exist. Maybe it’s buried in the backyard.
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-xl bg-white border hover:bg-slate-50 active:scale-95"
          >
            ⬅ Back
          </button>
          <Link
            to="/"
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 active:scale-95"
          >
            🏠 Home
          </Link>
          <Link
            to="/game"
            className="px-4 py-2 rounded-xl bg-white border hover:bg-slate-50 active:scale-95"
          >
            ▶ Start Game
          </Link>
        </div>

        <div className="mt-4 text-xs text-emerald-900/50">
          Build v{typeof __APP_VERSION__ === "string" ? __APP_VERSION__ : "dev"}
        </div>
      </div>
    </div>
  );
}
