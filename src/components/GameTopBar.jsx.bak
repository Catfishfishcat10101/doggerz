// src/components/GameTopBar.jsx

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
export default function GameTopBar() {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const isSignedIn = !!(user?.email || user?.id);
  async function handleLogout() {
    try {
      const { signOut, auth } = await getLogoutDeps();
      if (signOut && auth) await signOut(auth);
    } catch {
      // ignore and still route out
    } finally {
      navigate("/", { replace: true });
    }
  }
  function handleExit() {
    navigate("/", { replace: true });
  }
  return (
    <header className="w-full max-w-6xl mx-auto px-4 pt-4">
      <div className="flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-black/40 backdrop-blur-md px-4 py-3 shadow-[0_0_25px_rgba(16,185,129,0.15)]">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="text-lg font-extrabold tracking-wide text-emerald-300"
          >
            DOGGERZ
          </Link>
        </div>
        <nav className="flex items-center gap-1">
          <TopLink to="/about">About</TopLink>
          <TopLink to="/settings">Settings</TopLink>
          <button
            onClick={isSignedIn ? handleLogout : handleExit}
            className="px-3 py-2 rounded-lg text-sm font-semibold text-zinc-100 hover:bg-white/10 transition"
            type="button"
          >
            {isSignedIn ? "Logout" : "Exit"}
          </button>
        </nav>
      </div>
    </header>
  );
}
