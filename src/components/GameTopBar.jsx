// src/components/GameTopBar.jsx

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/userSlice.js";

let _logoutDepsPromise = null;
async function getLogoutDeps() {
  if (_logoutDepsPromise) return _logoutDepsPromise;
  _logoutDepsPromise = (async () => {
    try {
      const [{ signOut }, { auth }] = await Promise.all([
        import("firebase/auth"),
        import("@/firebase.js"),
      ]);
      return { signOut, auth };
    } catch {
      return { signOut: null, auth: null };
    }
  })();
  return _logoutDepsPromise;
}
function TopLink({ to, children }) {
  return (
    <Link
      to={to}
      className="px-3 py-2 rounded-lg text-sm font-semibold text-emerald-200 hover:text-emerald-100 hover:bg-emerald-500/10 transition"
    >
      {children}
    </Link>
  );
}

const DEFAULT_LINKS = [
  { label: "About", to: "/about" },
  { label: "Settings", to: "/settings" },
];

export default function GameTopBar({
  links = DEFAULT_LINKS,
  showBrand = true,
  brandLabel = "DOGGERZ",
  brandTo = "/",
  compact = false,
  tone = "emerald", // emerald | dark | light
  showUser = false,
  showAuthAction = true,
  onLogout,
  onExit,
  rightSlot = null,
  className = "",
}) {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const isSignedIn = !!(user?.email || user?.id);
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const displayName = useMemo(() => {
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email;
    if (user?.id) return "Trainer";
    return "Guest";
  }, [user?.displayName, user?.email, user?.id]);
  async function handleLogout() {
    try {
      if (typeof onLogout === "function") {
        await onLogout();
        return;
      }
      const { signOut, auth } = await getLogoutDeps();
      if (signOut && auth) await signOut(auth);
    } catch {
      // ignore and still route out
    } finally {
      navigate("/", { replace: true });
    }
  }
  function handleExit() {
    if (typeof onExit === "function") {
      onExit();
      return;
    }
    navigate("/", { replace: true });
  }

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const onPointerDown = (event) => {
      const el = menuRef.current;
      if (!el || el.contains(event.target)) return;
      setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [menuOpen]);

  const toneClass =
    tone === "light"
      ? "border-black/10 bg-white/80 text-zinc-900"
      : tone === "dark"
        ? "border-white/10 bg-black/50 text-zinc-100"
        : "border-emerald-500/25 bg-black/45 text-zinc-100";

  const badgeClass =
    tone === "light"
      ? "border-black/10 bg-black/5 text-zinc-700"
      : "border-white/10 bg-white/5 text-zinc-200";

  return (
    <header className={`w-full max-w-6xl mx-auto px-4 ${className}`}>
      <div
        className={`relative flex flex-wrap items-center justify-between gap-3 rounded-2xl border backdrop-blur-md shadow-[0_0_25px_rgba(16,185,129,0.15)] ${
          compact ? "px-4 py-2" : "px-4 py-3"
        } ${toneClass}`}
      >
        {tone !== "light" ? (
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_20%_0%,rgba(16,185,129,0.18),transparent_55%)]" />
        ) : null}

        <div className="relative z-10 flex items-center gap-3">
          {showBrand ? (
            <Link
              to={brandTo}
              className={`text-lg font-extrabold tracking-wide ${
                tone === "light" ? "text-zinc-900" : "text-emerald-300"
              }`}
            >
              {brandLabel}
            </Link>
          ) : null}

          {showUser ? (
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] ${badgeClass}`}
            >
              {displayName}
            </span>
          ) : null}
        </div>

        <div className="relative z-10 flex items-center gap-2">
          {rightSlot}

          <nav className="hidden items-center gap-1 sm:flex" aria-label="Top">
            {links.map((link) => (
              <TopLink key={link.to} to={link.to}>
                {link.label}
              </TopLink>
            ))}
            {showAuthAction ? (
              <button
                onClick={isSignedIn ? handleLogout : handleExit}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  tone === "light"
                    ? "text-zinc-900 hover:bg-black/5"
                    : "text-zinc-100 hover:bg-white/10"
                }`}
                type="button"
              >
                {isSignedIn ? "Logout" : "Exit"}
              </button>
            ) : null}
          </nav>

          <div ref={menuRef} className="sm:hidden">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
                tone === "light"
                  ? "border-black/10 bg-white text-zinc-900"
                  : "border-white/10 bg-black/40 text-zinc-100"
              }`}
              aria-expanded={menuOpen}
              aria-label="Toggle menu"
            >
              Menu
            </button>

            {menuOpen ? (
              <div
                className={`absolute right-0 mt-2 w-48 rounded-2xl border p-2 shadow-[0_18px_50px_rgba(0,0,0,0.35)] ${
                  tone === "light"
                    ? "border-black/10 bg-white text-zinc-900"
                    : "border-white/10 bg-black/90 text-zinc-100"
                }`}
              >
                <div className="flex flex-col">
                  {links.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-white/10"
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  {showAuthAction ? (
                    <button
                      onClick={isSignedIn ? handleLogout : handleExit}
                      className="rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-white/10"
                      type="button"
                    >
                      {isSignedIn ? "Logout" : "Exit"}
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
