import React, { useEffect, useState, useCallback } from "react";
import { slide as Menu } from "react-burger-menu";
import { NavLink, useLocation } from "react-router-dom";
import {
  Gamepad2,
  Info,
  Wrench,
  Mail,
  Home,
  LogIn,
  UserPlus,
  LogOut,
  PawPrint,
} from "lucide-react";
import "./BurgerMenu.css";

/**
 * NavBar
 * - Uses NavLink for SPA routing (no full page refresh)
 * - Closes on route change
 * - Keyboard: Ctrl/Cmd+K or "m" toggles menu
 * - Right-side slide, customizable width
 */
export default function NavBar({ width = 300 }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const close = useCallback(() => setIsOpen(false), []);
  const onStateChange = (state) => setIsOpen(state.isOpen);

  // Close when navigating
  useEffect(() => {
    close();
  }, [location.pathname, close]);

  // Hotkeys: Ctrl/Cmd+K or "m" to toggle
  useEffect(() => {
    const onKey = (e) => {
      const k = e.key?.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && k === "k") {
        e.preventDefault();
        setIsOpen((v) => !v);
      } else if (!e.ctrlKey && !e.metaKey && !e.altKey && k === "m") {
        setIsOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // TODO: replace with real auth state if you have it
  const isAuthed = false;

  const items = [
    { to: "/", label: "Home", icon: Home, end: true },
    { to: "/game", label: "Game", icon: Gamepad2 },
    { to: "/potty", label: "Potty Training", icon: Wrench },
    { to: "/about", label: "About", icon: Info },
    { to: "/contact", label: "Contact", icon: Mail },
  ];

  const authItems = isAuthed
    ? [{ to: "/logout", label: "Logout", icon: LogOut }]
    : [
        { to: "/login", label: "Log in", icon: LogIn },
        { to: "/signup", label: "Sign up", icon: UserPlus },
      ];

  return (
    <>
      {/* The component renders its own burger button; CSS controls its position. */}
      <Menu
        right
        width={width}
        isOpen={isOpen}
        onStateChange={onStateChange}
        // Provide accessible custom icons (optional). Remove these two props to use defaults.
        customBurgerIcon={
          <button
            className="bm-burger-button-override"
            aria-label="Open navigation menu"
            title="Open menu (Ctrl/Cmd+K)"
          >
            <span className="bm-burger-bar" />
            <span className="bm-burger-bar" />
            <span className="bm-burger-bar" />
          </button>
        }
        customCrossIcon={
          <button
            className="bm-cross-button-override"
            aria-label="Close navigation menu"
            title="Close menu"
          >
            ✕
          </button>
        }
      >
        {/* Header */}
        <div className="menu-header">
          <div className="brand">
            <PawPrint size={18} />
            <span>Doggerz</span>
          </div>
          <small className="hint">Press <kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>K</kbd> to toggle</small>
        </div>

        {/* Primary links */}
        <nav className="menu-section" aria-label="Primary">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                "menu-item" + (isActive ? " active" : "")
              }
              onClick={close}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Divider */}
        <hr className="menu-divider" />

        {/* Auth / secondary */}
        <nav className="menu-section" aria-label="Account">
          {authItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                "menu-item" + (isActive ? " active" : "")
              }
              onClick={close}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="menu-footer">
          <span className="footer-text">© {new Date().getFullYear()} Doggerz</span>
        </div>
      </Menu>
    </>
  );
}