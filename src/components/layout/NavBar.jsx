import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, userSignedOut } from "@/redux/userSlice";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

/**
 * Doggerz Navigation Bar
 * - Fixed top layout with large Doggerz logo (top-left)
 * - Dynamic routes (Game, Shop, Settings)
 * - Hides login/signup for authenticated users
 * - Dark theme compatible (Tailwind-based)
 * - Responsive with burger toggle on mobile
 */

export default function NavBar() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Auto-close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  async function handleSignOut() {
    try {
      await signOut(auth);
      dispatch(userSignedOut());
      navigate("/login");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  }

  const navItems = user
    ? [
        { to: "/game", label: "Game" },
        { to: "/shop", label: "Shop" },
        { to: "/settings", label: "Settings" },
      ]
    : [
        { to: "/login", label: "Login" },
        { to: "/signup", label: "Sign Up" },
      ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#0b1220]/80 backdrop-blur-lg border-b border-white/10">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link
          to="/"
          className="text-3xl sm:text-4xl font-extrabold tracking-wide text-indigo-400 hover:text-teal-300 transition-all select-none"
        >
          Doggerz
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex gap-6 text-white text-lg font-medium">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `transition-all duration-200 ${
                    isActive
                      ? "text-teal-400 font-semibold"
                      : "text-gray-300 hover:text-teal-200"
                  }`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}

          {user && (
            <li>
              <button
                onClick={handleSignOut}
                className="text-gray-300 hover:text-rose-400 transition-all"
              >
                Sign Out
              </button>
            </li>
          )}
        </ul>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white text-3xl focus:outline-none"
        >
          {menuOpen ? "✖" : "☰"}
        </button>
      </nav>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0b1220]/95 border-t border-white/10 text-center py-4">
          <ul className="flex flex-col gap-4 text-lg font-medium text-white">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `block transition-all duration-200 ${
                      isActive
                        ? "text-teal-400 font-semibold"
                        : "text-gray-300 hover:text-teal-200"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}

            {user && (
              <li>
                <button
                  onClick={handleSignOut}
                  className="text-gray-300 hover:text-rose-400 transition-all"
                >
                  Sign Out
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}