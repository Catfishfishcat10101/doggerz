// src/pages/NotFound.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl p-8 text-center">
      <h1 className="text-3xl font-bold mb-2">404</h1>
      <p className="mb-6 opacity-80">That route doesn’t exist.</p>
      <Link
        to="/"
        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20"
      >
        Back to Home
      </Link>
    </div>
  );
}
