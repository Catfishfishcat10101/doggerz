import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/redux/userSlice.js";

export default function NavBar() {
  const nav = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((s) => s.user.user); // null or { displayName, email }
  const dogName = useSelector((s) => s.dog.name ?? "Pupper");

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-black/30 border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <button
          onClick={() => nav("/")}
          className="font-black tracking-wide text-lg select-none"
          aria-label="Doggerz Home"
        >
          DOGGERZ<span className="ml-2 text-xs font-semibold opacity-70">Beta</span>
        </button>

        <nav className="flex items-center gap-4 text-sm">
          <NavLink to="/" className={({ isActive }) => linkCx(isActive)}>Home</NavLink>
          <NavLink to="/game" className={({ isActive }) => linkCx(isActive)}>Game</NavLink>
          <NavLink to="/shop" className={({ isActive }) => linkCx(isActive)}>Shop</NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-xs opacity-80">Pup: {dogName}</span>
          {user ? (
            <button
              onClick={() => dispatch(logout())}
              className="btn-primary"
            >
              Sign out
            </button>
          ) : (
            <button onClick={() => nav("/game")} className="btn-primary">
              Play Now
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

function linkCx(active) {
  return [
    "px-2 py-1 rounded-md",
    active ? "bg-white/10" : "hover:bg-white/5"
  ].join(" ");
}