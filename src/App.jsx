// src/App.jsx
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  Link,
} from "react-router-dom";

import Splash from "@/pages/Splash.jsx";
import Landing from "@/pages/Landing.jsx";
import Adopt from "@/pages/Adopt.jsx";
import GamePage from "@/pages/Game.jsx";
import Login from "@/pages/Login.jsx";
import Signup from "@/pages/Signup.jsx";
import About from "@/pages/About.jsx";
import Settings from "@/pages/Settings.jsx";
import Legal from "@/pages/Legal.jsx";
import NotFound from "@/pages/NotFound.jsx";
import Memory from "@/pages/Memory.jsx";
import Potty from "@/pages/Potty.jsx";

// ---------------------------
// Layout pieces
// ---------------------------
function AppHeader() {
  const navigate = useNavigate();

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex flex-col leading-none">
          <span className="text-[10px] uppercase tracking-[0.28em] text-emerald-400/90">
            Virtual Pup
          </span>
          <span className="text-2xl font-extrabold tracking-tight text-white">
            Doggerz
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          <button
            onClick={() => navigate("/about")}
            className="text-sm text-zinc-400 hover:text-white transition"
          >
            About
          </button>
          <button
            onClick={() => navigate("/login")}
            className="text-sm text-zinc-400 hover:text-white transition"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/adopt")}
            className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold px-4 py-1.5 transition"
          >
            Adopt
          </button>
        </nav>
      </div>
    </header>
  );
}

function AppFooter() {
  const navigate = useNavigate();

  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 text-xs text-zinc-500 py-4">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© 2025 Doggerz. Created by William Johnson.</p>
        <nav className="flex items-center gap-4">
          <button
            onClick={() => navigate("/about")}
            className="hover:text-zinc-300"
          >
            About
          </button>
          <button
            onClick={() => navigate("/settings")}
            className="hover:text-zinc-300"
          >
            Settings
          </button>
          <button
            onClick={() => navigate("/legal")}
            className="hover:text-zinc-300"
          >
            Legal
          </button>
        </nav>
      </div>
    </footer>
  );
}

// ---------------------------
// Route shell
// ---------------------------
function AppShell() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-50">
      <AppHeader />

      <main className="flex-1">
        <Routes>
          {/* Primary entry */}
          <Route path="/" element={<Splash />} />

          {/* Secondary marketing / info */}
          <Route path="/landing" element={<Landing />} />

          {/* Core game flow */}
          <Route path="/adopt" element={<Adopt />} />
          <Route path="/game" element={<GamePage />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Extras / sub-screens */}
          <Route path="/about" element={<About />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/memory" element={<Memory />} />
          <Route path="/potty" element={<Potty />} />

          {/* Friendly aliases / redirects */}
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/play" element={<Navigate to="/game" replace />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <AppFooter />
    </div>
  );
}

// ---------------------------
// Root App
// ---------------------------
export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
