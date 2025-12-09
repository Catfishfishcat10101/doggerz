// src/pages/NotFoundPage.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-50 p-6">
      <h1 className="text-2xl font-bold mb-2">Page not found</h1>
      <p className="text-zinc-400 mb-6 text-sm text-center max-w-sm">
        The page you tried to open doesn’t exist or is still in progress.
      </p>
      <Link
        to="/"
        className="px-4 py-2 bg-emerald-500 rounded-md text-black font-medium text-sm"
      >
        Go home
      </Link>
    </main>
  );
}
