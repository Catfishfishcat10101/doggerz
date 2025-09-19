// src/pages/Offline.jsx
import React from "react";
import { Link } from "react-router-dom";
export default function Offline() {
  return (
    <main className="min-h-[60vh] grid place-items-center p-6 bg-emerald-50">
      <div className="bg-white border rounded-2xl shadow p-6 text-center">
        <div className="text-4xl mb-1">📵</div>
        <h1 className="text-xl font-bold text-emerald-900">You’re offline</h1>
        <p className="text-emerald-900/70 mt-1">Core gameplay works; cloud sync resumes when you’re back.</p>
        <Link to="/" className="inline-block mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white">Home</Link>
      </div>
    </main>
  );
}
