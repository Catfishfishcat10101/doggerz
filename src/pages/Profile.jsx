// src/pages/Profile.jsx
import React from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";

import { auth } from "@/lib/firebase.js";           // ✅ canonical firebase client
import { signOut } from "firebase/auth";
import { PATHS } from "@/routes.js";
import { selectDog } from "@/redux/dogSlice.js";
import { selectUser } from "@/redux/userSlice.js";

export default function ProfilePage() {
  const navigate = useNavigate();

  // Prefer Redux user slice, fall back to auth.currentUser as a safety net
  const userFromStore = useSelector(selectUser);
  const u = userFromStore?.id ? userFromStore : auth.currentUser || null;

  const dog = useSelector(selectDog) || {};

  async function handleLogout() {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Logout failed:", e);
    }
    // Soft redirect through router instead of a full page reload
    navigate(PATHS.HOME, { replace: true });
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-sm text-zinc-400">
              Account, session, and a quick snapshot of your Doggerz pup.
            </p>
          </div>

          <Link
            to={PATHS.GAME}
            className="inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
          >
            Back to Game
          </Link>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* ACCOUNT CARD */}
          <section className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-6 shadow-xl space-y-4">
            <h2 className="text-xl font-semibold">Account</h2>

            {u ? (
              <>
                <div className="flex items-center gap-4">
                  {u.photoURL && (
                    <img
                      src={u.photoURL}
                      alt="avatar"
                      className="w-14 h-14 rounded-full border border-zinc-700 object-cover"
                    />
                  )}

                  <div>
                    <div className="font-semibold text-lg">
                      {u.displayName || "Anonymous User"}
                    </div>
                    <div className="text-sm text-zinc-400">
                      {u.email || "No email on file"}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-zinc-500">
                  UID:{" "}
                  <span className="font-mono text-[11px]">
                    {u.uid || userFromStore?.id || "—"}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-sm font-semibold"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <p className="text-zinc-400">Not signed in.</p>
                <Link
                  to={PATHS.LOGIN}
                  className="inline-flex mt-3 items-center justify-center px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold text-emerald-950"
                >
                  Go to Login
                </Link>
              </>
            )}
          </section>

          {/* DOG SNAPSHOT CARD */}
          <section className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-6 shadow-xl space-y-4">
            <h2 className="text-xl font-semibold">Pup Snapshot</h2>

            <div className="text-sm text-zinc-400 space-y-1.5">
              <div>
                Name:{" "}
                <span className="font-semibold text-white">
                  {dog.name || "—"}
                </span>
              </div>

              <div>
                Level:{" "}
                <span className="font-semibold text-white">
                  {dog.level ?? 0}
                </span>
              </div>

              <div>
                Coins:{" "}
                <span className="font-semibold text-white">
                  {dog.coins ?? 0}
                </span>
              </div>

              <div>
                Potty Level:{" "}
                <span className="font-semibold text-white">
                  {dog.pottyLevel ?? 0}%
                </span>{" "}
                {dog.isPottyTrained && (
                  <span className="text-emerald-400">(trained)</span>
                )}
              </div>

              <div>
                Poop Count:{" "}
                <span className="font-semibold text-white">
                  {dog.poopCount ?? 0}
                </span>
              </div>
            </div>

            <p className="text-xs text-zinc-500 mt-2">
              These values are live from your current Doggerz session. Once
              autosave is fully wired, this will reflect your cloud state.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
