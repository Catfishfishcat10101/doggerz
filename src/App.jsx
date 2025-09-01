// src/App.jsx
import React, { Suspense } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import Home from "@/pages/Home.jsx";

export default function App() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link to="/" style={{ fontWeight: 700 }}>Doggerz</Link>
          <nav style={{ display: "flex", gap: 16 }}>
            <Link to="/home" style={{ opacity: 0.85 }}>Home</Link>
          </nav>
        </div>
      </header>

      <main className="container" style={{ flex: 1 }}>
        <Suspense fallback={<div className="card">Loading…</div>}>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="*" element={<div className="card">Not found.</div>} />
          </Routes>
        </Suspense>
      </main>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="container" style={{ opacity: 0.6, fontSize: 12 }}>
          © {new Date().getFullYear()} Doggerz
        </div>
      </footer>
    </div>
  );
}
