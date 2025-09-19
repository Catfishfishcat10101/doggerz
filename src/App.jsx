// src/App.jsx
import React from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUid } from "./redux/userSlice";

export default function App() {
  const uid = useSelector(selectUid);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-emerald-50 to-emerald-100">
      <header className="sticky top-0 z-20 backdrop-blur bg-white/80 border-b">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 font-bold">
            <span className="text-emerald-700 text-lg">🐾 Doggerz</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
              v{typeof __APP_VERSION__ === "string" ? __APP_VERSION__ : "dev"}
            </span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1 text-sm">
            <Tab to="/">Home</Tab>
            <Tab to="/game">Game</Tab>
            <Tab to="/shop">Shop</Tab>
            <Tab to="/stats">Stats</Tab>
          </nav>

          <div className="flex items-center gap-2">
            {uid ? (
              <LogoutButton />
            ) : (
              <>
                <Link to="/login" className="px-3 py-1.5 rounded-lg border hover:bg-slate-50">
                  Log in
                </Link>
                <Link to="/signup" className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Routed pages render here */}
        <Outlet />
      </main>

      <footer className="border-t bg-white/80">
        <div className="mx-auto max-w-5xl px-4 py-4 text-xs text-slate-600 flex items-center justify-between">
          <span>© {new Date().getFullYear()} Doggerz</span>
          <span className="opacity-80">Vite + React • PWA-ready</span>
        </div>
      </footer>
    </div>
  );
}

function Tab({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "px-3 py-1.5 rounded-lg transition-colors",
          isActive ? "bg-emerald-600 text-white" : "hover:bg-slate-50",
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );
}

function LogoutButton() {
  const onLogout = async () => {
    try {
      const [{ auth }, { signOut }] = await Promise.all([
        import("./firebase"),
        import("firebase/auth"),
      ]);
      await signOut(auth);
    } catch {}
  };
  return (
    <button
      onClick={onLogout}
      className="px-3 py-1.5 rounded-lg border hover:bg-slate-50"
      title="Sign out"
      aria-label="Sign out"
    >
      ⎋ Logout
    </button>
  );
}
