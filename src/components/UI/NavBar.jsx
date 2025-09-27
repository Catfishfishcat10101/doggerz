// src/components/UI/NavBar.jsx
import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, userSignedOut } from "@/redux/userSlice";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { isPublicPath } from "@/utils/routes";

export default function NavBar() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const nav = useNavigate();
  const { pathname } = useLocation();
  const compact = isPublicPath(pathname); // auto-compact on public pages

  const linkBase = "px-3 py-2 rounded-xl text-sm font-medium transition-opacity";
  const linkActive = "bg-white/15 opacity-100";
  const linkIdle = "hover:bg-white/10 opacity-90";

  async function onLogout() {
    try {
      await signOut(auth);
      dispatch(userSignedOut());
      nav("/");
    } catch (e) {
      console.error("Sign-out failed:", e);
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur bg-gradient-to-b from-slate-900/70 to-slate-900/40 border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="h-14 flex items-center justify-between gap-3">
          {/* Brand */}
          <button
            type="button"
            onClick={() => nav("/")}
            className="flex items-center gap-2 group"
            aria-label="Doggerz Home"
          >
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-300 to-pink-400 shadow-inner" />
            <div className="text-lg font-bold tracking-wide text-white">
              Doggerz
            </div>
          </button>

          {/* Primary nav */}
          <nav className={`${compact ? "hidden sm:flex" : "hidden sm:flex"} items-center gap-1`}>
            {compact ? (
              <>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? linkActive : linkIdle}`
                  }
                >
                  Home
                </NavLink>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? linkActive : linkIdle}`
                  }
                >
                  Log in
                </NavLink>
                <NavLink
                  to="/signup"
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? linkActive : linkIdle}`
                  }
                >
                  Sign up
                </NavLink>
                <NavLink
                  to="/legal/privacy"
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? linkActive : linkIdle}`
                  }
                >
                  Privacy
                </NavLink>
              </>
            ) : (
              <>
                <NavLink
                  to="/game"
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? linkActive : linkIdle}`
                  }
                >
                  Game
                </NavLink>
                <NavLink
                  to="/shop"
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? linkActive : linkIdle}`
                  }
                >
                  Shop
                </NavLink>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? linkActive : linkIdle}`
                  }
                >
                  Profile
                </NavLink>
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? linkActive : linkIdle}`
                  }
                >
                  Settings
                </NavLink>
              </>
            )}
          </nav>

          {/* Auth controls */}
          <div className="flex items-center gap-2">
            {user?.uid ? (
              <>
                <span className="hidden sm:inline text-sm text-white/80">
                  {user.displayName || user.email}
                </span>
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-3 py-2 rounded-xl text-sm font-medium bg-white/15 hover:bg-white/25 text-white"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => nav("/login")}
                  className="px-3 py-2 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/20 text-white"
                >
                  Log in
                </button>
                <button
                  type="button"
                  onClick={() => nav("/signup")}
                  className="px-3 py-2 rounded-xl text-sm font-medium bg-amber-400/90 hover:bg-amber-300 text-slate-900"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
